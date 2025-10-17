# 状态管理层测试（Redux/Pinia/Vuex 等）

目标：验证 store 的纯逻辑（reducers/mutations/selectors）与副作用（thunks/sagas/effects），保证数据层稳定。

通用策略：
- 纯函数优先：对 reducer/mutation/selector 进行输入->输出的直接断言
- 端点隔离：副作用层（thunk/saga/effect）打桩网络/时间/存储
- 组件-状态集成：仅对关键交互做浅层集成测试（避免过度耦合）

Redux 示例：
```ts
// counterSlice.ts
const initial = { n: 0 }
export function reducer(state = initial, action: any) {
  switch (action.type) {
    case 'inc': return { n: state.n + 1 }
    default: return state
  }
}
export const selectN = (s: any) => s.n
```
```ts
// counterSlice.spec.ts
import { reducer, selectN } from './counterSlice'
it('inc', () => {
  const s1 = reducer({ n: 0 }, { type: 'inc' })
  expect(selectN(s1)).toBe(1)
})
```
副作用（thunk）：
```ts
export const fetchUser = (id: string) => async (dispatch: any) => {
  const r = await fetch('/api/users/' + id)
  dispatch({ type: 'user', payload: await r.json() })
}
```
```ts
// fetchUser.spec.ts
global.fetch = vi.fn(() =>
  Promise.resolve({ json: () => Promise.resolve({ id: '1' }) })
) as any
it('dispatch user', async () => {
  const dispatched: any[] = []
  const dispatch = (a: any) => void dispatched.push(a)
  await fetchUser('1')(dispatch)
  expect(dispatched.at(-1)).toMatchObject({ type: 'user', payload: { id: '1' } })
})
```

Pinia 示例：
```ts
// stores/counter.ts
import { defineStore } from 'pinia'
export const useCounter = defineStore('counter', {
  state: () => ({ n: 0 }),
  actions: { inc() { this.n++ } }
})
```
```ts
// counter.spec.ts
import { createPinia, setActivePinia } from 'pinia'
import { useCounter } from './counter'
beforeEach(() => setActivePinia(createPinia()))
it('inc', () => {
  const s = useCounter()
  s.inc()
  expect(s.n).toBe(1)
})
```

集成到组件（最小化）：
- React：使用 Provider 包裹，验证关键 UI 与 dispatch
- Vue：使用 createTestingPinia 或真实 pinia，断言交互结果

最佳实践：
- 选择器单测：复杂派生状态应独立测试（性能/正确性）
- 副作用隔离：统一用 MSW/fake timers/Storage 桩，避免真实依赖
- 对关键状态流设变更集覆盖门禁（参见差异覆盖章节）

Checklist
- [ ] 纯逻辑（reducer/mutation/selector）覆盖完整
- [ ] 副作用打桩网络/时间/存储
- [ ] 关键组件交互做轻量集成测试

常见错误排查
- 组件过度耦合 store：拆分到 hook/composable 并分别测试
- 随机/时间导致不稳定：统一 seed 与 fake timers