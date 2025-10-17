export default {
  title: '深入浅出之 ECMAScript 手册',
  description: '现代 JavaScript 指南',
  lang: 'zh-CN',
  sitemap: { hostname: 'https://hiliyongke.github.io/ruochen-dev-lab' },
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    ['meta', { name: 'theme-color', content: '#0ea5e9' }],
    ['meta', { name: 'keywords', content: 'ECMAScript, JavaScript, ES6+, ES2024, 前端手册, 现代JS, 教程' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '深入浅出之 ECMAScript 手册' }],
    ['meta', { property: 'og:description', content: '从基础到进阶的现代 JavaScript 指南' }],
    ['meta', { property: 'og:image', content: 'https://hiliyongke.github.io/ruochen-dev-lab/og-cover.png' }],
    ['meta', { name: 'twitter:image', content: 'https://hiliyongke.github.io/ruochen-dev-lab/og-cover.png' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  markdown: { mermaid: true },
  themeConfig: {
    lastUpdated: true,
    lastUpdatedText: '上次更新',
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
      { text: '主题导航', link: '/guide/topics-overview' },
      { text: '术语表', link: '/guide/glossary' },
      { text: 'FAQ', link: '/guide/faq' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '介绍',
          items: [
            { text: '手册简介', link: '/guide/introduction' },
          ]
        },
        {
          text: 'ES6 核心特性',
          items: [
            { text: 'let 和 const', link: '/guide/es6-let-const' },
            { text: '箭头函数', link: '/guide/es6-arrow-functions' },
            { text: '解构赋值', link: '/guide/es6-destructuring' },
            { text: '模板字符串', link: '/guide/es6-template-literals' },
            { text: '函数的扩展', link: '/guide/es6-function-extensions' },
            { text: '对象的扩展', link: '/guide/es6-object-extensions' },
            { text: 'Promise', link: '/guide/es6-promise' },
            { text: '模块化 (Modules)', link: '/guide/es6-modules' },
            { text: '类 (Classes)', link: '/guide/es6-classes' },
            { text: 'Set 和 Map', link: '/guide/es6-set-map' },
            { text: 'Symbol 和 Iterator', link: '/guide/es6-symbol-iterator' },
          ]
        },
        {
          text: '现代异步编程',
          items: [
            { text: 'async/await', link: '/guide/es2017-async-await' },
          ]
        },
        {
          text: '后续版本特性 (ES2016+)',
          items: [
            { text: 'ES2016', link: '/guide/es2016' },
            { text: 'ES2017', link: '/guide/es2017' },
            { text: 'ES2018', link: '/guide/es2018' },
            { text: 'ES2019', link: '/guide/es2019' },
            { text: 'ES2020', link: '/guide/es2020' },
            { text: 'ES2021', link: '/guide/es2021' },
            { text: 'ES2022', link: '/guide/es2022' },
            { text: 'ES2023', link: '/guide/es2023' },
            { text: 'ES2024', link: '/guide/es2024' },
          ]
        },
        {
          text: '展望未来：TC39 提案',
          items: [
            { text: 'Stage 3 特性', link: '/guide/future-features' }
          ]
        },
        {
          text: '主题导航（草案）',
          items: [
            { text: '语言语义基础', link: '/guide/language-semantics' },
            { text: '迭代与生成器', link: '/guide/iteration-generators' },
            { text: '元编程与反射', link: '/guide/metaprogramming-reflection' },
            { text: '二进制与性能', link: '/guide/binary-performance' },
            { text: '正则全面指南', link: '/guide/regex-guide' },
            { text: '模块与打包', link: '/guide/modules-bundling' },
            { text: '时间与国际化', link: '/guide/time-i18n' },
            { text: '数值与大整数', link: '/guide/numbers-bigint' },
            { text: '集合与内置类型深潜', link: '/guide/collections-deep-dive' },
            { text: '错误处理与调试', link: '/guide/error-debugging' },
            { text: '内存与资源管理', link: '/guide/memory-resource' },
            { text: '工具链与兼容性', link: '/guide/tooling-compat' },
            { text: '主题总览', link: '/guide/topics-overview' },
            { text: '术语词汇表', link: '/guide/glossary' },
            { text: '风格指南', link: '/guide/style-guide' },
            { text: 'FAQ', link: '/guide/faq' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hiliyongke/ruochen-dev-lab.git' } // 这里可以替换成你的 GitHub 仓库地址
    ],
    cleanUrls: true
  }
}