import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '深入浅出之Vue手册',
  description: '一套完整的Vue.js学习资料，包含详细的技术文档和配套的Demo项目',
  
  // 主题配置
  themeConfig: {
    logo: '/logo.svg',
    
    // 导航栏配置
    nav: [
      { text: '首页', link: '/' },
      { text: '开始学习', link: '/guide/getting-started' },
      { text: 'Demo项目', link: '/demo/' },
      { text: 'GitHub', link: 'https://github.com' }
    ],
    
    // 侧边栏配置
    sidebar: {
      '/guide/': [
        {
          text: '入门指南',
          items: [
            { text: '开始使用', link: '/guide/getting-started' },
            { text: '项目结构', link: '/guide/project-structure' }
          ]
        }
      ],
      '/': [
        {
          text: 'Vue核心概念',
          collapsible: true,
          items: [
            { text: '1. 基础概念', link: '/01-basic-concepts' },
            { text: '2. 组件开发', link: '/02-component-development' },
            { text: '3. 状态管理', link: '/03-state-management' }
          ]
        },
        {
          text: '进阶特性',
          collapsible: true,
          items: [
            { text: '4. 路由管理', link: '/04-routing-management' },
            { text: '5. Composition API', link: '/05-Composition-API' },
            { text: '6. 高级特性', link: '/06-advanced-features' }
          ]
        },
        {
          text: '最佳实践',
          collapsible: true,
          items: [
            { text: '7. 性能优化', link: '/07-performance-optimization' },
            { text: '8. 测试和调试', link: '/08-testing-debugging' },
            { text: '9. 项目实战', link: '/09-project-practice' },
            { text: '10. 最佳实践', link: '/10-best-practices' }
          ]
        }
      ]
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],
    
    // 页脚配置
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Vue Handbook Team'
    },
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/edit/main/docs/:path',
      text: '在GitHub上编辑此页面'
    },
    
    // 最后更新时间
    lastUpdatedText: '最后更新',
    
    // 搜索配置
    search: {
      provider: 'local'
    }
  },
  
  // Markdown配置
  markdown: {
    lineNumbers: true,
    config: (md) => {
      // 可以添加markdown插件
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    host: 'localhost'
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  
  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'keywords', content: 'Vue,Vue.js,VitePress,文档,教程,手册' }],
    ['meta', { name: 'author', content: 'Vue Handbook Team' }]
  ]
})