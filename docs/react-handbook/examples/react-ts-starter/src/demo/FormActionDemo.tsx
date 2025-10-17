import React, { useActionState, useState } from "react"

type FormState = { ok: boolean; message: string } | null

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
async function fakeSubmit(data: { name: string; email: string }) {
  await wait(800)
  if (!data.name || !data.email) {
    return { ok: false, message: "请填写必填项" }
  }
  return { ok: true, message: `已提交：${data.name} <${data.email}>` }
}

export default function FormActionDemo() {
  const [result, action, pending] = useActionState<FormState, FormData>(async (_prev, fd) => {
    const name = String(fd.get("name") || "")
    const email = String(fd.get("email") || "")
    return await fakeSubmit({ name, email })
  }, null)

  // 受控输入只是为了更易观察交互（Actions 对非受控同样适用）
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-700">
        React 19 Form Actions + useActionState 最小示例（纯前端模拟提交）。
      </div>

      <form action={action} method="post" className="space-y-2">
        <div className="flex gap-3">
          <input
            name="name"
            placeholder="姓名"
            className="border rounded px-2 py-1 flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
          />
          <input
            name="email"
            placeholder="邮箱"
            className="border rounded px-2 py-1 flex-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className={`px-3 py-1 rounded ${pending ? "bg-gray-300" : "bg-blue-600 text-white"}`}
        >
          {pending ? "提交中..." : "提交"}
        </button>
      </form>

      <div className="text-sm text-gray-600">
        状态：{pending ? "处理中..." : "空闲"}
        {result ? ` | 结果：${result.ok ? "成功" : "失败"} - ${result.message}` : ""}
      </div>

      <details className="text-xs text-gray-600">
        <summary>要点</summary>
        <ul className="list-disc pl-5 space-y-1">
          <li><code>{`<form action={fn} method="post">`}</code> + <code>useActionState</code> 搭配，天然支持并发与过渡。</li>
          <li>渐进增强：无 JS 环境可将 action 指向服务端 URL。</li>
          <li>复杂表单仍可结合 React Hook Form + schema（zod）使用。</li>
        </ul>
      </details>
    </div>
  )
}