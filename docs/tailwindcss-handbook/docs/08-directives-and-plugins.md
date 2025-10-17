# 08. 指令与插件体系（Directives & Plugins）

你将学到什么
- Tailwind 指令：@tailwind、@layer、@apply、@config 的作用与边界
- 官方插件体系：typography、forms、line-clamp 的安装与使用
- 自定义插件（plugins）的能力边界与最佳实践
- CDN/构建两种环境下的差异与常见坑

前置知识
- 已熟悉 @layer/@apply（第 05 章），theme.extend（第 06 章）
- 了解响应式与变体（第 04 章）

一、核心指令概览
- @tailwind base | components | utilities
  - 注入 Tailwind 的基础层、组件层、工具层（构建链路中使用）
- @layer base | components | utilities
  - 在对应层追加你的样式，确保与 Tailwind 的生成顺序一致
- @apply
  - 将一组 Utility 组合成可复用的类，增强可读性
- @config
  - 在单文件中内联配置（主要用于独立实验场景）
说明
- 在 CDN 环境中，没有构建步骤，不能使用 @tailwind base 等“注入生成”的指令；
- 但可以在 `<style type="text/tailwindcss">` 内使用 @layer/@apply 扩展。

二、官方插件（typography/forms/line-clamp）
- 安装（构建链路）
```bash
# 推荐在真实项目的构建链路使用
npm i -D @tailwindcss/typography @tailwindcss/forms @tailwindcss/line-clamp
```
- 配置（tailwind.config.js）
```js
// tailwind.config.js
const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');
const lineClamp = require('@tailwindcss/line-clamp');

module.exports = {
  content: ['./src/**/*.{html,js,ts,tsx,vue}'],
  theme: { extend: {} },
  plugins: [typography, forms, lineClamp],
};
```
- 使用
  - typography：prose 类名为长文排版提供优雅默认值
  - forms：统一原生表单控件的视觉基线
  - line-clamp：提供多行截断，如 line-clamp-3
注意
- 目前 line-clamp 已进入核心（新版本可直接使用 line-clamp-*）；typography/forms 仍需插件。建议使用 Tailwind v3.3+；低于该版本请继续通过 @tailwindcss/line-clamp 插件提供支持。
- 在纯 CDN 环境不经过打包，无法直接“安装插件包”，可使用 @layer 模拟常用样式或切换到构建链路。

三、CDN 环境的替代方案
- “类 prose”排版：在 @layer base 中设置正文/标题的默认样式
- 表单基线：通过组合类在组件层封装 .form-control 等
- 多行截断：直接使用 line-clamp-*（核心工具）
示例（完整可运行见 assets/examples/08-plugins.html）
```html
<style type="text/tailwindcss">
  @layer base {
    .prose-like h1 { @apply text-3xl sm:text-4xl font-bold leading-tight; }
    .prose-like h2 { @apply text-2xl font-bold leading-snug mt-6; }
    .prose-like p  { @apply text-slate-300 leading-7 mt-3; }
    .prose-like a  { @apply text-emerald-400 hover:text-emerald-300 underline; }
  }
  @layer components {
    .form-control { @apply w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-slate-100 placeholder-slate-500; }
    .form-control:focus { @apply outline-none ring-2 ring-emerald-500; }
  }
</style>
<div class="prose-like">
  <h1>标题</h1>
  <p>正文示例</p>
</div>
<input class="form-control" placeholder="输入点什么..."/>
<p class="line-clamp-3">长文本...</p>
```

四、自定义插件（构建链路）
- 适用场景：批量生成工具类、注册复杂变体、桥接设计令牌等
- 写法示例
```js
// plugin/brand-utils.js
const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities, theme, matchUtilities }) {
  // 简单工具
  addUtilities({
    '.content-auto': { 'content-visibility': 'auto' },
  });

  // 基于令牌的匹配工具（如 --brand-*）
  matchUtilities(
    {
      'brand-bg': (value) => ({ backgroundColor: value }),
    },
    { values: theme('colors.brand', {}) }
  );
}, {
  // 可选：默认主题扩展
  theme: {
    extend: {
      colors: {
        brand: { 500: '#3BA4F0', 600: '#1E7FC1' },
      },
    },
  },
});
```
- 在 tailwind.config.js 中启用
```js
module.exports = {
  // ...
  plugins: [require('./plugin/brand-utils')],
};
```
最佳实践
- 插件尽量“数据驱动”：依据 theme() 的令牌生成类，避免硬编码；
- 为插件编写 README 与用例，保持稳定 API；
- 与设计系统对齐：从 tokens/presets 派生，而非“另起一套”。

五、常见坑
- 在 CDN 环境尝试使用 @tailwind base/components/utilities → 无效；这些需要构建步骤
- 安装插件后未在 tailwind.config.js 的 plugins 中声明 → 不生效
- content 匹配不全导致插件生成的类被裁剪 → 检查扫描路径
- typography 与项目主题冲突：可通过主题定制或局部容器隔离（如 .prose 只用于正文区域）

六、小结
- 指令层面：构建环境可用 @tailwind 注入；CDN 环境用 @layer/@apply 扩展
- 插件层面：typography/forms/line-clamp 常用；line-clamp 多版本已进入核心
- 自定义插件：用 matchUtilities/addUtilities 结合 theme() 生成与令牌对齐的工具

练习
1) 在构建链路项目中启用 typography 与 forms 插件，并编写一段“文档正文 + 表单”的演示页
2) 使用自定义插件，为 colors.brand 派生 brand-bg-500/600 工具类
3) 在 CDN 示例中扩展 .prose-like 的列表与代码片默认样式，保持与本小册风格一致

参考与延伸阅读
- Directives: https://tailwindcss.com/docs/functions-and-directives
- Plugins: https://tailwindcss.com/docs/plugins
- Typography: https://github.com/tailwindlabs/tailwindcss-typography
- Forms: https://github.com/tailwindlabs/tailwindcss-forms
- Line Clamp: https://tailwindcss.com/docs/line-clamp