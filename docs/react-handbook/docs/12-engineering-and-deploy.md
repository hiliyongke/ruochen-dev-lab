# 第12章 工程化与部署：构建优化、Env、CI、监控与错误上报

## 导读与学习目标
你将学会：
- 基于 Vite 的构建优化路线（分包、懒加载、分析包体、CDN/缓存）
- 环境变量与配置分层（本地/测试/生产），以及安全暴露边界
- CI/CD 基线流程与质量卡口（构建、测试、覆盖率、预览部署）
- 前端监控与错误上报框架（采集、脱敏、抽样、上报、告警）
- 发布与回滚策略（版本化、灰度、回退）

预计用时：60–90 分钟。

---

## 12.1 构建优化
- 代码分割：动态 import 懒加载路由与重组件；共用依赖抽至 vendor
- 产物分析：使用插件（如 rollup-plugin-visualizer）审查大依赖
- Tree-shaking：按需引入组件库；避免 “* as lib”
- 资源缓存：文件名哈希 + 长缓存；HTML 不缓存
- CDN 与边缘：静态资源下发到边缘；SSR/预渲染可选

清单：
- 路由懒加载 + Suspense
- 可视化 bundle 分析与预算阈值
- 图片/字体压缩与格式选择（webp/woff2）

---

## 12.2 环境与配置（Env）
- Vite 以 import.meta.env 暴露 VITE_ 前缀变量
- 区分构建时与运行时配置：运行时变更可用 window.__RUNTIME_CONFIG__（或服务端注入）
- 安全边界：仅暴露可公开信息（例如静态 API 网关域名），敏感密钥绝不下发

推荐：
- .env.local 本地开发；.env.production 生产；CI 注入敏感变量作为构建时替换
- EnvDemo 展示读取 VITE_API_BASE、MODE 等

---

## 12.3 CI/CD 基线
- 典型阶段：install → lint/typecheck → build → unit/component test → 预览部署（PR 环境）→ 产物扫描
- 质量卡口：覆盖率阈值、bundle 体积阈值、lint 阻断
- 多环境：dev/staging/prod 分支策略；tag 触发生产部署

---

## 12.4 前端监控与错误上报
- 采集：window.onerror、unhandledrejection、ErrorBoundary
- 抽样：减少噪声，按错误率/用户量动态抽样
- 脱敏：去除个人信息/Token；仅保留必要上下文
- 上报：fetch/beacon；服务端聚合 + 告警
- ErrorReportingDemo 展示 ErrorBoundary 捕获 + 简易上报逻辑

---

## 12.5 发布与回滚
- 版本化：SemVer + Changelog；前端静态资源加 hash
- 灰度：按流量或用户特征逐步放量
- 回退：保留 N 个可回退版本；CDN 回源切换/版本指针回滚

---

## 本章小结
- 优先从“分包与懒加载、可视化审计、长缓存”入手做构建优化
- Env 仅暴露可公开信息；区分构建/运行时配置
- CI 以质量卡口固化产线
- 监控与上报：采集→抽样→脱敏→上报→告警；回滚机制必须预置

---

## 练习题
1. 为项目添加 bundle 可视化与体积阈值校验（构建失败条件）
2. 为 ErrorBoundary 增加“用户反馈附加信息”表单，并将信息一并上报
3. 设计一套 PR 环境预览流程：每个 PR 自动部署并回帖预览链接

---

## 延伸阅读
- Vite 官方文档：环境变量与模式、构建优化
- Rollup 文档与可视化工具
- Web 前端可观测性实践：RUM、错误聚合与告警
- GitHub Actions / GitLab CI 模板库

## 版本与补遗（最小可用片段）
- GitHub Actions 最小 CI（Vite + Vitest）：
  ```yaml
  name: CI
  on: [push, pull_request]
  jobs:
    build-test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 20 }
        - run: npm ci
        - run: npm run build
        - run: npm run test -- --coverage
  ```
- 错误上报最小示例（窗口级）：
  ```ts
  window.addEventListener('error', (e) => {
    navigator.sendBeacon('/monitor', JSON.stringify({ type: 'error', msg: e.message }))
  })
  window.addEventListener('unhandledrejection', (e) => {
    navigator.sendBeacon('/monitor', JSON.stringify({ type: 'promise', msg: String(e.reason) }))
  })
  ```
- 版本化与回滚：产物加 hash，CDN 配置回源指针；预留 N 个版本快速切换。