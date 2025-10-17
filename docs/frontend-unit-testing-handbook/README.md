# 深入浅出之 前端单元测试 手册



![CI](https://github.com/owner/repo/actions/workflows/ci.yml/badge.svg)

[![codecov](https://codecov.io/gh/owner/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/owner/repo)

本手册以「掘金小册」风格编写：短小分章、先动手后抽象、以实战驱动理解。旨在帮你在真实项目里快速落地前端单元测试，从 0 到 1 再到工程化最佳实践。

- 面向人群：会写前端但缺乏系统测试经验的同学
- 学习目标：
  1) 写出稳定、可读、可维护的单元测试
  2) 正确使用 Jest/Vitest、Testing Library 等工具
  3) 在团队中推进覆盖率、规范与 CI 集成
- 使用方式：按目录从前到后学习；或根据问题直达对应章节

## 覆盖率与 Codecov
本仓库已在 CI 集成覆盖率生成与 Codecov 上报：
- GitHub Actions：使用 codecov/codecov-action@v4，上报 examples/**/coverage/lcov.info
- GitLab CI：使用官方 uploader，通过 CODECOV_TOKEN 变量上报

配置说明（私仓需 TOKEN）：
1) GitHub：Settings → Secrets and variables → Actions → 新增 secrets：CODECOV_TOKEN
2) GitLab：Settings → CI/CD → Variables → 新增变量：CODECOV_TOKEN
3) 如仓库路径或默认分支非 main，请更新本 README 顶部徽章的 owner/repo 与 branch

覆盖生成位置：
- 各示例运行测试后会在 examples/{example}/coverage/ 下生成报告（lcov.info、HTML 报告）
- CI 中会尝试通过 Vitest run --coverage 生成 lcov.info 并上报

开始阅读：见 SUMMARY.md 或 chapters/ 目录。