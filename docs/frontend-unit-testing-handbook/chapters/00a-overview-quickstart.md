# 总览速读（10 分钟掌握要点）

适用对象：新加入项目或首次完善测试体系的同学。目标：10 分钟完成测试观念对齐与落地清单。

一、测试分层与比例
- Unit 70%+ / 组件/集成 20-25% / E2E 5-10%
- 单元聚焦纯逻辑；集成关注模块契约与 DOM 行为；E2E 仅覆盖关键业务路径

二、最小落地（Vite/Vitest 项目）
- 依赖：vitest @vitest/coverage-v8 @testing-library/react|vue @testing-library/jest-dom jsdom
- vitest.config.ts
  - test.globals=true，environment='jsdom'，setupFiles=['test/setup.ts']，coverage.provider='v8'
- test/setup.ts：引入 '@testing-library/jest-dom/vitest'；如有 HTTP，配置 MSW node server

三、HTTP 与异步
- MSW：setupServer + onUnhandledRequest='error'；测试内 server.use 动态覆盖接口
- 异步断言：优先 findBy*/waitFor；使用假时钟配合 vi.runOnlyPendingTimersAsync

四、可访问性与可维护性
- 选择器优先级：role > name > label > text > testid
- 引入 jest-axe 做 a11y 检查；错误边界要有 fallback 用例

五、质量门禁（CI）
- 差异覆盖（changed lines）≥ 90%；src/** 目录最小覆盖阈值（如 80%）
- 冒烟 E2E 独立 Job；缓存 node_modules/vite/vitest

六、团队协作
- 每个 bug 附带最小复现测试；评审 Checklist 检查可测试性与稳定性
- 使用 Test Data Builder/Fixture，避免重复样例数据

关联阅读
- 金字塔：chapters/01a-testing-pyramid.md
- 对比表：chapters/02a-tools-comparison.md
- 清单：chapters/11a-best-practices-checklist.md