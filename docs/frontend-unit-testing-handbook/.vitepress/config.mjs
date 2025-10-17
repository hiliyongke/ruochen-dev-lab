import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '深入浅出之 前端单元测试 手册',
  description: '前端单元测试实践与指南',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '目录', link: '/SUMMARY' },
      { text: 'README', link: '/README' }
    ],
    sidebar: [
      {
        text: '章节',
        items: [
          { text: '序言：为什么需要前端单元测试', link: '/chapters/00-preface' },
          { text: '总览速读（10 分钟掌握要点）', link: '/chapters/00a-overview-quickstart' },
          { text: '测试全景与术语速览', link: '/chapters/01-overview' },
          { text: '测试金字塔与分层策略图解', link: '/chapters/01a-testing-pyramid' },
          { text: '项目与工具选择', link: '/chapters/02-tooling' },
          { text: '工具与框架对比表', link: '/chapters/02a-tools-comparison' },
          { text: 'Jest 与 Vitest 快速上手', link: '/chapters/03-jest-vitest' },
          { text: '断言、Mock、Spy、Stub 体系', link: '/chapters/04-assertions-mocks' },
          { text: '异步、计时器与网络请求测试', link: '/chapters/05-async-and-timers' },
          { text: 'DOM/组件测试（Testing Library）', link: '/chapters/06-dom-testing' },
          { text: '覆盖率与质量度量', link: '/chapters/07-coverage' },
          { text: '用 TDD/BDD 驱动设计', link: '/chapters/08-tdd-bdd' },
          { text: 'CI/CD 集成与分层策略', link: '/chapters/09-ci-cd' },
          { text: 'React 与 Vue 的测试实践', link: '/chapters/10-react-vue-testing' },
          { text: '工程化与团队最佳实践', link: '/chapters/11-best-practices' },
          { text: '最佳实践清单（Checklist）', link: '/chapters/11a-best-practices-checklist' },
          { text: '常见坑与诊断思路', link: '/chapters/12-common-pitfalls' },
          { text: '实战案例：从 0 给组件库补测试', link: '/chapters/13-case-study' },
          { text: '附录：速查表与规范模板', link: '/chapters/14-cheatsheet' },
          { text: '高阶专题：变异/性质/契约/Monorepo', link: '/chapters/15-advanced-topics' },
          { text: '网络请求模拟与隔离（MSW）', link: '/chapters/16-msw-network-mocking' },
          { text: '可访问性测试（a11y）实践', link: '/chapters/17-accessibility-testing' },
          { text: '组件级 E2E：Playwright Component Testing', link: '/chapters/18-playwright-component-testing' },
          { text: '差异覆盖门禁脚本（PR 变更集）', link: '/chapters/19-changed-coverage-script' },
          { text: 'SSR 场景下的单元测试策略', link: '/chapters/20-ssr-testing-strategies' },
          { text: '状态管理层测试（Redux/Pinia/Vuex 等）', link: '/chapters/21-state-management-testing' },
          { text: '前端安全测试（XSS/CSRF/Clickjacking 等）', link: '/chapters/24-security-testing' },
          { text: '测试数据管理：Factory 与 Fixtures', link: '/chapters/25-test-data-factory-fixtures' },
          { text: '前端日志与可观测性测试', link: '/chapters/22-observability-logging-testing' },
          { text: 'Mock 策略选型与维护', link: '/chapters/23-mock-strategy-and-maintenance' },
          { text: 'Hook/Composable 测试模式（React/Vue）', link: '/chapters/26-hooks-composables-testing' },
          { text: '特性开关与灰度测试（Feature Flags）', link: '/chapters/27-feature-flags-testing' },
          { text: 'Flaky 测试治理与稳定性工程', link: '/chapters/32-flaky-tests-governance' },
          { text: '依赖与供应链安全测试', link: '/chapters/33-dependency-supply-chain-testing' },
          { text: '表单与验证测试（Form & Validation）', link: '/chapters/30-form-and-validation-testing' },
          { text: '国际化/本地化测试（i18n/L10n）', link: '/chapters/31-i18n-l10n-testing' },
          { text: '前端性能测试与预算（Performance Budget）', link: '/chapters/28-performance-budget-testing' },
          { text: '视觉回归测试（Visual Regression）', link: '/chapters/29-visual-regression-testing' }
        ]
      },
      {
        text: '附加文档',
        items: [
          { text: 'README', link: '/README' },
          { text: '目录 (SUMMARY)', link: '/SUMMARY' }
        ]
      },
      {
        text: '示例',
        items: [
          { text: '示例总览', link: '/examples/index' },
          { text: 'React 基础', link: '/examples/react-basic/' },
          { text: 'Vue3 基础', link: '/examples/vue3-basic/' },
          { text: 'Next.js 基础', link: '/examples/nextjs-basic/' },
          { text: 'Next.js 应用', link: '/examples/nextjs-app/' },
          { text: 'Nuxt 基础', link: '/examples/nuxt-basic/' },
          { text: 'Nuxt 应用', link: '/examples/nuxt-app/' },
          { text: 'Node + MSW', link: '/examples/node-msw/' }
        ]
      }
    ]
  }
})