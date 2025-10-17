# 项目与工具选择

测试运行器：
- Jest：生态成熟、默认开箱
- Vitest：Vite 原生、快、TypeScript 体验更好

断言库：
- Jest 内置 expect
- Vitest 兼容 Jest API

DOM 测试：
- @testing-library/react / vue：强调以用户视角查询、避免实现细节耦合

覆盖率：
- Istanbul（c8/nyc），Jest/Vitest 内置集成

选择建议：
- Vite 项目优先 Vitest；CRA/老项目可用 Jest
- DOM 相关统一用 Testing Library，少用 Enzyme 这类依赖实现细节的方案

最小可运行配置（Vitest）：
- 安装：npm i -D vitest @vitest/ui @testing-library/dom @testing-library/user-event
- 在 package.json 添加脚本：
  "test": "vitest --ui",
  "test:run": "vitest run --coverage"

进阶选型与生态：
- 隔离策略：优先通过模块边界+依赖注入实现可测性；对外部依赖（时间/随机/网络/存储）统一抽象，便于替身（Fake/Stub/Mock）替换
- HTTP Mock（MSW）：在浏览器与 Node 环境统一拦截网络，适合组件集成测试与 Storybook 校验
  安装：npm i -D msw
  初始化（Node/Vitest）：
  ```ts
  // test/setup.ts
  import { setupServer } from 'msw/node';
  import { http, HttpResponse } from 'msw';
  export const server = setupServer(
    http.get('/api/user/:id', ({ params }) =>
      HttpResponse.json({ id: params.id, name: 'Alice' })
    )
  );
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  ```
  在 vitest.config.ts 中注册 setupFiles：["test/setup.ts"]
- 测试数据构造（Test Data Builder/Object Mother）：用构造器消除样例数据重复，提高可读与稳定
  ```ts
  // user.builder.ts
  export class UserBuilder {
    private u = { id: '1', name: 'Alice', roles: [] as string[] };
    withId(id: string) { this.u.id = id; return this; }
    withRole(r: string) { this.u.roles.push(r); return this; }
    build() { return { ...this.u }; }
  }
  ```
- 随机化与性质测试（fast-check）：发现边界与不变式问题
  安装：npm i -D fast-check
  示例：见 15 章与断言章节的示例
- 跨框架差异（选型建议）：
  - React：优先 Vitest + React Testing Library；关注 React 18 并发（useTransition/useDeferredValue）与 act 要求
  - Vue：Vitest + Vue Testing Library；组合式 API 与异步 DOM 更新（nextTick）断言策略
  - SSR/路由：Next/Nuxt 中对路由/数据层（React Query/Pinia）采用容器级测试与 MSW 模拟

进一步工具：
- 变异测试（StrykerJS）：评估测试有效性（Mutation Score），补强关键模块断言质量
- 契约测试（Pact）：前后端契约校验，避免集成阶段才暴露不兼容

## 扩展：工具与框架对比（精要）
- 单元：Vitest 启动快、与 Vite 集成佳；Jest 生态成熟（老项目可选）
- 组件：Testing Library 以用户语义断言，减少实现耦合
- HTTP Mock：MSW 在 Node/JSDOM 一致拦截，默认 onUnhandledRequest='error'
- E2E：Cypress（可视化强）/Playwright（并发快、跨浏览器）
- 度量：@vitest/coverage-v8 与 Codecov 差异覆盖；Stryker 变异分数衡量有效性
- 兼容提示：jest-dom 在 Vitest 中用 '@testing-library/jest-dom/vitest'；Vitest 与 coverage 插件版本保持一致
详细对比表见：docs/chapters/02a-tools-comparison.md