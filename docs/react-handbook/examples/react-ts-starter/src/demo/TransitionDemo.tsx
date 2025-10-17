import React, { startTransition, useState } from "react"

export function TransitionDemo() {
  const [kw, setKw] = useState("")
  const [list, setList] = useState<string[]>([])

  const handleChange = (v: string) => {
    setKw(v) // 紧急更新：输入框即时响应
    startTransition(() => {
      // 非紧急更新：列表重计算放入过渡
      const all = Array.from({ length: 5000 }, (_, i) => `row-${i}-${v}`)
      setList(all)
    })
  }

  return (
    <div className="space-y-2">
      <input
        className="border px-3 py-2 rounded w-64"
        placeholder="输入触发大列表生成"
        value={kw}
        onChange={(e) => handleChange(e.target.value)}
      />
      <div className="text-sm text-gray-600">rows: {list.length}</div>
      <div className="h-40 overflow-auto border rounded p-2 bg-white">
        {list.slice(0, 200).map((x, i) => (
          <div key={i} className="text-xs py-0.5">{x}</div>
        ))}
      </div>
      <p className="text-sm text-gray-600">startTransition 保证输入始终流畅</p>
    </div>
  )
}

export default TransitionDemo