import React, { useEffect, useState } from "react"

type FetchState<T> = { data: T | null; loading: boolean; error: any }
export type FetcherProps<T> = {
  url: string
  children: (state: FetchState<T>) => React.ReactNode
}

/** Render Props 模式：演示用 setTimeout 模拟请求，避免跨域 */
export function Fetcher<T>({ url, children }: FetcherProps<T>) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  useEffect(() => {
    let timer = setTimeout(() => {
      try {
        // 模拟后端返回
        const mock = ({ name: "React User" } as unknown) as T
        setState({ data: mock, loading: false, error: null })
      } catch (e) {
        setState({ data: null, loading: false, error: e })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [url])
  return <>{children(state)}</>
}

export function FetcherDemo() {
  return (
    <Fetcher<{ name: string }> url="/api/me">
      {({ data, loading }) =>
        loading ? <p>加载中…</p> : <p>Hi, {data?.name}</p>
      }
    </Fetcher>
  )
}

export default FetcherDemo