import { it, expect, vi } from 'vitest';
import { server, http, HttpResponse } from './setup';
import { retryFetch } from '../src/retry';

it('retries with exponential backoff and eventually succeeds', async () => {
  vi.useFakeTimers();
  let calls = 0;
  server.use(
    http.get('/unstable', () => {
      calls += 1;
      return calls < 3
        ? new HttpResponse(null, { status: 500 })
        : HttpResponse.json({ ok: true });
    })
  );

  const p = retryFetch('/unstable', { retries: 5, base: 10 });

  vi.advanceTimersByTime(10);
  await Promise.resolve();
  vi.advanceTimersByTime(20);
  await Promise.resolve();

  await expect(p.then((r) => r.json())).resolves.toEqual({ ok: true });
  vi.useRealTimers();
});