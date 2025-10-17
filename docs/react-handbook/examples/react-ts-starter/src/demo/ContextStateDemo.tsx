import React, { createContext, useContext, useMemo, useReducer } from "react"

type PrefState = { theme: "light" | "dark"; lang: "zh" | "en" }
type Action =
  | { type: "toggleTheme" }
  | { type: "setLang"; payload: "zh" | "en" }

const PrefContext = createContext<{ state: PrefState; dispatch: React.Dispatch<Action> } | null>(null)

function reducer(state: PrefState, action: Action): PrefState {
  switch (action.type) {
    case "toggleTheme":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" }
    case "setLang":
      return { ...state, lang: action.payload }
    default:
      return state
  }
}

export function PrefProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { theme: "light", lang: "zh" })
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <PrefContext.Provider value={value}>{children}</PrefContext.Provider>
}

function usePref() {
  const ctx = useContext(PrefContext)
  if (!ctx) throw new Error("usePref must be used within PrefProvider")
  return ctx
}

function ThemePanel() {
  const { state, dispatch } = usePref()
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">主题：{state.theme}</span>
      <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={() => dispatch({ type: "toggleTheme" })}>
        切换主题
      </button>
    </div>
  )
}

function LangPanel() {
  const { state, dispatch } = usePref()
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">语言：{state.lang}</span>
      <button className="px-2 py-1 border rounded bg-white hover:bg-gray-100" onClick={() => dispatch({ type: "setLang", payload: state.lang === "zh" ? "en" : "zh" })}>
        切换语言
      </button>
    </div>
  )
}

export function ContextStateDemo() {
  return (
    <PrefProvider>
      <div className="space-y-2">
        <ThemePanel />
        <LangPanel />
        <p className="text-xs text-gray-500">要点：useMemo 稳定 context value；按域拆分 Provider 可降低刷新范围</p>
      </div>
    </PrefProvider>
  )
}

export default ContextStateDemo