# 09. 自定义配置与约束（配置结构、扫描策略与团队规范）

你将学到什么
- tailwind.config.* 的结构与关键字段：content、theme、plugins、darkMode、prefix、important、corePlugins
- content 扫描策略与 safelist 使用场景，避免类名被裁剪
- 主题扩展与覆盖：theme.extend vs theme 替换
- 变体/插件的启用与配合
- 团队约束清单：动态类名禁忌、命名前缀、ESLint 规则、评审要点

前置知识
- 已阅读第 05~08 章（@layer/@apply、设计系统、插件体系）
- 了解构建链路（Vite/Next.js 等）

一、配置文件结构概览
- 位置：tailwind.config.js / ts
- 字段：
  - content：扫描模板源，决定生成与保留哪些类（JIT）
  - theme：主题令牌与刻度；使用 extend 进行增量扩展
  - plugins：官方/自定义插件注册
  - darkMode：'media' | 'class'（第 07 章）
  - prefix：为所有工具类添加前缀（如 tw-）
  - important：将生成的工具类标记为 !important 或限制到特定选择器
  - corePlugins：按需关闭核心工具（极少用）
示例（构建链路项目）：
```js
// tailwind.config.js
const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');
const lineClamp = require('@tailwindcss/line-clamp');

module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { 500: '#3BA4F0', 600: '#1E7FC1' },
      },
      maxWidth: { prose: '72ch' },
    },
  },
  plugins: [typography, forms, lineClamp],
};
```

二、content 扫描与 safelist
- content 是生成/保留工具类的“源代码清单”，必须覆盖所有模板路径
- 常见陷阱：动态拼接类名导致扫描不到，如 `text-${color}-600` → 类被裁剪
- 解决：
  1) 改为“映射表 + 显式类名”：
     ```ts
     const textColorMap = { success: 'text-emerald-600', warn: 'text-amber-600' };
     <span className={textColorMap[state] ?? 'text-slate-600'} />
     ```
  2) safelist：声明必须保留的类或模式（正则）
     ```js
     // tailwind.config.js
     safelist: [
       'text-emerald-600',
       { pattern: /(bg|text|border)-(emerald|amber|rose)-(400|600)/ },
     ]
     ```
- 何时用 safelist：类名集合可枚举、来自数据字典；不适合无限组合

三、prefix 与 important
- prefix：避免与第三方样式冲突（如 tw-）
  - 代价：类名更长，迁移成本高，通常在“与大型遗留系统共存”时启用
- important：两种用法
  - 布尔值 true：全局工具类都加 !important（谨慎）
  - 选择器字符串：将所有工具类限定到某个根容器并变得更强势
    ```js
    // 仅在 #app 内的工具类带重要性，避免污染外部系统
    important: '#app'
    ```
- 建议：优先使用容器 important，避免全局 !important

四、theme：extend vs 覆盖
- extend：增量扩展（推荐）
- 完全覆盖：直接赋值 theme.colors = {...}（风险：丢失内置刻度）
- 建议策略：
  - 高频令牌（brand/语义色/spacing/typography）进入 extend
  - 低频值使用 CSS 变量 + 任意值

五、corePlugins 与插件
- 关闭核心工具示例：
  ```js
  corePlugins: {
    preflight: false, // 关闭基础样式重置（需自行管理 CSS Reset）
  }
  ```
- 插件：参考第 08 章；启用后记得检验 content，避免生成类被裁剪

六、配置在 CDN 与构建环境的差异
- 构建环境：tailwind.config.* 完整生效，@tailwind base/components/utilities 可用
- CDN 环境：可在页面中注入
  ```html
  <script>
    tailwind.config = { prefix: 'tw-', darkMode: 'class', theme: { extend: { colors: { brand: '#3BA4F0' }}} }
  </script>
  ```
  但无法使用构建期插件安装（需转入构建链路）

七、团队约束清单（建议落到文档/CI）
- 类名顺序：布局 → 尺寸/间距 → 颜色/阴影 → 交互/动画 → 变体
- 禁止 runtime 动态拼接类名；改用“枚举映射”
- content 范围必须覆盖：页面模板/组件/MDX/服务端渲染产物
- safelist 有据可依（数据字典或白名单文件），定期审计
- 设计令牌与 theme.extend 同步，避免散落任意值
- 工具链：
  - eslint-plugin-tailwindcss：classnames-order、no-custom-classname（按需）
  - PR 模板：对比度、节奏、dark、焦点可访问性检查
- 版本差异：升级 Tailwind 时Review BREAKING CHANGES 与插件兼容性

常见坑
- content 忽略了服务端模板或第三方组件中的类名 → 生产被裁剪
- prefix 后忘记替换历史类名 → 局部样式失效
- important 全局开启导致调试困难 → 首选容器 important
- safelist 过度泛化（大正则） → 体积暴涨

小结
- 配置是“生成规则 + 团队约束”的落点
- content 与动态类名管理决定上线稳定性与体积
- prefix/important 是兼容策略，慎用但要会用
- 以规则与工具把控一致性，配合 Review 与 CI 形成闭环

练习
1) 为一个 Vite 项目配置 content（含 src/** 与 mdx），并用 safelist 保留 3 个语义色阶
2) 启用重要性容器 important: '#app' 并验证外部第三方样式不会被覆写
3) 实现一段“枚举映射”的类名选择器，并统计无效状态的回退策略
4) 将团队品牌色板同步到 theme.extend.colors，并用 ESLint 规则约束类名顺序

参考与延伸阅读
- Configuration: https://tailwindcss.com/docs/configuration
- Content scanning: https://tailwindcss.com/docs/content-configuration
- Dark mode: https://tailwindcss.com/docs/dark-mode
- Plugins: https://tailwindcss.com/docs/plugins