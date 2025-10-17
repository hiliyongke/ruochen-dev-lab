# 前端性能测试与预算（Performance Budget）

目标：在测试与 CI 中建立性能预算（如 LCP/FID/CLS/总包体积/关键页面 TTI），防止性能回退。

关键指标与预算：
- 核心 Web 指标：LCP、FID、CLS（建议用真实浏览器采集或实验室工具）
- 构建产物：首屏关键 chunk 体积、总 JS/CSS 体积、图片体积
- 请求数与关键路径：首屏请求数量与阻塞资源

构建体积门禁（示例）：
```js
// scripts/check-bundle-size.mjs
import fs from 'node:fs'
const MAX = { js: 300 * 1024, css: 100 * 1024 } // 例：js 300KB、css 100KB
const stats = JSON.parse(fs.readFileSync('dist/stats.json', 'utf-8'))
const js = stats.assets.filter(a => a.name.endsWith('.js')).reduce((s,a) => s+a.size,0)
const css = stats.assets.filter(a => a.name.endsWith('.css')).reduce((s,a) => s+a.size,0)
if (js > MAX.js || css > MAX.css) {
  console.error(`[perf-budget-fail] js=${js} css=${css}`)
  process.exit(1)
}
```

Lighthouse/Playwright 性能采集（思路）：
- 使用 Lighthouse CI 在 PR 中跑关键页面并设置阈值（performance ≥ 0.9）
- 使用 Playwright 在真实浏览器下记录首屏时间/资源数，并在测试中断言不超过预算

示例：Playwright 采集网络与首屏耗时（伪代码）：
```ts
import { test, expect } from '@playwright/test'
test('首页性能预算', async ({ page }) => {
  const start = Date.now()
  const reqs: any[] = []
  page.on('requestfinished', r => reqs.push(r))
  await page.goto('https://app.local/')
  const tti = Date.now() - start
  expect(tti).toBeLessThan(3000) // 3s
  expect(reqs.length).toBeLessThan(30)
})
```

最佳实践：
- 将“构建体积预算 + 关键页面性能阈值”纳入 CI 必选检查
- 针对大图与第三方脚本制定专用预算与加载策略（延迟/按需）
- 与可观测性联动：线上 APM/前端埋点对比实验室结果

Checklist
- [ ] 构建体积预算脚本在 CI 中执行
- [ ] 关键页面性能阈值（Lighthouse/Playwright）达标
- [ ] 第三方脚本与图片加载策略明确

常见错误排查
- 体积异常增长：检查依赖引入与 tree-shaking 失效
- 实验室与线上差异：校准采样、网络条件与缓存策略