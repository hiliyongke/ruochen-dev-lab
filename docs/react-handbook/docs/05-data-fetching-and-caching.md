# 第5章 数据获取与缓存（SWR vs React Query）

## 导读
现代前端的数据层不仅仅是“发起请求”，还涉及缓存、失效策略、并发与竞争、错误与重试、加载与骨架、请求去重、依赖刷新和预取等。本章对比 SWR 与 React Query 两大方案，结合工程实践给出可落地的选型标准与套路，覆盖从入门到进阶的常见场景。

## 学习目标
- 理解数据获取的通用问题：缓存、重试、并发一致性、占位与骨架、错误可恢复
- 掌握 SWR 与 React Query 的核心 API、行为差异与适用边界
- 能为列表/详情/表单提交流程设计合理的数据流与缓存策略
- 学会失效与刷新、依赖查询、乐观更新与回滚、错误边界搭配
- 了解与 Suspense 的协同现状与注意事项

---

## 5.1 数据获取的工程挑战与通用模型
常见痛点：
- 重复请求与竞态：同一 key 多次请求如何去重/合并；后返回的旧数据覆盖新数据
- 缓存一致性：新建/更新/删除后如何使列表与详情保持一致
- 加载体验：首屏骨架、分页骨架、占位符；刷新与失效的时机和可视反馈
- 错误恢复：重试策略、退避（exponential backoff）、手动重试按钮、错误边界
- 预取与性能：路由跳转前的预加载、滚动到视口前的懒加载
- 并发特性：过渡状态下的请求与 UI 交互（React 19 的 startTransition）

通用抽象：
- key（数据身份）→ fetcher（获取函数）→ 缓存（内存/持久化）→ 失效/刷新（触发更新）→ 订阅（组件更新）

---

## 5.2 SWR 核心用法与特点
SWR（stale-while-revalidate）强调“先陈旧数据命中缓存→后台再校验刷新”的体验，默认具有请求去重、焦点重新聚焦/网络恢复自动刷新。

基本用法：
```tsx
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function UserCard({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useSWR(`/api/users/${id}`, fetcher)
  if (error) return <div>加载失败</div>
  if (isLoading) return <div>加载中…</div>
  return (
    <div>
      <p>{data.name}</p>
      <button onClick={() => mutate()}>手动刷新</button>
    </div>
  )
}
```

要点：
- key 为字符串或数组；数组便于依赖参数组合
- mutate 用于手动失效与更新，支持乐观更新
- 焦点聚焦/网络恢复时自动 revalidate，可全局配置关闭/调整

适用场景：
- 简洁 API，轻量缓存；中小型页面数据、简单依赖刷新、无需复杂关联失效

---

## 5.3 React Query 核心用法与特点
React Query（@tanstack/react-query）提供更完整的查询/变更生态：查询缓存、失效、重试、乐观更新、并行/依赖查询、持久化、开发工具等，更适合中大型项目。

基本用法：
```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

async function getUser(id: string) {
  const r = await fetch(`/api/users/${id}`)
  return r.json()
}

async function updateUser(id: string, body: any) {
  const r = await fetch(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(body) })
  return r.json()
}

export function UserProfile({ id }: { id: string }) {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ["user", id], queryFn: () => getUser(id) })
  const mutation = useMutation({
    mutationFn: (payload: any) => updateUser(id, payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ["user", id] })
      const prev = qc.getQueryData(["user", id])
      qc.setQueryData(["user", id], (old: any) => ({ ...old, ...payload })) // 乐观更新
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["user", id], ctx.prev) }, // 回滚
    onSettled: () => { qc.invalidateQueries({ queryKey: ["user", id] }) },
  })

  if (isLoading) return <div>加载中…</div>
  if (error) return <div>出错了</div>
  return (
    <div>
      <p>{data.name}</p>
      <button onClick={() => mutation.mutate({ name: "New Name" })}>更新</button>
    </div>
  )
}
```

要点：
- queryKey 统一标识数据；invalidateQueries 精准失效
- useMutation 提供完整的乐观更新/回滚钩子
- Devtools/持久化（persistQueryClient）便于调试与离线

适用场景：
- 多模块共享数据、复杂失效链、乐观更新、批量查询与依赖刷新

---

## 5.4 SWR vs React Query：对比与选型
- API 复杂度：SWR 简洁；RQ 功能全面（学习曲线更陡）
- 失效与更新：SWR 以 mutate 为中心；RQ 以 queryKey + invalidate 为中心
- 变更（写）流程：SWR 通过手工 mutate；RQ 有 useMutation 的配套语义
- 特性生态：RQ 内置重试/退避、并行与依赖、Devtools、持久化；SWR 有基础能力 + 插件化
- 规模：中小项目/SWR 足够；中大项目/数据域复杂 → RQ 更合适
- 与路由的协同：两者皆可搭配懒加载路由与骨架屏

简易决策建议：
- 页面内/简单数据，偏读多写少：SWR
- 读写并重、多页面共享与联动、严格一致性：React Query

---

## 5.5 加载体验：骨架、占位与刷新
- 初次加载：Skeleton/渐进占位，确保不“白屏”
- 后台刷新：小型局部 spinner 或淡入刷新，避免主内容跳动
- 分页/列表：行级骨架/占位卡片 + 保持滚动位置
- 与错误边界：仅对灾难性错误使用错误边界；可恢复的接口错误以“摘要 + 重试”呈现

---

## 5.6 依赖查询、并发与去重
- 依赖查询：根据上游 query 的 data 决定下游启用（RQ 的 enabled / SWR 的条件 key）
- 并发请求：避免重复；SWR 与 RQ 均有层面上的去重/共享
- 请求取消与竞态：组件卸载/参数变化时中断旧请求（fetch + AbortController，或库内置处理）

---

## 5.7 预取与路由协同
- 路由 hover/视口进入前预取下一页数据（搭配第4章的 PrefetchLink 思路）
- 进入页面立即可渲染缓存数据，再在后台刷新
- 预取要“可见即合理”：避免预取过量造成资源争抢

---

## 5.8 Suspense 协同（前瞻）
- 两者均在逐步完善对 Suspense 的支持；生产中需谨慎评估
- 建议仍以“显式 isLoading + 占位”为主流方案；在次级体验点尝试 Suspense

---

## 本章小结
- 数据获取的关键在于“缓存 + 失效 + 体验 + 一致性”；不要只停留在“请求-渲染”
- SWR 以“简单好用”为长，React Query 以“功能完备”见长
- 合理的骨架与后台刷新能显著提升体感；错误呈现要可恢复
- 预取与懒加载协同能降低切页等待；谨慎使用 Suspense

---

## 练习（建议 30–50 分钟）
1) 用 SWR 实现一个用户详情卡片，要求：焦点聚焦自动刷新、提供手动刷新按钮
2) 用 React Query 实现一个“更新资料”流程：点击更新后进行乐观更新，失败回滚并提示
3) 为列表页加上分页骨架；切换页码时保持滚动位置与主内容稳定
4) 结合第4章，为“用户详情”页面在 hover 菜单时预取数据；观察网络面板变化

提示/参考：
- SWR：条件 key（如 id 存在才发起）、mutate 的乐观策略
- React Query：enabled、invalidateQueries、onMutate/onError/onSettled 钩子
- 骨架优先，错误可恢复，预取适度

---

## 延伸阅读
- SWR 文档：https://swr.vercel.app/
- TanStack Query（React Query）文档：https://tanstack.com/query/latest
- HTTP 缓存与 ETag/Last-Modified 机制
- Exponential backoff 与重试策略设计

## 版本与补遗
- 与路由 Data API 协同：切页数据用 loader/defer 提前获取，页面内部交互与细粒度刷新继续用 SWR/RQ；通过 queryKey/invalidate 与路由导航事件联动。
- 与 SSR/RSC：SSR/RSC 负责首屏/骨架与接近数据源的缓存；客户端 SWR/RQ 负责交互后的即时命中、乐观更新与离线。注意避免双重请求（hydrate 传入初始数据）。
- Suspense 协作：生产中仍以显式 isLoading 为主；在 defer/局部 Suspense 子树尝试渐进体验，保留回退路径。
- 预取策略：与第4章的 PrefetchLink/路由预取结合，关键页面 hover 时预取数据与分片。