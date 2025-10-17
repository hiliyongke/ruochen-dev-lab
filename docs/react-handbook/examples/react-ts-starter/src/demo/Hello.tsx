import React from "react"

export type HelloProps = { name: string; highlight?: boolean }

export function Hello({ name, highlight }: HelloProps) {
  return (
    <h1 className={highlight ? "text-xl font-bold text-blue-600" : "text-xl"}>
      你好，{name}
    </h1>
  )
}

export default Hello