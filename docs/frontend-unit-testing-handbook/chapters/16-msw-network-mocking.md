# 网络请求模拟与隔离（MSW）

目标：让测试在“无真实后端”的情况下稳定运行，支持不同响应场景与错误注入。

适用场景：
- 组件/业务逻辑依赖 fetch/XHR
- 需要在单测/集成测试中模拟接口成功/失败/慢速/鉴权失效

MSW 快速上手：
```bash
npm i -D msw
```

基础用法（单测场景）：
```ts
// tests/setup-msw.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const server = setupServer(
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Neo' }, { status: 200 })
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

在 Vitest 中启用：
```ts
// vitest.config.ts 片段
export default defineConfig({
  test: {
    setupFiles: ['tests/setup-msw.ts']
  }
})
```

测试示例：
```ts
import { expect, test } from 'vitest'

test('获取用户成功', async () => {
  const r = await fetch('/api/users/1')
  const json = await r.json()
  expect(json).toMatchObject({ id: '1', name: 'Neo' })
})
```

错误场景注入：
```ts
import { server } from './setup-msw'
import { http, HttpResponse } from 'msw'

test('接口 500 错误', async () => {
  server.use(
    http.get('/api/users/:id', () => HttpResponse.json({ message: 'oops' }, { status: 500 }))
  )
  const r = await fetch('/api/users/1')
  expect(r.ok).toBe(false)
})
```

技巧与最佳实践：
- 对慢速场景：延时返回（setTimeout 或自定义 delay），配合 fake timers 验证重试/超时策略
- 对鉴权：在 handler 中检查 headers/cookies，返回 401/403 并验证前端跳转/提示
- 统一在 setup 中开启 onUnhandledRequest: 'error'，避免漏拦截静默通过

CI 注意事项：
- Node 环境下使用 msw/node（不是浏览器 worker）
- 若存在 ESM/CJS 混用，确保 Vitest 配置与导入语法一致

## 示例入口
- examples/node-msw：基础拦截与错误注入用例
- Vitest 集成：vitest.config.ts 的 setupFiles 指向 tests/setup-msw.ts

## Checklist
- [ ] 开启 onUnhandledRequest: 'error' 防止漏拦截
- [ ] 覆盖成功/失败/超时/鉴权失效场景
- [ ] Node/E2E 区分拦截方式（msw/node vs 浏览器路由）

## 常见错误排查
- 未拦截生效：检查测试环境是否用到真实 fetch/XHR 替代
- ESM/CJS 报错：统一导入语法与 Vitest 配置