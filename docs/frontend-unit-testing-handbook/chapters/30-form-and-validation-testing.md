# 表单与验证测试（Form & Validation）

目标：确保表单交互、校验逻辑与提交流程稳定可靠，并可在单测/组件测试中覆盖关键路径。

关注点：
- 输入校验：同步/异步规则（必填、长度、格式、唯一性）
- 提交流程：禁用按钮、loading、错误提示与重试
- 无障碍与可用性：焦点顺序、错误消息可读、ARIA 关联

React 示例（受控表单）：
```tsx
// Login.tsx
export function Login({ onSubmit }: any) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('');
  const valid = u.length > 0 && p.length >= 6;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!valid) { setErr('invalid'); return; } onSubmit({ u, p }); }}>
      <input aria-label="username" value={u} onChange={(e)=>setU(e.target.value)} />
      <input aria-label="password" type="password" value={p} onChange={(e)=>setP(e.target.value)} />
      {err && <div role="alert">{err}</div>}
      <button disabled={!valid}>提交</button>
    </form>
  )
}
```
```tsx
// Login.spec.tsx
it('禁用与错误提示', async () => {
  render(<Login onSubmit={vi.fn()} />)
  expect(screen.getByRole('button', { name: '提交' })).toBeDisabled()
  await user.type(screen.getByLabelText('password'), '123')
  await user.click(screen.getByRole('button', { name: '提交' }))
  expect(screen.getByRole('alert')).toHaveTextContent(/invalid/)
})
```

异步校验与提交：
- 对唯一性/后端校验使用 MSW 拦截，断言 loading/错误消息与重试逻辑
- 在提交成功后断言清理/跳转/提示

Vue 示例（校验库结合）：
- 使用 VeeValidate/Yup：对 schema 的同步/异步校验单测；组件层断言禁用与提示

最佳实践：
- 将校验规则抽为纯函数或 schema，单测直接覆盖
- 错误消息与可访问性：role=alert、aria-describedby 关联输入与消息
- 对复杂表单建立“场景用例”（缺失、边界、异常、成功）

Checklist
- [ ] 校验规则纯函数或 schema 测试完善
- [ ] 提交流程的禁用/loading/错误重试覆盖
- [ ] a11y 错误消息可读且关联正确

常见错误排查
- 仅单测校验而忽略组件交互：补充组件层用例
- 异步校验竞态：用取消/最新请求覆盖策略