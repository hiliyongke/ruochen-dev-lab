# 环境与配置治理

## 本章目的
- 建立“开发/构建/部署/运行时”一致的配置治理模型，避免环境偏差与隐性风险
- 提供 .env 分层、类型校验、密钥管理、特性开关与 CI 集成的可复制方案

## 复制清单
- 分层与加载：.env, .env.local, .env.development, .env.production（不纳入 VCS 的 *.local）
- 校验与类型化：zod + 自定义 loader（或 envalid/envsafe）
- 运行时 vs 构建时：Vite define、Next/Nuxt 公共/私有前缀、后端代理注入
- 秘密管理：.env.local/.npmrc 私有、CI Secret/环境变量、git-secrets/secretlint
- 特性开关：简单布尔 + 灰度百分比 + 远端配置（OpenFeature/LaunchDarkly）
- CI 集成：环境矩阵、构建产物注入、审计与报告归档

## 配置分层与加载顺序
通用建议：
1) .env              // 默认值（纳入版本控制，不含敏感信息）
2) .env.development  // 开发专用
3) .env.test         // 测试专用
4) .env.production   // 生产默认
5) .env.local / .env.*.local // 仅本机/环境注入（不入库，gitignore）

注意：
- 本地优先级覆盖环境默认；CI/容器优先通过环境变量覆盖 .env
- 针对多应用/monorepo：每个 package 维护自身 .env.*，避免污染

## 运行时 vs 构建时变量
- 构建时（Build-time）：在打包阶段固化，如 Vite 的 import.meta.env、Webpack DefinePlugin
- 运行时（Runtime）：容器/边缘环境注入，避免每次变更都重新构建

Vite 示例（构建时常量）
```ts
// vite.config.ts
import { defineConfig } from 'vite';
export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
```

运行时注入思路（静态站点）
- 在容器启动时生成 /config/runtime-config.json
- 应用启动从 window.__RUNTIME_CONFIG__ 或该 JSON 拉取
```html
<script>
  window.__RUNTIME_CONFIG__ = { API_BASE: "%API_BASE%" };
</script>
```
CI/CD 用 sed/envsubst 注入真实值，避免重新构建。

Next.js/Nuxt 前缀约定
- Next.js：NEXT_PUBLIC_ 前缀可暴露至客户端；其他仅服务端
- Nuxt：NUXT_PUBLIC_ 前缀同理
- Vite：VITE_ 前缀可暴露给客户端（谨慎放敏感信息）

## 类型化与校验（Zod 示例）
```ts
// src/config.ts
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']),
  VITE_API_BASE: z.string().url(),
  VITE_FEATURE_ALPHA: z.string().transform(v => v === 'true').default('false')
});

const parsed = schema.safeParse(import.meta.env);
if (!parsed.success) {
  console.error('Invalid env:', parsed.error.flatten().fieldErrors);
  throw new Error('Env validation failed');
}

export const CONFIG = {
  env: parsed.data.NODE_ENV,
  apiBase: parsed.data.VITE_API_BASE,
  featureAlpha: parsed.data.VITE_FEATURE_ALPHA
};
```
提示：
- 生产时也执行校验，失败快速失败（fail fast）
- 对数字/布尔/枚举进行转换

## 秘密管理与泄露防护
- 秘密不进仓库：.env.local/.npmrc/.yarnrc.yml 放入 .gitignore
- CI Secrets：在平台侧配置（GitHub Actions/GitLab CI/云厂商），按 Job 权限最小化访问
- 静态扫描：git-secrets / secretlint / gitleaks 纳入 CI
- Sentry/日志：禁止记录密钥；Source Map 仅私有上传；CSP/SRI 与 Referrer-Policy

CI 片段（GitHub Actions）
```yml
- name: Build
  run: |
    echo "VITE_API_BASE=$API_BASE" >> .env.production
    pnpm build
  env:
    API_BASE: ${{ secrets.API_BASE }}
```

## 特性开关与灰度
基础布尔
```ts
export const flags = {
  alpha: CONFIG.featureAlpha
};
```
按用户/百分比灰度
```ts
function hash(s: string) { let h = 0; for (const c of s) h = (h*31 + c.charCodeAt(0))>>>0; return h; }
export function inPercent(userId: string, percent: number) {
  return (hash(userId) % 100) < percent;
}
```
远端配置（OpenFeature 概念）
- 定义 flag key -> 规则（人群/时间/版本）
- SDK 拉取并本地缓存；超时降级为默认值
- 记录曝光与变更审计

## 多环境与多租户
- 目录：/configs/{env}.json，运行时由网关/容器挂载
- 租户维度：租户前缀键（TENANT_A_API_BASE），或租户配置中心
- 不同 Region：域名/CDN/数据合规联动（和“安全与合规”章节互链）

## 常见框架差异速查
- React+Vite：import.meta.env.VITE_*（客户端暴露）；其余通过 Runtime 注入
- Next.js：区分服务端与客户端，NEXT_PUBLIC_* 才能给浏览器
- Vue+Vite：同 Vite 约定
- SSR：优先使用服务端环境注入，避免客户端暴露敏感信息

## CI 集成与审计
- 矩阵：{env: [dev, test, prod]}，对每个 env 执行校验/构建/部署
- 产物：将 .env.* 与 build info 以工件形式归档（避免泄露敏感字段，可脱敏）
- 审计：记录变更历史（谁在何时改了哪些配置），关联发布记录

## 度量与看板
- 配置变更次数/回滚次数/平均修复时间（MTTR）
- 线上变量覆盖率（运行实例读取的配置与预期一致性）
- 事故画像：配置导致的错误占比

## 常见坑与 FAQ
- “VITE_* 就能放密钥吗？”：不能，带 VITE_ 会被打进包里
- “每改变量都要重建？”：改运行时配置或使用 Feature Flag，避免重新构建
- “多 env .env 覆盖混乱？”：明确优先级与来源，CI 只用环境变量覆盖，开发用 *.local

## 参考链接
- Twelve-Factor: https://12factor.net/zh_cn/config
- envalid: https://github.com/af/envalid
- OpenFeature: https://openfeature.dev