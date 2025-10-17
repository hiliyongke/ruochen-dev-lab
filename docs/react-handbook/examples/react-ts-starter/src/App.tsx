import React, { useState } from "react"
import { Hello } from "./demo/Hello"
import { Clicker } from "./demo/Clicker"
import { SearchPanel } from "./demo/SearchPanel"
import { ThemeContextDemo } from "./demo/ThemeContextDemo"
import { CardSlotsDemo } from "./demo/CardSlots"
import { FetcherDemo } from "./demo/Fetcher"
import { RouterDemo } from "./demo/RouterDemo"
import { SwrDemo } from "./demo/SwrDemo"
import { ReactQueryDemo } from "./demo/ReactQueryDemo"
import { RhfBasic } from "./demo/RhfBasic"
import { RhfControllerDemo } from "./demo/RhfControllerDemo"
import { RhfFieldArrayDemo } from "./demo/RhfFieldArrayDemo"
import { RhfZodDemo } from "./demo/RhfZodDemo"
import { PerfMemoDemo } from "./demo/PerfMemoDemo"
import { DeferredSearchDemo } from "./demo/DeferredSearchDemo"
import { TransitionDemo } from "./demo/TransitionDemo"
import { VirtualListDemo } from "./demo/VirtualListDemo"
import { CustomHookDemo } from "./demo/CustomHookDemo"
import RenderPropsVsHOCDemo from "./demo/RenderPropsVsHOCDemo"
import { ContextStateDemo } from "./demo/ContextStateDemo"
import RTKDemo from "./demo/RTKDemo"
import ZustandDemo from "./demo/ZustandDemo"
import JotaiDemo from "./demo/JotaiDemo"
import A11yDemo from "./demo/A11yDemo"
import I18nDemo from "./demo/I18nDemo"
import TestableCounter from "./demo/TestableCounter"
import MockApiWidget from "./demo/MockApiWidget"
import EnvDemo from "./demo/EnvDemo"
import ErrorReportingDemo from "./demo/ErrorReportingDemo"
import FormActionDemo from "./demo/FormActionDemo"
import LoaderDeferDemo from "./demo/LoaderDeferDemo"

const demos = [
  { key: "hello", label: "Hello/Clicker", node: <div className="space-y-3"><Hello name="React" highlight /><Clicker /></div> },
  { key: "search", label: "状态提升：SearchPanel", node: <SearchPanel /> },
  { key: "theme", label: "Context：主题切换", node: <ThemeContextDemo /> },
  { key: "slots", label: "组合/插槽：CardSlots", node: <CardSlotsDemo /> },
  { key: "fetcher", label: "Render Props：Fetcher", node: <FetcherDemo /> },
  { key: "router", label: "Router：路由与懒加载", node: <RouterDemo /> },
  { key: "swr", label: "Data：SWR", node: <SwrDemo /> },
  { key: "rq", label: "Data：React Query", node: <ReactQueryDemo /> },
  { key: "rhf-basic", label: "Form：RHF 基础", node: <RhfBasic /> },
  { key: "rhf-ctrl", label: "Form：Controller", node: <RhfControllerDemo /> },
  { key: "rhf-array", label: "Form：FieldArray", node: <RhfFieldArrayDemo /> },
  { key: "rhf-zod", label: "Form：Zod 校验", node: <RhfZodDemo /> },
  { key: "perf-memo", label: "Perf：memo/稳定引用", node: <PerfMemoDemo /> },
  { key: "perf-deferred", label: "Perf：deferred 搜索", node: <DeferredSearchDemo /> },
  { key: "perf-transition", label: "Perf：startTransition", node: <TransitionDemo /> },
  { key: "perf-virtual", label: "Perf：简易虚拟化", node: <VirtualListDemo /> },
  { key: "reuse-hooks", label: "Reuse：自定义 Hook", node: <CustomHookDemo /> },
  { key: "reuse-rp-hoc", label: "Reuse：Render Props/HOC", node: <RenderPropsVsHOCDemo /> },
  { key: "state-context", label: "State：Context", node: <ContextStateDemo /> },
  { key: "state-rtk", label: "State：Redux Toolkit", node: <RTKDemo /> },
  { key: "state-zustand", label: "State：Zustand", node: <ZustandDemo /> },
  { key: "state-jotai", label: "State：Jotai", node: <JotaiDemo /> },
  { key: "a11y", label: "A11y：键盘可达/ARIA", node: <A11yDemo /> },
  { key: "i18n", label: "i18n：上下文式国际化", node: <I18nDemo /> },
  { key: "quality-counter", label: "Quality：TestableCounter", node: <TestableCounter /> },
  { key: "quality-mock", label: "Quality：MockApiWidget", node: <MockApiWidget /> },
  { key: "eng-env", label: "Eng：环境变量/配置", node: <EnvDemo /> },
  { key: "eng-error", label: "Eng：错误边界与上报", node: <ErrorReportingDemo /> },
  { key: "form-action", label: "Form：React 19 Actions", node: <FormActionDemo /> },
  { key: "router-defer", label: "Router：loader/defer", node: <LoaderDeferDemo /> },
] as const

export default function App() {
  const [tab, setTab] = useState<typeof demos[number]["key"]>("hello")
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-semibold mb-4">示例面板</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {demos.map((d) => (
          <button
            key={d.key}
            onClick={() => setTab(d.key)}
            className={`px-3 py-2 rounded border ${tab === d.key ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-100"}`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded border p-4 shadow-sm">{demos.find((d) => d.key === tab)?.node}</div>
    </div>
  )
}