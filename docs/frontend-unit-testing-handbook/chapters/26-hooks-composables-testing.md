# Hook/Composable 测试模式（React/Vue）

目标：针对逻辑复用单元（React Hooks/Vue Composables）建立稳定、可读的测试模式，隔离副作用并提高复用。

通用原则：
- 纯逻辑优先：将复杂计算/派生状态抽到纯函数，先测纯函数
- 环境注入：对时间、网络、Storage、路由等外部依赖通过注入或打桩
- 最小渲染载体：仅在需要 DOM/上下文时使用最小组件作为载体

React Hooks 示例（useCounter）：
```ts
// useCounter.ts
import { useState } from 'react'
export function useCounter(init = 0) {
  const [n, setN] = useState(init)
  return { n, inc: () => setN(v => v + 1) }
}
```
```tsx
// useCounter.spec.tsx
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

it('inc works', () => {
  const { result } = renderHook(() => useCounter(0))
  act(() => result.current.inc())
  expect(result.current.n).toBe(1)
})
```

异步副作用 Hook（网络/计时器）：
```ts
// useUser.ts
export function useUser(id: string) {
  const [u, setU] = useState<any>(null)
  useEffect(() => {
    let alive = true
    fetch('/api/users/' + id).then(r => r.json()).then(j => { if (alive) setU(j) })
    return () => { alive = false }
  }, [id])
  return u
}
```
```tsx
// useUser.spec.tsx
global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ id: '1' }) })) as any
it('fetch user', async () => {
  const { result } = renderHook(() => useUser('1'))
  await vi.waitUntil(() => !!result.current)
  expect(result.current).toMatchObject({ id: '1' })
})
```

Vue Composable 示例（useCounter）：
```ts
// useCounter.ts
import { ref } from 'vue'
export function useCounter(init = 0) {
  const n = ref(init)
  const inc = () => n.value++
  return { n, inc }
}
```
```ts
// useCounter.spec.ts
import { useCounter } from './useCounter'
it('inc', () => {
  const { n, inc } = useCounter(0)
  inc()
  expect(n.value).toBe(1)
})
```

与组件/状态的协作：
- 对路由/Pinia/Redux：在测试中提供最小上下文（Provider/createTestingPinia），将可观察行为留在 hook/composable 层断言

最佳实践：
- 将复杂副作用拆分：网络/时间/存储各自可替换或打桩
- 对可观察事件（订阅/清理）编写“挂载-卸载”用例，避免内存泄漏
- 在 CI 中纳入变更集门禁，确保关键 hooks 覆盖

Checklist
- [ ] 纯逻辑与副作用分层测试
- [ ] 外部依赖通过注入/打桩
- [ ] 挂载与卸载路径均被覆盖

常见错误排查
- 渲染载体过重：hook 测试无需真实 DOM，除非依赖环境
- 异步竞态：使用“alive”标记或 AbortController，测试断言等待稳定时机