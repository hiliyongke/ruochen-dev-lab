import { defineConfig } from 'vitepress'
import { webcrypto as _webcrypto } from 'node:crypto'

// Polyfill Web Crypto for Node build (vite/vitepress may expect globalThis.crypto)
if (!(globalThis as any).crypto && _webcrypto) {
  ;(globalThis as any).crypto = _webcrypto as any
}

export default defineConfig({
  title: '深入浅出之 React',
  description: 'React 19 实战与原理、工程化与最佳实践',
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      { text: '发布汇总', link: '/publish/summary' },
      { text: '小册简介', link: '/publish/intro' },
      { text: '亮点卖点', link: '/publish/highlights' },
      { text: '目录', link: '/publish/table-of-contents' },
    ],
    sidebar: [
      {
        text: '绪论',
        items: [
          { text: '小册简介', link: '/publish/intro' },
          { text: '亮点卖点', link: '/publish/highlights' },
          { text: '目录', link: '/publish/table-of-contents' },
        ],
      },
      {
        text: '章节',
        items: [
          { text: '第0章 阅读指南与环境准备', link: '/00-reading-guide-and-setup' },
          { text: '第1章 从零认识 React', link: '/01-intro-react' },
          { text: '第2章 Hooks 核心与陷阱（样章）', link: '/02-hooks-core' },
          { text: '第3章 组件通信与组合模式', link: '/03-communication-state-lifting-context-composition' },
          { text: '第4章 路由与代码分割', link: '/04-routing-and-code-splitting' },
          { text: '第5章 数据获取与缓存', link: '/05-data-fetching-and-caching' },
          { text: '第6章 表单与校验', link: '/06-forms-and-controlled-uncontrolled' },
          { text: '第7章 性能优化与并发特性', link: '/07-performance-optimization' },
          { text: '第8章 可复用性与自定义 Hooks', link: '/08-reusability-and-custom-hooks' },
          { text: '第9章 状态管理选型', link: '/09-state-management-selection' },
          { text: '第10章 可访问性与国际化', link: '/10-a11y-and-i18n' },
          { text: '第11章 测试与质量', link: '/11-testing-and-quality' },
          { text: '第12章 工程化与部署', link: '/12-engineering-and-deploy' },
          { text: '第13章 React 19 与 RSC/Actions 实战', link: '/13-react-19-and-rsc-actions' },
        ],
      },
      {
        text: '附录',
        items: [
          { text: '术语表', link: '/appendix-terminology-glossary' },
          { text: '风格与结构检查清单', link: '/style-structure-checklist' },
          { text: '示例索引（章节映射）', link: '/appendix/examples-map' },
          { text: '面试题精选', link: '/appendix/interview-questions' },
        ],
      },
    ],
    outline: 'deep',
    lastUpdated: {
      text: '最近更新',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short' }
    },
  },
})