import React from "react"
import { atom, useAtom } from "jotai"

const countAtom = atom(0)
const doubleAtom = atom((get) => get(countAtom) * 2)

function Counter() {
  const [c, setC] = useAtom(countAtom)
  return (
    <div className="flex items-center gap-2">
      <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={() => setC((v) => v + 1)}>+1</button>
      <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={() => setC(0)}>重置</button>
      <span className="text-sm">count: {c}</span>
    </div>
  )
}

function DoubleView() {
  const [d] = useAtom(doubleAtom)
  return <div className="text-sm text-gray-600">double: {d}</div>
}

export default function JotaiDemo() {
  return (
    <div className="space-y-2">
      <Counter />
      <DoubleView />
      <p className="text-xs text-gray-500">Jotai：原子与派生原子，细粒度刷新</p>
    </div>
  )
}