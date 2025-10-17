# 组件级 E2E：Playwright Component Testing

目标：在真实浏览器中验证组件交互与样式，覆盖单测难以还原的场景（动画、布局、可视化）。

安装与初始化：
```bash
npm i -D @playwright/test @playwright/experimental-ct-react # 或 vue
npx playwright install
```

基本用例（React 示例）：
```tsx
// Button.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react'
import { Button } from './Button'

test('点击触发', async ({ mount }) => {
  const clicked: string[] = []
  const cmp = await mount(<Button onClick={() => clicked.push('ok')}>点我</Button>)
  await cmp.click()
  expect(clicked).toEqual(['ok'])
})
```

可视化断言与可访问性：
- 使用 locator 检查可见性与文本
- 结合 axe@playwright 插件做 a11y 扫描（可选）

最佳实践：
- 对动画与过渡：使用 prefers-reduced-motion 或测试配置关闭动画
- 对网络：用 MSW 或 Playwright 路由拦截进行模拟
- 将组件测试纳入 CI 的“快速层”，避免与慢速 E2E 冲突

## 示例入口
- examples/react-basic：抽取组件到 CT 用例
- Playwright CT 配置：playwright-ct.config.ts（官方模板）

## Checklist
- [ ] 交互与视觉在真实浏览器中得到验证
- [ ] 动画/过渡在测试中关闭或稳定化
- [ ] 网络依赖通过 MSW/路由拦截隔离

## 常见错误排查
- mount 失败：检查 CT 适配的框架与版本（React/Vue）
- 选择器不稳定：使用更语义化的 locator，避免纯 CSS 类名