import React, { createContext, useContext, useMemo, useState } from "react"

type Theme = "light" | "dark"
type ThemeCtxType = { theme: Theme; setTheme: (t: Theme) => void }

const ThemeCtx = createContext<ThemeCtxType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

function Toolbar() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex items-center gap-3">
      <span>主题：{theme}</span>
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
      >
        切换主题
      </button>
    </div>
  )
}

export function ThemeContextDemo() {
  return (
    <ThemeProvider>
      <div className="space-y-3">
        <Toolbar />
        <ThemedBox />
      </div>
    </ThemeProvider>
  )
}

function ThemedBox() {
  const { theme } = useTheme()
  return (
    <div
      className={`p-4 rounded border ${
        theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"
      }`}
    >
      根据 Context 切换样式
    </div>
  )
}

export default ThemeContextDemo