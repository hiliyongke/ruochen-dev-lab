# 国际化/本地化测试（i18n/L10n）

目标：在不同语言/地区设置下确保 UI 文案、格式化与方向性（RTL）正确，避免硬编码与格式错误。

关注点：
- 文案与占位：使用 i18n 键而非硬编码；变量插值与复数规则
- 本地化格式：日期/货币/数字（Intl/库）
- 布局方向：RTL 支持（dir="rtl"）、组件镜像与对齐

文案测试（React 示例）：
```tsx
// i18n.ts
export const t = (k: string, vars?: any) => k === 'hello' ? `你好 ${vars?.name||''}` : k
```
```tsx
// Hello.spec.tsx
render(<div>{t('hello', { name: 'Neo' })}</div>)
expect(screen.getByText('你好 Neo')).toBeInTheDocument()
```

本地化格式（Intl）：
```ts
it('货币格式', () => {
  const s = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(1234.5)
  expect(s).toMatch(/￥\s?1,234\.50/)
})
```

RTL 测试：
- 在组件测试中设置 document.dir='rtl' 并断言布局/对齐
- 使用 Testing Library 的 RTL 插件或自定义 helper

最佳实践：
- 文案查漏：为关键页面建立“键覆盖测试”，确保所有 keys 解析成功
- 变量插值与复数：对 ICU Message/Plural 规则编写用例
- 与可访问性协同：语言属性与朗读正确性

Checklist
- [ ] 关键页面 i18n 键覆盖测试
- [ ] 本地化格式（日期/货币）用例
- [ ] RTL 布局断言

常见错误排查
- 键缺失：测试中断言 fallback 并在 CI 报告
- 不同环境 Intl 差异：固定 Node/浏览器版本或使用 polyfill