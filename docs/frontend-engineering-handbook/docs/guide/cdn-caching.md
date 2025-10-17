# CDN 与缓存工程

## 本章目的
- 建立“源站→CDN→浏览器→Service Worker”的多层缓存策略闭环
- 通过可复制的 Cache-Control/ETag/版本化/失效策略，提升可用性与性能

## 复制清单
- 资源命名：文件名指纹（content hash）+ 不变资源长期缓存
- HTTP 缓存头：Cache-Control、ETag/Last-Modified、Vary、Surrogate-Key
- 策略：immutable、stale-while-revalidate、分层 TTL、关键路径预热
- 失效：精准失效（by path/key）、灰度与回滚、自动化预热
- 压缩与传输：Brotli/Gzip、preload/preconnect、Priority Hints
- SW 离线：Service Worker 缓存静态资产与降级页面

## 缓存分层与职责
- CDN：静态资源与 HTML 的边缘分发；按路径/Key 控制失效（推荐使用标签/Key）
- 浏览器：短 TTL + ETag 再验证；对指纹化资源启用长期缓存
- 应用层（SSR/边缘函数）：数据缓存与再验证（SWR/ISR）

## 资源指纹与目录结构
构建产物示例
```
/assets/app.3f4a1c2.js
/assets/vendor.a9c8b7c.css
/index.html
```
- 指纹化资源（.js/.css/images/fonts）：Cache-Control: public, max-age=31536000, immutable
- HTML：Cache-Control: public, max-age=60, s-maxage=600, stale-while-revalidate=120

## HTTP 头部策略
示例（静态资源）
```
Cache-Control: public, max-age=31536000, immutable
ETag: "W/3f4a1c2"
```
示例（HTML）
```
Cache-Control: public, max-age=60, s-maxage=600, stale-while-revalidate=120
Vary: Accept-Encoding
```
说明
- immutable：指纹不变则无需再验证
- s-maxage：CDN 专用 TTL；浏览器仍遵循 max-age
- stale-while-revalidate：在后台再验证期间提供过期内容，降低抖动

## CDN 侧配置要点
- 基于路径的规则：/assets/* 长缓存；/index.html 短 TTL + 再验证
- 基于 Key 的失效：为动态页面或聚合资源设置 Surrogate-Key（例如：page:home、tenant:acme）
- 多 Region：按合规要求限制地理路由与源站回源

示例（Cloudflare Workers/Pages Functions 添加头）
```ts
export async function onRequestGet({ request }) {
  const res = await fetch(request);
  const newHeaders = new Headers(res.headers);
  const url = new URL(request.url);
  if (url.pathname.startsWith('/assets/')) {
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    newHeaders.set('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=120');
  }
  return new Response(res.body, { headers: newHeaders, status: res.status, statusText: res.statusText });
}
```

## 失效与预热
- 精准失效：按路径或 Surrogate-Key，避免全站清空
- 新版本发布：指纹文件无需失效；仅 HTML 与入口路由失效
- 预热：CI 完成后触达热点路径；首屏与关键路由优先
- 回滚：指纹资源天然可回滚；HTML 失效回滚至上个版本

CI 任务片段（伪示例）
```yml
- name: Invalidate CDN
  run: |
    curl -X POST "$CDN_API/purge" -H "Authorization: Bearer $TOKEN" -d '{"paths":["/","/index.html","/app-shell"]}'
- name: Warm Up
  run: |
    for p in / /home /products; do curl -sSL "https://example.com$p" -o /dev/null; done
```

## 传输优化
- 压缩：Brotli 优先（br），回退到 gzip；为文本类资源开启
- 连接：preconnect 到关键域名（API/CDN/字体）；prefetch 次级路由
- 优先级提示（Priority Hints）：
```
<link rel="preload" href="/assets/app.js" as="script" importance="high" />
```

## 图片与媒体
- 响应式图片：srcset/sizes，WebP/AVIF 优先，回退 JPEG/PNG
- 按需裁剪与格式转换：使用 CDN 图像处理接口
- 占位与渐进：LQIP/BlurHash 提升感知速度

## SPA 与路由
- 对单页应用启用“回退到 index.html”的路由规则
- 对 404/500 页面设置短 TTL 与可观测（避免错误缓存太久）
- i18n 与多租户：使用 Vary（如 Vary: Accept-Language, Cookie）谨慎控制缓存粒度

## Service Worker（可选）
- Precache 构建产物（指纹化文件），Runtime 缓存 API 响应
- 策略：网络优先/缓存优先/缓存更新并回退（Stale-While-Revalidate）
示例（Workbox）
```ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate()
);
```

## 常见陷阱与防御
- 指纹缺失导致缓存污染：强制开启文件名 hash
- HTML 过度缓存：用户拿到旧版本；需短 TTL+SWR
- Vary 维度过多：CDN 缓存命中率下降；控制最少必要维度
- 仅清缓存不预热：首波用户遇到慢/冷缓存

## CI 检查与度量
- Budget：JS/CSS/HTML 体积预算；图片格式与体积阈值
- Headers 检查：CI 验证关键路径的 Cache-Control/Content-Encoding
- 命中率：CDN 命中率、回源率、边缘与源站延时
- 回滚演练：定期演练回滚 + 冷启动预热流程

## 参考链接
- HTTP Caching: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
- stale-while-revalidate: https://www.rfc-editor.org/rfc/rfc5861
- Workbox: https://developer.chrome.com/docs/workbox
- Priority Hints: https://developer.chrome.com/docs/web-platform/priority-hints