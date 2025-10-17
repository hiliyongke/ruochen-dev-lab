# 10. 中型页面实战（从稿到页、组件切分、交互与可访问性）

你将学到什么
- 从设计稿到页面的落地流程与分工
- 组件切分与命名策略（原子类为主，@layer 封装稳定组合）
- 响应式与暗色支持的一次性设计
- 常用交互（手风琴/选项切换/滚动吸顶）与可访问性要点
- 调试与验收清单

前置知识
- 已完成第 01~09 章与框架集成
- 熟悉 dark: 变体、设计令牌与 @layer 组件化

实战目标
- 交付一个“中型单页着陆页（Landing）”：导航、Hero、特性、价格、FAQ、页脚
- 要求：响应式（sm/md/lg）、暗色模式、键盘可达、对比度达标、类名规范

一、从稿到页（流程）
1) 信息架构：区块顺序与内容优先级（Hero → 信任背书/特性 → 价格 → FAQ → CTA → Footer）
2) 设计刻度定标：色板/间距/排版采用团队统一刻度（第 06 章）
3) 组件切分：Card/Button/Section/FAQItem；把稳定组合抽象为 @layer components
4) 原子类为主：页面层以 Tailwind 类组合为主，少量 @apply 增强可读性

二、组件切分与命名
- Button：.btn .btn-primary .btn-outline（第 05 章套路）
- Card：.card（圆角、边框、内边距）
- Section：.section（容器宽度、内边距与节奏）
- FAQItem：使用 details/summary 原生可访问组件 + data-state 辅助样式

三、交互与可访问性
- 键盘可达：focus-visible:ring-* 与按钮/链接的 :focus 样式
- 语义标签：header/main/section/article/footer、details/summary
- ARIA：aria-expanded（按钮）、aria-controls（面板）
- 动效可访问：motion-safe: animate-*；print: 隐藏非必要部分

四、可运行示例
- 见 assets/examples/10-case-study.html；可直接双击运行

五、调试与验收清单
- 视觉刻度：色/距/排版是否遵循团队刻度；组件外观是否一致
- 响应式：sm/md/lg 下的布局是否符合预期；溢出与断行是否合理
- 暗色：背景/文本/分隔线对比度是否达标（WCAG AA）
- 可访问性：Tab 遍历顺序、焦点可见、ARIA 状态同步
- 性能与体积：构建链路下开启内容裁剪、观察产物大小
- 类名规范：顺序与映射表实践；避免动态拼接

练习
1) 将特性区改为 2→3→4 列自适应，并为每个卡片增加图标与 hover 高亮
2) 为价格卡片增加“切换按月/按年”按钮，使用映射表控制价格文本
3) 将 FAQ 改为仅允许单开一项（点击当前项时关闭其他项）

参考
- HTML 语义与可访问性：https://developer.mozilla.org
- Tailwind A11y 实践：https://tailwindcss.com/docs/hover-focus-and-other-states#focus-visible
- Dark Mode：https://tailwindcss.com/docs/dark-mode