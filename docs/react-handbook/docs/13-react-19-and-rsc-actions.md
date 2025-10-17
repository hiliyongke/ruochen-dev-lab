# 第13章 React 19 与 RSC/Actions 实战（升级与取舍）

## 导读
本章聚焦 React 19 带来的关键变化与工程落地：Form Actions 的渐进增强提交、React Server Components（RSC）的基本模型、流式渲染与缓存协同、与 React Router 6.4+ Data APIs 的对比与取舍，最后提供一份迁移清单与风险提示。目标是让你在保持现有项目稳定的前提下，有序拥抱 React 19 新能力。

## 学习目标
- 理解 React 19 的 Actions 与表单提交流程，编写可回退的渐进增强表单
- 理解 RSC 的约束与价值：组件运行于服务端、仅传输序列化 payload、减少客户端包体
- 掌握流式渲染/缓存的基本思路与与数据层（SWR/RQ）协同
- 能在“组件内数据获取 vs 路由 Data APIs vs RSC”之间做架构取舍
- 具备一份可执行的升级/迁移清单

---

## 13.1 React 19 核心：Actions（表单 Actions）

- 思想：以“原生 form 提交”为基座，借助 Actions 在客户端或服务端处理提交逻辑，可渐进增强（JS 可用时无刷新、不可用时也能回退）。
- 好处：更接近平台、天然可回退、减少冗余 JS；与并发特性/过渡状态良好配合。

最小示例（客户端 Action，模拟提交与错误）
```tsx
import { useState, startTransition } from "react";

type Result = { ok: boolean; message?: string };

function saveProfile(formData: FormData): Promise<Result> {
  return new Promise((resolve) =>
    setTimeout(() => {
      const name = String(formData.get("name") || "");
      resolve(name ? { ok: true } : { ok: false, message: "姓名必填" });
    }, 600)
  );
}

export default function ProfileForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(false);

  async function onAction(formData: FormData) {
    setPending(true);
    const r = await saveProfile(formData);
    startTransition(() => {
      setResult(r);
      setPending(false);
    });
  }

  return (
    <form action={onAction} className="space-y-3">
      <input name="name" className="border px-2 py-1" placeholder="姓名" />
      <button disabled={pending} className="px-3 py-2 border rounded">
        {pending ? "提交中..." : "保存"}
      </button>
      {result && !result.ok && <p className="text-red-600">{result.message}</p>}
      {result?.ok && <p className="text-green-600">保存成功</p>}
    </form>
  );
}
```
- 渐进增强：即使 JS 失效，form 仍会向 action 的 URL 正常提交（需要配合后端处理）；在纯前端项目中可通过路由/接口承接或退化到传统提交。
- 与 RHF：复杂校验/联动仍可用 RHF 提升 DX，最终提交可通过 form action（或 fetch）触发。

---

## 13.2 React Server Components（RSC）基础

- 运行时：组件在服务端执行，返回可序列化的 UI 描述；客户端只接收最小 payload 与必要的“客户端边界组件”（client boundaries）。
- 价值：显著降低客户端包体与水合成本；天然靠近数据/后台资源。
- 约束：
  - RSC 内不能使用客户端专属 API（如 window、useEffect 等）。
  - 需要构建/路由框架（Next.js 等）支持；纯 Vite SPA 需借助生态方案或保持 CSR/SSR 传统模式。

RSC 模型（示意）：
```mermaid
flowchart LR
  U[用户请求] --> S[服务器渲染RSC]
  S --> P[返回RSC Payload(可流式)]
  P --> C[客户端边界渲染/水合]
  C --> UI[最终UI]
```

何时考虑 RSC：
- 大型应用、页面首屏复杂、大量数据依赖，且可使用 Next.js 等具备 RSC 能力的框架
- 对包体、首屏/切页 TTIF/CPU 预算要求严格

---

## 13.3 流式渲染与缓存协同（前瞻/实践）

- 流式：首屏优先返回关键 UI，次要内容流式注入，避免“白屏等待”；RSC/SSR/路由 Data API 均可协作实现。
- 缓存协同：
  - RSC 层：接近数据源的缓存（如 fetch 缓存、框架内置缓存）
  - 客户端：SWR/React Query 做事件后/二次访问命中，减少重复
- 取舍：数据越靠近服务端，缓存一致性越强；客户端仍承担交互时的快速反馈、乐观更新与离线支持

---

## 13.4 React Router 6.4+ Data APIs vs 组件内数据获取 vs RSC

- 组件内获取（SWR/RQ）：
  - 优点：简单、组件内聚合、生态成熟
  - 缺点：首屏需要骨架/占位；数据“靠后”
- 路由 Data API（loader/action/defer）：
  - 优点：切页模型天然匹配、错误边界与状态整合、更早获取数据
  - 缺点：需要改写路由组织方式；与现有 SWR/RQ 叠加需做好边界
- RSC：
  - 优点：最薄的客户端、最佳首屏与一致性
  - 缺点：需框架支持；客户端交互边界更复杂

建议：
- 纯 SPA：优先用 SWR/RQ；针对切页/关键路径可引入 Router Data API
- 全栈/Next.js：优先采用 RSC + Actions；客户端以 SWR/RQ 做增量体验

---

## 13.5 升级/迁移清单

- 版本策略：以 React 19 为基线，逐步在局部引入 Actions 与 Router Data API 能力；对存量页面保持平滑演进
- 表单：
  - 简单表单改用 form action（渐进增强）
  - 复杂校验/联动继续 RHF，提交层可接 form action 或 fetch
- 路由数据：
  - 切页关键路径可用 loader/defer 提前取数；组件内仍可用 SWR/RQ 细化
- 监控与回退：
  - 引入新特性前建立指标基线；提供回退开关（特性开关/环境变量）

---

## 本章小结
- React 19 的 Actions 让“更接近平台”的表单提交流畅回归主流
- RSC 是降低客户端负担的方向，但需要框架与组织方式的改变
- 在 SPA 场景中，Data API 可以作为“切页层”的数据方案，SWR/RQ 负责页面内的交互层
- 升级应循序渐进：先点状引入，度量验证，再逐步扩大覆盖

---

## 练习
1) 将一个资料编辑表单改为 form action 提交，并在 JS 禁用时验证仍可提交  
2) 为“用户详情页”接入 Router loader + defer，实现首屏先渲染骨架+关键字段，次要数据流式加载  
3) 设计你的“数据分层”：RSC/路由数据/组件内 SWR 三者的边界与协作方案

---

## 延伸阅读
- React 官方（Actions / RSC / Streaming 介绍与 RFC）
- React Router v6.4+ Data APIs
- Next.js 关于 RSC、Server Actions 与缓存策略