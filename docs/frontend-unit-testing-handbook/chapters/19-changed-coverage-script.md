# 差异覆盖门禁脚本（PR 变更集）

目标：仅对 PR 变更文件设覆盖阈值，避免整体阈值牵制，提升门禁有效性。

脚本示例（Vitest + json-summary）：
```bash
# 生成覆盖摘要
vitest run --coverage --coverage.reporter=json-summary
```
```js
// scripts/check-changed-coverage.mjs
import fs from 'node:fs'
import { execSync } from 'node:child_process'

const MIN = { lines: 80, statements: 80, functions: 75, branches: 70 }

function getChangedFiles() {
  const out = execSync('git diff --name-only origin/main...HEAD').toString()
  return out.split('\n').filter(f => /^(src|packages)\/.+\.(ts|tsx|js|jsx)$/.test(f))
}

function readSummary() {
  const json = fs.readFileSync('coverage/coverage-summary.json', 'utf-8')
  return JSON.parse(json)
}

const changed = getChangedFiles()
const summary = readSummary()
let fail = false

for (const f of changed) {
  const tgt = summary[f] || summary.total
  if (!tgt) continue
  const ok =
    tgt.lines.pct >= MIN.lines &&
    tgt.statements.pct >= MIN.statements &&
    tgt.functions.pct >= MIN.functions &&
    tgt.branches.pct >= MIN.branches
  if (!ok) {
    console.error(`[cov-fail] ${f} lines:${tgt.lines.pct}% funcs:${tgt.functions.pct}% branches:${tgt.branches.pct}%`)
    fail = true
  }
}

if (fail) process.exit(1)
```

CI 集成（GitHub Actions 片段）：
```yaml
- run: vitest run --coverage --coverage.reporter=json-summary
- run: node scripts/check-changed-coverage.mjs
```

扩展建议：
- Monorepo 下优先使用受影响图（Turborepo/Nx），缩小校验范围
- 对关键目录设更高阈值，自动生成白/黑名单

## 示例入口
- scripts/check-changed-coverage.mjs：直接复制使用
- examples/react-basic：跑覆盖并生成 coverage-summary.json

## Checklist
- [ ] 覆盖生成 json-summary
- [ ] 变更文件列表解析正确（相对 origin/main）
- [ ] 对关键目录设更高阈值或白名单管理

## 常见错误排查
- summary 缺失：确认 reporter 包含 json-summary
- 变更解析为空：CI 中是否先 fetch 主干并正确设置对比基线