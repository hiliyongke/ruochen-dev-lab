# 附录：示例索引（按章节映射）

说明
- 本页将各章的关键知识点映射到 examples/react-ts-starter 下的可运行示例，便于“看完即跑”。
- 进入示例工程后运行：npm install && npm run dev。页面中“示例面板”可点击切换各 Demo。

章节到示例映射
- 第1章 从零认识 React
  - Hello/Clicker（hello）：src/demo/Hello.tsx、Clicker.tsx
- 第2章 Hooks 核心与陷阱
  - TransitionDemo（perf-transition）：src/demo/TransitionDemo.tsx
  - DeferredSearchDemo（perf-deferred）：src/demo/DeferredSearchDemo.tsx
  - CustomHookDemo（reuse-hooks）：src/demo/CustomHookDemo.tsx
- 第3章 组件通信与组合模式
  - ContextStateDemo（state-context）：src/demo/ContextStateDemo.tsx
  - CardSlotsDemo（slots）：src/demo/CardSlots.tsx
  - RenderPropsVsHOCDemo（reuse-rp-hoc）：src/demo/RenderPropsVsHOCDemo.tsx
- 第4章 路由与代码分割
  - RouterDemo（router）：src/demo/RouterDemo.tsx（懒加载 + 预取）
  - LoaderDeferDemo（router-defer）：src/demo/LoaderDeferDemo.tsx（路由级数据获取）
- 第5章 数据获取与缓存
  - SwrDemo（swr）：src/demo/SwrDemo.tsx
  - ReactQueryDemo（rq）：src/demo/ReactQueryDemo.tsx
  - FetcherDemo（fetcher）：src/demo/Fetcher.tsx
- 第6章 表单与校验
  - RhfBasic/RhfControllerDemo/RhfFieldArrayDemo/RhfZodDemo（rhf-*）：src/demo/[…].tsx
  - FormActionDemo（form-action）：src/demo/FormActionDemo.tsx（React 19 Actions + useActionState）
- 第7章 性能优化与并发特性
  - PerfMemoDemo（perf-memo）：src/demo/PerfMemoDemo.tsx
  - VirtualListDemo（perf-virtual）：src/demo/VirtualListDemo.tsx
- 第8章 可复用性与自定义 Hooks
  - CustomHookDemo（reuse-hooks）：src/demo/CustomHookDemo.tsx
- 第9章 状态管理选型
  - RTKDemo（state-rtk）：src/demo/RTKDemo.tsx
  - ZustandDemo（state-zustand）：src/demo/ZustandDemo.tsx
  - JotaiDemo（state-jotai）：src/demo/JotaiDemo.tsx
- 第10章 可访问性与国际化
  - A11yDemo（a11y）：src/demo/A11yDemo.tsx
  - I18nDemo（i18n）：src/demo/I18nDemo.tsx
- 第11章 测试与质量
  - TestableCounter（quality-counter）：src/demo/TestableCounter.tsx
  - MockApiWidget（quality-mock）：src/demo/MockApiWidget.tsx
- 第12章 工程化与部署
  - EnvDemo（eng-env）：src/demo/EnvDemo.tsx
  - ErrorReportingDemo（eng-error）：src/demo/ErrorReportingDemo.tsx
- 第13章 React 19 与 RSC/Actions 实战
  - FormActionDemo（form-action）：src/demo/FormActionDemo.tsx
  - LoaderDeferDemo（router-defer）：src/demo/LoaderDeferDemo.tsx

提示
- 若需查看每个 Demo 的入口：examples/react-ts-starter/src/App.tsx 内的 demos 数组。
- 若你使用 React Router 的数据 API（defer/Await）版本，请确保依赖版本满足其类型导出要求；本仓库提供了 loader 同步版以保证开箱可用。