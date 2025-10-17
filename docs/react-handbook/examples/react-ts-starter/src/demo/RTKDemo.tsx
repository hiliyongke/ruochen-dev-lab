import React from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit"

type CounterState = { value: number }
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 } as CounterState,
  reducers: {
    inc: (s) => { s.value += 1 },
    add: (s, a: PayloadAction<number>) => { s.value += a.payload },
    reset: (s) => { s.value = 0 },
  },
})

const store = configureStore({ reducer: { counter: counterSlice.reducer } })
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch

function CounterView() {
  const v = useSelector((s: RootState) => s.counter.value)
  const d = useDispatch<AppDispatch>()
  return (
    <div className="flex items-center gap-2">
      <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={() => d(counterSlice.actions.inc())}>+1</button>
      <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={() => d(counterSlice.actions.add(5))}>+5</button>
      <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={() => d(counterSlice.actions.reset())}>重置</button>
      <span className="text-sm">value: {v}</span>
    </div>
  )
}

export default function RTKDemo() {
  return (
    <Provider store={store}>
      <div className="space-y-2">
        <CounterView />
        <p className="text-xs text-gray-500">RTK：createSlice 简化不可变更新；配合 selector 精准读取</p>
      </div>
    </Provider>
  )
}