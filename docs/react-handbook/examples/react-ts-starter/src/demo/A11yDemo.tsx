import React, { useEffect, useRef, useState } from "react"

type Option = { id: string; label: string }

const OPTIONS: Option[] = [
  { id: "1", label: "苹果 Apple" },
  { id: "2", label: "香蕉 Banana" },
  { id: "3", label: "樱桃 Cherry" },
  { id: "4", label: "火龙果 Dragon Fruit" },
]

export default function A11yDemo() {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [value, setValue] = useState<Option | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = "demo-listbox"
  const activeId = open ? `opt-${activeIdx}` : undefined

  useEffect(() => {
    if (open && listRef.current) listRef.current.focus()
  }, [open])

  const onKeyDownList = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(OPTIONS.length - 1, i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const opt = OPTIONS[activeIdx]
      setValue(opt)
      setOpen(false)
      btnRef.current?.focus()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
      btnRef.current?.focus()
    }
  }

  return (
    <div className="space-y-3">
      <a href="#main" className="sr-only focus:not-sr-only underline text-blue-600">跳至主要内容</a>
      <button
        ref={btnRef}
        className="px-3 py-2 border rounded bg-white hover:bg-gray-100"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        选择水果：{value ? value.label : "未选择"}
      </button>

      {open && (
        <div
          id={listId}
          ref={listRef}
          role="listbox"
          tabIndex={0}
          aria-activedescendant={activeId}
          className="max-h-48 overflow-auto border rounded bg-white divide-y outline-none"
          onKeyDown={onKeyDownList}
        >
          {OPTIONS.map((opt, idx) => {
            const id = `opt-${idx}`
            const active = idx === activeIdx
            return (
              <div
                id={id}
                key={opt.id}
                role="option"
                aria-selected={active}
                className={`px-3 py-2 cursor-pointer ${active ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => {
                  setValue(opt)
                  setOpen(false)
                  btnRef.current?.focus()
                }}
              >
                {opt.label}
              </div>
            )
          })}
        </div>
      )}

      <main id="main" className="text-sm text-gray-600">
        键盘操作：↑/↓ 移动，Enter 选中，Esc 关闭；辅助技术可朗读选项与状态。
      </main>
    </div>
  )
}