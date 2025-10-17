# 05. 复用与抽象：@apply、组件化与约束

你将学到什么
- 在不丢失 Utility-First 的前提下进行适度抽象
- 使用 @apply 与 @layer components/utilities 封装复用样式
- 设计令牌（Design Tokens）与 CSS 变量在 Tailwind 中的结合
- 预设（presets）与插件（plugins）的组织方式（概念级）
- 代码约束与规范：eslint-plugin-tailwindcss、类名顺序与审查清单

前置知识
- 已掌握第 01~04 章内容（原子类、响应式/变体、布局）
- 了解 Tailwind CDN 或构建链路；本章示例使用 CDN 的 @layer/@apply 能力

为什么需要它（问题驱动）
- 随着页面增长，一些“稳定组合”在多处重复出现
- 需要在保持刻度一致的前提下，封装按钮、卡片、表单等复用样式
- 同时必须建立“约束”，避免抽象过度与类名漂移

一、适度抽象的原则
- 先以原子类拼装，真正高频/稳定后再抽象
- 抽象产物表达“意图”而非“细节”，例如 .btn-primary 表达语义，细节仍可用类名微调
- 抽象承载“设计令牌”，例如颜色、间距、圆角、阴影刻度

二、@apply 与 @layer：封装组件/工具类
- @layer components：放置组件级封装（.btn、.card 等）
- @layer utilities：扩展工具类（如 .content-auto 的微型工具）
- @apply：把 Utility 组合成类，保留可读性与可覆盖性（后续类可继续覆盖）

示例（完整示例见 assets/examples/05-reuse-apply.html）
```html
<!-- 使用 CDN 时可在 style[type="text/tailwindcss"] 中书写 -->
<style type="text/tailwindcss">
  @layer components {
    .btn {
      @apply inline-flex items-center gap-2 rounded-md px-4 py-2 font-semibold transition-colors;
    }
    .btn-primary {
      @apply bg-emerald-600 text-emerald-950 hover:bg-emerald-500;
    }
    .btn-secondary {
      @apply border border-slate-700 text-slate-200 hover:border-slate-500;
    }
  }

  @layer utilities {
    .content-auto { content-visibility: auto; }
  }
</style>

<button class="btn btn-primary">主按钮</button>
<button class="btn btn-secondary">次按钮</button>
```

三、设计令牌与 CSS 变量
- 令牌是“被命名的决策”，如 --brand、--radius、--spacing-3
- 在 Tailwind 中可用任意值语法配合 var() 使用
- 建议把令牌作用在组件封装中，页面层用原子类做微调

示例：全局令牌 + 任意值
```html
<style>
  :root {
    --brand: #3BA4F0;
    --brand-dark: #1E7FC1;
    --sidebar-w: 18rem;
  }
</style>

<!-- 令牌用在任意值上 -->
<a class="inline-flex items-center rounded-md px-4 py-2 font-semibold
           text-slate-900 bg-[var(--brand)] hover:bg-[var(--brand-dark)]">
  品牌按钮
</a>

<aside class="h-24 bg-slate-900 w-[var(--sidebar-w)] rounded-md"></aside>
```

四、预设与插件（概念）
- 预设（presets）：抽出一份 tailwind.config.js 的通用配置，在多个项目共享（色板、刻度、插件）
- 插件（plugins）：扩展新的工具类/组件，或注册复杂规则（例如排版、表单插件）
- 推荐：从“团队设计系统”导出 presets；项目按需叠加差异化

五、约束与规范（关键）
- 类名顺序：布局 → 尺寸/间距 → 颜色/阴影 → 交互/动画 → 变体
- 避免“无依据”的任意值；若必须，记录在设计令牌中
- 评审清单：
  1) 是否符合刻度与品牌色板
  2) 是否滥用任意值
  3) @apply 是否仅用于稳定组合
  4) 组件类命名是否表达意图（btn-primary 而非 green-button）
  5) 是否保留可访问状态（focus-visible 等）

六、工具与 ESLint
- 使用 eslint-plugin-tailwindcss：
  - tailwindcss/classnames-order 强制类名顺序
  - tailwindcss/no-custom-classname（可选，避免随意命名破坏统一）
- Prettier 插件整合，统一格式

可运行示例
- 见 assets/examples/05-reuse-apply.html：演示 @layer components 封装按钮/卡片、令牌驱动、utilities 扩展

常见坑
- 过度抽象导致“再微调要回退到原子类” → 抽象只承载稳定部分，细节仍留给原子类
- @apply 与后续类名覆盖顺序冲突 → 需要注意使用处的类名位置与权重
- CDN 环境忘记使用 type="text/tailwindcss" 的 style 标签 → 导致 @apply/@layer 无效
- 任意值散落各处 → 用 CSS 变量聚合，做到“有名有据”

小结
- Utility-First 仍是主体，@apply/@layer 用于“稳定组合”的可读性与可维护性
- 令牌让品牌语言可被复用、可被推导；预设/插件让团队共用基线
- 以规范与工具护航，避免抽象失控

练习
1) 用 @layer components 抽象 .card 组件（含内边距、圆角、边框、标题/正文样式），并提供 .card-hover 变体
2) 用 CSS 变量声明 --brand 与 --brand-dark，把按钮改为品牌色驱动并支持 hover
3) 扩展一个 utilities 类 .safe-area-p（iOS 浏览器场景），并在示例中验证
4) 为你的项目配置 eslint-plugin-tailwindcss 并开启类名顺序规则

参考与延伸阅读
- @apply: https://tailwindcss.com/docs/functions-and-directives#apply
- @layer: https://tailwindcss.com/docs/functions-and-directives#layer
- Plugins: https://tailwindcss.com/docs/plugins
- Design Tokens: https://designtokens.org/