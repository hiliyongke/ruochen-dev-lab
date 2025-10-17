# 开篇：为什么要工程化

工程化的目标：
- 稳定：统一规范与质量门禁
- 高效：自动化构建与发布，减少重复劳动
- 可规模化：多人协作、跨项目沉淀与复用

落地路径：
1. 明确业务交付与研发效率目标
2. 选型与组合工具链（构建、质量、规范、发布、自动化）
3. 通过脚手架/模板沉淀
4. 建立 CI/CD 与可观测（编译时间、包体积、单测覆盖）

本小册会在每一章给出“可复制”的配置片段与落地建议。

## 本章目的
- 搭建整体认知：明确工程化的价值与闭环要素
- 确立后续学习路径与最低可用实践（MVP）

## 规范要点
- 统一规范：代码风格、提交规范、分支/发布策略
- 标准流程：从需求→开发→检查→集成→发布→回溯
- 可观测：时间、体积、质量、稳定性有据可依

## 复制清单
- 脚手架/模板：内置 ESLint/Prettier、Husky、CI、Release
- 约定目录：src/ tests/ .github/ .husky/ changeset/
- 必备脚本：lint、test、build、release、ci

## 可运行示例
```bash
pnpm dlx create-vite my-app -t react-ts
cd my-app
pnpm add -D eslint prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm dlx husky init
```

## 自动化与门禁
- 预提交：lint-staged + commitlint
- CI：安装缓存、并行任务、失败快报
- 发布：Changesets 或 semantic-release 自动生成版本与日志

## 度量与最佳实践
- 指标：构建时长、包体积、Lint/测试覆盖、发布频率
- 基线：为关键指标设阈值并持续监控

## 常见坑与 FAQ
- 仅引入工具不等于工程化：规范与流程同等重要
- 无度量难迭代：上线后无法验证改进有效性

## 参考链接
- https://vitepress.dev
- https://conventionalcommits.org