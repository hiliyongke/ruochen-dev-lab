import React from "react"

type State = { hasError: boolean }
export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return <div className="p-3 rounded border border-red-300 bg-red-50 text-red-700">页面出错了</div>
    return this.props.children
  }
}