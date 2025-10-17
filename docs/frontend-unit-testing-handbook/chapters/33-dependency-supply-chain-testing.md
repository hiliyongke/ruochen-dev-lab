# 依赖与供应链安全测试

目标：在测试与 CI 中对第三方依赖与构建供应链进行安全与稳定校验，降低引入风险。

关注点：
- 依赖安全：审计漏洞（npm audit/pnpm audit）、许可证合规
- 篡改与完整性：锁文件与校验和、Subresource Integrity（SRI）
- 构建链路：CI 节点可信、缓存与 artifact 完整性

实践建议：
- 将审计纳入 CI：
```bash
pnpm audit --json > audit.json
node scripts/check-audit.mjs audit.json # 设定严重级别门禁
```
- 许可证检查：
  - 使用 license-checker 生成依赖许可证列表，在 CI 校验是否符合策略
- SRI 与资源完整性：
  - 对外部 CDN 资源启用 SRI；在测试中断言链接含 integrity 属性
- 锁文件与来源：
  - 锁定 registry 与镜像；PR 禁止修改不相关锁文件片段

示例：审计门禁脚本（思路）
```js
// scripts/check-audit.mjs
import fs from 'node:fs'
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'))
const issues = (data.advisories || []).filter(a => a.severity === 'high' || a.severity === 'critical')
if (issues.length) {
  console.error(`[audit-fail] found ${issues.length} high/critical vulnerabilities`)
  process.exit(1)
}
```

最佳实践：
- 适配层引入第三方 SDK，测试只依赖适配层接口
- 定期审计与自动修复（npm audit fix 审慎使用，需评审）
- 对关键页面的外部脚本建立加载与失败回退用例

Checklist
- [ ] 审计与许可证检查纳入 CI
- [ ] 关键外部资源具备完整性校验或本地化策略
- [ ] 锁文件与 registry 固定，避免来源风险

常见错误排查
- 审计阻塞：审查是否可通过升级或替换依赖解决
- 外部脚本失败：确保存在回退路径与错误提示