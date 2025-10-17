# 版本语义与自动发布

两条主线任选其一：

## A. Changesets（适合 Monorepo）
```bash
pnpm add -D @changesets/cli
pnpm changeset init
```
常用命令
```bash
# 交互式创建变更
pnpm changeset
# 计算版本与生成 changelog
pnpm changeset version
# 发布 npm
pnpm changeset publish
```
CI 中可由 bot 自动执行 version/publish。

## B. semantic-release（适合单包或简单仓库）
```bash
pnpm add -D semantic-release @semantic-release/changelog @semantic-release/git \
@semantic-release/npm @semantic-release/commit-analyzer @semantic-release/release-notes-generator
```

.release.config.cjs
```js
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    '@semantic-release/npm',
    ['@semantic-release/git', { assets: ['package.json', 'CHANGELOG.md'] }]
  ]
};
```

CI 中运行
```bash
npx semantic-release
```

## 本章目的
- 打通从“提交规范”到“自动版本与发布”的完整链路
- 提供两套可复制方案（Changesets / semantic-release）及 CI 工作流

## 策略选择建议
- Monorepo：优选 Changesets（多包版本协同、独立发布）
- 单包或简单仓库：semantic-release（按提交自动判级与生成日志）

## 复制清单
- 提交规范：Conventional Commits + commitlint（已在 commit 章节）
- 版本与发布：Changesets 或 semantic-release（本文示例）
- CI：GitHub Actions / GitLab CI（示例含缓存、权限）
- NPM 权限：使用 automation token（只授权发布），保护主分支

## GitHub Actions（semantic-release）
.github/workflows/release.yml
```yml
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write
  issues: write
  deployments: write
  id-token: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org/'
      - run: pnpm i --frozen-lockfile
      - run: pnpm build
      - run: npx semantic-release
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## GitHub Actions（Changesets 自动发布）
.github/workflows/release.yml
```yml
name: Changesets Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org/'
      - run: pnpm i --frozen-lockfile
      - run: pnpm build
      - name: Version & Publish
        run: |
          pnpm changeset version
          pnpm -r publish --access public
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## GitLab CI（semantic-release）
.gitlab-ci.yml
```yml
stages: [release]
release:
  image: node:20
  stage: release
  only:
    - main
  before_script:
    - corepack enable
    - npm i -g pnpm
    - pnpm i --frozen-lockfile
    - pnpm build
  script:
    - npx semantic-release
  variables:
    NPM_TOKEN: $NPM_TOKEN
```

## 预发布 / Canary 流程
- 语义化预发布：1.2.0-next.0 / 1.2.0-rc.1
- NPM dist-tag：next 用于测试人群
```bash
# semantic-release 使用 channel 或 npmPublish:false + 手动 dist-tag
npm publish --tag next
# 或 changesets 生成 prerelease 后统一 publish
pnpm changeset pre enter next && pnpm changeset version && pnpm changeset publish && pnpm changeset pre exit
```

## 权限与合规
- NPM Token：使用 automation token，仅授权发布；不要使用个人完全体 token
- 保护分支：main 需受保护并强制 PR 流程与状态检查通过
- 机密管理：NPM_TOKEN/GITHUB_TOKEN 放置在 CI secrets；禁日志输出
- 合规提示：生成可读 changelog；若需 SBOM/License 报告，CI 中生成并归档

## 与提交规范联动
- 类型映射（semantic-release 默认）
  - feat → minor；fix/perf → patch；BREAKING CHANGE → major
- 建议：PR 模板要求填写“影响范围/迁移说明”，方便生成 changelog

## 常见坑与 FAQ
- 问：semantic-release 未触发？
  - 答：确认是否在受控分支、是否存在符合规则的 commit、CI 权限是否足够
- 问：Changesets 版本未更新或 publish 失败？
  - 答：检查 changeset 文件是否合并到主分支，npm token 权限是否正确
- 问：changelog 不可读？
  - 答：规范提交主题，避免 “update” 等无意义描述；必要时引入手写补充段落

版本策略建议
- 使用 release-please/changesets 管控版本变更来源
- 变更日志必须面向用户/使用者可读

## 参考链接
- https://github.com/changesets/changesets
- https://semantic-release.gitbook.io/semantic-release
- https://docs.github.com/actions
- https://docs.gitlab.com/ee/ci/