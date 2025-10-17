# 第8章 可复用性：自定义 Hooks、Render Props 与 HOC 的取舍

## 导读与学习目标
本章聚焦 React 复用性的三种主要形态：组件组合（Composition）、自定义 Hooks、Render Props 与 HOC。你将学会：
- 何时优先使用组合 vs 抽象逻辑
- 如何设计健壮的自定义 Hooks（参数、返回值、依赖、清理）
- Render Props 与 HOC 的适用场景与常见坑
- 从类库实践中提炼复用模式与迁移路径

阅读前提：掌握第2章 Hooks 核心；了解 Context；具备基础 TypeScript 能力。
预计用时：60–90 分钟。

---

## 8.1 复用的层级：先组合，再抽象
- UI 复用优先采用组合/插槽（children、以 props 注入结构），避免过早抽象逻辑。
- 当重复出现“相同副作用/状态机/数据请求控制”时，再通过自定义 Hook 抽象。
- Render Props/HOC 作为历史沿革与特殊场景手段：跨框架、无 Hooks 时代兼容、注入横切能力（权限、埋点）。

要点：
- 组合解决“结构”和“排列”问题
- 自定义 Hook 解决“可共享的状态与副作用”问题
- Render Props/HOC 解决“注入与包裹”问题

---

## 8.2 自定义 Hooks 设计指南
核心原则：
- 单一职责：每个 Hook 只做一件事（如 useToggle、useInterval、useFetch）
- 纯函数思维：输入参数决定行为，避免隐藏的外部可变状态
- 稳定引用：返回的回调应使用 useCallback；暴露的数据应稳定，必要时 useMemo
- 清理与边界：副作用必须清理（返回函数），考虑组件卸载 race condition

示例：useToggle 与 useInterval
```ts
import { useCallback, useEffect, useRef, useState } from "react"

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn(v => !v), [])
  const setTrue = useCallback(() => setOn(true), [])
  const setFalse = useCallback(() => setOn(false), [])
  return { on, toggle, setTrue, setFalse }
}

export function useInterval(fn: () => void, ms: number, options?: { immediate?: boolean }) {
  const saved = useRef(fn)
  useEffect(() => { saved.current = fn }, [fn])
  useEffect(() => {
    let timer: number | null = null
    if (options?.immediate) saved.current()
    timer = window.setInterval(() => saved.current(), ms)
    return () => { if (timer !== null) window.clearInterval(timer) }
  }, [ms, options?.immediate])
}
```

注意：
- 通过 ref 保存最新回调，避免闭包过期
- 清理定时器，防止内存泄漏
- 提供最小必要 API，避免过度返回

---

## 8.3 Render Props：函数作为 children
优势：
- 精确控制渲染输出，逻辑/数据与视图解耦
- 组合性强，可与多层提供者协作

注意点：
- 多层嵌套易导致“回调地狱”与阅读成本
- 函数组件每次渲染重新创建函数，需关注性能（memo/stable props）

小示例伪代码：
```tsx
<DataProvider render={(data, state) => (
  <List items={data} loading={state.loading} />
)} />
```

---

## 8.4 HOC：高阶组件的边界与迁移
优势：
- 以包裹方式注入能力（鉴权、埋点、错误边界）
- 适合与类组件或不支持 Hooks 的生态对接

注意点：
- 破坏组件树层次的直观性，调试不友好
- 静态属性（displayName）与 ref 透传（forwardRef）需补强
- TypeScript 泛型推断复杂，Props 竞合风险

迁移建议：
- 优先以自定义 Hook + 组合替代
- HOC 保留在路由守卫、错误边界、遗留兼容等场景

---

## 8.5 实战范式与防坑清单
- Hook 命名以 use 开头，导出稳定 API
- 依赖项数组明确，必要时提炼到参数中
- 处理竞态：在 effect 清理阶段终止异步/订阅
- 拆分：请求控制（重试、取消）与渲染分离
- 文档化：说明前置条件、返回值与副作用

---

## 本章小结
- 复用优先级：组合 > 自定义 Hook > Render Props/HOC
- 自定义 Hook 关注稳定引用、清理与最小 API
- Render Props/HOC 是工具箱的一部分，但避免滥用

---

## 练习题
1. 将项目中两处重复使用的“节流输入框”逻辑抽成 useThrottleInput Hook，支持 maxWait。
2. 使用 Render Props 改造一个权限控制组件 <Auth>{(allowed) => ...}</Auth>。
3. 用 HOC 实现 withErrorBoundary，包裹任意组件并提供 fallback。

提示：结合第7章的性能要点，确保返回回调稳定、避免不必要重渲染。

---

## 延伸阅读
- React 官方：Reusing Logic with Custom Hooks
- Kent C. Dodds：Application State Management with Hooks
- Overreacted：A Complete Guide to useEffect
- React Conf 资料：Concurrent Features & Transitions