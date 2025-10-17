# CI/CD 实践

目标
- 在云端复现本地流水线：安装 → 构建 → 质量 → 测试 → 发布
- 使用缓存与并行提升速度

## GitHub Actions
.github/workflows/ci.yml
```yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - name: Install
        run: pnpm i --frozen-lockfile
      - name: Lint & Test
        run: |
          pnpm lint
          pnpm -r test --if-present
      - name: Build
        run: pnpm build
```

发布流程（semantic-release）
```yml
  release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: pnpm i --frozen-lockfile
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## GitLab CI (同理)
.gitlab-ci.yml
```yml
stages:
  - install
  - test
  - build
  - release

install:
  stage: install
  image: node:20-alpine
  script:
    - corepack enable
    - corepack prepare pnpm@9 --activate
    - pnpm i --frozen-lockfile
  cache:
    paths:
      - node_modules/

test:
  stage: test
  script:
    - pnpm lint
    - pnpm -r test --if-present

build:
  stage: build
  script:
    - pnpm build
  artifacts:
    paths:
      - dist/

release:
  stage: release
  script:
    - npx semantic-release
```

## 策略矩阵（速览）
- 触发：push/pr/tag/手动dispatch
- 运行环境：node版本×操作系统矩阵
- 缓存：包管理器缓存 + 构建产物缓存（Turborepo/outputs）
- 并行与依赖：拆分 jobs（lint/test/build/release），needs 串联
- 权限与合规：受控 Token、保护分支、审计与报告
- 制品与报告：构建产物、体积报告、测试/覆盖率、SBOM

## GitHub Actions：矩阵与并行
.github/workflows/ci.yml（矩阵 + 并行 + 缓存）
```yml
name: CI
on:
  push: { branches: [main, develop] }
  pull_request:
jobs:
  build-test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        node: [18, 20]
        os: [ubuntu-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: pnpm
      - name: Install
        run: pnpm i --frozen-lockfile
      - name: Lint
        run: pnpm lint
      - name: Test
        run: pnpm -r test --if-present
      - name: Build
        run: pnpm build
      - name: Artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.node }}
          path: dist
  release:
    needs: build-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: 'https://registry.npmjs.org/'
      - run: pnpm i --frozen-lockfile
      - run: pnpm build
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

要点
- concurrency 避免同分支重复运行
- permissions 精确授权，最小权限原则
- upload-artifact 归档构建产物，供后续阶段使用

## GitLab CI：缓存与制品
.gitlab-ci.yml（包缓存 + 制品 + 阶段依赖）
```yml
stages: [install, lint, test, build, release]
default:
  image: node:20
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
install:
  stage: install
  script:
    - corepack enable
    - npm i -g pnpm
    - pnpm i --frozen-lockfile
lint:
  stage: lint
  script: pnpm lint
test:
  stage: test
  script: pnpm -r test --if-present
build:
  stage: build
  script: pnpm build
  artifacts:
    paths: [dist/]
    expire_in: 7 days
release:
  stage: release
  only: [main]
  script: npx semantic-release
```

## 缓存与并行最佳实践
- 包缓存：使用 actions/setup-node cache: pnpm 或 GitLab cache 节点
- 构建缓存：Turborepo outputs/.turbo + 远程缓存（Vercel Remote Cache/自建）
- Job 拆分：lint/test/build 并行；release 仅在主分支触发
- 失败快：尽早执行 lint/test；构建与发布放后

## 权限与合规清单
- 令牌管理：使用 npm automation token；禁用个人全权限 token
- 保护分支：main 需要受保护并启用状态检查
- 机密隔离：secrets 不写入日志；敏感命令避免 -x 输出
- 合规报告：需要时在 CI 生成并归档 SBOM/License 报告（如 syft/license-checker）

## 报告与度量
- 输出体积摘要（Top N 大文件）、构建时长、测试覆盖率
- 归档 visualizer/bundle-analyzer HTML 与 stats.json，便于回溯

Tips
- 结合 Turborepo 远程缓存（Vercel Remote Cache / 自建）进一步加速
- 将构建产物与版本号/Commit 关联，便于定位问题