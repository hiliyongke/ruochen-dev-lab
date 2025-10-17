# Monorepo 工作流

使用 pnpm workspaces + Turborepo

package.json（仓库根）
```json
{
  "name": "awesome-repo",
  "private": true,
  "packageManager": "pnpm@9",
  "devDependencies": {
    "turbo": "^2.2.4"
  },
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test"
  }
}
```

turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {},
    "test": {
      "outputs": [".cache/test/**"]
    }
  }
}
```

示例目录
```
apps/web        # Vite 前端
packages/ui     # 组件库
packages/utils  # 工具库
```

packages/ui/package.json
```json
{
  "name": "@acme/ui",
  "version": "0.0.0",
  "private": false,
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json && tsup src/index.ts --dts",
    "dev": "tsup src/index.ts --watch",
    "lint": "eslint ."
  }
}
```

依赖打包工具可选：tsup/rollup（组件库推荐 tsup 简洁高效）。

## 本章目的
- 提供可复制的 Monorepo 组织方案，打通构建、版本与发布、CI 缓存与并行。

## 工作空间声明（可选）
pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## 版本与发布（Changesets）
安装与初始化
```bash
pnpm add -D @changesets/cli
pnpm changeset init
```
常用命令
```bash
pnpm changeset                # 交互式生成变更
pnpm changeset version        # 计算版本并写入各包
pnpm -r publish --access public  # 逐包发布（支持 scope）
```

## 包发布配置示例（库包）
packages/ui/package.json 片段
```json
{
  "name": "@acme/ui",
  "version": "0.0.0",
  "private": false,
  "publishConfig": { "access": "public" },
  "files": ["dist"],
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "tsc -p tsconfig.build.json && tsup src/index.ts --dts",
    "dev": "tsup src/index.ts --watch",
    "lint": "eslint .",
    "prepublishOnly": "pnpm build"
  },
  "peerDependencies": {
    "react": ">=18"
  }
}
```

## Turborepo 缓存与并行
turbo.json 增强（选择性）
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "outputs": [".cache/test/**"] },
    "lint": {},
    "dev": { "cache": false }
  }
}
```
- 说明：^build 表示先构建依赖包；outputs 声明产物以启用缓存；dev 关闭缓存提升本地迭代体验。

## GitHub Actions（Monorepo + Changesets）
.github/workflows/release.yml
```yml
name: Monorepo Release
on:
  push:
    branches: [main]
permissions:
  contents: write
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
          cache: "pnpm"
          registry-url: "https://registry.npmjs.org/"
      - run: pnpm i --frozen-lockfile
      - run: pnpm build
      - name: Version & Publish
        run: |
          pnpm changeset version
          pnpm -r publish --access public
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## GitLab CI（缓存与并行示例）
.gitlab-ci.yml
```yml
stages: [build, test, release]
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .turbo/
build:
  stage: build
  image: node:20
  script:
    - corepack enable
    - npm i -g pnpm
    - pnpm i --frozen-lockfile
    - pnpm build
test:
  stage: test
  image: node:20
  script:
    - pnpm test --reporter=junit
release:
  stage: release
  only: [main]
  image: node:20
  script:
    - pnpm changeset version
    - pnpm -r publish --access public
```

## 常见坑与最佳实践
- 依赖声明：内外部依赖分明，库间用 workspace:* 或明确版本，避免幽灵依赖。
- 构建顺序：确保 pipeline 配置正确（^build），避免“先用后编”。
- 发布权限：使用 npm automation token；保护主分支与状态检查。
- 体积与 Side Effects：库包标记 "sideEffects": false 并提供 ESM。
- CI 缓存：声明 outputs 并归档构建报告（体积、时长、Top N）。

## 参考链接
- pnpm workspaces: https://pnpm.io/workspaces
- Turborepo: https://turbo.build/repo
- Changesets: https://github.com/changesets/changesets