# 异步、计时器与网络请求测试

异步代码断言：
- 返回 Promise：直接 return 或用 await
- rejects/resolves 搭配 toThrow/toEqual

```ts
it("handles async", async () => {
  const data = await Promise.resolve(42);
  expect(data).toBe(42);
});
```

计时器：
- 使用 fake timers 控制时间推进
- vitest: vi.useFakeTimers(); vi.advanceTimersByTime(ms)

```ts
import { vi } from "vitest";

it("debounce waits", () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  debounce(fn, 300)(); // 假设触发一次
  vi.advanceTimersByTime(299);
  expect(fn).not.toBeCalled();
  vi.advanceTimersByTime(1);
  expect(fn).toBeCalledTimes(1);
  vi.useRealTimers();
});
```

网络请求：
- 倾向对「使用方」打桩，而非真实发请求
- 若需更高可信度，使用 MSW（Mock Service Worker）在测试环境拦截 fetch/xhr

MSW 最小示例思路：
- 定义 handlers（拦截路由与响应）
- 在测试 setup 中启用 server.listen()
- 每个用例后重置 handlers

MSW 具体示例（Vitest/Node 环境）：
```ts
// test/setup.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
export const server = setupServer(
  http.get('/api/user/:id', ({ params }) =>
    HttpResponse.json({ id: params.id, name: 'Alice' })
  )
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```
```ts
// service.ts
export async function getUserName(id: string) {
  const res = await fetch(`/api/user/${id}`);
  const data = await res.json();
  return data.name;
}
```
```ts
// service.test.ts
import { describe, it, expect } from 'vitest';
import { server } from '../test/setup';
import { http, HttpResponse } from 'msw';
import { getUserName } from './service';

it('returns name from API', async () => {
  server.use(http.get('/api/user/1', () => HttpResponse.json({ name: 'Neo' })));
  await expect(getUserName('1')).resolves.toBe('Neo');
});
```

微任务 vs 宏任务（断言时机）：
- Promise.then 属于微任务，setTimeout 属于宏任务
- 组合使用时，需 await 微任务队列“清空”后再推进宏任务
```ts
it('micro/macro ordering', async () => {
  const logs: string[] = [];
  Promise.resolve().then(() => logs.push('micro'));
  setTimeout(() => logs.push('macro'), 0);
  await Promise.resolve(); // 刷新微任务
  expect(logs).toEqual(['micro']);
});
```

Fake Timers 稳定化要点：
- 使用现代计时器：vi.useFakeTimers() / jest.useFakeTimers()
- 推进时间使用 advanceTimersByTime；混合 Promise 时需先“冲刷”微任务
```ts
import { it, expect, vi } from 'vitest';
it('debounce runs once after 300ms', async () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  // 假设 debounce 实现内部 setTimeout(..., 300)
  // trigger();
  vi.advanceTimersByTime(299);
  expect(fn).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(fn).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
```

HTTP 重试与指数退避（配合 MSW）：
```ts
// retry.ts
export async function retryFetch(url: string, { retries = 3, base = 50 } = {}) {
  let attempt = 0;
  // 真实中用 setTimeout；测试中用 fake timers 推进
  while (true) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('bad');
      return res;
    } catch (e) {
      if (attempt++ >= retries) throw e;
      const delay = base * 2 ** (attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```
```ts
// retry.test.ts
import { it, expect, vi } from 'vitest';
import { server } from '../test/setup';
import { http, HttpResponse } from 'msw';
import { retryFetch } from './retry';

it('retries with exponential backoff', async () => {
  vi.useFakeTimers();
  let calls = 0;
  server.use(http.get('/unstable', () => {
    calls += 1;
    return calls < 3 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json({ ok: true });
  }));

  const p = retryFetch('/unstable', { retries: 5, base: 10 });
  // 推进退避：10ms -> 20ms
  vi.advanceTimersByTime(10);
  await Promise.resolve();
  vi.advanceTimersByTime(20);
  await Promise.resolve();

  await expect(p.then(r => r.json())).resolves.toEqual({ ok: true });
  vi.useRealTimers();
});
```

超时与取消（AbortController）：
```ts
export async function fetchWithTimeout(url: string, timeout = 300) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ac.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}
```
测试要点：用 fake timers 推进 timeout；或在 MSW handler 中延迟响应模拟超时。

轮询与退避（Polling）：
- 使用固定/指数退避间隔，注意设定最大轮询时长与停止条件
- 测试中使用 fake timers 控制推进，断言调用次数与停止条件达成

Flaky 诊断与稳定化清单：
- 稳定外部依赖：时间（fake timers）、随机（固定 seed）、网络（MSW）
- 断言时机正确：await 微任务/宏任务；对框架相关更新（React/Vue）使用 act/nextTick
- 避免过度依赖实现细节：断言可观察行为而非内部调用
- 在 CI 启用重试/重跑仅作为兜底，优先修复不稳定根因

AbortController 超时测试实战：
```ts
// fetchWithTimeout.ts
export async function fetchWithTimeout(url: string, timeout = 200) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeout);
  try {
    return await fetch(url, { signal: ac.signal });
  } finally {
    clearTimeout(id);
  }
}
```
```ts
// fetchWithTimeout.test.ts
import { it, expect, vi } from 'vitest';
import { server } from '../test/setup';
import { http, HttpResponse } from 'msw';
import { fetchWithTimeout } from './fetchWithTimeout';

it('aborts when timeout reached', async () => {
  vi.useFakeTimers();
  server.use(http.get('/slow', async () => {
    await new Promise(r => setTimeout(r, 1_000));
    return HttpResponse.json({ ok: true });
  }));
  const p = fetchWithTimeout('/slow', 200);
  vi.advanceTimersByTime(200);
  await expect(p).rejects.toThrow(/aborted|AbortError/i);
  vi.useRealTimers();
});
```

轮询（Polling）与退避停止条件：
```ts
// poll.ts
export async function poll(fn: () => Promise<boolean>, { interval = 200, max = 2000 } = {}) {
  let elapsed = 0;
  while (elapsed <= max) {
    if (await fn()) return true;
    await new Promise(r => setTimeout(r, interval));
    elapsed += interval;
  }
  return false;
}
```
```ts
// poll.test.ts
import { it, expect, vi } from 'vitest';
import { poll } from './poll';
it('stops when condition met with controlled timers', async () => {
  vi.useFakeTimers();
  let tries = 0;
  const p = poll(async () => ++tries >= 3, { interval: 100, max: 1000 });
  vi.advanceTimersByTime(300);
  expect(await p).toBe(true);
  vi.useRealTimers();
});
```

微/宏任务冲刷工具：
```ts
export async function flushMicrotasks() {
  await Promise.resolve();
  // 可重复多次以确保所有 then 链完成
}
```
在结合 fake timers 推进前，常先 flush 微任务以避免时序竞争。