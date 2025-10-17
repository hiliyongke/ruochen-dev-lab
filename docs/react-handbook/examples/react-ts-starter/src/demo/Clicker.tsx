import React from "react"

export function Clicker() {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    console.log("坐标", e.clientX, e.clientY)
  }
  return (
    <button
      onClick={handleClick}
      className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      点我
    </button>
  )
}

export default Clicker