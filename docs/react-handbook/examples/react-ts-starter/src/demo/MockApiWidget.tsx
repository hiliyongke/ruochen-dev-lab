import React, { useEffect, useState } from "react"

type Item = { id: number; name: string }
type S = { state: "idle" | "loading" | "success" | "error"; data?: Item[]; error?: string }

export default function MockApiWidget() {
  const [s, setS] = useState<S>({ state: "idle" })

  const fetchData = async () => {
    setS({ state: "loading" })
    try {
      // 这里可在测试中用 MSW 或 jest.spyOn(window, 'fetch') 替换
      const res = await fetch("/api/items")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Item[] = await res.json()
      setS({ state: "success", data })
    } catch (e: any) {
      setS({ state: "error", error: e?.message || "Network Error" })
    }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="space-y-2">
      <div className="text-sm">状态：{s.state}</div>
      {s.state === "loading" && <div aria-busy="true">Loading...</div>}
      {s.state === "error" && (
        <div role="alert" className="text-red-600">
          加载失败：{s.error} <button className="ml-2 underline" onClick={fetchData}>重试</button>
        </div>
      )}
      {s.state === "success" && (
        <ul aria-label="items" className="list-disc pl-6">
          {(s.data && s.data.length > 0) ? s.data.map((it) => <li key={it.id}>{it.name}</li>) : <li>暂无数据</li>}
        </ul>
      )}
      <p className="text-xs text-gray-500">可测试性：断言三态、列表内容与重试行为</p>
    </div>
  )
}