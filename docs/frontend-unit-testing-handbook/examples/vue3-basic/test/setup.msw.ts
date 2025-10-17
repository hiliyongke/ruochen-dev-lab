import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';


export const server = setupServer(
  // 默认兜底：未匹配的请求视为错误，避免用例遗漏桩
  http.get('https://api.example.com/health', () => HttpResponse.json({ ok: true }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export { http, HttpResponse };