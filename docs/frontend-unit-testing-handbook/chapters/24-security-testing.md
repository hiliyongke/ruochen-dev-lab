# 前端安全测试（XSS/CSRF/Clickjacking 等）

目标：在单测/集成层面尽早发现前端常见安全问题，确保关键防护逻辑可测试且稳定。

关注点：
- XSS：输入/渲染路径的转义与白名单策略
- CSRF：携带凭证请求的防护（SameSite、CSRF Token）
- Clickjacking：X-Frame-Options/Content-Security-Policy 防护
- CSP：限制不可信脚本/内联执行

示例：XSS 防护
```ts
// sanitize.ts
export function sanitize(input: string) {
  return input.replace(/[<>&"]/g, (c) => ({ '<':'<', '>':'>', '&':'&', '"':'"' }[c]!))
}
```
```ts
// sanitize.spec.ts
import { sanitize } from './sanitize'
it('转义恶意脚本', () => {
  expect(sanitize('<script>alert(1)</script>')).toContain('<script>')
})
```

示例：CSRF 校验（请求层）
```ts
// api.ts
export async function postWithCsrf(url: string, body: any, token: string) {
  return fetch(url, {
    method: 'POST',
    headers: { 'X-CSRF-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  })
}
```
```ts
// api.spec.ts
global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as any
it('携带 CSRF Token 与凭证', async () => {
  await postWithCsrf('/api/submit', { x: 1 }, 't123')
  const [url, init] = (fetch as any).mock.lastCall
  expect(init.headers['X-CSRF-Token']).toBe('t123')
  expect(init.credentials).toBe('include')
})
```

CSP/点击劫持（策略校验思路）：
- 组件/E2E 层：在 Playwright 中断言响应头包含 CSP/X-Frame-Options
- 单测层：抽象策略读取函数并断言关键值（如 frame-ancestors）

最佳实践：
- 输入出口统一：对富文本采用可信渲染库；对内联事件禁用
- 凭证策略：优先 SameSite=Lax/Strict，跨站需明确风控
- 将安全测试纳入变更集门禁，防止回退

Checklist
- [ ] 输入转义或可信渲染库校验
- [ ] 凭证与 CSRF 头/Token 校验
- [ ] 响应头安全策略（CSP/XFO）在测试中可验证

常见错误排查
- XSS 漏洞：检查绕过路径（属性注入/URL/样式），对富文本使用白名单解析
- CSRF 失效：确认凭证策略与 Token 一致性