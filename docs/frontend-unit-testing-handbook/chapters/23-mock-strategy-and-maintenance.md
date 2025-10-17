# Mock 策略选型与维护

目标：在不同层级（单元/集成/组件/E2E）选择合适的 Mock 手段，并建立可维护的 Mock 体系。

Mock 维度：
- 函数/模块级：vi.fn/vi.spyOn、jest.fn、module mocking
- 网络层：MSW（node/worker）、Playwright 路由拦截
- 时间与环境：fake timers、随机数 seed、Storage/Cookies 打桩

选型建议：
- 单元层：优先函数/模块级 Mock，保证纯逻辑稳定
- 集成层：网络用 MSW，保留跨模块交互；避免过度全局 Mock
- 组件/E2E：尽量使用真实浏览器上下文，Mock 仅限外部系统（支付/三方登录）

维护策略：
- Mock 目录与约定：tests/mocks 下集中管理；按领域划分（auth、billing、user）
- 复用与组合：为常见场景（成功/失败/超时/鉴权）提供预置 handler
- 防腐：对第三方 SDK 封装适配层，测试只 Mock 适配层接口

示例：模块打桩
```ts
// utils/random.ts
export const rand = () => Math.random()
```
```ts
// random.spec.ts
import * as R from './random'
it('固定随机数', () => {
  vi.spyOn(R, 'rand').mockReturnValue(0.42)
  expect(R.rand()).toBe(0.42)
})
```

示例：网络 MSW 复用
```ts
// tests/mocks/user.handlers.ts
import { http, HttpResponse } from 'msw'
export const userOk = http.get('/api/users/:id', ({ params }) =>
  HttpResponse.json({ id: params.id, name: 'Neo' })
)
export const userFail = http.get('/api/users/:id', () =>
  HttpResponse.json({ message: 'oops' }, { status: 500 })
)
```
```ts
// use in test
import { server } from '../setup-msw'
import { userFail } from './mocks/user.handlers'
server.use(userFail)
```

版本升级与一致性：
- 当后端接口变更：通过契约测试（Pact）提前发现；更新 Mock handler 同步
- 对 SDK 变更：适配层单点更新，避免全仓用例破碎

Checklist
- [ ] Mock 目录结构合理，场景可复用
- [ ] 集成层优先使用 MSW，避免过度模块打桩
- [ ] 对第三方 SDK 建立适配层以降低耦合

常见错误排查
- Mock 泄漏到其他用例：确保 afterEach 重置/关闭
- ESM/CJS 冲突：统一导入语法与测试框架配置