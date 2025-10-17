import React, { useDeferredValue, useMemo, useState } from "react"

function Result({ keyword }: { keyword: string }) {
  const list = useMemo(() => {
    const all = Array.from({ length: 5000 }, (_, i) => `item-${i}`)
    // 模拟较重计算
    return all.filter((x) => x.includes(keyword))
  }, [keyword])
  return <div className="text-sm text-gray-700">匹配：{list.length}</div>
}

export function DeferredSearchDemo() {
  const [kw, setKw] = useState("")
  const deferredKw = useDeferredValue(kw)
  return (
    <div className="space-y-2">
      <input
        className="border px-3 py-2 rounded w-64"
        placeholder="输入关键字，体验输入流畅性"
        value={kw}
        onChange={(e) => setKw(e.target.value)}
      />
      <Result keyword={deferredKw} />
      <p className="text-sm text-gray-600">useDeferredValue 推迟昂贵渲染，优先保障输入</p>
    </div>
  )
}

export default DeferredSearchDemo