import React from "react"
import { Link, Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <div className="min-h-[360px] flex border rounded overflow-hidden">
      <aside className="w-56 border-r p-3 space-y-2 bg-white">
        <div className="font-semibold mb-2">路由示例</div>
        <nav className="flex flex-col gap-2">
          <Link to="/users" className="text-blue-600 hover:underline">Users</Link>
          <Link to="/settings/profile" className="text-blue-600 hover:underline">Profile</Link>
        </nav>
      </aside>
      <main className="flex-1 p-4 bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}