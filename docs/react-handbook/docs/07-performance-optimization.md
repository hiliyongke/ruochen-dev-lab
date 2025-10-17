# 第7章 性能优化（避免 Re-render、并发特性、列表虚拟化）

## 导读
性能优化不是“盲目加 useMemo/useCallback”，而是以“可度量的瓶颈”为起点，结合渲染模型、依赖稳定性、并发特性（React 19）、列表与网络策略等手段，系统性地降低时延与卡顿。本章给出一套从定位→优化→验证→回归监控的闭环方法。

## 学习目标
- 掌握 React 渲染成本模型：触发渲染的来源、父子重渲染传播、提交阶段与布局影响
- 系统避免不必要的重渲染：组件分层、memo、稳定引用（useCallback/useMemo）、依赖收敛
- 理解并使用并发特性：startTransition、useDeferredValue 的适用边界
- 列表与重型节点优化：虚拟化、分块渲染、图片懒加载与占位骨架
- 建立“度量—优化—回归”的工程化闭环：Profiler、RUM 指标、报警与回滚策略

---

## 7.1 渲染成本模型与常见误区
- 触发渲染的常见来源：state/setState、父组件重渲染、context 变更、props 引用变化
- 渲染—提交两阶段：渲染阶段可中断（并发），提交阶段不可中断（DOM 变更）
- 误区：
  - 过度 memo：维护成本上升，收益不明显
  - 万能 useCallback/useMemo：若依赖不稳定或计算极轻，反而得不偿失
  - “一次性优化到底”：缺少基线与验证

建议：
- 先用 Profiler/性能面板定位“热点组件”和“频繁更新路径”
- 再做“切分 + 稳定 + 虚拟化”的针对性优化

---

## 7.2 组件分层与避免重渲染
策略：
- 粗到细：先切分“重型区域”为独立子树，再用 React.memo 定界
- 保持 props 引用稳定：回调与对象/数组 props 使用 useCallback/useMemo
- 避免全局 context 频繁变更穿透：拆 context 或结合选择器/订阅（如 use-context-selector）

示例（稳定回调/对象）：
```tsx
import React, { useMemo, useCallback, useState, memo } from "react"

const Heavy = memo(function Heavy({ data, onSelect }: { data: { id: number; name: string }[]; onSelect: (id:number)=>void }) {
  console.log("Heavy render")
  return (
    <ul>
      {data.map(d => (
        <li key={d.id}>
          <button onClick={() => onSelect(d.id)}>{d.name}</button>
        </li>
      ))}
    </ul>
  )
})

export function StableParent() {
  const [sel, setSel] = useState<number | null>(null)
  const data = useMemo(() => [{ id: 1, name: "Ada" }, { id: 2, name: "Grace" }], [])
  const onSelect = useCallback((id: number) => setSel(id), [])
  return (
    <div>
      <p>选中：{sel ?? "-"}</p>
      <Heavy data={data} onSelect={onSelect} />
    </div>
  )
}
```

要点：
- React.memo 局部化“是否重渲染”的判定
- 仅在 props/上下文变化时重渲染，稳定引用可显著降低父级波及

---

## 7.3 并发特性与过渡状态：startTransition/useDeferredValue
- startTransition：将“不紧急”的更新标记为过渡，优先保证输入/交互流畅
- useDeferredValue：推迟某个“昂贵值”的传递，输入先响应，重型渲染延后

示例（搜索结果延迟更新）：
```tsx
import React, { useState, useDeferredValue, useMemo } from "react"

function List({ keyword }: { keyword: string }) {
  // 模拟昂贵计算
  const items = useMemo(() => {
    const all = Array.from({ length: 5000 }, (_, i) => `item-${i}`)
    return all.filter(x => x.includes(keyword))
  }, [keyword])
  return <div>匹配：{items.length}</div>
}

export function DeferredSearch() {
  const [kw, setKw] = useState("")
  const deferredKw = useDeferredValue(kw)
  return (
    <div className="space-y-2">
      <input className="border px-2 py-1" value={kw} onChange={e => setKw(e.target.value)} placeholder="输入关键字" />
      <List keyword={deferredKw} />
    </div>
  )
}
```

注意：
- 并发特性 ≠ 自动优化一切，仍需“切分 + 稳定 + 渐进更新”配合
- 过渡状态与 Loading 的 UX 需明确反馈

---

## 7.4 列表虚拟化与分块渲染
- 虚拟化库（react-window/react-virtualized）：只渲染“可见窗口”的列表项
- 分块渲染：将大批量渲染拆成多帧（requestIdleCallback / setTimeout 分片）
- 图片懒加载：浏览器原生 loading="lazy" + 占位骨架，避免布局抖动（CLS）

简例（概念性，避免引入依赖）：
```tsx
// 思路：仅渲染 start..end 范围，容器占位高度保持滚动条稳定
// 生产建议直接使用 react-window 的 FixedSizeList
```

---

## 7.5 Profiler 与度量闭环
- 本地：React DevTools Profiler 获取渲染次数、渲染耗时、更新来源
- 线上：RUM 指标（FCP/LCP/INP/CLS）+ 性能埋点（首屏/切页/操作耗时）
- 回归保障：性能阈值报警 + 可视化看板（例如 DataDog/Grafana）+ 回滚策略

流程建议：
1) 建基线：在关键路径记录现状指标
2) 定位热点：Profiler 与代码层分析
3) 逐项优化：一处一验证
4) 回归监控：观察一段时间，防“优化倒退”

---

## 7.6 常见反模式与避坑
- 无差别 useMemo/useCallback：权衡计算成本与依赖维护成本
- 把大量 UI 状态放在顶层：状态就近化，减少级联更新
- 大 context 频繁更新：拆分上下文或局部订阅
- 函数组件定义内联大数据结构：用 useMemo 固定
- 列表 key 不稳定：导致 diff 失效与重建
- “大组件做一切”：拆分职责、引入边界组件

---

## 7.7 实战清单
- 渲染结构：拆分重型区域 + React.memo 定界 + 稳定 props
- 并发体验：startTransition/useDeferredValue 用在交互密集且昂贵渲染路径上
- 列表：虚拟化/懒加载/骨架 + 稳定高度避免 CLS
- 度量：先测再改，提交 PR 附上优化前后对比
- 监控：RUM 仪表盘与阈值报警

---

## 本章小结
- 优化的本质是“定位热区 + 收敛更新 + 渐进加载 + 持续度量”
- 并发特性是加速器，不是万能钥匙；仍需良好的组件切分与依赖管理
- 列表与图片是高频瓶颈场景，优先解决可见窗口与占位问题

---

## 练习（建议 30–50 分钟）
1) 使用 React.memo 与稳定回调将某“重型子树”的重渲染次数减半，并提交前后对比图
2) 将搜索结果计算改为 useDeferredValue，验证输入时的 INP/响应性提升
3) 为 5000+ 行列表接入虚拟化库（react-window），测量渲染时长与内存占用变化
4) 引入 Profiler 对比优化前后关键页面切换耗时

---

## 延伸阅读
- React 官方：Optimizing Performance
- React 19 并发特性（Transitions/Deferred Value）
- INP 与交互性能指标实践
- react-window/react-virtualized 文档与最佳实践