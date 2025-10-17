import React, { useRef } from "react"
import { Link } from "react-router-dom"

export function PrefetchLink() {
  const timer = useRef<number | null>(null)
  const prefetch = () => import("./Users")

  return (
    <Link
      to="/users"
      className="text-blue-600 hover:underline"
      onMouseEnter={() => {
        if (timer.current) return
        timer.current = window.setTimeout(prefetch, 50)
      }}
      onMouseLeave={() => {
        if (timer.current) {
          window.clearTimeout(timer.current)
          timer.current = null
        }
      }}
    >
      Users（hover 预取）
    </Link>
  )
}