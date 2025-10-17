# 运行时观测与错误追踪

## 本章目的
- 建立前端“可观测”闭环：采集→关联→告警→定位→回溯
- 提供 RUM 指标上报、错误追踪（Sentry）、日志与版本关联的可复制方案

## 能力矩阵
- 指标：Web Vitals（LCP/INP/CLS）、TTFB、错误率、接口失败率、白屏率
- 追踪：错误堆栈、Breadcrumbs、用户行为、Release/Commit 关联、环境与版本
- 资产：Source Map 私有上传，避免源码泄露
- 治理：采样率、PII 脱敏、隐私合规，告警与自愈（降级/重试）

## 复制清单
- RUM：web-vitals 上报接口（后端汇聚/看板）
- 错误追踪：Sentry SDK（或自建/阿里云可观测），绑定 release 与环境
- Source Map：生产构建生成 map，CI 私有上传，产物内不内联
- 兜底与降级：Error Boundary（React/Vue）、重试/退避/熔断

## 可运行示例：Web Vitals 上报
```ts
import { onCLS, onINP, onLCP } from 'web-vitals';
const send = (name: string, value: number) =>
  navigator.sendBeacon?.('/rum', new Blob([JSON.stringify({ name, value, ts: Date.now() })], { type: 'application/json' }))
  || fetch('/rum', { method: 'POST', body: JSON.stringify({ name, value, ts: Date.now() }) });

onCLS(v => send('CLS', v.value));
onINP(v => send('INP', v.value));
onLCP(v => send('LCP', v.value));
```

## 可运行示例：Sentry 最小接入
安装
```bash
pnpm add @sentry/browser @sentry/tracing
```
初始化（React/Vue 通用要点）
```ts
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: __APP_VERSION__, // 通过构建注入版本
  tracesSampleRate: 0.1,    // 性能采样，按需调整
  replaysSessionSampleRate: 0, // 若启用会话回放，谨慎评估隐私与带宽
  beforeSend(event) {
    // 脱敏：移除 PII
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  }
});
```

Release 关联（构建注入）
```ts
// vite.config.ts
import { defineConfig } from 'vite';
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.GIT_COMMIT || 'dev')
  }
});
```

## Source Map 私有上传（生产）
- 生产环境生成 map，但不随产物公开分发
- 仅将 map 上传到私有端（Sentry/自建），并移除产物中的 map 引用

GitHub Actions 片段
```yml
- name: Build
  run: pnpm build
- name: Upload Sentry sourcemaps
  run: |
    pnpm dlx @sentry/cli releases new "$GITHUB_SHA"
    pnpm dlx @sentry/cli releases files "$GITHUB_SHA" upload-sourcemaps ./dist --url-prefix "~/assets" --rewrite
    pnpm dlx @sentry/cli releases finalize "$GITHUB_SHA"
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: your-project
```

## React/Vue 错误兜底
React Error Boundary
```tsx
class AppErrorBoundary extends React.Component<{},{hasError:boolean}> {
  state={hasError:false};
  static getDerivedStateFromError(){ return {hasError:true}; }
  componentDidCatch(err:any, info:any){ /* 上报日志 */ }
  render(){ return this.state.hasError ? <Fallback /> : this.props.children; }
}
```
Vue 3 全局错误处理
```ts
app.config.errorHandler = (err, instance, info) => {
  // 上报 Sentry 或日志服务
};
```

## 网络错误与自愈
- 重试与退避：指数退避 + 抖动（避免雪崩）
- 熔断：连续失败阈值后快速失败，定时半开恢复探测
- 降级：读取缓存/静态数据、隐藏非关键模块

## CI 集成（最小模板）
- 在构建阶段注入 release，并上传 Source Map
- 在主分支/发布流水线中开启“错误率/核心指标”阈值校验（与“性能与预算”联动）

## 隐私与合规
- 严格脱敏：禁收集身份证号、手机号原文等 PII
- 最小化原则：只采集定位问题所必需的信息
- 管理端口：统一的隐私与开关控制（灰度场景下动态调整采样）

## 度量与看板
- 错误率：按版本/页面/设备维度对比
- TOP 异常：堆栈聚合、影响用户数、告警阈值
- 指标趋势：Web Vitals 与错误率关联，观察发布前后变化

## 常见坑与 FAQ
- “错误堆栈不可读”：缺少 map 或行列信息，确认 map 上传与 release 绑定
- “上报过多影响性能”：采样、批量上报与去重策略
- “隐私风险”：beforeSend 脱敏、白名单字段、合规评审

## 参考链接
- Sentry JS: https://docs.sentry.io/platforms/javascript/
- Web Vitals: https://web.dev/vitals/
- 前端可观测综述: https://opentelemetry.io (可选自建方案)