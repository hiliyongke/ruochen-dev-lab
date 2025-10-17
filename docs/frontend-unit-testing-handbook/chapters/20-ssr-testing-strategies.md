# SSR 场景下的单元测试策略（Next/Nuxt）

目标：在服务端渲染（SSR）与水合（Hydration）场景下保持测试稳定，覆盖同构代码与仅服务器/仅浏览器分支。

适用框架：
- Next.js（React）：App Router / Pages Router
- Nuxt（Vue）：服务器端渲染 + 客户端水合

核心关注点：
- 仅服务器分支：如读取 cookies/headers、Node API（fs、path），需在测试中用假实现或注入上下文
- 仅浏览器分支：window/document/IntersectionObserver 等，需在 JSDOM 中打桩
- 水合一致性：SSR 输出与客户端水合后的 DOM 不应产生错误或警告

Next 示例（服务端数据获取 + 客户端渲染）：
```ts
// app/user/[id]/page.tsx
export default async function Page({ params }) {
  const res = await fetch(process.env.API + '/users/' + params.id, { cache: 'no-store' })
  const user = await res.json()
  return <div data-id={user.id}>{user.name}</div>
}
```
```ts
// page.spec.tsx（组件单测思路，非端到端）
import { render, screen } from '@testing-library/react'
global.fetch = vi.fn(() =>
  Promise.resolve({ json: () => Promise.resolve({ id: '1', name: 'Neo' }) })
) as any

it('SSR 数据被渲染', async () => {
  render(<div data-id={'1'}>Neo</div>)
  // 真实 Next SSR 需用 e2e/集成测试验证路由与数据层，这里展示组件层断言
  expect(await screen.findByText('Neo')).toBeInTheDocument()
})
```

Nuxt 示例（仅服务器分支假实现）：
```ts
// composables/useServerOnly.ts
export const useServerOnly = () => {
  if (process.server) return 'srv'
  return 'cli'
}
```
```ts
// useServerOnly.spec.ts（Vitest）
it('server 分支', () => {
  // 在测试中模拟 server 环境
  const orig = process.env.NUXT_TEST_SERVER
  process.env.NUXT_TEST_SERVER = '1'
  const val = 'srv' // 通过注入或模块打桩返回
  expect(val).toBe('srv')
  process.env.NUXT_TEST_SERVER = orig
})
```

稳定策略：
- 浏览器 API 打桩：为 window.matchMedia、IntersectionObserver、ResizeObserver 提供测试桩
- 时序与动画：关闭动画或使用 prefers-reduced-motion；利用 fake timers 控制水合后的副作用
- 网络与鉴权：用 MSW 拦截请求；SSR 场景下通过 node-msw 或在服务端层面模拟

何时用 E2E/CT：
- 路由与数据流整体验证建议使用 Playwright E2E 或 Component Testing
- 单测用于验证关键分支与副作用（如水合警告、仅服务器/仅浏览器逻辑）

Checklist
- [ ] 仅服务器/仅浏览器分支均有测试覆盖
- [ ] 浏览器 API 在 JSDOM 下有稳定桩
- [ ] 水合无错误/警告（控制台不出现 hydration mismatch）

常见错误排查
- Hydration mismatch：SSR 与客户端渲染输出不一致；检查使用时间/随机数/环境差异并稳定化
- Node API 未打桩：在 JSDOM 下调用 fs/path 导致报错；仅在服务器分支执行或打桩