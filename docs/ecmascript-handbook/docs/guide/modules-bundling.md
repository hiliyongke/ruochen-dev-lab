# 模块与打包（ESM/CJS、动态 import()、import.meta、Tree-shaking）

本章覆盖现代模块体系与打包要点：ESM 与 CJS 互操作、动态导入（import()）、import.meta、Tree-shaking 与 sideEffects、包入口与条件导出、兼容与构建策略。

## 1. 模块体系概览

- ESM（ECMAScript Modules）
  - 静态结构：import/export 顶层出现，便于编译期分析与摇树优化
  - 默认严格模式、单例模块实例、按引用导出（live bindings）
- CJS（CommonJS）
  - 运行时 require、module.exports/exports
  - Node 传统生态，动态性强但不利于静态优化

示例（ESM）
```js
// math.js
export const PI = 3.14159;
export function area(r){ return PI * r * r; }
// index.js
import { area } from './math.js';
console.log(area(2));
```

## 2. 动态 import 与分包

- 动态导入：import() 返回 Promise，按需加载与代码分割
```js
// 懒加载
button.addEventListener('click', async () => {
  const { heavy } = await import('./heavy.js');
  heavy();
});
```
建议：
- 将大体积分支/低频功能通过动态 import 切分
- 为打包器提供命名分块提示（如 /* webpackChunkName: "heavy" */）

## 3. import.meta 与运行时上下文

- import.meta.url：模块资源 URL（浏览器/部分运行时）
- 在构建工具中可被替换或用于定位静态资源
```js
console.log(import.meta.url); // 当前模块资源定位
```

## 4. ESM 与 CJS 互操作要点

- 在 Node 中：通过 package.json 的 "type": "module" 决定 .js 解析为 ESM/CJS
- 互操作常见场景：
  - CJS 引用 ESM：使用动态 import()（require 无法直接加载 ESM）
  - ESM 引用 CJS：import x from 'cjs' 将获得 CJS 的 module.exports 作为默认导出
- 条件导出（Conditional Exports）：
```json
{
  "name": "lib",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```
- 字段对照：
  - "main"（CJS 入口），"module"（ESM 入口，非 Node 标准但被打包器识别），"exports"（标准入口映射）

## 5. Tree-shaking 与 sideEffects

- Tree-shaking 前提：静态可分析 + 无副作用
- package.json 中声明
```json
{
  "sideEffects": false
}
```
- 若存在需要保留的副作用文件：
```json
{
  "sideEffects": ["*.css", "polyfills/**"]
}
```
- 常见导致无法摇树的行为：
  - 动态 require/动态属性访问导致不确定依赖
  - 通过顶层执行的副作用代码

示例（可摇树）
```js
// utils.js
export const add = (a,b)=>a+b;
export const sub = (a,b)=>a-b;
// 仅用 add 时，sub 会在生产构建中被删除（取决于打包器）
```

## 6. 打包与代码分割策略

- 目标运行时差异化：
  - Browserslist/targets 明确编译目标（现代/遗留）
  - Node 与浏览器构建分离（条件导出/多产物）
- 分包粒度：
  - 按路由/页面、按组件库（如图表）、按国际化语言包
- 资源内联与懒加载：
  - 小资源内联（Base64）减少请求，大资源动态加载
- Source Map：
  - dev：快速增量构建与 inline-source-map
  - prod：独立 source map 并控制可见性

## 7. 常见兼容与迁移

- 从 CJS 迁移到 ESM：
  - 明确默认导出与具名导出差异
  - 替换 __dirname/__filename（在 ESM 中可通过 import.meta.url 推导）
- 浏览器兼容：
  - 现代浏览器原生支持 ESM `<script type="module">`；旧浏览器需打包/降级
- Node 版本与 flags：
  - 老版本 Node 对 ESM 支持有限；升级或使用打包器将 ESM 输出为 CJS

## 8. 图示

摇树优化流程（简化）
```mermaid
flowchart LR
A[源码 ESM] --> B[静态依赖图]
B --> C[标记可达导出]
C --> D[消除未引用代码]
D --> E[产物优化]
```

模块分割与懒加载
```mermaid
flowchart LR
Entry[入口] --> Core[核心包]
Entry -->|动态 import()| FeatureA[特性A]
Entry -->|动态 import()| FeatureB[特性B]
```

## 9. FAQ（本章）

- 为什么 import() 比 require 更利于分包？import() 是异步、原生模块语义，打包器可静态识别与切分。
- 声明 "sideEffects": false 会不会导致 CSS 被误删？需在 sideEffects 数组中显式保留样式或具有副作用的文件。
- Node 中 ESM 加载 CJS/反之的最佳实践？优先通过条件导出与明确入口；CJS 加载 ESM 使用动态 import。

## 10. 参考

- Node ESM 指南、Conditional Exports
- Rollup/Vite/Webpack 文档：Tree-shaking、Code splitting
- MDN：import()、import.meta、ES Modules