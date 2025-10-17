# SSR/SSG 与微前端

## 本章目的
- 系统化梳理 SSR/SSG/CSR 的取舍与组合策略，给出可复制落地方案
- 总结微前端（MF）在现代前端工程化下的工程与交付实践

## 复制清单
- 框架选型：Next.js / Nuxt / SvelteKit（SSR/SSG/边缘渲染）；传统 CSR + Prerender
- 数据获取：服务端数据依赖/缓存、客户端增量与回填、错误与降级
- 性能与缓存：CDN + 边缘缓存策略、HTML/数据分层缓存、Stale-While-Revalidate
- Hydration 策略：全量/部分水合、岛屿架构、延迟/可视区域水合
- 微前端：Webpack Module Federation、Web Components、single-spa/qiankun
- 交付：多应用/多仓或 Monorepo、版本与依赖共享、灰度与回滚

## SSR/SSG/CSR 取舍
- CSR：构建简单、缓存友好；首屏 TTFB/TTI 较慢
- SSR（服务端渲染）：更好首屏与 SEO；需要服务端/边缘执行，成本更高
- SSG（静态生成）：极致快与稳；适合长尾内容，动态性弱
- ISR（增量静态生成）：折中方案，结合缓存与后台再生

## 数据获取模式（Next.js 概念通用）
- 服务端（SSR）：每次请求拉取，适合强动态/个性化
- 预生成（SSG/ISR）：构建或首请求后缓存，适合弱动态
- 客户端增量：SWR/React Query 在客户端拉取并回填，减少 SSR 压力
- 错误与降级：超时、重试、回退 UI，保持可用性

示例（Next.js App Router, 缓存与再验证）：
```ts
// app/page.tsx
export const revalidate = 60; // ISR: 60s 再验证
export default async function Page() {
  const data = await fetch('https://api.example.com/posts', { next: { revalidate: 60 } }).then(r => r.json());
  return <List data={data} />;
}
```

Nuxt 数据示例：
```ts
// pages/index.vue
<script setup lang="ts">
const { data, error, pending } = await useFetch('/api/posts', { server: true });
</script>
```

## 边缘 SSR 与缓存
- 平台：Vercel Edge、Cloudflare Workers/Pages、Netlify Edge Functions
- 缓存层次：CDN（HTML/静态资源）、应用层（数据）、浏览器
- 策略：Cache-Control、ETag、SWR；个性化页面禁用共享缓存

示例（Cloudflare Pages Functions，HTML 缓存）：
```ts
export async function onRequestGet({ request, env }) {
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).toString(), request);
  let res = await cache.match(cacheKey);
  if (res) return res;
  const html = await renderSSR(); // 你的 SSR 渲染
  res = new Response(html, { headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=120' } });
  await cache.put(cacheKey, res.clone());
  return res;
}
```

## Hydration 策略与岛屿架构
- 全量水合：实现简单，但成本高
- 部分/延迟水合：对交互组件进行碎片化水合；在视口内才执行
- 岛屿架构：Astro 等将静态与动态组件组合，降低 JS 体积

Astro 局部水合示例：
```astro
---
// src/pages/index.astro
import Chart from '../components/Chart.jsx';
---
<Layout>
  <Chart client:visible />  <!-- 进入视口才水合 -->
</Layout>
```

## 微前端（MF）
适用场景：
- 超大规模前端、多团队自治、跨技术栈共存、独立发布与灰度
常见方案：
- Module Federation（Webpack）：运行时共享依赖与模块
- Web Components：技术栈无关，标准化封装；状态与样式隔离更强
- single-spa/qiankun：基座路由装载子应用

Module Federation 基础配置：
```js
// host webpack.config.js
new ModuleFederationPlugin({
  name: 'host',
  remotes: { shop: 'shop@https://cdn.example.com/remoteEntry.js' },
  shared: { react: { singleton: true, requiredVersion: '^18.0.0' } }
})

// remote webpack.config.js
new ModuleFederationPlugin({
  name: 'shop',
  filename: 'remoteEntry.js',
  exposes: { './ProductCard': './src/ProductCard' },
  shared: { react: { singleton: true } }
})
```

MF 工程要点：
- 依赖共享：singleton + strictVersion；基础依赖强一致或通过适配层解耦
- 样式隔离：CSS Modules、Shadow DOM（Web Components）
- 路由与通信：URL/事件总线/数据契约；避免跨应用耦合
- 发布与回滚：每个子应用独立流水线；CDN 版本化与灰度

## 交付与 CI/CD
- SSR/SSG：按路径/语言/租户维度并行构建；产物多版本归档
- 边缘部署：根据 Region 与合规需求控制路由与数据驻留
- MF：多流水线并行、契约测试、防破坏升级、可回滚策略

GitHub Actions 片段（多目标部署矩阵）：
```yml
strategy:
  matrix:
    target: [ssg, ssr, edge]
steps:
  - run: pnpm build:${{ matrix.target }}
  - run: pnpm test:contract
  - run: pnpm deploy:${{ matrix.target }}
```

## 性能与度量
- 指标：TTFB/FP/FCP/LCP/TTI；HTML 体积；水合时间；JS 体积
- 监控：RUM + 服务端 APM；SSR 错误率与超时率
- 缓存命中：CDN 命中率、回源率、再验证延迟

## 常见坑与 FAQ
- “SSR 全站适用吗？”：强个性化/权限重路由复杂度高；可局部 SSR + 全站静态
- “MF 共享依赖冲突？”：启用 singleton + 版本锚定；或将核心依赖外部化到基座
- “ISR 会过期看到旧数据？”：为关键页面加 revalidate 阈值与手动失效机制

## 参考链接
- Next.js: https://nextjs.org
- Nuxt: https://nuxt.com
- Astro: https://astro.build
- Module Federation: https://module-federation.github.io
- SWR: https://swr.vercel.app/