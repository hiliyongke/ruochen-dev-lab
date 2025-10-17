# 第9章 状态管理选型：Context / Redux Toolkit / Zustand / Jotai

## 导读与学习目标
本章帮助你基于实际工程语境选型与落地状态管理方案。你将学会：
- 识别“组件内局部状态”“跨组件共享状态”“服务端数据状态（远端）”的边界
- 以 Context 处理轻量跨层通信；以 Redux Toolkit（RTK）处理复杂共享与协作；以 Zustand/Jotai 实现更轻量的原子化/切片化
- 结合第5章（SWR/React Query）明确“远端数据（server state）不应与本地状态（client state）混淆”的原则

预计用时：60–90 分钟

---

## 9.1 状态分类与边界
- 局部 UI 状态（组件内部）：useState/useReducer 解决
- 跨组件共享状态（client state）：Context/RTK/Zustand/Jotai
- 远端数据（server state）：优先用 SWR / React Query 管理缓存、重试、失效与请求生命周期
- 原则：不要用全局状态工具缓存服务端数据；混用会导致失效与一致性问题

---

## 9.2 Context：轻量共享的首选
适用场景：
- 主题、语言、登录用户、权限标记等低频、低复杂度共享信息
实践要点：
- 值稳定：useMemo 包装 context value
- 控制渲染范围：拆分 Provider，或拆出 selector 化读取
- 复杂逻辑建议 useReducer 组合

---

## 9.3 Redux Toolkit（RTK）：团队协作与复杂业务
适用场景：
- 多人协作、严格不可变数据、DevTools 调试、可回溯/中间件/工作流
优势：
- createSlice/createAsyncThunk 减少样板代码
- Immer 内建不可变更新
- 强生态（react-redux、RTK Query）

---

## 9.4 Zustand：极简且高性能的切片化
适用场景：
- 简单到中等复杂度的全局状态；无需样板与 Provider 层层包裹
优势：
- 选择器订阅细粒度切片，避免不必要重渲染
- 中间件生态（持久化、开发工具）轻量

---

## 9.5 Jotai：原子化思维
适用场景：
- 以“原子”为最小单位组织状态，组合导出派生原子，天然避免“大仓”耦合
优势：
- 原子级刷新，组合灵活；心智模型简单

---

## 9.6 选型建议
- 首选组合/Context 解决简单共享；复杂度上来再引入状态库
- 团队协作和强流程：RTK；个人/小型项目倾向 Zustand/Jotai
- 服务端数据：SWR/React Query；与本地状态分离
- 可演进架构：以 Context/Hook 包裹第三方库，暴露项目内统一 API，降低迁移成本

---

## 实战要点清单
- Context value 使用 useMemo；拆 Provider 降低刷新范围
- RTK 切片化 domain；Selector 选择最小读取；避免把 server state 放入 store
- Zustand/Jotai 使用选择器/原子衍生，保持订阅精细粒度
- 类型与测试：公共 store API 有 TS 类型与基本单测

---

## 本章小结
- 状态分层，工具有边界；远端与本地分治
- 简单用 Context，自定义 Hook 包裹；复杂协作用 RTK；轻量高效可选 Zustand/Jotai

---

## 练习题
1. 使用 Context+useReducer 重构“主题与语言”双配置，并确保切换时仅相关组件刷新
2. 将一个计数器与待办列表放入 RTK，不同页面通过 selector 选择不同切片
3. 使用 Zustand 编写购物车 store，拆分选择器并持久化到 localStorage
4. 使用 Jotai 将表单状态拆为多个原子，编写一个派生原子返回校验状态

---

## 延伸阅读
- Redux Toolkit 官方文档与风格指南
- Zustand 与 Jotai 官方文档
- Mark Erikson：State Management – A (Mostly) Complete Guide
- React 官方：You Might Not Need Redux