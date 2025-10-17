import crypto from 'node:crypto';
import mdMermaidPkg from 'markdown-it-mermaid';

// 兼容不同导出格式
const mdMermaid = mdMermaidPkg && mdMermaidPkg.default ? mdMermaidPkg.default : mdMermaidPkg;

if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
  // Node 16 兼容补丁：为 mermaid/markdown-it-mermaid 提供 Web Crypto
  globalThis.crypto = crypto.webcrypto;
}

export default {
  title: '代码的坏味道',
  description: '前端技术学习手册 - 识别和重构JavaScript代码质量问题',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '开始学习', link: '/guide/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '引言',
          items: [
            { text: '什么是代码的坏味道', link: '/guide/00-introduction' }
          ]
        },
        {
          text: '代码坏味道分类',
          items: [
            { text: '1. 重复代码', link: '/guide/01-duplicate-code' },
            { text: '2. 过长函数', link: '/guide/02-long-method' },
            { text: '3. 过大的类', link: '/guide/03-large-class' },
            { text: '4. 过长参数列', link: '/guide/04-long-parameter-list' },
            { text: '5. 发散式变化', link: '/guide/05-divergent-change' },
            { text: '6. 霰弹式修改', link: '/guide/06-shotgun-surgery' },
            { text: '7. 依恋情结', link: '/guide/07-feature-envy' },
            { text: '8. 数据泥团', link: '/guide/08-data-clumps' },
            { text: '9. 基本类型偏执', link: '/guide/09-primitive-obsession' },
            { text: '10. switch语句', link: '/guide/10-switch-statements' },
            { text: '11. 平行继承体系', link: '/guide/11-parallel-inheritance-hierarchies' },
            { text: '12. 冗余类', link: '/guide/12-lazy-class' },
            { text: '13. 夸夸其谈未来性', link: '/guide/13-speculative-generality' },
            { text: '14. 临时字段', link: '/guide/14-temporary-field' },
            { text: '15. 消息链', link: '/guide/15-message-chains' },
            { text: '16. 中间人', link: '/guide/16-middle-man' },
            { text: '17. 不恰当的亲密关系', link: '/guide/17-inappropriate-intimacy' },
            { text: '18. 接口不同的等价类', link: '/guide/18-alternative-classes-with-different-interfaces' },
            { text: '19. 不完整的库类', link: '/guide/19-incomplete-library-class' },
            { text: '20. 数据类', link: '/guide/20-data-class' },
            { text: '21. 被拒绝的遗赠', link: '/guide/21-refused-bequest' },
            { text: '22. 过多的注释', link: '/guide/22-comments' },
            { text: '23. 魔法数字', link: '/guide/23-magic-numbers' },
            { text: '24. 循环复杂度', link: '/guide/24-cyclomatic-complexity' },
            { text: '25. 总结与最佳实践', link: '/guide/25-summary' }
          ]
        },
        {
          text: '附录',
          items: [
            { text: '工具与资源', link: '/guide/appendix-tools-resources' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ]
  },
  markdown: {
    lineNumbers: true,
    // 使用 markdown-it 插件方式渲染 mermaid，兼容 Node 16
    config: (md) => {
      md.use(mdMermaid);
    }
  },
  lastUpdated: true,
  ignoreDeadLinks: true
}