# 12. 发布与导出（静态站点与 PDF）

你将学到什么
- 将本小册 Markdown 内容生成可浏览的静态站点
- 在 GitHub Pages / EdgeOne Pages 等平台发布
- 将整册导出为 PDF（单章与整合版）
- 发布前的质量检查清单

前置知识
- 目录与章节已成稿（docs/*.md，assets/*）
- 熟悉命令行与 Node.js 基础

一、发布目标与路线
- 目标：读者可在线阅读（站点）、可离线阅读（PDF）
- 常用路线：
  1) 文档框架：VitePress（推荐）/ Docusaurus / Nextra
  2) 纯静态：使用现有示例 + 简单索引页（快速但无搜索/目录）
  3) PDF：md-to-pdf / Pandoc / 浏览器打印（带目录与样式）

二、VitePress 快速路径（推荐）
特点：轻量、Markdown 友好、默认主题优秀、易于定制。

1) 安装
```bash
npm init -y
npm i -D vitepress@latest
```

2) 目录结构（建议）
```
.
├─ docs/                  # 小册章节（已存在）
├─ assets/                # 图片与示例资源（已存在）
└─ .vitepress/
   ├─ config.mjs
   └─ theme/              # 可选：自定义主题
```

3) 基本配置（.vitepress/config.mjs）
```js
export default {
  title: '深入浅出之 Tailwind CSS',
  description: '参考掘金小册风格的系统教程',
  lang: 'zh-CN',
  themeConfig: {
    nav: [{ text: 'GitHub', link: 'https://github.com/...' }],
    sidebar: [
      { text: '导言', link: '/01-intro-and-usage' },
      { text: '基础篇', items: [
        { text: '02 核心概念与原子类心智模型', link: '/02-core-concepts-and-mental-model' },
        { text: '03 布局体系：Flex/Grid 实战', link: '/03-layouts-flex-grid' },
        { text: '04 响应式与状态/交互变体', link: '/04-responsive-and-variants' },
        { text: '05 复用与抽象：@apply、组件化与约束', link: '/05-reuse-apply-components-constraints' },
      ]},
      { text: '进阶篇', items: [
        { text: '06 设计系统落地：色彩/间距/排版策略', link: '/06-design-system-colors-spacing-typography' },
        { text: '07 主题化与暗色模式', link: '/07-theming-and-dark-mode' },
        { text: '08 指令与插件体系', link: '/08-directives-and-plugins' },
        { text: '09 自定义配置与约束', link: '/09-configuration-and-constraints' },
      ]},
      { text: '实战与优化', items: [
        { text: '10 中型页面实战', link: '/10-case-study-medium-page' },
        { text: '11 构建裁剪、JIT、生产优化与调试清单', link: '/11-build-jit-optimization-and-debugging' },
        { text: '12 发布与导出', link: '/12-publish-and-export' },
        { text: '附录 术语对照与版本差异', link: '/appendix-terminology-and-version-diffs' },
      ]}
    ],
    outline: 'deep',
    search: { provider: 'local' }
  },
  srcDir: 'docs',
  cleanUrls: true
}
```

4) 启动与构建
```bash
npx vitepress dev      # 开发预览
npx vitepress build    # 生成 dist/ 静态产物
npx vitepress preview  # 本地预览 dist/
```

三、Docusaurus / Nextra（可选）
- Docusaurus：适合大型文档、版本化、多语言；需要 React 生态与 Node 环境，初学配置略重。
- Nextra：Next.js 社区方案，适合需要强扩展/MDX 的团队，部署在平台（Vercel/EdgeOne Pages）也很顺手。

四、纯静态最小路径（无框架）
- 适用：快速内网分发或一次性分享
- 做法：手写一个 index.html，把 docs/*.md 的关键章节转换为 HTML（可借助 VS Code Markdown 导出或简单的 markdown-it 脚本），assets/ 直接引用
- 限制：缺少站内搜索、侧边栏、主题切换等高级能力

五、部署方案
1) GitHub Pages
- 推送 dist/ 到 gh-pages 分支（或在仓库设置 Pages 指向 /docs）
- 典型命令（使用 gh-pages 工具）：
```bash
npm i -D gh-pages
# package.json
# "scripts": { "deploy": "gh-pages -d dist" }
npm run build
npm run deploy
```

2) EdgeOne Pages（适配边缘加速）
- 思路：使用 Pages 控台创建项目，绑定仓库，设置构建命令与输出目录（dist）
- 优点：节点覆盖广、自动 HTTPS、支持自定义域名与边缘缓存
- 注意：若使用 Next.js/Nextra 全栈模式，需配置 Functions/Edge Functions 目录与 Node 版本

3) 其他平台
- Vercel/Netlify/OSS 静态托管均可，核心是：产物目录 dist/ + 正确的根路径与路由策略

六、PDF 导出路径
1) md-to-pdf（基于 Puppeteer）
```bash
npm i -D md-to-pdf
# 单章
npx md-to-pdf docs/01-intro-and-usage.md
# 批量（示例）
npx md-to-pdf docs/*.md --stylesheet=./pdf.css --basedir=.
```
- 可选：自定义 pdf.css 控制页面尺寸、页眉页脚、代码块样式
- 优点：所见即所得，易集成 CI

2) Pandoc（高可定制）
```bash
# 安装后执行
pandoc docs/*.md -o book.pdf --from markdown+lists_without_preceding_blankline --pdf-engine=xelatex -V CJKmainfont="Noto Serif CJK SC"
```
- 优点：学术级排版，目录/索引/引用完整；学习成本较高

3) 浏览器打印为 PDF
- 先启动文档站（VitePress），在浏览器“打印 → 保存为 PDF”
- 建议：针对打印媒体添加样式（print: 类、隐藏导航与交互）

七、发布前质量检查清单
- 内容
  - 章节顺序与侧边栏链接一致
  - 代码示例可复制运行（CDN 链接有效）
  - 图片路径正确、可访问
- 视觉与可用性
  - 亮/暗模式对比度达标（WCAG AA 建议）
  - 移动端排版与字号/间距舒适
  - 站内搜索是否可用
- 技术
  - 构建无错误、dist 目录完整
  - 部署环境的根路径/域名/HTTPS 正常
  - 生产日志与监控（可选：统计/埋点）
- PDF
  - 目录可用、页码正确、长代码换行策略合适
  - 关键图示清晰（必要时使用矢量或高分辨率）

小结
- 推荐使用 VitePress 生成站点，GitHub Pages/EdgeOne Pages 部署
- PDF 导出优先 md-to-pdf；对排版要求高时使用 Pandoc
- 建立“发布清单 + CI 流程”可降低回归成本