export default {
  title: '深入浅出之 Tailwind CSS',
  description: '参考掘金小册风格的系统教程',
  lang: 'zh-CN',
  srcDir: 'docs',
  cleanUrls: true,
  themeConfig: {
    nav: [
      // { text: 'Home', link: '/' },
      // 如需添加仓库地址，请替换为真实链接
      // { text: 'GitHub', link: 'https://github.com/...' }
    ],
    sidebar: [
      { text: '导言', link: '/01-intro-and-usage' },
      {
        text: '基础篇',
        items: [
          { text: '02 核心概念与原子类心智模型', link: '/02-core-concepts-and-mental-model' },
          { text: '03 布局体系：Flex/Grid 实战', link: '/03-layouts-flex-grid' },
          { text: '04 响应式与状态/交互变体', link: '/04-responsive-and-variants' },
          { text: '05 复用与抽象：@apply、组件化与约束', link: '/05-reuse-apply-components-constraints' }
        ]
      },
      {
        text: '进阶篇',
        items: [
          { text: '06 设计系统落地：色彩/间距/排版策略', link: '/06-design-system-colors-spacing-typography' },
          { text: '07 主题化与暗色模式', link: '/07-theming-and-dark-mode' },
          { text: '08 指令与插件体系', link: '/08-directives-and-plugins' },
          { text: '09 自定义配置与约束', link: '/09-configuration-and-constraints' }
        ]
      },
      {
        text: '实战与优化',
        items: [
          { text: '10 中型页面实战', link: '/10-case-study-medium-page' },
          { text: '11 构建裁剪、JIT、生产优化与调试清单', link: '/11-build-jit-optimization-and-debugging' },
          { text: '12 发布与导出', link: '/12-publish-and-export' },
          { text: '附录 术语对照与版本差异', link: '/appendix-terminology-and-version-diffs' }
        ]
      },
      {
        text: '框架集成',
        items: [
          { text: 'React 与 Vue 集成', link: '/framework-integration-react-and-vue' }
        ]
      }
    ],
    outline: 'deep',
    search: { provider: 'local' }
  }
}