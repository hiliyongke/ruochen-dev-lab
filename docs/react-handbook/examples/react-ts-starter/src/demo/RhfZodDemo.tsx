import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  username: z.string().min(1, "必填"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "至少 6 位"),
})

type Values = z.infer<typeof schema>

export function RhfZodDemo() {
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) })
  return (
    <form onSubmit={handleSubmit(console.log)} className="space-y-3 max-w-md">
      <div>
        <label className="block text-sm mb-1">用户名</label>
        <input className="border px-3 py-2 rounded w-full" {...register("username")} />
        {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}
      </div>
      <div>
        <label className="block text-sm mb-1">邮箱</label>
        <input className="border px-3 py-2 rounded w-full" {...register("email")} />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm mb-1">密码</label>
        <input type="password" className="border px-3 py-2 rounded w-full" {...register("password")} />
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <button className="px-3 py-2 rounded border bg-white hover:bg-gray-100">注册</button>
    </form>
  )
}

export default RhfZodDemo