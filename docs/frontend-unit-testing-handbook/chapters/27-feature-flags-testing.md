# 特性开关与灰度测试（Feature Flags）

目标：保证在灰度/分组发布下的行为一致性与安全回退能力；测试覆盖不同开关状态与用户分群。

核心要点：
- Flag 读取层：集中于配置/SDK（如 LaunchDarkly/Unleash/自建），建立适配层，测试只依赖适配层
- 分群策略：按用户/地区/时间窗口，测试中注入可控分群
- 回退策略：开关关闭时的降级路径可测试

适配层示例：
```ts
// flags.ts
export type FlagProvider = { get(flag: string, user: any): boolean }
let provider: FlagProvider = { get: () => false }
export function setProvider(p: FlagProvider) { provider = p }
export function isEnabled(flag: string, user: any) { return provider.get(flag, user) }
```
```ts
// flags.spec.ts
import { setProvider, isEnabled } from './flags'
it('enable flag for admin', () => {
  setProvider({ get: (f, u) => f === 'new-ui' && u.role === 'admin' })
  expect(isEnabled('new-ui', { role: 'admin' })).toBe(true)
})
```

组件使用示例（降级回退）：
```tsx
// NewUI.tsx
import { isEnabled } from './flags'
export function NewUI({ user }: any) {
  if (!isEnabled('new-ui', user)) return <LegacyUI />
  return <ModernUI />
}
```
```tsx
// NewUI.spec.tsx
it('falls back when disabled', () => {
  setProvider({ get: () => false })
  render(<NewUI user={{ role: 'guest' }} />)
  expect(screen.getByText(/legacy/i)).toBeInTheDocument()
})
```

灰度与监控：
- 在 E2E/CT 中验证不同分群的可见行为（UI/路由/埋点）
- 与可观测性联动：在开启/关闭状态下检查关键埋点与错误率变化

最佳实践：
- 适配层单点：避免在业务代码中直接调用第三方 SDK
- 测试覆盖场景：开启/关闭/无配置/异常兜底
- 结合差异覆盖门禁：对新特性路径要求最低覆盖阈值

Checklist
- [ ] Flag 适配层可替换并有用例
- [ ] 开启/关闭/兜底路径均覆盖
- [ ] 与监控联动验证行为一致

常见错误排查
- 分群不稳定：在测试中固定分群策略并避免随机
- SDK 直连耦合：引入适配层并在测试中打桩