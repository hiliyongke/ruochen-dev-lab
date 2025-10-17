import React, { createContext, useContext, useMemo, useState } from "react"

type Lang = "zh" | "en"
type Dict = Record<string, string>
type Messages = Record<Lang, Dict>

const MESSAGES: Messages = {
  zh: {
    greet: "你好，{name}",
    items_one: "{count} 个商品",
    items_other: "{count} 个商品",
    langLabel: "语言",
    switch: "切换语言",
  },
  en: {
    greet: "Hello, {name}",
    items_one: "{count} item",
    items_other: "{count} items",
    langLabel: "Language",
    switch: "Switch language",
  },
}

type I18nContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, params?: Record<string, React.ReactNode | string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function format(template: string, params?: Record<string, React.ReactNode | string | number>) {
  if (!params) return template
  return Object.keys(params).reduce((s, k) => s.replace(new RegExp(`\\{${k}\\}`, "g"), String(params[k])), template)
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh")
  const t = (key: string, params?: Record<string, React.ReactNode | string | number>) => {
    // 复数约定：key_one / key_other
    if ("count" in (params || {})) {
      const count = Number((params as any).count)
      const k = count === 1 ? `${key}_one` : `${key}_other`
      const tpl = (MESSAGES[lang][k] ?? MESSAGES[lang][key]) || key
      return format(tpl, params)
    }
    const tpl = MESSAGES[lang][key] || key
    return format(tpl, params)
  }
  const value = useMemo(() => ({ lang, setLang, t }), [lang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}

export default function I18nDemo() {
  return (
    <I18nProvider>
      <Panel />
    </I18nProvider>
  )
}

function Panel() {
  const { lang, setLang, t } = useI18n()
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm">{t("langLabel")}：</label>
        <button
          className="px-3 py-2 border rounded bg-white hover:bg-gray-100"
          aria-pressed={lang === "en"}
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
        >
          {t("switch")}
        </button>
      </div>
      <div className="text-sm">{t("greet", { name: "Ada" })}</div>
      <div className="text-sm">{t("items", { count: 1 })}</div>
      <div className="text-sm">{t("items", { count: 3 })}</div>
      <p className="text-xs text-gray-500">
        提示：复杂格式化（日期、货币、区间）可引入专用库，但本示例展示可演进的最小架构。
      </p>
    </div>
  )
}