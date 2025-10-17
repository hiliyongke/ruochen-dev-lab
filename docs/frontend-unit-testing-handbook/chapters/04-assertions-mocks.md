# 断言、Mock、Spy、Stub 体系

为什么需要替身对象：
- 隔离外部依赖（网络、时间、随机数）
- 控制分支（返回值/异常）
- 观察交互（是否被调用、参数是什么）

Jest/Vitest 常用 API：
- vi.fn()/jest.fn()：创建可观测的空函数
- vi.spyOn(obj, "method")：对已有方法打桩
- mockReturnValue / mockResolvedValue / mockRejectedValue

示例：记录调用并断言参数
```ts
import { describe, it, expect, vi } from "vitest";

function greet(logger: (s: string) => void, name: string) {
  logger(`Hello, ${name}`);
}

it("calls logger with message", () => {
  const logger = vi.fn();
  greet(logger, "Neo");
  expect(logger).toHaveBeenCalledWith("Hello, Neo");
});
```

示例：对模块进行自动 Mock
```ts
// api.ts
export async function fetchUser(id: string) { /* 实际网络请求 */ }

// service.ts
import { fetchUser } from "./api";
export async function getUserName(id: string) {
  const u = await fetchUser(id);
  return u.name;
}
```

```ts
// service.test.ts
import { describe, it, expect, vi } from "vitest";
import * as api from "./api";

it("returns user name", async () => {
  vi.spyOn(api, "fetchUser").mockResolvedValue({ name: "Alice" } as any);
  const { getUserName } = await import("./service");
  await expect(getUserName("1")).resolves.toBe("Alice");
});
```

反模式：
- 只断言「被调用次数」，不断言行为结果
- 过度 Mock，导致改实现即测试全红（与实现耦合）

策略与示例扩展：
- 测试数据构造（Test Data Builder）提升可读性与复用
```ts
import { describe, it, expect } from 'vitest';
import { UserBuilder } from './user.builder';
import { canAccess } from './acl';

it('admin can access dashboard', () => {
  const user = new UserBuilder().withRole('admin').build();
  expect(canAccess(user, 'dashboard')).toBe(true);
});
```

- HTTP Mock（MSW）统一网络替身，避免对 fetch/axios 的脆弱打桩
```ts
import { describe, it, expect } from 'vitest';
import { server } from '../test/setup';
import { http, HttpResponse } from 'msw';
import { getUserName } from './service';

it('reads user name from API', async () => {
  server.use(http.get('/api/user/1', () => HttpResponse.json({ name: 'Neo' })));
  await expect(getUserName('1')).resolves.toBe('Neo');
});
```

- 稳定化时间与随机数（Fake Timers/Seed）
```ts
import { describe, it, expect, vi } from 'vitest';

it('debounce runs once after 300ms', () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const debounced = (cb: Function) => { /* 省略实现 */ };
  debounced(fn);
  vi.advanceTimersByTime(299);
  expect(fn).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(fn).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
```

- 性质测试（fast-check）校验不变式，提升断言质量（示例见 15 章）