import React, { useMemo, useRef, useState } from "react"

function useVirtual(total: number, rowHeight: number, viewportHeight: number) {
  const [scrollTop, setScrollTop] = useState(0)
  const start = Math.floor(scrollTop / rowHeight)
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + 2 // 预渲染缓冲
  const end = Math.min(total, start + visibleCount)
  const offset = start * rowHeight
  return { start, end, offset, setScrollTop }
}

export function VirtualListDemo() {
  const total = 10000
  const rowH = 28
  const viewportH = 280
  const data = useMemo(() => Array.from({ length: total }, (_, i) => `item-${i}`), [total])
  const { start, end, offset, setScrollTop } = useVirtual(total, rowH, viewportH)
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => setScrollTop((e.target as HTMLDivElement).scrollTop)
  const items = data.slice(start, end)

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">虚拟化：仅渲染可见窗口（{start} ~ {end}）</div>
      <div className="border rounded bg-white" style={{ height: viewportH, overflow: "auto" }} onScroll={onScroll}>
        <div style={{ height: total * rowH, position: "relative" }}>
          <div style={{ position: "absolute", top: offset, left: 0, right: 0 }}>
            {items.map((x, i) => (
              <div key={x} style={{ height: rowH }} className="px-2 text-sm flex items-center border-b">
                {x}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600">生产可直接使用 react-window 以获得更多能力</p>
    </div>
  )
}

export default VirtualListDemo