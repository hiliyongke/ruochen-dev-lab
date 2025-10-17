# 工具链与兼容性（TC39 / Babel / Polyfill / 支持矩阵）

本章提供 ECMAScript 特性落地到不同运行环境（浏览器 / Node.js / Deno / 小程序等）的系统方法论：标准演进、转换与填充策略、目标环境与支持矩阵、特性检测与降级、以及调试与质量保障。

目录
- 标准与提案：TC39 流程与阶段
- 目标环境与支持矩阵：Browserslist / Node 版本策略
- Babel 转换策略：preset-env / 插件选择 / Modules
- Polyfill 策略：core-js / regenerator / 按需注入
- 特性检测与渐进增强：Modernizr 模式 / import.meta / 动态能力
- Node / 浏览器兼容要点：ESM/CJS、导出条件与包字段
- 调试与质量：Source Map、体积与性能、回归与监控
- 参考与工具清单

一、标准与提案：TC39 流程与阶段
- Stage 0: Strawman（点子）— 仅讨论，不应依赖
- Stage 1: Proposal（提案）— 探索与原型
- Stage 2: Draft（草案）— 语义基本确定，开始实现反馈
- Stage 3: Candidate（候选）— 几乎稳定，等待实现者与规格细化
- Stage 4: Finished（完成）— 将进入下一年度 ECMAScript 标准
实践建议
- 生产环境仅依赖已进入标准（Stage 4）或广泛实现并可通过 Babel/polyfill 稳定支持的特性
- 跟踪：TC39 议程与 notes、v8/SpiderMonkey/JavaScriptCore 实现进展

二、目标环境与支持矩阵
- Browserslist 声明目标环境（前端构建工具通用：Autoprefixer、babel-preset-env、esbuild/terser 等）
  - 配置示例（package.json）
    "browserslist": [
      "defaults and not ie <= 11",
      "maintained node versions"
    ]
  - 常用查询："> 0.5%, last 2 versions, not dead"
- Node 策略
  - LTS 优先；锁定最低运行时版本（如 "engines": { "node": ">=18" }）
  - 以特性为导向：如原生 fetch、Web Streams 在 Node 18+ 可用
- 兼容矩阵参考
  - MDN、caniuse、node.green、compat-table（kangax）

三、Babel 转换策略
- preset-env（按目标环境与可用性选择转换）
  - useBuiltIns
    - "usage": 基于代码用到的特性按需注入 polyfill
    - "entry": 手动在入口引入 core-js；根据目标环境裁剪
    - false: 不处理 polyfill，仅语法转译
  - corejs: 明确 core-js 版本（如 "corejs": 3.38）
  - targets: 继承 Browserslist 或在 Babel 独立声明
- 插件选择
  - 面向 Stage 3/4 的提案插件需谨慎；升级时关注破坏性变化
  - 与 TypeScript 配合：@babel/preset-typescript 仅剥离类型，不做类型检查
- Modules 与 Tree-shaking
  - modules: "auto"|"commonjs"|false。打包器（Webpack/Rollup/Vite）通常要求 false 以保留 ESM 供摇树优化
  - sideEffects: 在 package.json 标注副作用文件以提升摇树效率

四、Polyfill 策略
- 核心手段
  - core-js：内建对象与静态/实例方法（如 Array.prototype.flat、Promise.any）
  - regenerator-runtime：生成器与 async/await 运行时（旧环境需要）
- 策略选择
  - 按需注入（useBuiltIns: "usage"）— 便捷但需 Babel 全量编译链
  - 入口注入（useBuiltIns: "entry"）— 主动控制与可读性更强
  - 自助引入（直接 import 特定 polyfill）— 较细粒度，需维护成本
- 注意事项
  - 污染全局与隔离：polyfill 通常为“sham/ponyfill/patch”差异；库侧可考虑使用 ponyfill（不污染全局）
  - 运行时开销：谨慎对待重写原生方法的 polyfill
  - 条件加载：基于 UA/特性检测的动态加载以降低现代浏览器成本

五、特性检测与渐进增强
- 能力优先而非 UA 嗅探
  - 例：if ("IntersectionObserver" in window) { ... }
  - try/catch + 备用实现
- 动态 import() 与条件资源
  - 按需加载 polyfill 与降级组件：if (!("URLPattern" in self)) await import("urlpattern-polyfill");
- import.meta 与运行时环境
  - import.meta.env、import.meta.url 用于区分构建与运行

六、Node / 浏览器兼容要点
- ESM 与 CJS 互操作
  - package.json: "type": "module" 决定 .js 解释语义
  - 导出条件（exports/exports.conditions）
    - "exports": { ".": { "import": "./esm/index.js", "require": "./cjs/index.cjs" } }
  - ESM 加载 CJS：默认导出映射到 module.exports
  - CJS 动态加载 ESM：使用 import()，需在支持的 Node 版本
- 条件导入与平台差异
  - 浏览器与 Node API 差异（如 Buffer、fs、DOM）
  - Web 平台 API 在 Node 18+ 渐进提供（fetch、URLPattern 等），需显式版本门槛
- 包字段与解析
  - main / module / exports / types 字段的优先级与兼容性
  - sideEffects 与副作用文件白名单

七、调试与质量
- Source Map
  - 生产可用 source map（hidden / nosources）以便错误还原同时降低泄露风险
  - 将构建版本、Git 提交号注入错误上报
- 体积与性能
  - 监控 bundle 体积与首屏关键路径（bundle-analyzer、coverage、RUM）
  - polyfill 与运行时代码的按需与分包
- 回归与监控
  - E2E/可用性检测（旧机型/低版本浏览器）
  - Sentry/TrackJS 等错误聚合与分版本回归分析

八、参考与工具清单
- TC39：https://tc39.es、会议记录（GitHub：tc39/notes）
- 兼容：caniuse.com、MDN、node.green、compat-table
- 构建：Babel、core-js、esbuild、SWC、tsc、Vite、Webpack、Rollup
- 策略：Browserslist、@babel/preset-env、regenerator-runtime
- 其它：web.dev、performance profiling 工具、source-map-tools

与本手册其它章节的关联
- 模块与打包：/guide/modules-bundling
- 错误与调试：/guide/error-debugging
- 语言与运行时差异：/guide/language-semantics
- FAQ（兼容与降级条目将同步归档）：/guide/faq

附：最小配置示例（Babel + core-js）
.browserslistrc
> 0.5%
last 2 versions
not dead

babel.config.json
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": "3.38",
      "modules": false
    }]
  ]
}