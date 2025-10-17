# 附录：术语对照与版本差异

一、术语中英对照
- 原子类：Utility / Atomic Class
- 变体：Variant（如 hover:, focus:, sm:, md:）
- 任意值：Arbitrary Values（如 w-[42px], bg-[#0ea5e9]）
- 设计令牌：Design Token
- 主题化：Theming
- 暗色模式：Dark Mode
- 内容扫描：Content Scanning（tailwind.config.js → content）
- 白名单/安全列表：Safelist
- 插件：Plugin
- 指令：Directives（@tailwind, @layer, @apply）
- 预设：Presets
- 基线节奏：Baseline Rhythm
- 可访问性：Accessibility (A11y)
- 首屏无闪烁暗色：No-FOUC Dark Strategy
- 构建裁剪：Tree-shaking / Purge（Tailwind v3+ 中由 JIT 与 content 扫描驱动）

二、Tailwind 版本差异要点（v2 → v3+）
- JIT：
  - v2：JIT 为可选插件/模式
  - v3+：JIT 默认内置，任意值与变体能力大幅增强
- 内容扫描（content）：
  - v2：多使用 purge 配置
  - v3+：统一使用 content 字段；推荐更精确的文件匹配
- 暗色模式（dark mode）：
  - v2/v3：均支持 'media' 与 'class'；v3 社区更偏向 'class'（可控/可持久化）
- 任意值：
  - v3+：广泛可用且稳定（如 bg-[#123456]/50, [mask-image:url(...)]）
- 变体扩展：
  - v3+：支持数据/ARIA/容器/motion 安全等更多变体前缀
- 插件生态：
  - typography/forms/line-clamp 等官方插件保持活跃，v3+ 与 JIT 协作更好
- 开发体验：
  - v3+：JIT 实时生成；开发期几乎“无限类”，生产需保证类名可静态分析

三、团队落地建议速查
- 类名规范：顺序（布局→尺寸→颜色→交互→变体）、避免运行期拼接
- 令牌与刻度：色彩/间距/字级统一，任意值受控使用
- 组件抽象：@layer components 封装稳定组合，页面层以原子类为主
- 暗色策略：使用 'class' + 本地持久化；提供“系统/亮/暗”三态
- 内容扫描：覆盖所有模板/组件/文档；动态类场景配合 safelist
- 构建产物：持续监控 CSS 体积；建立 CI 门禁
- 可访问性：focus-visible、语义标签、对比度、键盘可达

四、参考链接
- 官网文档：https://tailwindcss.com/docs
- 优化生产构建：https://tailwindcss.com/docs/optimizing-for-production
- 变体与状态：https://tailwindcss.com/docs/hover-focus-and-other-states
- 暗色模式：https://tailwindcss.com/docs/dark-mode
- 官方插件：https://github.com/tailwindlabs