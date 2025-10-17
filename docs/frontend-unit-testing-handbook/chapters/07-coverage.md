# 覆盖率与质量度量

覆盖率类型：
- 行(Line)、语句(Statement)、分支(Branch)、函数(Function)

如何使用：
- 本地快速查看趋势，CI 设阈值防回退
- 不唯覆盖率：高覆盖率也可能是「水测」

Vitest 启用：
- npx vitest run --coverage
- 配置 c8/istanbul 输出 html/text-summary

策略：
- 以关键模块为重点（算法/公共库/复杂组件）
- 对「分支」设置合理阈值（如 70-80%）
- 与代码评审结合，关注「有效断言密度」

阈值配置示例：
- Vitest（vitest.config.ts）
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      thresholds: { lines: 85, functions: 80, branches: 75, statements: 85 }
    }
  }
});
```
- Jest（jest.config.js）
```js
module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  coverageThreshold: {
    global: { lines: 85, functions: 80, branches: 75, statements: 85 },
    './src/core/**': { lines: 90, branches: 85 } // 关键目录更高阈值
  }
};
```

增量与变更集策略：
- 在 PR 上只关注变更文件的覆盖率增量，避免“整体阈值牵制”
- 结合 Codecov/GitHub Apps 输出覆盖率评论，阻止回退（status check）
- 受影响测试优先运行：结合 git diff 与测试映射，只跑受影响的包/用例

报告合并与上报（Monorepo）：
- 各包生成 LCOV，根目录汇总并上报
```bash
# 例：收集与合并
find packages -name lcov.info -exec cp {} coverage/ \;
npx lcov-result-merger 'coverage/**/*.info' 'coverage/lcov.info'
# Codecov 上传（CI）
bash <(curl -s https://codecov.io/bash) -f coverage/lcov.info
```

常见误区：
- 只追求数字：高覆盖率并不代表高质量断言；应关注关键路径与分支命中
- 快照滥用：大 DOM 快照不等于有效覆盖；更推荐精确、行为导向的断言

增量/差异覆盖门禁（PR 场景）：
- 目标：仅对“变更集”设门禁，避免整体阈值牵制
- 做法 A（托管方案）：使用 Codecov/Codecov App，在 PR 上启用“变更覆盖率必须 ≥ 阈值（如 80%）”，并设置不低于主干的最小回退值
- 做法 B（自管方案）：生成 json-summary 并按变更文件解析校验
```bash
# 1) 运行覆盖并输出 json-summary（Vitest）
vitest run --coverage --coverage.reporter=json-summary
# 2) 计算变更文件（相对主干）
CHANGED=$(git diff --name-only origin/main...HEAD | grep -E '^(src|packages)/.*\.(ts|tsx|js|jsx)$' || true)
# 3) 校验（示例脚本 check-changed-coverage.mjs）
node scripts/check-changed-coverage.mjs "$CHANGED"
```
```js
// scripts/check-changed-coverage.mjs
import fs from 'node:fs';
const summary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf-8'));
const files = process.argv.slice(2);
const MIN = { lines: 80, statements: 80, functions: 75, branches: 70 };
let fail = false;
for (const f of files) {
  const s = summary.total && summary[f] || null;
  // 若工具未逐文件统计，可退化为目录级/total 校验
  const tgt = summary[f] || summary.total;
  if (!tgt) continue;
  const { lines, statements, functions, branches } = tgt;
  if (lines.pct < MIN.lines || statements.pct < MIN.statements || functions.pct < MIN.functions || branches.pct < MIN.branches) {
    console.error(`[cov-fail] ${f} lines:${lines.pct}% funcs:${functions.pct}% branch:${branches.pct}%`);
    fail = true;
  }
}
if (fail) process.exit(1);
```

只跑变更相关测试：
- Monorepo：结合 Turborepo/Nx 的“受影响图”只跑受影响包
- 简化版：按路径过滤
```bash
CHANGED_PKGS=$(git diff --name-only origin/main...HEAD | grep '^packages/' | cut -d/ -f2 | sort -u || true)
for P in $CHANGED_PKGS; do pnpm --filter "packages/${P}" test:run; done
```

每文件阈值与例外：
- 将关键目录设更高阈值，允许个别文件豁免（如自动生成代码）：
  - Jest：在 coverageThreshold 中对路径进行单独配置
  - Vitest：建议使用 json-summary + 自定义校验脚本实现“白/黑名单”与差异门禁叠加

## 示例入口
- examples/react-basic：运行测试并生成覆盖
  - 命令：cd examples/react-basic && pnpm test:run
  - 覆盖报告：examples/react-basic/coverage/index.html
- Monorepo 汇总示例：examples/node-msw + scripts/lcov-merge

## Checklist
- [ ] 为关键模块设单独阈值
- [ ] 在 PR 上启用差异覆盖门禁
- [ ] 合并并上报覆盖（CI 产物/Codecov）
- [ ] 快照最小化，断言针对行为与分支

## 常见错误排查
- 覆盖不生成：检查 vitest/jest 配置的 reporter 与输出目录
- 差异校验失败：确认变更文件列表与 coverage-summary 路径一致
- Monorepo 汇总为空：检查 LCOV 路径与合并脚本的 glob