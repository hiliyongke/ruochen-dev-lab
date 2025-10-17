# 07. 主题化与暗色模式

你将学到什么
- 两种策略：媒体查询 prefers-color-scheme 与 class 切换
- Tailwind 的暗色变体 dark: 与主题设计的关系
- CSS 变量驱动的多主题（亮/暗/品牌扩展）
- 系统主题同步、首屏无闪烁与本地持久化
- 常见坑：对比度不足、图片/插画未适配、第三方组件样式不一致

前置知识
- 熟悉 theme.extend 与设计令牌（第 06 章）
- 会使用响应式/状态变体（第 04 章）

一、两种主题策略
1) 媒体查询策略（自动）
- 根据 prefers-color-scheme: dark 自动启用暗色
- 优点：无需存储用户选择；与系统一致
- 缺点：用户想“手动指定”时不便
2) class 策略（手动/可持久化）
- 在 html 或 body 上切换 class="dark"
- 优点：手动可控、可与 localStorage 结合
- 缺点：需处理首屏闪烁与系统同步

Tailwind 默认支持 dark 变体（需选择策略）：
- 媒体策略：在 tailwind.config.js 设置 darkMode: 'media'
- 类策略：设置 darkMode: 'class'（推荐用于手动切换）

二、dark: 变体的使用
- 在类名前加 dark: 表示“暗色模式下”生效
```html
<div class="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
  我会随主题切换
</div>
```
- 常见组合：背景/前景/边框/阴影/分隔线/状态色

三、CSS 变量 + 主题扩展
- 用 :root 与 .dark（或 [data-theme='dark']）定义不同令牌
- 组件里使用 bg-[var(--surface)]、text-[var(--text)] 等任意值
好处
- 与设计系统一致；主题切换只需切换变量集合
- 可扩展更多主题（如 高对比、品牌日/夜主题）

示例（片段）
```html
<style>
  :root {
    --surface: #ffffff;
    --on-surface: #0f172a; /* slate-900 */
    --brand: #3BA4F0;
    --brand-contrast: #0b3450;
  }
  .dark {
    --surface: #0b1220;
    --on-surface: #dce7f5;
    --brand: #3BA4F0;
    --brand-contrast: #7BD7FF;
  }
</style>

<article class="rounded-xl p-4 border bg-[var(--surface)] text-[var(--on-surface)]">
  <h3 class="font-semibold">变量驱动的卡片</h3>
</article>
```

四、系统同步与无闪烁
- 首屏注入“即时脚本”：
  1) 若 localStorage.theme 存在，尊重之
  2) 否则跟随系统（matchMedia('(prefers-color-scheme: dark)')）
- 该脚本必须尽早执行（在 CSS 前）避免 FOUC（闪烁）

五、可运行示例
- 见 assets/examples/07-theming-dark-mode.html：提供“系统/亮/暗”切换、持久化与示例组件

六、最佳实践
- 优先保证对比度达标（WCAG AA），暗色下文本/分隔线要提升可读性
- 图片与插画需准备深色背景下的版本或边框/投影修饰
- 第三方组件：统一在 @layer base 或局部容器内覆盖其颜色令牌
- 变体顺序：基础类 → dark: 覆盖；复杂页面优先使用变量减少重复

常见坑
- 仅改背景而未调整分隔线/阴影 → 暗色下层次消失
- 忘记同步滚动条/原生控件 → 使用 accent-*、::-webkit-scrollbar 等增强（跨浏览器需兼容）
- 未做首屏策略 → 页面会先亮后暗/反之，影响观感

小结
- class 策略 + CSS 变量适合多主题与手动切换；媒体策略适合“只跟系统”的简洁场景
- dark: 提供简单覆盖，变量提供系统化治理
- 通过首屏脚本与持久化获得一致、无闪烁的用户体验

练习
1) 为卡片与按钮补全暗色变量（边框、阴影、悬停色），确保对比度合规
2) 扩展第三个“高对比”主题 data-theme="contrast"，通过切换按钮验证
3) 为一张插画在暗色下添加轻微边框/阴影，避免在深背景中“融化”

参考与延伸阅读
- Dark Mode: https://tailwindcss.com/docs/dark-mode
- Prefers Color Scheme: https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme
- WCAG Contrast: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum/