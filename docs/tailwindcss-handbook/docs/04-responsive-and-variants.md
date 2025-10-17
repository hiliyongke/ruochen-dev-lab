# 04. 响应式与状态/交互变体

你将学到什么
- 响应式前缀与链式写法：sm/md/lg/xl/2xl
- 状态与交互变体：hover/focus/active/disabled/focus-visible/focus-within
- 结构与关系变体：group/group-hover、peer/peer-checked、first/last/odd/even
- 无障碍与数据变体：aria-*、data-*、open/closed
- 其他实用变体：motion-safe/motion-reduce、print、supports-[]、媒体任意值
- 类名冲突与优先级、可维护的书写顺序

前置知识
- 已阅读第 01~03 章，了解原子类与布局基础
- 理解变体是“条件 + 样式”的组合（前缀 + 类名）

一、响应式前缀（breakpoints）
- sm: ≥640px、md: ≥768px、lg: ≥1024px、xl: ≥1280px、2xl: ≥1536px
- 小屏优先：先写基础样式，再逐断点覆盖
- 链式与组合：sm:hover:、md:active: 等
示例
```html
<!-- 小屏按钮较小，≥768px(md:)变大，hover 时变色 -->
<a class="px-3 py-1 text-sm rounded bg-slate-800 text-slate-200 hover:bg-slate-700
           md:px-4 md:py-2 md:text-base">
  自适应按钮
</a>
```

二、状态与交互变体
- hover:/focus:/active:/disabled:/focus-visible:/focus-within:
- focus-visible: 更友好的键盘可见焦点
- disabled:: 对应 disabled 属性态
示例
```html
<button class="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-slate-900
               hover:bg-emerald-500 active:translate-y-px
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
               disabled:bg-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed">
  操作
</button>
```

三、结构与关系变体
1) group 与 group-hover
- 在父级加 group 类，子元素可使用 group-hover: 等变体响应父级交互
```html
<div class="group rounded-lg border border-slate-800 p-4 bg-slate-900/40">
  <h3 class="font-semibold group-hover:text-emerald-400 transition-colors">卡片标题</h3>
  <p class="text-sm text-slate-400">悬停整卡时，标题变色</p>
</div>
```
2) peer 与 peer-checked
- 同级元素间的联动：在“触发者”上设 peer，兄弟元素使用 peer-* 变体
```html
<label class="flex items-center gap-2">
  <input type="checkbox" class="peer accent-emerald-600">
  <span class="text-slate-300 peer-checked:text-emerald-400">选中我会变色</span>
</label>
```
3) first/last/odd/even/only 等
```html
<ul class="divide-y divide-slate-800">
  <li class="py-2 first:pt-0 last:pb-0 odd:bg-slate-900/30">项 1</li>
  <li class="py-2 odd:bg-slate-900/30">项 2</li>
  <li class="py-2 odd:bg-slate-900/30">项 3</li>
</ul>
```

四、无障碍与数据变体
- aria-*：aria-expanded、aria-checked 等
- data-*：data-state=open/closed、自定义数据状态
- open/closed：details/summary、dialog 等（浏览器/语义支持相关）
示例
```html
<!-- aria-expanded 示例 -->
<button aria-expanded="false"
  class="rounded border border-slate-700 px-3 py-1 text-slate-200
         aria-expanded:bg-emerald-600 aria-expanded:text-slate-900">
  展开
</button>

<!-- data-state 示例 -->
<div data-state="closed"
     class="mt-2 rounded px-3 py-2 bg-slate-800 data-[state=open]:bg-emerald-600">
  根据 data-state 切换底色
</div>
```

五、其他常用变体
- motion-safe:/motion-reduce: 动画可访问性
- print: 打印样式
- supports-[]: 条件支持（如 supports-[backdrop-filter]:backdrop-blur）
- media-[]: 自定义媒体查询（任意值语法）
示例
```html
<!-- 仅在用户允许动效时启用动画 -->
<div class="motion-safe:animate-pulse rounded-md bg-emerald-600 w-24 h-8"></div>

<!-- 打印时隐藏 -->
<div class="print:hidden">仅屏幕可见内容</div>

<!-- 支持 backdrop-filter 时增强背景 -->
<div class="p-4 bg-slate-900/60 supports-[backdrop-filter]:backdrop-blur">
  条件增强
</div>

<!-- 任意媒体查询：横屏时改变布局（浏览器支持要求） -->
<div class="[@media(orientation:landscape)]:flex [@media(orientation:landscape)]:gap-4">
  横屏布局
</div>
```

六、可运行示例
- 见 assets/examples/04-variants.html：包含 responsive、状态交互、group/peer、aria-/data-、motion-safe/reduce、print 等

七、写作与维护建议
- 类名分组顺序：布局 → 尺寸/间距 → 颜色/阴影 → 交互/动效 → 变体（从常用到稀有）
- 尽量使用语义清晰的变体，避免过多任意媒体/支持查询导致维护困难
- 统一在代码评审中检查 aria/data 状态与交互一致性

常见坑
- 变体顺序与覆盖：同一属性后写覆盖前写；链式组合从左到右代表更“具体”的条件
- 未设置可访问焦点样式：请使用 focus-visible:* 替代仅 hover 的交互
- CDN 环境下 supports-/media- 任意变体可用，但生产需确保内容扫描不会裁剪掉这些类名
- group/peer 生效范围：需要正确的父/兄弟关系与 class 命名（group/peer 必须出现在对应元素上）

小结
- 变体让“条件 + 样式”统一在类名层面完成，显著降低上下文切换
- 状态、结构、无障碍与数据变体协同，能构建复杂但可维护的交互
- 请遵循书写顺序与代码评审约定，避免覆盖冲突与可访问性缺失

练习
1) 实现一个卡片：悬停整卡时标题与图标同色高亮（group-hover），焦点可见（focus-visible）
2) 制作一个切换开关：checkbox 为 peer，标签文本与背景随 peer-checked 改变
3) 使用 aria-expanded + data-state 模拟手风琴的展开/收起两态
4) 为一个动效元素添加 motion-safe: 动画，print: 隐藏打印
参考与延伸阅读
- Variants（状态/交互等）：https://tailwindcss.com/docs/hover-focus-and-other-states
- Pseudo-class variants（group/peer）：https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state
- Accessibility（focus-visible）：https://tailwindcss.com/docs/hover-focus-and-other-states#focus-visible
- Arbitrary variants（媒体/支持）：https://tailwindcss.com/docs/hover-focus-and-other-states#arbitrary-variants