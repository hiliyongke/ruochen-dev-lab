import React from "react"
import {
  RouterProvider,
  createMemoryRouter,
  Link,
  useLoaderData,
} from "react-router-dom"

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
async function fetchUser(id: number) {
  await wait(800)
  return { id, name: "User " + id, email: `user${id}@demo.dev` }
}

function Home() {
  return (
    <div className="space-y-2">
      <div>首页：演示路由级数据（loader）</div>
      <div className="flex gap-2">
        <Link to="/user/1" className="text-blue-600 underline">User 1</Link>
        <Link to="/user/2" className="text-blue-600 underline">User 2</Link>
      </div>
    </div>
  )
}

function UserPage() {
  const data = useLoaderData() as { id: number; name: string; email: string }
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-700">路由 loader（同步返回已解析数据）</div>
      <div className="border rounded p-3 bg-white">
        <div>ID：{data.id}</div>
        <div>姓名：{data.name}</div>
        <div>邮箱：{data.email}</div>
      </div>
      <Link to="/" className="text-blue-600 underline">返回</Link>
    </div>
  )
}

export default function LoaderDeferDemo() {
  const router = createMemoryRouter([
    { path: "/", element: <Home /> },
    {
      path: "/user/:id",
      loader: async ({ params }) => {
        const id = Number(params.id || 1)
        // 直接在 loader 中 await 完成数据，再返回对象
        return await fetchUser(id)
      },
      element: <UserPage />,
    },
    { path: "*", element: <div className="p-2">404</div> },
  ])

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-700">该示例使用内嵌 memory data router，独立于外层 BrowserRouter。</div>
      <div className="border rounded p-3 bg-gray-50">
        <RouterProvider router={router} />
      </div>
      <details className="text-xs text-gray-600">
        <summary>要点</summary>
        <ul className="list-disc pl-5 space-y-1">
          <li>路由级数据（loader）与 UI 解耦，避免组件层重复请求。</li>
          <li>与组件内请求（SWR/RQ）对比：切页时数据更一致，可按需预取。</li>
          <li>如需流式渲染与占位，升级到支持 defer/Await 的实现（按项目依赖版本选择）。</li>
        </ul>
      </details>
    </div>
  )
}