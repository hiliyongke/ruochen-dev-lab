import React, { useCallback, useEffect, useRef, useState } from "react"

function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn(v => !v), [])
  const setTrue = useCallback(() => setOn(true), [])
  const setFalse = useCallback(() => setOn(false), [])
  return { on, toggle, setTrue, setFalse }
}

function useInterval(fn: () => void, ms: number, options?: { immediate?: boolean }) {
  const saved = useRef(fn)
  useEffect(() => { saved.current = fn }, [fn])
  useEffect(() => {
    let timer: number | null = null
    if (options?.immediate) saved.current()
    timer = window.setInterval(() => saved.current(), ms)
    return () => { if (timer !== null) window.clearInterval(timer) }
  }, [ms, options?.immediate])
}

export function CustomHookDemo() {
  const { on, toggle } = useToggle()
  const [ticks, setTicks] = useState(0)
  useInterval(() => setTicks(t => t + 1), 1000)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button className="px-3 py-2 border rounded bg-white hover:bg-gray-100" onClick={toggle}>
          切换：{on ? "ON" : "OFF"}
        </button>
        <span className="text-sm text-gray-600">useToggle 管理布尔状态</span>
      </div>
      <div className="text-sm text-gray-700">useInterval 计时：{ticks}s</div>
      <p className="text-sm text-gray-600">要点：回调使用 ref 保持最新；副作用需清理。</p>
    </div>
  )
}

export default CustomHookDemo