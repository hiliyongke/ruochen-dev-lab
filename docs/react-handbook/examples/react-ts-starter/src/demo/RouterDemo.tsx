import React, { Suspense, lazy } from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "../routes/Layout"
import ErrorBoundary from "../routes/ErrorBoundary"
import { PrefetchLink } from "../routes/PrefetchLink"

const Users = lazy(() => import("../routes/Users"))
const UserDetail = lazy(() => import("../routes/UserDetail"))
const Profile = lazy(() => import("../routes/settings/Profile"))

function PageLoading() {
  return <div className="p-2 text-gray-600">页面加载中...</div>
}

export function RouterDemo() {
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-700">
        演示说明：本面板复用外层 BrowserRouter，上下文一致；将 Users 与 Profile 路由懒加载，并提供 hover 预取。
      </div>

      <div className="border rounded bg-white">
          <div className="p-2 text-sm">快速入口：<PrefetchLink /></div>
          <ErrorBoundary>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/users" element={<Users />} />
                  <Route path="/users/:id" element={<UserDetail />} />
                  <Route path="/settings/profile" element={<Profile />} />
                </Route>
                <Route path="*" element={<div className="p-3">404</div>} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
      </div>
    </div>
  )
}

export default RouterDemo