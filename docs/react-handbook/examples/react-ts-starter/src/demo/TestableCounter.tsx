import React, { useCallback, useState } from "react"

export default function TestableCounter() {
  const [count, setCount] = useState(0)
  const inc = useCallback(() => setCount((c) => c + 1), [])
  const reset = useCallback(() => setCount(0), [])

  return (
    <div className="space-y-2">
      <div aria-live="polite" className="text-sm">count: {count}</div>
      <div className="flex items-center gap-2">
        <button
          aria-label="increment"
          className="px-3 py-2 border rounded bg-white hover:bg-gray-100"
          onClick={inc}
          onKeyDown={(e) => { if (e.key === "Enter") inc() }}
        >
          +1
        </button>
        <button
          aria-label="reset"
          className="px-3 py-2 border rounded bg-white hover:bg-gray-100"
          onClick={reset}
        >
          reset
        </button>
      </div>
      <p className="text-xs text-gray-500">可测试性要点：可读的 aria-label、键盘交互、aria-live 反馈</p>
    </div>
  )
}