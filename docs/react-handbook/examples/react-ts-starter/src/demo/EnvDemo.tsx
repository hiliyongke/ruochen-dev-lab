import React from "react"

export default function EnvDemo() {
  const mode = import.meta.env.MODE
  const base = import.meta.env.BASE_URL
  // 仅 VITE_ 前缀会被注入到客户端
  const api = (import.meta.env as any).VITE_API_BASE

  return (
    <div className="space-y-2">
      <div className="text-sm">运行模式：{mode}</div>
      <div className="text-sm">Base URL：{base}</div>
      <div className="text-sm">API 基址（VITE_API_BASE）：{api ?? "(未配置)"}</div>
      <p className="text-xs text-gray-500">
        注意：敏感密钥绝不应放入客户端变量；仅暴露可公开信息。不同环境用 .env.* 管理。
      </p>
    </div>
  )
}