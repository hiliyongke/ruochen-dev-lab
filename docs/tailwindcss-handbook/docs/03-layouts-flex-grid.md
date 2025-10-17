# 03. 布局体系：Flex/Grid 实战

你将学到什么
- 何时选择 Flex，何时选择 Grid
- 常用布局模式：导航/两栏/三栏/圣杯/瀑布流/卡片网格
- 响应式断点与列数/间距调节
- 对齐、换行、间隙、等高与自适应技巧

前置知识
- 已掌握第 01~02 章内容（原子类、变体、刻度）
- 基本 CSS Flex 与 Grid 概念

为什么需要它（问题驱动）
- 页面布局是所有 UI 的骨架；选择合适的布局模型可显著降低样式复杂度
- Tailwind 对 Flex/Grid 封装了高频语义与刻度，能以极少类名完成复杂布局

一、何时用 Flex，何时用 Grid
- Flex：一维布局（主轴或交叉轴），常用于导航条、工具栏、卡片横向对齐等
- Grid：二维布局，更适合网格、照片墙、复杂区域划分、响应式列数变化
- 混合策略：父级 Grid 划分大区块，子级用 Flex 做局部对齐

二、导航条（Flex）
```html
<header class="h-14 flex items-center justify-between px-4 bg-slate-900 text-slate-100">
  <div class="font-semibold">Brand</div>
  <nav class="hidden sm:flex items-center gap-4 text-sm">
    <a class="text-slate-300 hover:text-white" href="#">主页</a>
    <a class="text-slate-300 hover:text-white" href="#">文档</a>
    <a class="text-slate-300 hover:text-white" href="#">社区</a>
  </nav>
  <button class="sm:hidden rounded-md border border-slate-700 px-3 py-1">菜单</button>
</header>
```
要点：items-center 垂直居中，justify-between 两端对齐，断点控制显示。

三、两栏/三栏布局（Flex 与 Grid）
1) 两栏（主内容 + 侧栏）
```html
<section class="max-w-6xl mx-auto px-4 grid md:grid-cols-[1fr_320px] gap-6">
  <main class="min-h-[300px] rounded-lg border border-slate-200/10 p-4">主内容</main>
  <aside class="rounded-lg border border-slate-200/10 p-4">侧栏</aside>
</section>
```
- Grid Track：md:grid-cols-[1fr_320px] 直接定义列轨道，移动端自然单列堆叠
2) 三栏（圣杯布局）
```html
<section class="max-w-6xl mx-auto px-4 grid lg:grid-cols-[240px_1fr_280px] gap-6">
  <aside class="rounded-lg border p-4">左栏</aside>
  <main class="rounded-lg border p-4">主内容</main>
  <aside class="rounded-lg border p-4">右栏</aside>
</section>
```
- 优势：轨道显式可读；在不同断点切换列数更直观

四、卡片网格（Grid，响应式列数）
```html
<ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <li class="rounded-xl border border-slate-200/10 p-4">卡片 1</li>
  <li class="rounded-xl border border-slate-200/10 p-4">卡片 2</li>
  <li class="rounded-xl border border-slate-200/10 p-4">卡片 3</li>
  <li class="rounded-xl border border-slate-200/10 p-4">卡片 4</li>
  <li class="rounded-xl border border-slate-200/10 p-4">卡片 5</li>
  <li class="rounded-xl border border-slate-200/10 p-4">卡片 6</li>
</ul>
```
- 断点逐步增加列数；gap-* 控制网格间距；容器宽度由父级控制

五、媒体对象与等高（Flex）
```html
<article class="flex gap-4">
  <img class="w-16 h-16 rounded-lg object-cover" src="https://picsum.photos/96" alt="">
  <div class="flex-1">
    <h3 class="font-semibold">标题</h3>
    <p class="text-sm text-slate-400">多行文本也能与头像自然对齐</p>
    <div class="mt-2 flex items-center gap-2">
      <span class="inline-flex items-center rounded bg-emerald-600 px-2 py-0.5 text-xs">标签</span>
      <span class="text-xs text-slate-400">· 2 min read</span>
    </div>
  </div>
</article>
```
- flex-1 让右侧自适应填满；items-center/strech 控制交叉轴对齐

六、瀑布流/不等高卡片（CSS Grid + auto-rows）
简化版（等行高卡片，容错强）：
```html
<section class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[10px]">
  <div class="rounded-lg border p-4 row-span-12">短内容</div>
  <div class="rounded-lg border p-4 row-span-20">较长内容<br/>...</div>
  <div class="rounded-lg border p-4 row-span-14">中等内容</div>
  <div class="rounded-lg border p-4 row-span-18">更长内容<br/>...<br/>...</div>
</section>
```
- 通过固定行高 + row-span-* 粗略模拟瀑布流（更复杂需求建议 Masonry/JS）

七、常用对齐与换行
- Flex 主轴对齐：justify-start/center/between
- Flex 交叉轴对齐：items-start/center/stretch
- Grid 对齐：place-items-center/justify-items-start
- 换行：flex-wrap；间隙：gap-x-*/gap-y-*；等距分布：justify-evenly

八、可运行示例
- 见 assets/examples/03-layouts.html，包含导航、两栏/三栏、卡片网格、媒体对象、瀑布流

最佳实践
- 优先用 Grid 做宏观区域划分，用 Flex 处理局部对齐与分布
- 坚持“容器控制宽度，子项控制填充”，避免在子项上硬编码页面边距
- 使用 gap 替代子项 margin 做网格间距，减少相邻计算问题

常见坑
- 在子项滥用 w-full 导致溢出 → 先检查父级容器的网格轨道/列数设定
- 同时给父级和子项设置 padding 与 gap，造成视觉双倍间距 → 统一到容器 gap
- 多断点布局时忘记覆盖旧类名 → 断点从小到大逐级声明，必要时删除冗余类

小结
- Flex 解决一维对齐，Grid 管二维区域；混用能兼顾效率与表达力
- 响应式列数、gap 与轨道显式定义能提升可读性与可维护性

练习
1) 将两栏布局在 md: 为 1fr + 320px，在 lg: 变为 1fr + 400px
2) 实现一个 2→3→4 列的卡片网格（sm→lg→xl），gap 分别为 4/6/8
3) 用 Grid 写一个页头（左LOGO，中搜索，右用户区），在小屏改为三行垂直堆叠

参考与延伸阅读
- Flex: https://tailwindcss.com/docs/flex
- Grid: https://tailwindcss.com/docs/grid-template-columns
- Gap: https://tailwindcss.com/docs/gap
- Justify/Align: https://tailwindcss.com/docs/justify-content