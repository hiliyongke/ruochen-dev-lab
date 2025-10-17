# 附录：面试题精选（含要点提示）

说明
- 本附录覆盖 React 常见高频题与近版本（React 19）特性考点。
- 每题附“要点提示”，便于自检与二次扩展。

一、基础与 JSX
1) React 与 JSX 的关系？虚拟 DOM 解决了什么问题？
- 要点：JSX 是 createElement 的语法糖；虚拟 DOM 是对象描述 UI，带来跨平台/最小化变更/可中断渲染等；并非性能银弹，核心价值是工程能力与可控更新。

2) key 的作用与工作原理？
- 要点：协助列表 diff 定位同一节点，避免错误复用/重建；稳定且局部唯一；索引作为 key 会导致移动/插入时复用错误。

3) 受控与非受控组件区别？
- 要点：受控 value/checked 由 state 驱动，单一数据源；非受控通过 ref 读取；复杂表单优先受控或库（RHF），文件上传等可用非受控。

二、Hooks 与渲染机制
4) useEffect 与 useLayoutEffect 区别？避免无限循环的要点？
- 要点：layout 同步、effect 异步；依赖列表稳定、在 effect 内不要直接更新依赖；清理函数时机；数据获取放 effect/路由 loader，避免 render 期副作用。

5) 自定义 Hook 的输入输出稳定性如何保证？
- 要点：以参数为最小依赖；返回值用 useMemo/useCallback 保持引用稳定；避免把可变对象直接当依赖。

6) 为什么不要在条件/循环中调用 Hook？
- 要点：Hook 调用顺序必须一致，违反将错位；用条件包裹内部逻辑，而不是调用本身。

三、性能与并发特性
7) memo/useMemo/useCallback 该如何取舍？
- 要点：以“计算/子树成本”与“稳定引用外溢面”为准；过度 memo 反增复杂度；配合 key、分片列表（虚拟滚动）。

8) React 19 的过渡与中断渲染（useTransition）有什么用？
- 要点：把低优先级更新标记为可中断，提升交互流畅性；避免在 transition 内做必须同步的状态。

四、路由与数据获取（v6.4+ Data APIs）
9) 组件内请求 vs 路由级 loader/action 的权衡？
- 要点：路由级聚合数据、并发、错误边界、SSR 友好；组件内请求更内聚但易重复；大型应用建议路由级为主、组件级补充。

10) defer/Await 与 Suspense 的价值？
- 要点：分块/流式加载与骨架；需要正确错误边界与时序；类型/版本匹配很重要。

五、表单与校验
11) 受控表单性能优化策略？
- 要点：字段粒度拆分、避免顶层状态抖动；RHF 控制非受控注册；schema（zod/yup）校验与异步校验分层。

12) React 19 Form Actions 与 useActionState 如何配合？
- 要点：`<form action={fn}>` 服务端/客户端动作统一；useActionState 管理 pending 与结果；渐进增强（原生提交流程可回退）；与路由 action 区别与取舍。

六、状态管理选型
13) 何时用 Context、Zustand、Redux Toolkit、Jotai？
- 要点：Context 适合配置/少量全局；Zustand 简洁轻量、选择器；RTK 标准化流程与生态；Jotai 粒度更细；以“可观测/可回放/中间件”需求决定。

14) 派生状态与缓存的边界？
- 要点：尽量派生不存储；昂贵计算才缓存；同一数据源的 write-through 方案与一致性。

七、RSC 与 Actions（React 19）
15) React Server Components 的边界与约束？
- 要点：仅在服务器执行，无浏览器副作用/事件处理；通过 props/缓存与客户端组件协作；路由/框架（如 Next.js）更易落地。

16) Actions 与 Router action 的区别？
- 要点：前者绑定到表单/按钮，函数签名由 React 管控；后者属于路由数据 API，用于路由级变更；二者可互补，避免重复校验与双写。

八、测试与工程化
17) React Testing Library 的测试哲学？
- 要点：以用户视角（getByRole/getByText）；避免实现细节（class/state）断言；可结合 MSW 模拟网络。

18) VitePress/CI 部署要点？
- 要点：分离构建与预览；缓存 node_modules；PR 构建预览；静态站选择 Pages/Vercel/Netlify；环境变量管理。

附：思考与扩展题（简答）
A) 为什么“虚拟 DOM 一定更快”是误解？
- 要点：快慢取决于场景与实现；VDOM 强在工程能力与可控更新。

B) 何时应该放弃复用一个复杂组件？
- 要点：复用成本 > 重写成本；设计 API 面向真实变化；通过组合替代过度抽象。

C) 如何避免“数据请求重复/竞态”？
- 要点：单一数据面（路由 loader/缓存库）；竞态取消与落后响应丢弃；Stream/Suspense。

参考实践
- 对应示例：见“附录：示例索引（章节映射）”。
- 更深入：将题目转化为最小可运行 Demo，再配合断点/Profiler 分析。