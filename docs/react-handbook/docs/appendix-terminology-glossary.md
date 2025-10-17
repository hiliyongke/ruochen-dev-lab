# 附录：术语表（统一翻译与中英对照）

说明
- 本表用于全书统一术语、减少歧义。若有新术语，请先在此登记后再使用。
- 约定：首现英文+中文，后文可直接使用中文或约定简写。

核心
- React concurrent features 并发特性
- startTransition 启动过渡/过渡更新
- useDeferredValue 延后值/延迟值
- Suspense 悬念边界/异步占位
- Error Boundary 错误边界
- Reconciliation 协调
- Commit phase 提交阶段
- Render phase 渲染阶段
- Virtual DOM 虚拟 DOM
- Re-render 重新渲染
- Memoization 记忆化
- Controlled component 受控组件
- Uncontrolled component 非受控组件
- Form validation 表单校验
- Data fetching 数据获取
- Caching 缓存
- Invalidation 失效/作废
- Optimistic update 乐观更新
- Prefetch 预取
- Code splitting 代码分割
- Lazy loading 懒加载
- Route layout 路由布局
- Server state 服务端状态
- Client state 客户端状态/本地状态
- Context 上下文
- Provider 提供者
- Selector 选择器（状态选择函数）
- Custom Hook 自定义 Hook
- Render Props 渲染属性
- Higher-Order Component (HOC) 高阶组件
- Redux Toolkit (RTK) Redux 工具包
- Zustand Zustand（音译，轻量状态库）
- Jotai Jotai（音译，原子化状态库）
- i18n 国际化
- a11y 可访问性
- ARIA 无障碍富互联网应用规范
- Keyboard accessibility 键盘可达
- Focus management 焦点管理
- RTL (React Testing Library) React 测试库
- Vitest/Jest 测试框架
- Contract test 契约测试
- E2E end-to-end 端到端测试
- CI/CD 持续集成/持续部署
- RUM Real User Monitoring 真正用户监控
- Error reporting 错误上报
- Bundle 产物包
- Tree shaking 摇树优化
- Long-term caching 长缓存
- CDN 内容分发网络
- Environment variables 环境变量
- Feature flag 特性开关
- Lint/Prettier 规范/格式化
- Monorepo 单一仓库多包
- Changelog 变更日志

翻译与风格约定
- Hook 名称：统一保留英文小驼峰（例如 useEffect），首现加中文解释
- 组件与库名：保持原名，首次出现加中文解释（示例：Zustand——轻量状态库）
- “并发/concurrent”：指 React 19 并发更新能力（Transitions/Deferred 等），避免与“多线程”混淆
- “缓存/cache”与“失效/invalidate”：与数据请求场景一致，统一用词
- 错误/异常：User-facing 文案用“出错/加载失败”，技术语境用“异常/错误”区分

术语更新流程
- 新增术语时，在“核心/扩展”分区新增条目，并在 PR 中 @评审确认