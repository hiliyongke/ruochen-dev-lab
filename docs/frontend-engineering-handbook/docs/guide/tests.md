# 测试与质量矩阵

## 本章目的
- 建立从单元/组件测试到端到端测试（E2E）的质量闭环
- 提供可复制的工具配置、覆盖率阈值与 CI 集成方案

## 测试金字塔与矩阵
- 单元测试（Unit）：函数/工具，快速、稳定，数量最多（Vitest/Jest）
- 组件测试（Component）：UI 与交互，结合 DOM 测试库（RTL/Vue Test Utils）
- 集成测试（Integration）：模块/接口联动，可使用 MSW 模拟后端
- 端到端（E2E）：从页面到服务的用户路径验证（Playwright/Cypress）
- 非功能测试：可访问性（axe/Playwright a11y）、性能（Lighthouse CI）、安全扫描

推荐矩阵（最小闭环）
- Unit + Component：覆盖核心逻辑与关键交互
- E2E：覆盖关键业务路径与回归用例
- 覆盖率阈值：statements/branches/functions/lines ≥ 80%（按项目阶段调整）

## 复制清单
- Vitest 或 Jest（单测/组件测）
- React Testing Library / Vue Test Utils
- Playwright（E2E），截图/视频/trace 归档
- 覆盖率阈值与 CI 报告（Junit/HTML）

## 可运行示例：Vitest + React Testing Library
安装
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```
vitest.config.ts
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
});
```
test/setup.ts
```ts
import '@testing-library/jest-dom';
```
组件测试示例
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';

function Counter() {
  const [n, setN] = useState(0);
  return (
    <div>
      <span aria-label="value">{n}</span>
      <button onClick={() => setN(n + 1)}>inc</button>
    </div>
  );
}

test('counter works', () => {
  render(<Counter />);
  expect(screen.getByLabelText('value')).toHaveTextContent('0');
  fireEvent.click(screen.getByText('inc'));
  expect(screen.getByLabelText('value')).toHaveTextContent('1');
});
```

## 可运行示例：Vitest + Vue Test Utils
```bash
pnpm add -D vitest @vue/test-utils vue@^3 jsdom
```
vitest.config.ts 关键配置与上同，environment 使用 jsdom。
Vue 组件测试
```ts
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';

const Counter = defineComponent({
  setup() {
    const n = ref(0);
    return () => (
      <div>
        <span aria-label="value">{n.value}</span>
        <button onClick={() => (n.value += 1)}>inc</button>
      </div>
    );
  }
});

test('counter works', () => {
  const wrapper = mount(Counter);
  expect(wrapper.get('[aria-label="value"]').text()).toBe('0');
  wrapper.get('button').trigger('click');
  expect(wrapper.get('[aria-label="value"]').text()).toBe('1');
});
```

## 可运行示例：Jest（可选）
```bash
pnpm add -D jest @types/jest ts-jest jest-environment-jsdom
pnpm ts-jest config:init
```
jest.config.ts 片段
```ts
export default {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageReporters: ['text', 'html', 'lcov'],
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 }
  }
};
```

## 可运行示例：Playwright（E2E）
安装与初始化
```bash
pnpm create playwright@latest
```
playwright.config.ts 要点
```ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  use: { trace: 'on-first-retry', video: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]]
});
```
示例用例 e2e/example.spec.ts
```ts
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page).toHaveTitle(/工程化|Vite/i);
});
```

## 测试数据与隔离
- API Mock：MSW（Mock Service Worker）在单测/组件测试中模拟网络
- 固定时间/随机数：使用 fake timers/seeded randomness，保证可重复
- 清理副作用：每个用例前后清理 DOM/状态/文件

## CI 集成（GitHub Actions）
.github/workflows/test.yml
```yml
name: Test
on:
  pull_request:
  push: { branches: [main] }
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm i --frozen-lockfile
      - run: pnpm test -- --run
      - uses: actions/upload-artifact@v4
        with: { name: coverage-html, path: coverage }
  e2e:
    needs: unit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm i --frozen-lockfile
      - run: pnpm build
      - run: pnpm -w dlx serve dist -l 5173 & sleep 2
      - run: pnpm playwright install --with-deps
      - run: pnpm playwright test
      - uses: actions/upload-artifact@v4
        with: { name: playwright-report, path: playwright-report }
```

## CI 集成（GitLab CI）
.gitlab-ci.yml 片段
```yml
stages: [test, e2e]
unit:
  stage: test
  image: node:20
  script:
    - corepack enable && npm i -g pnpm
    - pnpm i --frozen-lockfile
    - pnpm test -- --run
  artifacts:
    paths: [coverage]
e2e:
  stage: e2e
  image: mcr.microsoft.com/playwright:v1.47.0-jammy
  script:
    - corepack enable && npm i -g pnpm
    - pnpm i --frozen-lockfile
    - pnpm build
    - pnpm -w dlx serve dist -l 5173 & sleep 2
    - pnpm playwright test
  artifacts:
    paths: [playwright-report]
```

## 报告与度量
- 覆盖率：text/html/lcov；在 CI 中归档 HTML，上传 lcov 到覆盖率服务（Codecov/GitLab）
- E2E 报告：Playwright HTML、trace、视频、截图作为制品
- 趋势：对比主分支覆盖率与失败用例 Top N，作为改进输入

## 常见坑与 FAQ
- “单测覆盖高但 Bug 仍多”：关注交互与边界值；用 E2E 覆盖关键路径
- “测试不稳定”：异步等待条件不足、依赖外部服务未 mock、时间/随机未固定
- “跑得慢”：并行化、拆分 job、只在主分支跑重型检查，PR 跑必要子集

## 参考链接
- Vitest: https://vitest.dev
- Testing Library: https://testing-library.com
- Vue Test Utils: https://test-utils.vuejs.org
- Jest: https://jestjs.io
- Playwright: https://playwright.dev