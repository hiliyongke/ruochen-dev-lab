# 依赖与版本治理

## 本章目的
- 建立“识别→升级→验证→发布”的依赖治理闭环，降低供应链与回归风险
- 提供 Renovate 策略、SemVer 范围策略、pnpm 工具与 CI 守护的可复制方案

## 治理矩阵（速览）
- 升级来源：手动/自动（Renovate）/安全通告（OSV、npm advisory）
- 范围策略：caret(^)/tilde(~)/固定(=)/范围（>=x <y）
- 风险分级：Major（破坏性）/Minor/ Patch/ 安全修复
- 验证：单元/组件/E2E、构建与体积预算、变更日志与迁移指南
- 发布：单仓 semantic-release / Monorepo Changesets

## 复制清单
- 自动升级：Renovate（或 Dependabot）+ 分组与标签
- 兼容控制：engines、peerDependencies、package.json exports
- 锁定与去重：pnpm-lock.yaml、pnpm overrides、pnpm dedupe
- 验证：CI 跑测试与构建、size-limit、Lighthouse CI（可选）

## Renovate 配置（单仓/Monorepo 通用）
renovate.json
```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", ":semanticCommits"],
  "rangeStrategy": "bump",
  "labels": ["deps"],
  "timezone": "Asia/Shanghai",
  "prHourlyLimit": 5,
  "prConcurrentLimit": 10,
  "packageRules": [
    { "matchDepTypes": ["devDependencies"], "groupName": "dev-deps (minor/patch)", "matchUpdateTypes": ["minor", "patch"] },
    { "matchUpdateTypes": ["major"], "groupName": "major deps", "stabilityDays": 3 }
  ]
}
```
要点
- rangeStrategy: bump 保持锁文件与范围同步
- 对 major 升级延迟合并（stabilityDays）+ 指定审阅人

## SemVer 与范围策略
- ^1.2.3：兼容次要/补丁升级（1.x），易于持续集成；适合应用
- ~1.2.3：仅补丁升级；适合对稳定性敏感的库或关键依赖
- 精确版本：仅在“可复现构建”强需求或问题定位阶段临时使用
- 建议：package.json 使用 ^（或 ~），通过锁文件钉死实际版本

## pnpm 工具箱
常用命令
```bash
# 升级策略
pnpm up -L         # 遵循 semver 升级
pnpm up --latest   # 忽略范围到最新（慎用）
pnpm up react@18   # 指定包

# 解析与去重
pnpm why react
pnpm dedupe        # 同一依赖版本对齐，降低重复
```
overrides（强制对齐依赖版本）
```json
// package.json
{
  "pnpm": {
    "overrides": {
      "react": "^18.3.1",
      "webpack-terser-plugin>terser": "^5.31.0"
    }
  }
}
```
resolutions（Yarn/NPM 生态同理；pnpm 用 overrides）
- 对少数问题依赖进行“顶层钉死”；合并后务必记录原因并开跟进 Issue

## Monorepo 升级与发布
- 升级路径：先升级底层 packages（utils/ui）→ 应用 apps
- 版本联动：使用 Changesets 生成变更并驱动发布
```bash
pnpm changeset           # 记录受影响包与变更类型
pnpm changeset version   # 统一升级版本并写入各包
pnpm -r publish --access public
```
- 依赖约束：使用 workspace:* 描述内部依赖，避免幽灵依赖

## CI 守护（GitHub Actions）
.github/workflows/deps.yml
```yml
name: Deps Governance
on:
  pull_request:
  push: { branches: [main] }
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm i --frozen-lockfile
      - run: pnpm -r test --if-present
      - run: pnpm build
      - run: pnpm size || true
      - name: Check engines/peer
        run: node -e "console.log('engines/peer check placeholder')"
```
建议
- 升级 PR 必须通过测试/构建/体积预算
- Major 升级要求提供迁移说明和验证清单

## 库发布要点（简版）
- package.json: exports/types/main/module、sideEffects:false、engines、peerDependencies
- 文档：CHANGELOG、迁移指南、README 中给出最小示例
- 兼容性：如双包（CJS+ESM）需保证消费者 bundler 能正确解析

## 常见坑与 FAQ
- “锁文件冲突频繁”：保持单一包管工具与 Node 版本；PR 合并前 rebase 主分支
- “依赖重复导致产物膨胀”：使用 pnpm dedupe/overrides，以及 bundlers 中的可视化分析
- “peer 冲突”：明确 peer 的受支持范围；应用侧按需安装

## 参考链接
- Renovate: https://docs.renovatebot.com
- pnpm overrides/dedupe: https://pnpm.io/cli/overrides / https://pnpm.io/cli/dedupe
- SemVer: https://semver.org
- Changesets: https://github.com/changesets/changesets