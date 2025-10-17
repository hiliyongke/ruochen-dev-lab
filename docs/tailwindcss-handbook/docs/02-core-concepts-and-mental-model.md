# 02. 核心概念与原子类心智模型

你将学到什么
- Utility-First（原子类优先）的心智模型与设计动线
- 设计刻度体系：颜色、间距、字号的“标尺”与取值规律
- JIT 引擎与任意值语法（arbitrary values）
- 变体（variants）与优先级：响应式/状态/并列冲突的处理
- 调试技巧与高效查找类名的方法

前置知识
- 基础 HTML/CSS/JS
- 了解 Tailwind 的 CDN 或构建使用方式（第 01 章）

为什么需要它（问题驱动）
- 传统 CSS 往往在“抽象 → 落地”之间来回切换，效率不稳定
- 原子类能把“抽象”前置为“设计刻度”，在 HTML 中直接拼装，所见即所得
- 通过统一刻度，跨团队能保持一致的视觉语言与代码风格

一、Utility-First 心智模型
- 单一含义的类名即一个“原子”样式，例如 px-4、text-sm、bg-slate-900
- 组件的外观来自若干原子类的组合，而非预先写好的 CSS 选择器
- 好处：切换成本低、复用强、命名负担小、读代码即可读样式

示例：按钮（类名即文档）
```html
<button class="inline-flex items-center rounded-md px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-500">
  提交
</button>
```

与 BEM/Utility CSS 的关系
- BEM 通过“命名”表达结构与状态；Tailwind 通过“组合原子类”表达外观
- 两者可共存：结构/语义用 BEM/组件命名，外观用原子类组合；避免在 Tailwind 中“再造 BEM”
- Utility CSS 是更广义概念；Tailwind 是工程化最完善的 Utility-First 实践之一

何时避免或收敛
- 同一组合反复出现时：抽到 @layer components 或使用 @apply（第05章）
- 任意值泛滥：优先使用刻度；任意值仅用于少量边界需求并沉淀为令牌
- 动态类名拼接：改用“映射表/白名单”（第11章），必要时配合 safelist pattern

典型使用场景
- 要求强定制、迭代频繁、跨人协作的中大项目（控制台、SaaS、营销页、内容站）
- 组件库难以覆盖的复杂视觉与交互
- 从设计系统/令牌到代码落地的一致性工程

反例与陷阱
- 在模板中构造 `bg-${color}-500` 动态类名 → 生产构建无法静态分析，样式被裁剪
- 用 Tailwind 写“深层级选择器的大段样式” → 违背原子类心智；应拆分元素并用组合表达
- 同一 UI 组合在多处复制粘贴 → 应抽象到组件层或 @layer

二、设计刻度（Scales）
Tailwind 为常见设计维度提供了“标尺”：
- 颜色：如 text-slate-300、bg-emerald-600（数字越大通常越深）
- 间距：p-4、px-6、mt-2（核心刻度：0, 0.5, 1, 1.5, 2, 2.5, ...，多以 4px 步进换算）
- 字号/行高：text-sm、text-lg、leading-6、tracking-wide 等
- 圆角/阴影：rounded、rounded-md、shadow、shadow-lg
遵循刻度意味着视觉设计“可度量”“可比较”，团队协作更稳。

示例：卡片间距与层次
```html
<article class="rounded-lg border border-slate-200/20 bg-white/5 p-4 shadow-sm">
  <h3 class="text-base font-semibold">标题</h3>
  <p class="mt-2 text-sm text-slate-300">内容说明...</p>
</article>
```

三、JIT 引擎与任意值语法
- JIT（Just-In-Time）会在扫描到类名时即时生成对应 CSS
- 任意值语法让你在刻度外“偶发”地自定义值，兼顾标准化与灵活性
  - 颜色：bg-[#0ea5e9]、text-[rgb(34,197,94)]
  - 间距/尺寸：w-[42rem]、p-[18px]、top-[10%]
  - 任意属性：content-['NEW']（仅搭配支持的属性前缀）
- 注意：生产构建需确保“内容扫描”能捕获这些类名（避免被裁剪掉）

示例：任意值
```html
<div class="w-[42rem] max-w-full bg-[linear-gradient(90deg,#0ea5e9,#22c55e)] text-white p-6 rounded-xl">
  任意尺寸 + 任意渐变
</div>
```

四、变体（Variants）与优先级
- 响应式前缀：sm:/md:/lg:/xl:/2xl:（断点从小到大）
- 状态/交互：hover:/focus:/active:/disabled:/focus-visible: 等
- 结构：first:/last:/odd:/even:/group-hover:/data-[state=open]: 等
- 书写顺序：多个变体可以链式组合，如 sm:hover:bg-emerald-600
- 优先级：Tailwind 原子类通常等权，后写覆盖前写；同元素出现冲突时，右侧类生效

示例：响应式 + 状态
```html
<a class="inline-block px-4 py-2 rounded-md bg-slate-800 text-slate-200
           sm:bg-slate-700 hover:bg-slate-600">
  自适应导航项
</a>
```

五、常用调试技巧
- class 按功能分段书写：布局类（flex/grid）→ 尺寸/间距 → 颜色/阴影 → 交互/动画
- 善用浏览器 DevTools：在元素上逐个开关类名观察差异
- 搜索类名：Tailwind 文档中搜索“关键词”即可找到对应类与刻度（如 “spacing scale”）
- 遇到覆盖冲突：调整类名顺序或拆分到更细粒度的元素

可运行示例
- 见 assets/examples/02-core-concepts.html（双击打开即可运行）
- 覆盖：刻度、响应式、状态变体、任意值、覆盖顺序等

最佳实践
- 以“设计刻度”为主，任意值为辅；避免全局泛滥的任意值破坏一致性
- 类名按“布局 → 外观 → 交互”的分层顺序组织，提升可读性
- 组件组合频繁时再考虑抽取（@apply/预设/约束将在后续章节说明）

常见坑
- 生产构建未正确扫描内容，导致类名被裁剪 → 配置 content 数组/Glob 正确覆盖模板源
- 任意值书写错误或被模板字符串拆散，JIT 无法识别 → 保持类名原子化、避免拼接
- 与第三方组件库样式冲突 → 利用更明确的结构/顺序，必要时使用 important（配置层面）

小结
- Utility-First 让样式组合更直观、更高效
- 通过刻度统一视觉语言，任意值解决少量边界需求
- 变体让响应式与交互自然融入同一书写体系

练习
1) 使用 spacing 刻度（p-、m-）与 text-*，制作一个两栏卡片栅格：sm: 单列，md: 双列
2) 为按钮添加 hover:/active:/disabled: 三种状态，并在 sm: 与 md: 显示不同配色
3) 使用任意值创建一个宽度为 36rem 的展示条，并在 hover 时改变背景为自定义渐变

参考与延伸阅读
- Spacing Scale: https://tailwindcss.com/docs/customizing-spacing
- Colors: https://tailwindcss.com/docs/customizing-colors
- Arbitrary values: https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values
- Variants: https://tailwindcss.com/docs/hover-focus-and-other-states