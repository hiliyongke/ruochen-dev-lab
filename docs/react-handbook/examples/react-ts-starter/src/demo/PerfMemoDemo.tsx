import React, { memo, useCallback, useMemo, useState } from "react"

type Item = { id: number; name: string }

const Heavy = memo(function Heavy({ data, onSelect }: { data: Item[]; onSelect: (id: number) => void }) {
  // 模拟较重渲染
  let sum = 0
  for (let i = 0; i < 10000; i++) sum += i
  return (
    <ul className="space-y-1">
      {data.map((d) => (
        <li key={d.id}>
          <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={() => onSelect(d.id)}>
            {d.name}
          </button>
        </li>
      ))}
    </ul>
  )
})

export function PerfMemoDemo() {
  const [count, setCount] = useState(0)
  const [sel, setSel] = useState<number | null>(null)

  // 稳定数据/回调，避免父级更新触发 Heavy 不必要重渲染
  const data = useMemo<Item[]>(() => [
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
    { id: 3, name: "Linus" },
  ], [])
  const onSelect = useCallback((id: number) => setSel(id), [])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button className="px-3 py-2 border rounded bg-white hover:bg-gray-100" onClick={() => setCount((c) => c + 1)}>
          点我递增（父组件重渲染）
        </button>
        <span>count: {count}</span>
        <span>选中：{sel ?? "-"}</span>
      </div>
      <Heavy data={data} onSelect={onSelect} />
      <p className="text-sm text-gray-600">对比：去掉 memo/useMemo/useCallback 后再观察渲染次数</p>
    </div>
  )
}

export default PerfMemoDemo