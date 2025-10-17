# 测试数据管理：Factory 与 Fixtures

目标：通过可复用的数据工厂与固定装置（fixtures），降低测试维护成本，提升可读性与稳定性。

原则：
- 明确数据意图：仅生成断言所需字段，避免“巨型对象”
- 可复用与覆盖：基于默认工厂 + 局部覆盖（override）
- 稳定与随机：统一随机种子或使用确定性生成

Factory 示例：
```ts
// tests/factories/user.ts
export function userFactory(override: Partial<any> = {}) {
  return { id: 'u_' + Math.random().toString(36).slice(2, 8), name: 'Neo', role: 'admin', ...override }
}
```
```ts
// user.spec.ts
import { userFactory } from './factories/user'
it('生成用户并覆盖字段', () => {
  const u = userFactory({ role: 'guest' })
  expect(u.role).toBe('guest')
})
```

Fixtures（测试装置）：
- Vitest：使用 beforeEach/afterEach 或 setupFiles 提供通用环境（MSW/seed/fake timers）
- Playwright：使用 test.extend 创建复用上下文（如已登录用户/预置数据）

稳定策略：
- 随机数种子：统一 faker.seed(...) 或固定工厂逻辑
- 时间：使用 fake timers 或固定时间来源（Date.now -> 可控注入）
- 网络：MSW 统一拦截，复用 handlers

最佳实践：
- 工厂与装置目录：tests/factories、tests/fixtures
- 领域化：按业务模块分类（user/order/product）
- 只生成必要字段：避免隐性依赖与难以阅读的巨型对象

Checklist
- [ ] 工厂默认值清晰，支持局部覆盖
- [ ] 统一随机种子/时间来源
- [ ] 通用环境（MSW/fake timers）集中在 fixtures

常见错误排查
- 数据耦合过重：拆分为更细的工厂并按需组合
- 非确定性失败：检查随机/时间/网络是否未稳定化