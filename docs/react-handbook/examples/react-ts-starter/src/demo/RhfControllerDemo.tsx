import React from "react"
import { useForm, Controller } from "react-hook-form"

type Values = { age: number; agree: boolean }

function NumberInput({ value, onChange }: { value?: number; onChange?: (v: number) => void }) {
  return (
    <input
      type="number"
      className="border px-3 py-2 rounded w-32"
      value={value ?? 0}
      onChange={(e) => onChange?.(Number(e.target.value))}
    />
  )
}

function Switch({ checked, onChange }: { checked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={`px-3 py-1 rounded border ${checked ? "bg-green-600 text-white border-green-600" : "bg-white"}`}
    >
      {checked ? "已同意" : "未同意"}
    </button>
  )
}

export function RhfControllerDemo() {
  const { control, handleSubmit } = useForm<Values>({ defaultValues: { age: 18, agree: false } })
  return (
    <form onSubmit={handleSubmit(console.log)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm mb-1">年龄</label>
        <Controller
          name="age"
          control={control}
          rules={{ min: { value: 0, message: "年龄不能为负" } }}
          render={({ field, fieldState }) => (
            <div>
              <NumberInput value={field.value} onChange={field.onChange} />
              {fieldState.error && <p className="text-red-600 text-sm mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">协议</label>
        <Controller
          name="agree"
          control={control}
          rules={{ validate: (v) => v || "请先同意协议" }}
          render={({ field, fieldState }) => (
            <div>
              <Switch checked={field.value} onChange={field.onChange} />
              {fieldState.error && <p className="text-red-600 text-sm mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </div>
      <button className="px-3 py-2 rounded border bg-white hover:bg-gray-100">提交</button>
    </form>
  )
}

export default RhfControllerDemo