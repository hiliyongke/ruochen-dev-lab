import React from "react"
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

type User = { id: number; name: string }

const client = new QueryClient()

async function apiGetUser(id: number): Promise<User> {
  return await new Promise((resolve) =>
    setTimeout(() => resolve({ id, name: id === 1 ? "Ada" : "Grace" }), 500),
  )
}

async function apiPatchUser(id: number, body: Partial<User>): Promise<User> {
  return await new Promise((resolve) =>
    setTimeout(() => resolve({ id, name: body.name ?? "Updated" }), 500),
  )
}

function Profile({ id }: { id: number }) {
  const qc = useQueryClient()
  const qKey = ["user", id]
  const { data, isLoading, error } = useQuery({
    queryKey: qKey,
    queryFn: () => apiGetUser(id),
  })

  const mutation = useMutation({
    mutationFn: (payload: Partial<User>) => apiPatchUser(id, payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: qKey })
      const prev = qc.getQueryData<User>(qKey)
      qc.setQueryData<User>(qKey, (old) => ({ ...(old as User), ...(payload as User) }))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData<User>(qKey, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qKey })
    },
  })

  if (isLoading) return <div className="h-5 bg-gray-200 rounded animate-pulse" />
  if (error) return <div className="text-red-600">加载失败</div>
  return (
    <div className="flex items-center gap-3">
      <span className="font-medium">#{data?.id}</span>
      <span>{data?.name}</span>
      <button
        onClick={() => mutation.mutate({ name: "New Name" })}
        className="px-2 py-1 text-sm rounded border bg-white hover:bg-gray-100"
      >
        乐观更新名称
      </button>
    </div>
  )
}

export function ReactQueryDemo() {
  return (
    <QueryClientProvider client={client}>
      <div className="space-y-4">
        <h4 className="font-semibold">User Profile（乐观更新/回滚/失效）</h4>
        <Profile id={1} />
      </div>
    </QueryClientProvider>
  )
}

export default ReactQueryDemo