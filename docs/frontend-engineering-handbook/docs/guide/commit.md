# 提交规范与自动校验

采用 Conventional Commits
- feat: 新功能
- fix: 修复
- docs: 文档
- refactor: 重构
- chore: 杂务
- test: 测试
- build: 构建相关
- perf: 性能优化

安装 commitlint
```bash
pnpm add -D @commitlint/config-conventional @commitlint/cli
```

commitlint.config.cjs
```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

.husky/commit-msg
```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit "$1"
```

生成提交信息辅助（可选）
```bash
pnpm add -D cz-git commitizen
```
package.json 片段
```json
{
  "config": {
    "commitizen": {
      "path": "cz-git"
    }
  }
}
```
使用
```bash
pnpm cz
```

## 本章目的
- 通过可读的提交信息提升协作效率，并驱动自动化发布

## 规范要点
- 遵循 Conventional Commits：type(scope): subject
- 保持动词原形，subject 简洁可检索

## 复制清单
- commitlint.config.cjs
- .husky/commit-msg 与 pre-commit
- 可选：cz-git 提示式提交

## 可运行示例
```bash
echo "feat(ui): 新增按钮悬浮态" | cat
```

## 自动化与门禁
- commit-msg：commitlint 校验提交规范
- pre-commit：lint-staged 保证代码质量

## 度量与最佳实践
- 指标：feat/fix 占比、revert 频率、平均变更规模
- 最佳实践：结合 Changesets/semantic-release 自动生成 changelog

## 常见坑与 FAQ
- 仅使用 chore 来规避规范：会降低历史可读性

## 参考链接
- https://www.conventionalcommits.org/zh-hans/
- https://github.com/conventional-changelog/commitlint