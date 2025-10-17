# 前端日志与可观测性测试（Logging/Tracing/Metrics）

目标：确保前端在问题发生时能“被看见”，并通过测试保证日志、埋点与错误上报的正确性与稳定性。

范围与对象：
- 错误采集：window.onerror、unhandledrejection、框架 ErrorBoundary
- 日志/埋点：用户行为（点击/曝光）、性能指标（TTFB/FCP/LCP/CLS）
- Tracing：跨请求链路（traceId）传递与采样策略

错误上报（示例）：
```ts
// report.ts
export function reportError(err: unknown) {
  // 发送到 Sentry/自建端点
  // fetch('/api/log', { method: 'POST', body: JSON.stringify({ message }) })
}
```
```ts
// report.spec.ts
global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as any
it('上报错误成功', async () => {
  await reportError(new Error('oops'))
  expect(fetch).toHaveBeenCalled()
})
```

埋点验证：
- 对点击/曝光事件：在测试中触发交互并断言埋点函数被正确调用，参数含关键字段（page、component、action、traceId）
- 使用 MSW 拦截上报请求，验证请求体结构与频控（如批量/采样）

性能指标（合成场景）：
- 使用 Performance API 伪造指标或通过 Playwright CT/E2E 在真实浏览器采集
- 将核心指标采样上报，在测试中断言采样与降噪策略（如过滤极端值）

最佳实践：
- 统一日志/埋点 SDK，避免散落调用
- 设定采样率与隐私合规策略，在测试中校验开关与脱敏
- 将关键上报纳入“变更集门禁”，避免遗漏或破坏

Checklist
- [ ] 错误上报在单测中被验证（含网络拦截）
- [ ] 关键埋点（点击/曝光）具备断言与参数校验
- [ ] 采样与隐私脱敏策略可测试

常见错误排查
- 未触发上报：检查事件绑定与测试交互是否命中
- 请求体结构不符：用 MSW 校验并提供详细断言