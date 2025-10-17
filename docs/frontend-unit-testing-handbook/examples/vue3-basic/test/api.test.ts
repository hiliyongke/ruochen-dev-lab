
import { server, http, HttpResponse } from './setup.msw';
import { fetchUser, fetchWithRetry, fetchWithTimeout } from '../src/app/api';

describe('MSW + Async (Vue3 example)', () => {
  it('fetchUser returns data from mocked API', async () => {
    server.use(http.get('https://api.example.com/users/1', () =>
      HttpResponse.json({ id: '1', name: 'Neo' })
    ));
    await expect(fetchUser('1')).resolves.toEqual({ id: '1', name: 'Neo' });
  });

  it('retries with exponential backoff then succeeds', async () => {
    vi.useFakeTimers();
    let calls = 0;
    server.use(http.get('https://api.example.com/unstable', () => {
      calls += 1;
      return calls < 3
        ? new HttpResponse(null, { status: 500 })
        : HttpResponse.json({ ok: true });
    }));

    const p = fetchWithRetry('https://api.example.com/unstable', { retries: 3, base: 20 });

    // 推进第一次等待 20ms
    await vi.advanceTimersByTimeAsync(20);
    await Promise.resolve();

    // 推进第二次等待 40ms
    await vi.advanceTimersByTimeAsync(40);
    await Promise.resolve();

    // 清空剩余挂起的定时器（稳妥起见）
    await vi.runOnlyPendingTimersAsync();

    const res = await p;
    await expect(res.json()).resolves.toEqual({ ok: true });

    vi.useRealTimers();
  });

  it('aborts on timeout', async () => {
    vi.useFakeTimers();
    server.use(http.get('https://api.example.com/slow', async () => {
      await new Promise((r) => setTimeout(r, 1000));
      return HttpResponse.json({ ok: true });
    }));
    const p = fetchWithTimeout('https://api.example.com/slow', 100);
    vi.advanceTimersByTime(100);
    await expect(p).rejects.toThrow(/Abort/i);
    vi.useRealTimers();
  });
});