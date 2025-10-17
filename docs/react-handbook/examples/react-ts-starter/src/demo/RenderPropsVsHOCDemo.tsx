import React, { ComponentType, PropsWithChildren, useEffect, useState } from "react"

// 简化的数据提供者：Render Props
function DataProvider(props: { render: (data: string[], loading: boolean) => React.ReactNode }) {
  const [data, setData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(["alpha", "beta", "gamma"])
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])
  return <>{props.render(data, loading)}</>
}

export function RenderPropsDemo() {
  return (
    <DataProvider
      render={(data, loading) => (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Render Props 注入渲染：</div>
          {loading ? <div>Loading...</div> : <ul className="list-disc pl-6">{data.map(x => <li key={x}>{x}</li>)}</ul>}
        </div>
      )}
    />
  )
}

// 高阶组件示例：withStamp 给组件注入时间戳 props
type WithStampProps = { stamp: number }
function withStamp<P extends object>(Wrapped: ComponentType<P & WithStampProps>) {
  const Comp = (props: P) => {
    return <Wrapped {...props} stamp={Date.now()} />
  }
  Comp.displayName = `withStamp(${Wrapped.displayName || Wrapped.name || "Component"})`
  return Comp
}

function BaseView(props: { title: string } & WithStampProps) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-600">HOC 注入：</div>
      <div className="font-medium">{props.title}</div>
      <div className="text-xs text-gray-500">stamp: {props.stamp}</div>
    </div>
  )
}
const EnhancedView = withStamp(BaseView)

export function HOCDemo() {
  return <EnhancedView title="示例组件" />
}

export default function RenderPropsVsHOCDemo() {
  return (
    <div className="space-y-4">
      <RenderPropsDemo />
      <HOCDemo />
    </div>
  )
}