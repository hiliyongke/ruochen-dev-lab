# 第6章 表单与受控/非受控（React Hook Form 与性能）

## 导读
表单是前端工程的“复杂地带”：涉及联动校验、性能抖动、受控/非受控取舍、错误提示与可访问性、服务端交互与乐观更新。本章从 React 受控/非受控基础出发，系统介绍 React Hook Form（RHF）的理念与高性能实践，并给出在真实业务中的落地范式。

## 学习目标
- 区分受控与非受控组件的差异、优缺点与典型适配场景
- 掌握 React Hook Form 的核心 API：useForm、register、Controller、useFieldArray、formState
- 设计可维护的验证与错误展示（同步/异步、schema 驱动）
- 优化表单性能：减少重渲染、按需控制、虚拟化长表单
- 处理复杂表单：动态字段、联动、上传与进度、提交流程与回滚

---

## 6.1 受控 vs 非受控

- 受控（Controlled）
  - 输入值由 React state 驱动；value + onChange
  - 优点：可预期、易联动/回放；缺点：大表单渲染成本较高
- 非受控（Uncontrolled）
  - DOM 自行管理值，按需读取（ref）或在提交时收集
  - 优点：性能友好；缺点：联动复杂度上升

对比建议：
- 简单小表单/强联动：受控可行
- 中/大型表单：非受控优先 + 局部受控（组合）

基本示例（受控与非受控）：
```tsx
import React, { useRef, useState } from "react"

// 受控
export function ControlledInput() {
  const [name, setName] = useState("")
  return <input value={name} onChange={(e) => setName(e.target.value)} className="border px-2 py-1" />
}

// 非受控
export function UncontrolledInput() {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="space-x-2">
      <input ref={ref} className="border px-2 py-1" defaultValue="Ada" />
      <button
        className="px-2 py-1 border rounded"
        onClick={() => console.log("current:", ref.current?.value)}
      >
        Log
      </button>
    </div>
  )
}
```

---

## 6.2 为何选择 React Hook Form（RHF）
- 响应式非受控为主：减少重渲染
- 按需注册/卸载：更适合动态/长表单
- 与 UI 库/受控组件通过 Controller 适配
- 内置验证与错误管理，联动 formState

核心理念：尽可能让 DOM 管理输入值，React 只在必要时订阅与校验。

---

## 6.3 RHF 入门：useForm、register、formState

```tsx
import React from "react"
import { useForm } from "react-hook-form"

type FormValues = { name: string; email: string }

export function RhfBasic() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>()
  const onSubmit = (data: FormValues) => {
    console.log("submit", data)
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <input
          placeholder="姓名"
          className="border px-2 py-1"
          {...register("name", { required: "请输入姓名" })}
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <input
          placeholder="邮箱"
          className="border px-2 py-1"
          {...register("email", {
            required: "请输入邮箱",
            pattern: { value: /\S+@\S+\.\S+/, message: "邮箱格式不正确" },
          })}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>
      <button disabled={isSubmitting} className="px-3 py-2 border rounded bg-white hover:bg-gray-100">
        {isSubmitting ? "提交中..." : "提交"}
      </button>
    </form>
  )
}
```

要点：
- register 返回的 props 绑定到 input
- formState.errors 提供逐项错误
- handleSubmit 包装提交逻辑

---

## 6.4 与受控 UI 组件协同：Controller

部分 UI 库输入是受控模式（value/onChange），需用 Controller 进行“受控桥接”。

```tsx
import React from "react"
import { useForm, Controller } from "react-hook-form"

type Values = { age: number }

function NumberInput(props: { value?: number; onChange?: (v: number) => void }) {
  const { value, onChange } = props
  return (
    <input
      type="number"
      className="border px-2 py-1"
      value={value ?? 0}
      onChange={(e) => onChange?.(Number(e.target.value))}
    />
  )
}

export function RhfControllerDemo() {
  const { control, handleSubmit } = useForm<Values>({ defaultValues: { age: 18 } })
  return (
    <form onSubmit={handleSubmit(console.log)} className="space-y-3">
      <Controller
        control={control}
        name="age"
        rules={{ min: { value: 0, message: "年龄不能为负" } }}
        render={({ field, fieldState }) => (
          <div>
            <NumberInput value={field.value} onChange={field.onChange} />
            {fieldState.error && <p className="text-red-600 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />
      <button className="px-3 py-2 border rounded bg-white hover:bg-gray-100">提交</button>
    </form>
  )
}
```

---

## 6.5 动态字段与数组：useFieldArray
适合订单行、可变条目等场景。

```tsx
import React from "react"
import { useForm, useFieldArray } from "react-hook-form"

type Item = { title: string; qty: number }
type Values = { items: Item[] }

export function RhfFieldArray() {
  const { control, register, handleSubmit } = useForm<Values>({
    defaultValues: { items: [{ title: "", qty: 1 }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  return (
    <form onSubmit={handleSubmit(console.log)} className="space-y-3">
      {fields.map((f, i) => (
        <div key={f.id} className="flex gap-2 items-center">
          <input className="border px-2 py-1" placeholder="标题" {...register(`items.${i}.title` as const)} />
          <input type="number" className="border px-2 py-1 w-20" {...register(`items.${i}.qty` as const, { valueAsNumber: true, min: 1 })} />
          <button type="button" className="px-2 py-1 border rounded" onClick={() => remove(i)}>删除</button>
        </div>
      ))}
      <div className="space-x-2">
        <button type="button" className="px-2 py-1 border rounded" onClick={() => append({ title: "", qty: 1 })}>新增行</button>
        <button className="px-3 py-2 border rounded bg-white hover:bg-gray-100">提交</button>
      </div>
    </form>
  )
}
```

---

## 6.6 校验策略：内置规则 vs Schema 驱动
- 内置规则：required、min/max、pattern、validate
- Schema 驱动：Zod/Yup + @hookform/resolvers
  - 优点：跨端复用、可维护；缺点：引入体积

示例（以 Zod 为例）：
```tsx
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  name: z.string().min(1, "必填"),
  email: z.string().email("邮箱格式不正确"),
})

type Values = z.infer<typeof schema>

export function RhfZod() {
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) })
  return (
    <form onSubmit={handleSubmit(console.log)} className="space-y-3">
      <input className="border px-2 py-1" placeholder="姓名" {...register("name")} />
      {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
      <input className="border px-2 py-1" placeholder="邮箱" {...register("email")} />
      {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      <button className="px-3 py-2 border rounded">提交</button>
    </form>
  )
}
```

---

## 6.7 性能优化清单
- 尽量采用 RHF 非受控模式，避免每次输入都触发 React 重渲染
- 将昂贵子组件与错误展示区域拆分，使用 React.memo
- Controller 仅用于必要的受控组件；其余用 register
- 大型表单按分区/步骤渲染（步骤条/懒加载分部）、视口内渲染（虚拟化）
- 减少 watch 广域订阅；必要时 watch 指定字段
- 提交时聚合请求，减少校验/提交抖动

---

## 6.8 上传与异步校验
- 上传：受控组件或自研上传与 RHF 协同，value 维护为文件列表；进度通过额外状态管理
- 异步校验：可在 validate 内返回 Promise 或使用 schema 异步校验；注意防抖与竞态取消

---

## 6.9 UX 与可访问性（a11y）
- label/aria-describedby 关联错误文案
- 错误优先展示在可见区域并聚焦首个错误字段
- 必填星标、输入长度/格式提示、即时反馈与批量提示结合
- 键盘可操作（Tab 顺序、Enter 提交、Esc 取消）

---

## 本章小结
- 正确认知受控/非受控的边界，选用 RHF 获取更好的大表单性能
- 通过 Controller 适配受控 UI 组件；useFieldArray 支撑动态表单
- 使用 Schema 驱动统一校验规则，提高一致性与可维护性
- 从渲染、订阅、分区、虚拟化多维度优化表单性能

---

## 练习（建议 30–50 分钟）
1) 将一个 8+ 字段的表单改造为 RHF：内置校验 + 错误提示 + 提交态禁用
2) 使用 Controller 适配一个第三方选择器（受控），并与其他输入联动
3) 实现动态行（useFieldArray）：新增/删除/排序，并保持校验
4) 引入 Zod 完成 schema 校验，将必填/格式校验统一到 schema
5) 为长表单引入“步骤分区 + 懒加载”，并测量渲染时间变化

---

## 延伸阅读
- React Hook Form 文档：https://react-hook-form.com/
- @hookform/resolvers 与 Schema 校验（Zod/Yup）
- 表单可访问性指南（WAI-ARIA Authoring Practices）
- 大型表单性能优化案例与实战分享

## 版本与补遗
- React 19 Form Actions：以原生 form 为基座，action 处理提交；JS 可用时无刷新，禁用时也能回退。适合“简单表单/低交互耦合”的提交流。
- 与 RHF 的取舍：复杂联动/校验/性能优化仍以 RHF 为主，在提交层可接入 form action 或保留 fetch/mutation。两者可并存。
- 最小示例（客户端 action）：
  ```jsx
  <form action={(fd) => console.log(Object.fromEntries(fd))}>
    ...
  </form>
  ```
- 可访问性：Actions 方案依然遵守 a11y 规范；按钮禁用、进度提示与错误聚焦逻辑需要保留。