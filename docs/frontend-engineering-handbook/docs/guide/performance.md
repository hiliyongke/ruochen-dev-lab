# 性能与预算

## 本章目的
- 建立从指标→优化→预算→自动化的性能闭环
- 提供可复制的 Lighthouse CI、Web Vitals、体积预算与缓存策略

## 指标速览（建议基线）
- LCP: ≤ 2.5s（P75）、FID/INP: ≤ 200ms、CLS: ≤ 0.1
- TTFB: ≤ 0.8s、TTI: 越小越好
- 首屏体积（JS 压缩后）≤ 200KB，单 chunk ≤ 250KB

## 复制清单
- 测量：Lighthouse CI、Web Vitals（RUM）
- 体积：size-limit / bundlesize、source-map-explorer
- 资源：图片（avif/webp）、字体（subset+display=swap）、缓存头（immutable）
- 构建：代码拆分、按需加载、预加载/预获取、SSR/流式渲染（可选）

## 体积预算（size-limit）
安装
```bash
pnpm add -D size-limit @size-limit/preset-app
```
package.json
```json
{
  "size-limit": [
    { "path": "dist/assets/*.js", "limit": "250 KB" }
  ],
  "scripts": {
    "size": "size-limit"
  }
}
```

## Lighthouse CI（页面质量预算）
安装
```bash
pnpm add -D @lhci/cli
```
lighthouserc.json
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "dist",
      "numberOfRuns": 3,
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "unused-javascript": "warn",
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }]
      }
    }
  }
}
```

## Web Vitals（运行时真实数据）
安装
```bash
pnpm add web-vitals
```
上报示例
```ts
import { onCLS, onINP, onLCP } from 'web-vitals';
const report = (name: string, value: number) => {
  fetch('/rum', { method: 'POST', body: JSON.stringify({ name, value }) });
};
onCLS(v => report('CLS', v.value));
onINP(v => report('INP', v.value));
onLCP(v => report('LCP', v.value));
```

## 代码拆分与预加载
- 路由/页面级拆分：动态 import()，避免大包首屏阻塞
- 第三方依赖拆分：UI 框架与图表库单独拆包
- 预加载：<link rel="preload"> 关键资源；preconnect dns-prefetch 降低握手时延

Vite 示例（拆包+警戒值）
```ts
// vite.config.ts 片段
export default {
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: { output: { manualChunks: { vendor: ['react', 'react-dom'] } } }
  }
};
```

## 资源优化
- 图片：优先 avif/webp；按密度与布局裁切；懒加载 loading="lazy"
- 字体：子集化 + display=swap；HTTP 缓存一年 + immutable
- 压缩：gzip + brotli；HTTP/2 多路复用、HTTP/3 视情况评估

## 缓存与 CDN
- 静态资源：文件名带 contenthash，Cache-Control: public, max-age=31536000, immutable
- HTML：短缓存/不缓存；利用 ETag 与服务端缓存层
- CDN：就近分发，开启 brotli 与智能压缩

## CI 集成（GitHub Actions）
.github/workflows/perf.yml
```yml
name: Performance
on:
  pull_request:
  push: { branches: [main] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm i --frozen-lockfile
      - run: pnpm build
      - run: pnpm size
      - run: npx lhci autorun --config=./lighthouserc.json
```

## CI 集成（GitLab CI）
.gitlab-ci.yml 片段
```yml
stages: [build, perf]
build:
  stage: build
  image: node:20
  script:
    - corepack enable && npm i -g pnpm
    - pnpm i --frozen-lockfile
    - pnpm build
  artifacts: { paths: [dist] }
perf:
  stage: perf
  image: node:20
  script:
    - pnpm add -D @lhci/cli size-limit @size-limit/preset-app
    - pnpm size
    - npx lhci autorun --config=./lighthouserc.json
  dependencies: [build]
```

## 度量与看板
- CI 存档：Lighthouse 报告、size-limit 结果、Top N 大文件清单
- 趋势：主分支对比拉红；达不到预算拒绝合并或标记风险

## 常见坑与 FAQ
- “预算太紧导致频繁失败”：逐步收紧，设置 warning→error 渐进门槛
- “体积报告波动大”：固定构建环境/版本，跑多次取 P75
- “LCP 高”：首屏资源过大、关键字体阻塞、图片未优化或未使用预加载

## 参考链接
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
- Web Vitals: https://web.dev/vitals/
- size-limit: https://github.com/ai/size-limit
- source-map-explorer: https://github.com/danvk/source-map-explorer