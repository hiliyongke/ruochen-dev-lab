import React from "react"
import useSWR, { SWRConfig } from "swr"

type User = { id: number; name: string }
type ListResp = { items: User[] }

const fetcher = async (key: string) =>
  await new Promise<any>((resolve) =>
    setTimeout(() => {
      if (key.startsWith("/api/user/")) {
        const id = Number(key.split("/").pop())
        resolve({ id, name: id === 1 ? "Ada" : id === 2 ? "Grace" : "Linus" })
      } else {
        resolve({ items: [{ id: 1, name: "Ada" }, { id: 2, name: "Grace" }, { id: 3, name: "Linus" }] })
      }
    }, 500),
  )

function SkeletonRow() {
  return <div className="h-5 bg-gray-200 rounded animate-pulse" />
}

function UserCard({ id }: { id: number }) {
  const { data, error, isLoading, mutate } = useSWR<User>(`/api/user/${id}`, fetcher)
  if (error) return <div className="text-red-600">加载失败</div>
  if (isLoading) return <SkeletonRow />
  return (
    <div className="flex items-center gap-3">
      <span className="font-medium">#{data?.id}</span>
      <span>{data?.name}</span>
      <button
        onClick={() => mutate()}
        className="px-2 py-1 text-sm rounded border bg-white hover:bg-gray-100"
      >
        手动刷新
      </button>
    </div>
  )
}

function UserList() {
  const { data, error, isLoading } = useSWR<ListResp>("/api/users", fetcher)
  if (error) return <div className="text-red-600">列表加载失败</div>
  if (isLoading)
    return (
      <div className="space-y-2">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    )
  return (
    <ul className="list-disc pl-5">
      {data?.items.map((u) => (
        <li key={u.id}>
          <span className="font-medium">{u.name}</span>
        </li>
      ))}
    </ul>
  )
}

export function SwrDemo() {
  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: true }}>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">UserCard（详情 + 手动刷新）</h4>
          <div className="space-y-2">
            <UserCard id={1} />
            <UserCard id={2} />
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">UserList（列表 + 骨架）</h4>
          <UserList />
        </div>
      </div>
    </SWRConfig>
  )
}

export default SwrDemo