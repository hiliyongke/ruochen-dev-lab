import React from "react"
import { useForm, useFieldArray } from "react-hook-form"

type Item = { title: string; qty: number }
type Values = { items: Item[] }

export function RhfFieldArrayDemo() {
  const { control, register, handleSubmit } = useForm<Values>({ defaultValues: { items: [{ title: "", qty: 1 }] } })
  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  return (
    <form onSubmit={handleSubmit(console.log)} className="space-y-3">
      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={f.id} className="flex gap-2 items-center">
            <input
              className="border px-3 py-2 rounded"
              placeholder="标题"
              {...register(`items.${i}.title` as const, { required: true })}
            />
            <input
              type="number"
              className="border px-3 py-2 rounded w-24"
              {...register(`items.${i}.qty` as const, { valueAsNumber: true, min: 1 })}
            />
            <button type="button" className="px-2 py-1 rounded border" onClick={() => remove(i)}>删除</button>
          </div>
        ))}
      </div>
      <div className="space-x-2">
        <button type="button" className="px-3 py-2 rounded border" onClick={() => append({ title: "", qty: 1 })}>新增行</button>
        <button className="px-3 py-2 rounded border bg-white hover:bg-gray-100">提交</button>
      </div>
    </form>
  )
}

export default RhfFieldArrayDemo