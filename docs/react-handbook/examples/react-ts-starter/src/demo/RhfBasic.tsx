import React from "react"
import { useForm } from "react-hook-form"

type FormValues = { name: string; email: string }

export function RhfBasic() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<FormValues>({ mode: "onTouched" })
  const onSubmit = (data: FormValues) => {
    console.log("submit", data)
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-md">
      <div>
        <label className="block text-sm mb-1">姓名</label>
        <input
          placeholder="如：Ada Lovelace"
          className="border px-3 py-2 rounded w-full"
          {...register("name", { required: "请输入姓名" })}
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm mb-1">邮箱</label>
        <input
          placeholder="name@example.com"
          className="border px-3 py-2 rounded w-full"
          {...register("email", {
            required: "请输入邮箱",
            pattern: { value: /\S+@\S+\.\S+/, message: "邮箱格式不正确" },
          })}
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <button
        disabled={isSubmitting || !isValid}
        className={`px-3 py-2 rounded border ${isSubmitting || !isValid ? "cursor-not-allowed opacity-60" : "bg-white hover:bg-gray-100"}`}
      >
        {isSubmitting ? "提交中..." : "提交"}
      </button>
    </form>
  )
}

export default RhfBasic