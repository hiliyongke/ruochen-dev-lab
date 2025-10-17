# 工具链选型与组合

建议组合：
- 构建：Vite（Web 应用）/ Webpack（复杂兼容或自定义 loader 流程）
- 语言：TypeScript
- 质量：ESLint + Prettier + Stylelint
- 提交门禁：Husky + lint-staged + commitlint
- 版本与发布：Changesets 或 semantic-release
- Monorepo：pnpm workspaces + Turborepo（或 Nx）
- CI：GitHub Actions / GitLab CI / Jenkins（示例均提供）

选择建议：
- 以“团队技能栈 + 维护成本”为先
- 优先选“生态完善、社区活跃”的主流方案

## 本章目的
- 给出通用型工具链组合与选型维度，便于快速落地

## 规范要点
- 以最小闭环为目标：构建/质量/规范/提交门禁/发布/CI

## 复制清单
- 基础依赖：Vite/TS/ESLint/Prettier/Stylelint/Husky/commitlint
- 发布方案：Changesets（Monorepo）或 semantic-release（单仓）

## 可运行示例
```bash
# 初始化并注入基础工具链
pnpm dlx create-vite app -t react-ts
cd app
pnpm add -D typescript eslint prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm dlx husky init
```

## 自动化与门禁
- pre-commit：lint-staged
- commit-msg：commitlint
- CI：缓存 pnpm、划分 job

## 度量与最佳实践
- 在构建脚本中打印产物体积与编译时间摘要

## 常见坑与 FAQ
- 过度自定义规则导致维护成本陡增：优先官方推荐

## 参考链接
- https://pnpm.io
- https://vitejs.dev