# 可访问性测试（a11y）实践

目标：在单测层面捕捉无障碍问题（语义、对比度、可聚焦、ARIA 等），降低后期整改成本。

工具选择：
- @testing-library/dom + jest-axe（或 vitest-axe）
- Playwright + Axe（端到端层面）

快速上手（Vitest）：
```bash
npm i -D @testing-library/dom vitest-axe axe-core
```

基础断言示例：
```ts
import { describe, it, expect } from 'vitest'
import { configureAxe, toHaveNoViolations } from 'vitest-axe'

expect.extend(toHaveNoViolations)
const axe = configureAxe()

it('页面无严重 a11y 违规', async () => {
  document.body.innerHTML = `
    <main>
      <h1>标题</h1>
      <button aria-label="关闭">X</button>
    </main>
  `
  const results = await axe(document.body)
  expect(results).toHaveNoViolations()
})
```

常见问题清单：
- 图标按钮缺少可读 label：用 aria-label 或可见文本
- 仅颜色传达信息：增加图标/文本说明
- 可聚焦顺序错乱：检查 tabindex 与 DOM 顺序
- 语义不当：div 代替 button/link，导致键盘导航不可用

与组件库结合：
- 为组件封装 a11y 单测模板（标题层级、按钮可用性、焦点环、ARIA 属性）
- 在 CI 中将 a11y 违规作为警告或门禁（严重违规阻止合并）

## 示例入口
- examples/react-basic：组件 a11y 用例模板
- Playwright + Axe：在端到端测试中集成 a11y 扫描（可选）

## Checklist
- [ ] 所有交互元素具备可读标签
- [ ] 焦点可达且顺序合理
- [ ] 语义正确（使用 button/link 等原生元素）

## 常见错误排查
- 断言为“有违规但未失败”：确认 toHaveNoViolations 已扩展到 expect
- 焦点异常：测试时是否模拟键盘导航而非仅点击