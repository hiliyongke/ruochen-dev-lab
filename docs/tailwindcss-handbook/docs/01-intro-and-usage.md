# 01. 导言与使用姿势

简版术语速查与对比要点
- Utility 原子类：单一语义的小类名（如 px-4、text-sm、bg-emerald-600）
- Variant 变体：前缀修饰（sm:/md:/hover:/focus:/dark:/data-[state=open]）
- 任意值：刻度外灵活值（w-[42rem]、bg-[#0ea5e9]）
- @layer 层次：base/components/utilities 注入顺序与扩展
- JIT：按 content 扫描的“按需生成”机制；动态类需映射或 safelist
- 暗色模式：推荐 class 策略并做持久化（localStorage/系统同步）

对比要点（一句话）
- vs BEM：命名负担转为“组合”，依赖统一刻度
- vs 组件库：强定制与贴设计稿优势明显，但需自建组件
- vs CSS-in-JS：零运行期开销，动态样式弱于编程式方案

阅读指引
- 想要展开版术语与对比表，请参考 README 顶部；本章保持精炼，专注上手路径

你将学到什么
- 了解 Tailwind CSS 的原子化思想与适用场景
- 快速以 CDN 方式启动并在本地浏览器直接运行
- 掌握基础类名组合与响应式/状态变体的写法
- 认识常见坑与调试方式

前置知识
- 基础 HTML/CSS/JS
- 了解 CSS 类选择器与响应式断点的基本概念

Tailwind 是什么
- Utility-First（原子类优先）的 CSS 框架：以单一语义的小类名构建外观（如 px-4、text-sm、bg-emerald-600）
- 优点：开发效率高、可读性强（类名即文档）、与设计刻度系统天然匹配、样式作用域天然隔离（几乎无全局泄漏）
- 代价：类名较多（但可读），需要团队在“刻度”和“抽象”上形成共识

为什么选用 Tailwind（和谁比）
- 对比“手写 CSS/SCSS”：Tailwind 免去大量命名与切换上下文；可通过原子类组合快速迭代
- 对比“BEM/约定式 CSS”：Tailwind 将命名负担转为“组合”，依靠刻度系统保证一致性
- 对比“UI 组件库（如 Ant/Element/MUI）”：组件库上手快但视觉定制成本高；Tailwind 适合强定制与贴设计稿的场景
- 对比“CSS-in-JS”：Tailwind 无运行期开销；CSS-in-JS 适合复杂动态样式与主题上下文管理

典型使用场景
- 需要“贴设计稿”的中大型前端项目（营销页、控制台、SaaS 后台、内容站）
- 需要统一品牌设计系统（色彩/间距/排版刻度），并能在代码层严格落地
- 组件库覆盖不全、或组件二次设计较多的团队

不适用或不优先的场景
- 完全使用现成组件库且对视觉定制要求极低
- 团队尚未建立最基本的设计刻度（色/距/字级），短期交付以“能用”为先
- 运行期需要高度动态生成样式且无法静态分析类名（可通过映射表+safelist 缓解）

团队落地建议
- 先定“刻度”（第06章）：色板/间距/字级；任意值作为补充而非常态
- 抽象稳定组合到 @layer components，以页面层“原子类组合”为主（第05章）
- 建立类名顺序规范与映射表（颜色/尺寸别名），并在 PR 审查中对齐

为什么需要它（问题驱动）
- 传统 CSS 在风格复用与一致性上容易“散”和“飘”，维护成本高
- 组件库在风格细节上可能不完全贴合设计稿
- Tailwind 以“原子类”的方式在 HTML 中直观组织样式，既快又可控，便于建立团队一致的设计系统

快速上手（可复制运行的最小示例）
- 直接双击打开本地 HTML 文件即可运行，无需安装任何依赖
- 你可以使用本文档仓库中的 assets/examples/01-cdn-min.html，或复制下方代码另存为本地 HTML

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Tailwind 最小可运行示例</title>
  <!-- 使用官方 CDN（含 JIT 引擎），生产环境请配合构建裁剪体积 -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- 可选：自定义主题（示例仅做演示） -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              DEFAULT: '#3BA4F0',
              dark: '#1E7FC1',
            },
          }
        }
      }
    }
  </script>
</head>
<body class="min-h-screen bg-slate-900 text-slate-100 antialiased">
  <header class="sticky top-0 z-10 backdrop-blur bg-slate-900/60 border-b border-slate-800">
    <div class="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
      <div class="font-semibold tracking-wide">Tailwind Demo</div>
      <nav class="hidden sm:flex gap-4 text-sm">
        <a class="text-slate-300 hover:text-white transition-colors" href="#features">特性</a>
        <a class="text-slate-300 hover:text-white transition-colors" href="#cta">开始</a>
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-4 py-12">
    <!-- Hero -->
    <section class="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold leading-tight">
          原子化 CSS，<span class="text-brand">快速</span>构建现代页面
        </h1>
        <p class="mt-3 text-slate-300">
          在 HTML 中直接组合类名，无需切换上下文，在保持一致设计系统的同时提升开发效率。
        </p>
        <div class="mt-6 flex gap-3">
          <a href="#cta"
             class="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-slate-900 font-semibold hover:bg-brand-dark transition-colors">
            立即开始
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 5l7 7-7 7M5 12h14"/></svg>
          </a>
          <a href="#features"
             class="inline-flex items-center rounded-md border border-slate-700 px-4 py-2 hover:border-slate-500 transition-colors">
            了解更多
          </a>
        </div>
      </div>
      <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div class="text-xs text-slate-400 mb-2">按钮示例</div>
        <button
          class="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-emerald-900 hover:bg-emerald-400 transition">
          Hover 我
        </button>
        <div class="mt-4 text-xs text-slate-400">响应式：窗口宽度 ≥640px 时，导航显示（sm:）</div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <article class="rounded-lg border border-slate-800 p-5 bg-slate-900/40">
        <h3 class="font-semibold">原子类组合</h3>
        <p class="mt-2 text-slate-300 text-sm">通过类名直观描述样式，例如 px-4 py-2 text-slate-900。</p>
      </article>
      <article class="rounded-lg border border-slate-800 p-5 bg-slate-900/40">
        <h3 class="font-semibold">响应式与变体</h3>
        <p class="mt-2 text-slate-300 text-sm">使用 sm:, md:, hover:, focus: 等前缀快速适配。</p>
      </article>
      <article class="rounded-lg border border-slate-800 p-5 bg-slate-900/40">
        <h3 class="font-semibold">设计系统</h3>
        <p class="mt-2 text-slate-300 text-sm">统一色彩、间距、排版，保持品牌一致性。</p>
      </article>
    </section>

    <section id="cta" class="mt-16">
      <div class="rounded-xl border border-slate-800 p-6 bg-gradient-to-r from-slate-900 to-slate-800">
        <h2 class="text-2xl font-bold">下一步</h2>
        <p class="mt-2 text-slate-300">继续阅读第 02 章，构建你的原子类心智模型。</p>
      </div>
    </section>
  </main>

  <footer class="mt-16 py-6 text-center text-sm text-slate-400">
    Made with Tailwind CSS CDN
  </footer>
</body>
</html>
```

如何运行
- 方法 A：使用本仓库示例
  1) 打开 assets/examples/01-cdn-min.html
  2) 直接双击或右键使用浏览器打开
- 方法 B：复制上例代码，新建本地 HTML 文件并打开

核心知识点与示例
1) 类名即样式，组合即组件
- 你写在元素上的类名就是最终样式的来源，无需再切换到 CSS 文件
- 将常用组合抽象为组件（后续章节介绍 @apply 与约束）
```html
<button class="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-emerald-900 hover:bg-emerald-400">
  Hover 我
</button>
```

2) 响应式变体与状态变体
- 响应式前缀：sm:, md:, lg:, xl:, 2xl:
- 状态与交互：hover:, focus:, active:, disabled: 等
```html
<nav class="hidden sm:flex gap-4">
  <!-- 小屏隐藏，≥640px 显示 -->
  ...
</nav>
<a class="text-slate-300 hover:text-white transition-colors">链接</a>
```

3) 快速自定义主题（演示）
- 通过 tailwind.config（CDN 下以 JS 对象注入）扩展品牌色
```html
<script>
  tailwind.config = {
    theme: { extend: { colors: { brand: { DEFAULT: '#3BA4F0', dark: '#1E7FC1' }}}}
  }
</script>
<a class="bg-brand hover:bg-brand-dark text-slate-900 font-semibold px-3 py-2 rounded-md">品牌按钮</a>
```

最佳实践
- 开发期可用 CDN 快速试验，生产环境建议使用构建工具并启用内容裁剪（第 11 章详述）
- 先从“令牌”级别（色彩、间距、字体尺寸）统一，再抽象复用
- 善用 hover:/focus:/disabled: 与 transition/rounded/shadow 等组合强化交互感

常见坑
- 仅用 CDN 时，打包与裁剪没有介入，生产体积会偏大 → 生产请走构建链路
- 类名优先级与顺序：Tailwind 基于原子类，后写的类可能覆盖前面的冲突样式
- 未开启 antialiased 或字体渲染差异导致显示不一致 → body 可加 antialiased
- 忘记设置 viewport 或移动端断点未生效 → 保证 <meta name="viewport"...> 存在

小结
- Tailwind 通过原子类在 HTML 中直观叠加样式，提高迭代速度
- 使用响应式/状态变体快速适配不同屏幕与交互
- CDN 上手快，生产建议结合构建与裁剪

练习
- 练习 1：为示例新增一个“次要按钮”（灰色边框、hover 边框变亮），在 sm: 以上显示
- 练习 2：将品牌按钮替换为你的品牌主色，并为 hover 状态设置更深一档的色值
- 练习 3：增加一个包含图片与文字的卡片组件，要求在 md: 以上水平并排，小屏上下堆叠

参考与延伸阅读
- Tailwind 官方文档：https://tailwindcss.com/docs
- Play 在线试验台：https://play.tailwindcss.com
- Typography 插件：https://tailwindcss.com/docs/typography-plugin