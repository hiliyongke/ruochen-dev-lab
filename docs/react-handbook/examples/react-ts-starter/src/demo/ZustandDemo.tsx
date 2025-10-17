import React from "react"
import { create } from "zustand"

type CartState = {
  items: { id: number; name: string; qty: number }[]
  add: (name: string) => void
  inc: (id: number) => void
  clear: () => void
}

const useCart = create<CartState>((set) => ({
  items: [],
  add: (name) =>
    set((s) => {
      const id = s.items.length + 1
      return { items: [...s.items, { id, name, qty: 1 }] }
    }),
  inc: (id) =>
    set((s) => ({
      items: s.items.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it)),
    })),
  clear: () => set({ items: [] }),
}))

function AddForm() {
  const add = useCart((s) => s.add)
  return (
    <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={() => add("商品-" + Math.floor(Math.random() * 1000))}>
      加入商品
    </button>
  )
}

function List() {
  const items = useCart((s) => s.items)
  const inc = useCart((s) => s.inc)
  return (
    <ul className="space-y-1">
      {items.map((it) => (
        <li key={it.id} className="flex items-center gap-2">
          <span>{it.name}</span>
          <button className="px-2 py-0.5 border rounded" onClick={() => inc(it.id)}>+1</button>
          <span className="text-sm text-gray-600">qty: {it.qty}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ZustandDemo() {
  const clear = useCart((s) => s.clear)
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AddForm />
        <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={clear}>清空</button>
      </div>
      <List />
      <p className="text-xs text-gray-500">Zustand：选择器订阅切片，避免全局重渲染</p>
    </div>
  )
}