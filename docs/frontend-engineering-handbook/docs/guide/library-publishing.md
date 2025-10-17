# 库发布最佳实践

## 本章目的
- 提供 TypeScript 库从开发、构建到发布的可复制方案
- 兼容 ESM/CJS、完善类型、保持 Tree-shaking，确保安全与合规

## 复制清单
- 模块格式：ESM 优先，必要时提供 CJS 兼容
- 导出映射：package.json exports 按条件导出（types/import/require）
- 类型：生成 .d.ts 并与 exports 对齐
- 依赖：peerDependencies + peerDependenciesMeta，避免重复打包
- 构建：tsup/rollup（Sourcemap、minify、treeshake、sideEffects）
- 发布：npm provenance、Changelogs（Changesets）、CI 自动化
- 合规：许可证、第三方声明、大小与 API 变更报告

## package.json 模板（推荐 ESM + 条件导出）
```json
{
  "name": "@acme/utils",
  "version": "0.1.0",
  "description": "Utility library for web apps",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    },
    "./package.json": "./package.json"
  },
  "sideEffects": false,
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsup src/index.ts --dts --format esm,cjs --sourcemap --clean",
    "dev": "tsup src/index.ts --dts --format esm,cjs --watch",
    "test": "vitest run --coverage",
    "lint": "eslint .",
    "release": "changeset version && pnpm i -w && changeset publish",
    "prepublishOnly": "pnpm run build && pnpm test && pnpm lint"
  },
  "engines": { "node": ">=18" },
  "peerDependencies": {
    "react": ">=18"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true }
  },
  "repository": { "type": "git", "url": "https://github.com/acme/utils.git" },
  "bugs": { "url": "https://github.com/acme/utils/issues" },
  "license": "MIT",
  "keywords": ["utils","typescript","esm","cjs"]
}
```
要点：
- type=module 使源默认 ESM；同时输出 CJS 以兼容老环境
- exports 精准控制入口，避免隐式深引入破坏兼容
- sideEffects=false 利于 Tree-shaking（如有副作用文件需列出例外）

## tsconfig 基线
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "outDir": "dist",
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

## 构建方案 A：tsup（简单高效）
```bash
pnpm add -D tsup typescript
```
```ts
// tsup.config.ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm','cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  splitting: false // 库通常不需要 code-splitting
});
```

## 构建方案 B：rollup（颗粒度更细）
```bash
pnpm add -D rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript rollup-plugin-dts
```
```js
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.js', format: 'esm', sourcemap: true },
      { file: 'dist/index.cjs', format: 'cjs', sourcemap: true, exports: 'named' }
    ],
    external: [/^react(\/.*)?$/],
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })]
  }
];
```
类型打包
```js
// rollup.dts.config.js
import dts from 'rollup-plugin-dts';
export default {
  input: 'dist/types/index.d.ts',
  output: { file: 'dist/index.d.ts', format: 'es' },
  plugins: [dts()]
}
```

## API 设计与导出策略
- 单一入口 src/index.ts：统一 re-export，避免深路径导入碎片化
- Stable API：避免破坏性变更；必要时走 major 版本
- 副作用控制：纯函数库优选 sideEffects=false；有 polyfill/注册逻辑单独文件并在 package.json sideEffects 显式列出

## 依赖治理
- runtime 依赖尽量 external（由宿主提供），减少包体积
- peerDependencies 声明兼容范围，避免重复打包
- 使用 pnpm overrides 或 resolutions 管控易出问题的子依赖版本

## 测试与质量
- Vitest + Coverage 阈值，快照仅用于稳定输出
```bash
pnpm add -D vitest @types/node
```
```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { coverage: { reporter: ['text','html'], statements: 90, branches: 85, functions: 90, lines: 90 } }
});
```

## 文档与示例
- README：安装、用法、API、版本兼容矩阵、常见问题
- 示例：提供最小可运行示例（stackblitz/codesandbox 链接）

## 发布与版本
- Changesets 管理版本与变更日志
```bash
pnpm add -D @changesets/cli
pnpm changeset init
```
- CI 中执行 changeset publish 或 semantic-release（两者二选一，不混用）
- npm provenance（供应链溯源）
```yml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write
  id-token: write   # provenance
  packages: write
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
          cache: pnpm
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm i --frozen-lockfile
      - run: pnpm test
      - run: pnpm build
      - name: Publish with provenance
        run: pnpm exec npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 合规与安全
- LICENSE 与 NOTICE；三方依赖与许可证审计（license-checker / osv-scanner）
- Source Map 私有上传（Sentry/自建），禁公开生产 Source Map
- 签名与校验：Provenance/OIDC；避免明文 token 泄露

## 常见坑与 FAQ
- “只发 ESM 可以吗？”：生态逐步 ESM 化，但仍有 CJS 用户；建议双格式，或明确 ESM-only 并标注支持范围
- “typesVersions 还用吗？”：有 exports/types 映射通常不需要；除非需兼容旧 TS 解析
- “sideEffects=false 会误删代码？”：对副作用文件单独标注；或关闭有风险的摇树优化路径
- “BOM 体积变大？”：external peerDeps，并用 bundle-analyzer 审计

## 参考链接
- npm provenance: https://docs.npmjs.com/generate-provenance
- Changesets: https://github.com/changesets/changesets
- TS + exports: https://www.typescriptlang.org/docs/handbook/esm-node.html
- Rollup: https://rollupjs.org
- tsup: https://tsup.egoist.dev