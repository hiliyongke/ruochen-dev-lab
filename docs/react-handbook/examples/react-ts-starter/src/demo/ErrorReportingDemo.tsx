import React from "react"

class ErrorBoundary extends React.Component<React.PropsWithChildren<{ onReport?: (err: unknown, info: any) => void }>, { hasError: boolean; msg?: string }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, msg: error?.message || "Unknown error" }
  }
  componentDidCatch(error: any, info: any) {
    if (this.props.onReport) this.props.onReport(error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="text-red-600 space-y-2">
          <div>组件崩溃：{this.state.msg}</div>
          <button className="underline" onClick={() => this.setState({ hasError: false, msg: undefined })}>重试</button>
        </div>
      )
    }
    return this.props.children as any
  }
}

function BoomButton() {
  const [n, setN] = React.useState(0)
  if (n >= 3) {
    throw new Error("计数器达到错误阈值（≥3）")
  }
  return (
    <div className="space-y-2">
      <div className="text-sm">计数：{n}</div>
      <button className="px-3 py-2 border rounded bg-white hover:bg-gray-100" onClick={() => setN(n + 1)}>
        +1（到 3 触发异常）
      </button>
    </div>
  )
}

async function report(err: unknown, info: any) {
  const payload = {
    name: (err as any)?.name || "Error",
    message: (err as any)?.message || String(err),
    stack: (err as any)?.stack?.slice(0, 2000),
    componentStack: info?.componentStack?.slice(0, 2000),
    url: location.href,
    ua: navigator.userAgent,
    ts: Date.now(),
  }
  try {
    await fetch("/log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
  } catch {
    // 静默失败，避免再次报错
    console.error("report fail")
  }
}

export default function ErrorReportingDemo() {
  return (
    <div className="space-y-2">
      <ErrorBoundary onReport={report}>
        <BoomButton />
      </ErrorBoundary>
      <p className="text-xs text-gray-500">
        要点：ErrorBoundary 捕获渲染期异常；上报需脱敏与抽样；服务侧做聚合与告警。
      </p>
    </div>
  )
}