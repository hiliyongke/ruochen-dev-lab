# 视觉回归测试（Visual Regression）

目标：在 UI 改动时自动比对快照/截图，发现样式与布局回退，适用于组件库与关键页面。

工具选择：
- Playwright Screenshot Diff（内置视觉比较）
- Storybook + Chromatic（云端视觉回归）
- Percy（截图对比即服务）

Playwright 视觉比较示例：
```tsx
import { test, expect } from '@playwright/test'
test('按钮视觉稳定', async ({ page }) => {
  await page.goto('http://localhost:5173/components/button')
  const btn = page.locator('[data-testid=primary-btn]')
  await expect(btn).toHaveScreenshot('button-primary.png', { maxDiffPixelRatio: 0.01 })
})
```

组件级（Storybook）：
- 在组件故事上生成快照/截图，对比 PR 改动
- CI 集成 Chromatic：提交后自动跑视觉回归并出差异报告

稳定策略：
- 关闭动画/过渡（prefers-reduced-motion 或测试配置）
- 使用固定数据与字体加载策略，避免非确定性
- 只对关键组件/页面启用视觉回归，控制成本

最佳实践：
- 将视觉回归作为“慢层”，与单测/CT 分层运行
- 差异审查流程：允许小幅差异并需人工批准（变更图像阈值与忽略区域）
- 与功能测试分离，避免断言耦合

Checklist
- [ ] 关键组件/页面具备视觉回归用例
- [ ] 动画/字体/数据稳定化
- [ ] 差异审查与忽略策略明确

常见错误排查
- 非确定性失败：固定网络/字体/动画；设置阈值与忽略区域
- 截图不一致：检查视口尺寸与渲染环境一致性