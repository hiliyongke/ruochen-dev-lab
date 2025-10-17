# 06. 设计系统落地：色彩/间距/排版策略

你将学到什么
- 以“刻度”为核心的配色策略（品牌主色/语义色与 50~900 阶）
- 间距与节奏（Spacing Scale 与 4px/8px 基线）
- 排版系统（Font Family/Size/Leading/Measure）与可读性
- 令牌（CSS Variables）与 Tailwind theme.extend 的映射实践
- 常见坑：色值不统一、间距漂移、行高与可读宽度失控

前置知识
- 已掌握原子类、变体、布局与 @apply/@layer（第 01~05 章）
- 了解团队已有或将要制定的设计规范（色板、间距、字体）

为什么需要它（问题驱动）
- 没有“刻度”的项目，视觉样式难以复用且难以评审
- 通过统一的颜色/间距/排版标尺，组件外观可预测、页面节奏更连贯

一、配色策略：从语义到刻度
- 语义维度：Brand/Info/Success/Warning/Error
- 刻度维度：50 → 900（亮到暗）
- Tailwind 建议：theme.extend.colors 下定义 brand 与语义色，便于 hover 深一档
示例映射（CDN 配置见示例文件）
```js
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ebf5ff',
          100: '#d6ebff',
          200: '#add7ff',
          300: '#7fc1ff',
          400: '#55aeff',
          500: '#3BA4F0',   // DEFAULT
          600: '#1E7FC1',
          700: '#176399',
          800: '#114a73',
          900: '#0b3450',
          DEFAULT: '#3BA4F0'
        }
      }
    }
  }
}
```
使用建议
- 交互色 hover 采用 +100 或 +200 的更深一档，如 bg-brand-500 hover:bg-brand-600
- 文字与背景的对比度保持 WCAG AA（可使用 Contrast 工具校验）

二、间距与节奏：Spacing Scale 与基线
- 选定 4px 或 8px 基线（推荐），整站内边距/外边距按尺度对齐
- Tailwind 内置间距刻度与 4px 兼容良好（1 → 0.25rem → 4px）
- 用 gap 控制网格间距，减少子元素 margin 带来的耦合
基线示例
```html
<section class="max-w-3xl mx-auto p-6 sm:p-8">
  <h2 class="text-2xl font-bold">标题</h2>
  <p class="mt-3 text-slate-300">段落 A</p>
  <p class="mt-3 text-slate-300">段落 B</p>
  <div class="mt-6 grid sm:grid-cols-2 gap-6">
    <article class="rounded-lg border border-slate-800 p-6">卡片</article>
    <article class="rounded-lg border border-slate-800 p-6">卡片</article>
  </div>
</section>
```
要点
- 段落间距统一为 mt-3（12px 基线），区块间距用 mt-6（24px 基线）

三、排版系统：字体、字号、行高、阅读宽度
- 字体族：中文/西文无衬线 + 等宽（代码）
- 字号阶梯：text-sm → base → lg → xl → 2xl...
- 行高：正文建议 leading-7/relaxed，标题相对更紧凑
- 阅读宽度（measure）：prose 宽度约 60~75 字符；Tailwind 可用 max-w-prose 或自定义
示例（@layer base 设置正文排版）
```html
<style type="text/tailwindcss">
  @layer base {
    h1,h2,h3 { @apply font-bold text-slate-100; }
    h1 { @apply text-3xl sm:text-4xl leading-tight; }
    h2 { @apply text-2xl leading-snug mt-8; }
    p  { @apply text-slate-300 leading-7; }
    code { @apply font-mono text-emerald-300; }
  }
</style>
```

四、令牌与 Tailwind 的桥接
- 在 :root 定义 CSS 变量（--brand、--radius、--space-xl 等）
- 在组件层采用 bg-[var(--brand)]、rounded-[var(--radius)] 等任意值使用
- 在 theme.extend 中复刻关键令牌（如 brand 色板），保证原子类就能直接调用
策略
- “通用令牌”走 CSS 变量，“频繁使用”的令牌同步到 theme.extend 以获得更短类名

五、可运行示例
- 见 assets/examples/06-design-system.html：内含
  - brand 色板展示卡
  - 基线节奏示例（段落/卡片/网格）
  - 正文排版（@layer base）与 max-w-prose 阅读宽度
  - 令牌到 Tailwind 的双向映射

六、最佳实践
- 避免用任意色值散落代码：统一进 theme.extend.colors 或 CSS 变量
- 页面节奏优先用间距刻度，不在局部“拍脑袋”加随机 px 值
- 标题与正文在 @layer base 中一次性设定，页面里只关注结构与内容
- 设计评审清单：对比度、品牌色一致性、节奏一致性、阅读宽度与可访问性

常见坑
- Hover 不是同阶色导致跳变奇怪 → 使用 brand-500 → hover:brand-600
- 行高过小导致中文挤压 → 正文至少 leading-7/relaxed
- 卡片/网格间距混用 gap 与 margin → 统一用 gap 管理
- 令牌没同步到 theme → 导致类名冗长难复用

小结
- 以“刻度”为锚点建立色彩/间距/排版系统
- 令牌提供品牌一致性，theme.extend 让使用路径更简短
- 通过 @layer base 固化排版，减少页面样式噪音

练习
1) 为项目定义 brand 与语义色（success/warning/error）的 50~900 阶，并在按钮上实现 hover 深一档
2) 以 8px 为基线，设计一个详情页的段落与区块节奏（给出段落间距/区块间距与标题样式）
3) 配置 @layer base 的标题与正文，设置 max-w-prose 的阅读宽度与适配小屏的断点调整
4) 将 --brand 与 --radius 作为令牌，并在两个组件上分别用任意值与 theme.extend 两种方式调用

参考与延伸阅读
- Colors: https://tailwindcss.com/docs/customizing-colors
- Spacing: https://tailwindcss.com/docs/customizing-spacing
- Typography: https://tailwindcss.com/docs/font-size
- Design Tokens: https://designtokens.org/