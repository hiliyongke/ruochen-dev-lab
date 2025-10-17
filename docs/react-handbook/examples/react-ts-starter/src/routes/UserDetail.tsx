import React from "react"
import { useParams, useSearchParams, Link } from "react-router-dom"

export default function UserDetail() {
  const { id } = useParams()
  const [qs, setQs] = useSearchParams()
  const tab = qs.get("tab") ?? "profile"
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">User #{id}</h3>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded border ${tab === "profile" ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}
          onClick={() => setQs({ tab: "profile" })}
        >
          Profile
        </button>
        <button
          className={`px-3 py-1 rounded border ${tab === "settings" ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}
          onClick={() => setQs({ tab: "settings" })}
        >
          Settings
        </button>
      </div>
      <p className="text-gray-700">当前 Tab: {tab}</p>
      <Link to="/users" className="text-blue-600 hover:underline">返回列表</Link>
    </div>
  )
}