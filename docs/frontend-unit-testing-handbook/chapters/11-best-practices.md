# 工程化与团队最佳实践

编码规范：
- 每个导出函数/组件至少有 1 个用例
- 公共工具优先补齐分支覆盖
- 新增功能 TDD 驱动小步提交

目录组织：
- 源码旁边放测试：foo.ts 与 foo.test.ts 同层
- e2e 放独立目录，分 CI Job

命名与可读性：
- 用例名表达意图：「应当…当…时…」
- AAA 分段空行清晰

稳定性：
- 禁用真实时间与随机数
- 网络使用 MSW/Mock
- 清理副作用（afterEach 清 DOM/定时器）

推进落地：
- 从最痛点模块开始
- 设定合理阈值与阶段目标
- 在评审环节强制「需要可测试性」

## 扩展：最佳实践清单（精要）
- 命名与结构：Given-When-Then/AAA，断言聚焦对外行为
- 异步与时序：优先 findBy*/waitFor；fake timers 配合 vi.runOnlyPendingTimersAsync
- 组件与 a11y：role/name/label 优先；引入 '@testing-library/jest-dom/vitest' 与 jest-axe
- HTTP 与契约：MSW 严格拦截；关键接口用 Pact；测试数据用 Builder/Fixture
- 覆盖与门禁：差异覆盖阈值、目录最小覆盖、变异分数基线纳入 CI
- 团队与 CI：矩阵并行、缓存加速、flaky 登记与根因修复
完整清单见：docs/chapters/11a-best-practices-checklist.md