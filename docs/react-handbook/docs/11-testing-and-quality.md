# 第11章 测试与质量：RTL、Vitest/Jest、契约测试、Mock、E2E 概览

## 导读与学习目标
你将学会：
- 在 React 中用 RTL（React Testing Library）驱动用户视角测试
- 用 Vitest/Jest 进行单元与组件测试、Mock/Spy、快照与覆盖率
- 何为契约测试（Contract Test），如何降低前后端协作回归成本
- 何时做 E2E 测试（Cypress/Playwright）与如何控制金字塔成本
预计用时：60–90 分钟

---

## 11.1 测试金字塔与覆盖面
- 单元/组件测试（底座，数量最多，快）：逻辑、边界、UI可见性与交互
- 集成/契约测试（中层）：模块协作、接口契约
- E2E（塔尖，少而关键）：关键用户旅程、支付/下单/授权

建议：80% 单元+组件，15% 集成/契约，5% E2E（视业务调整）

---

## 11.2 工程搭建与最佳实践
- 测试框架：Vitest（推荐，Vite 生态）或 Jest（二选一）
- 断言：@testing-library/jest-dom
- 覆盖率：--coverage，阈值在 CI 卡口
- 命名与目录：与被测文件同层 __tests__ 或 *.test.ts(x)
- 可测试性：组件对外暴露稳定可读的 role/name/label；避免测试实现细节

Vitest 基础配置示例（伪示例）：
```ts
// vitest.config.ts（示例）
// import { defineConfig } from 'vitest/config'
// export default defineConfig({ test: { environment: 'jsdom', setupFiles: ['./test/setup.ts'] } })
```

测试环境 setup（伪示例）：
```ts
// test/setup.ts
// import '@testing-library/jest-dom'
```

---

## 11.3 RTL 编写范式
- 查询策略：优先 byRole/byLabelText/byText，避免 getByTestId 滥用
- 用户事件：user-event 模拟真实交互（键盘/鼠标/输入）
- 异步：findBy* 与 waitFor，断言加载/错误/成功三态

示例要点（对应 TestableCounter）：
```tsx
// 断言初始值、点击 +1、键盘 Enter 也可触发
```

---

## 11.4 Mock 与契约测试
- Mock：隔离外部依赖（网络/时间/随机），更可控的断言
- MSW（Mock Service Worker）：以“网络层”拦截，最贴近真实
- 契约测试思想：将“接口响应结构 + 状态机”固化为契约，前后端对齐。变更时先更新契约再开发

示例要点（对应 MockApiWidget）：
- 成功/错误/空数据三态
- 重试按钮
- 请求节流/防抖（可选进阶）

---

## 11.5 E2E 概览（Cypress/Playwright）
- 选择之一即可：推荐 Playwright（多浏览器引擎一致性更好）
- 覆盖用户关键旅程（登录、筛选、下单）
- 控制数量：只测“冒烟 + 核心路径”，避免重复底层测试
- CI 并行与截图/视频留存

---

## 11.6 质量流水线与度量
- 预提交：lint-staged + ESLint/Prettier
- CI：安装依赖 → 构建 → 单元测试 → 报告覆盖率 → 执行关键 E2E
- 覆盖率不是目的：更关注“风险面”与“用户关键路径”是否被覆盖

---

## 本章小结
- RTL 专注用户视角；Vitest/Jest 生态成熟
- Mock 与契约测试降低集成风险；E2E 聚焦关键旅程
- 以流水线固化质量控制，并以业务风险为导向配置覆盖面

---

## 练习题
1. 为 TestableCounter 增加键盘 Enter 触发 +1，编写 RTL 用例断言
2. 为 MockApiWidget 编写“成功/错误/空数据”三态用例，使用 MSW 或手动 mock fetch
3. 在 CI 中添加覆盖率阈值，低于阈值直接失败

---

## 延伸阅读
- React Testing Library 文档
- Vitest / Jest 官方文档
- MSW（Mock Service Worker）
- Playwright / Cypress 官方文档

## 版本与补遗（最小可用片段）
- Vitest 最小配置（vite 项目）：
  ```ts
  // vitest.config.ts
  import { defineConfig } from 'vitest/config'
  export default defineConfig({
    test: { environment: 'jsdom', setupFiles: ['./test/setup.ts'] }
  })
  ```
  ```ts
  // test/setup.ts
  import '@testing-library/jest-dom'
  ```
- RTL 最小用例（对应 examples/react-ts-starter/src/demo/TestableCounter.tsx）：
  ```tsx
  import { render, screen } from '@testing-library/react'
  import user from '@testing-library/user-event'
  import { TestableCounter } from '@/demo/TestableCounter'
  test('click +1', async () => {
    render(<TestableCounter />)
    await user.click(screen.getByRole('button', { name: /\+1/ }))
    expect(screen.getByText(/count:\s*1/i)).toBeInTheDocument()
  })
  ```
- E2E：推荐 Playwright，先覆盖“冒烟 + 关键路径”，CI 并行执行并保留截图/视频。