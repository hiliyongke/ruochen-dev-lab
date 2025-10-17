import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterEach, afterAll } from 'vitest';

export const server = setupServer(
  http.get('/unstable', () => HttpResponse.json({ ok: true }))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export { http, HttpResponse };