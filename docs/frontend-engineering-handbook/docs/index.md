---
layout: home
title: 深入浅出之 前端工程化 手册
hero:
  name: 前端工程化手册
  text: 从 0 到 1，搭建稳定高效的前端工程体系
  tagline: 构建、质量、规范、发布、Monorepo、CI/CD，一册吃透工程化最佳实践
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/intro
    - theme: alt
      text: 工程示例
      link: /guide/bundlers
features:
  - title: 体系化
    details: 从目标到方案，从工具到流程，形成闭环
  - title: 可落地
    details: 每章配套可复制的配置与脚本，拿来即用
  - title: 可扩展
    details: 单仓/多仓、前后端、Web/Node、不同规模均可适配
---

## 快速上手
```bash
# 1) 创建项目（任选其一）
pnpm dlx create-vite app -t react-ts
# 或
pnpm dlx create-vite app -t vue-ts

# 2) 注入基础工程化工具
cd app
pnpm add -D typescript eslint prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm dlx husky init

# 3) 启动与构建
pnpm dev
pnpm build
```

## 推荐路径
1. 开篇与概念 → /guide/intro, /guide/concepts
2. 工具与构建 → /guide/toolchain, /guide/bundlers
3. 质量与规范 → /guide/lint, /guide/commit
4. 版本与流水线 → /guide/release, /guide/ci
5. 规模化协作 → /guide/monorepo

## 从提交到发布（闭环）
- 提交规范与门禁：/guide/commit
- 版本与自动发布：/guide/release
- CI 矩阵与缓存：/guide/ci
- 产物验证与优化：/guide/bundlers