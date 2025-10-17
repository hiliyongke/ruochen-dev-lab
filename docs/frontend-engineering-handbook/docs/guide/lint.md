# ESLint / Prettier / Stylelint

安装
```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier \
prettier stylelint stylelint-config-standard-scss stylelint-config-prettier postcss postcss-scss
```

.eslintrc.cjs
```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  env: { node: true, es2022: true, browser: true },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
```

.prettierrc
```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "none",
  "printWidth": 100
}
```

.stylelintrc.cjs
```js
module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier'],
  customSyntax: 'postcss-scss',
  rules: {
    'color-hex-length': 'short'
  }
};
```

配合 Husky 与 lint-staged
```bash
pnpm add -D husky lint-staged
pnpm dlx husky init
```

package.json 片段
```json
{
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier -w"],
    "*.scss": ["stylelint --fix", "prettier -w"],
    "*.{json,md,yml}": ["prettier -w"]
  },
  "scripts": {
    "lint": "eslint .",
    "stylelint": "stylelint \"**/*.{css,scss}\"",
    "format": "prettier -w ."
  }
}
```

.husky/pre-commit
```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

## 本章目的
- 建立跨框架一致的代码风格与静态检查门禁

## 规范要点
- ESLint 关注 JS/TS 语义，Prettier 关注格式，Stylelint 关注样式
- 通过 eslint-config-prettier 避免规则冲突

## 复制清单
- .eslintrc.cjs / .prettierrc / .stylelintrc.cjs
- package.json: lint、format、stylelint、lint-staged

## 可运行示例
```bash
pnpm eslint . && pnpm stylelint "**/*.{css,scss}" && pnpm prettier -c .
```

## 自动化与门禁
- pre-commit：启用 lint-staged 对变更文件增量修复
- CI：在 lint job 中对全量代码执行检查并生成报告

## 度量与最佳实践
- 指标：Lint 命中率、修复率、热点目录分布
- 最佳实践：每周检查规则噪声，减少误报

## 常见坑与 FAQ
- ESLint/Prettier 冲突：确保 extends 中包含 eslint-config-prettier 且顺序靠后

## 参考链接
- https://eslint.org
- https://prettier.io
- https://stylelint.io

## 规则集浏览器（跨框架速查）
- React 应用
  - 插件：eslint-plugin-react、eslint-plugin-react-hooks、eslint-plugin-jsx-a11y
  - 推荐扩展：airbnb/base 或 typescript-eslint/recommended + react 生态插件
- Vue 应用
  - 插件：eslint-plugin-vue、@vue/eslint-config-typescript（或 vue-tsc 做类型检查）
  - 规则基线：vue3-recommended
- Node/库开发
  - 插件：eslint-plugin-import、eslint-plugin-n（Node 规则，ESM 友好）
  - 规则：typescript-eslint/recommended 且启用 type-aware 规则（见下）
- 通用增强
  - import 排序：eslint-plugin-simple-import-sort 或 eslint-plugin-import 的 order 规则
  - 未使用导入：eslint-plugin-unused-imports
  - 安全提示：eslint-plugin-security（注意按项目评估噪声）
  - JSON/YAML/Markdown：eslint-plugin-jsonc、eslint-plugin-yml、remark/markdownlint（配合 Prettier）

示例：增强规则集（package.json 依赖略）
```js
// .eslintrc.cjs 片段
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'import', 'unused-imports', 'simple-import-sort'],
  rules: {
    'unused-imports/no-unused-imports': 'warn',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'import/order': 'off' // 与 simple-import-sort 二选一
  },
  settings: { react: { version: 'detect' } }
};
```

## 类型感知规则（Type-aware ESLint）
- 作用：开启 @typescript-eslint 的类型规则（如 no-floating-promises、no-unsafe-*）
- 代价：需要 parserOptions.project 指向 tsconfig，耗时上升
```js
// .eslintrc.cjs
module.exports = {
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ]
};
```
注意
- 大仓或 Monorepo 建议仅对关键包/目录开启类型感知（overrides 指定 globs）
- CI 可分两步：快速语义规则 → 仅在主分支跑类型感知规则

## Monorepo 最佳实践
- 根配置 root: true，包内用 overrides 细化规则，避免互相污染
- 统一 Prettier，避免子包“各自为政”造成 diff 噪声
- lint 脚本：turbo/lerna 仅 lint 受影响包；pre-commit 仅 lint-staged 增量文件

示例：根级覆盖
```js
// .eslintrc.cjs (repo root)
module.exports = {
  root: true,
  ignorePatterns: ['dist', 'coverage'],
  overrides: [
    { files: ['packages/ui/**/*.{ts,tsx}'], parserOptions: { project: ['./packages/ui/tsconfig.json'] } },
    { files: ['apps/web/**/*.{ts,tsx,vue}'] }
  ]
};
```

## 性能优化与稳定性
- 使用缓存：eslint --cache，stylelint --cache；CI 配置缓存目录
- 控制匹配范围：合理的 glob，避免扫描 node_modules、dist
- 降噪：每周清理误报/过严规则，保持“低噪声高信任”
- lint-staged 只对变更文件执行自动修复，CI 再跑全量校验

## Stylelint 跨技术栈
- SCSS：stylelint-config-standard-scss + stylelint-config-prettier
- Tailwind：stylelint-config-tailwindcss（可选），并在 Prettier 中启用 tailwind 插件进行类排序
- CSS-in-JS：针对 emotion/styled-components 可使用 eslint-plugin-format-jsx 或库自带 ESLint 规则

## IDE 与团队一致性
.vscode/settings.json（建议提交到仓库）
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact", "vue"],
  "stylelint.validate": ["css", "scss"]
}
```

## CI 报告与门禁
- 输出格式：ESLint junit/JSON，Stylelint JSON；在 GitHub/GitLab 作为构件归档
- PR 注解：GitHub 的 problem matchers 或 Reviewdog 注入行级评论
- 指标看板：收集命中率/修复率/热点目录，持续压降噪声

参考插件与资料
- eslint-plugin-react / react-hooks / jsx-a11y
- eslint-plugin-import / simple-import-sort / unused-imports
- @typescript-eslint/eslint-plugin / recommended-requiring-type-checking
- eslint-plugin-vue / @vue/eslint-config-typescript
- stylelint-config-standard-scss / stylelint-config-prettier / stylelint-config-tailwindcss