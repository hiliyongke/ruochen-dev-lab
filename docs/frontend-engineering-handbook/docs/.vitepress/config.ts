import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '深入浅出之 前端工程化 手册',
  description: '规范-流程-校验-自动化-度量-最佳实践的完整闭环',
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/intro' },
      {
        text: '版本',
        items: [
          { text: '最新（v1）', link: '/' },
          // 如有历史版本站点可替换为各版本 base 路径
          { text: '历史版本', link: 'https://github.com/your-org/your-repo/releases' }
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '概览',
          items: [
            { text: '开篇：为什么要工程化', link: '/guide/intro' },
            { text: '核心概念与目标', link: '/guide/concepts' },
            { text: '工具链选型与组合', link: '/guide/toolchain' }
          ]
        },
        {
          text: '构建与质量',
          items: [
            { text: 'Vite 与 Webpack 实战', link: '/guide/bundlers' },
            { text: 'ESLint / Prettier / Stylelint', link: '/guide/lint' },
            { text: '测试与质量矩阵', link: '/guide/tests' },
            { text: '性能与预算', link: '/guide/performance' },
            { text: '可访问性与国际化', link: '/guide/a11y-i18n' }
          ]
        },
        {
          text: '流程与协作',
          items: [
            { text: '提交规范与自动校验', link: '/guide/commit' },
            { text: '版本语义与自动发布', link: '/guide/release' },
            { text: '依赖与版本治理', link: '/guide/dependency' },
            { text: 'Monorepo 工作流', link: '/guide/monorepo' },
            { text: 'CI/CD 实践', link: '/guide/ci' },
            { text: '安全与合规', link: '/guide/security' },
            { text: '环境与配置治理', link: '/guide/configuration' },
            { text: 'SSR/SSG 与微前端', link: '/guide/ssr-ssg-microfrontends' },
            { text: 'CDN 与缓存工程', link: '/guide/cdn-caching' },
            { text: '库发布最佳实践', link: '/guide/library-publishing' },
            { text: '运行时观测与错误追踪', link: '/guide/observability' }
          ]
        }
      ]
    },
    outline: [2, 3],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/your-repo' }
    ],
    editLink: {
      pattern: 'https://github.com/your-org/your-repo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    lastUpdatedText: '上次更新'
  }
})