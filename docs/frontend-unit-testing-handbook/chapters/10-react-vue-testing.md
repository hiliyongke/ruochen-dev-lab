# React 与 Vue 的测试实践

React：
- @testing-library/react 渲染
- user-event 模拟真实交互（键盘、粘贴）
- 钩子（hooks）测试：倾向通过组件行为间接验证；或使用 @testing-library/react 的自定义测试组件

Vue 3：
- @testing-library/vue 渲染
- 组合式 API 的逻辑拆到可测试的纯函数
- 对 Pinia/Vuex 状态注入测试用 store

跨框架建议：
- UI 以 role/label 查询
- 抽离副作用/IO，注入依赖便于打桩
- 暴露可观测行为（事件/输出），隐藏实现