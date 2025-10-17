# Jest 与 Vitest 快速上手

最小示例：纯函数测试（Vitest/Jest 通用）
```ts
// sum.ts
export function sum(a: number, b: number) { return a + b; }
```

```ts
// sum.test.ts
import { describe, it, expect } from "vitest"; // 或从 jest 引入全局
import { sum } from "./sum";

describe("sum", () => {
  it("adds two numbers", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

运行：
- Vitest: npx vitest
- Jest: npx jest

常用断言：
- toBe/toEqual：基本类型 vs 深比较
- toContain/toHaveLength：集合
- toThrow：异常
- resolves/rejects：异步

测试结构：
- describe 分组，it/test 表达行为
- beforeEach/afterEach 做清理
- 只跑一个用例：it.only；临时跳过：it.skip

TypeScript 支持：
- Vitest 原生支持 TS
- Jest 需 ts-jest 或 babel-jest

配置与环境要点：
- Vitest（vitest.config.ts）
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom', // 组件测试
    setupFiles: ['test/setup.ts'],
    coverage: { reporter: ['text', 'html'], provider: 'v8', all: true, thresholds: { lines: 85, statements: 85 } }
  }
});
```
- Jest（jest.config.js）
```js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  coverageThreshold: { global: { lines: 85, statements: 85 } },
  transform: { '^.+\\.(t|j)sx?$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-typescript'] }] }
};
```

并发与隔离：
- Vitest 支持 test.concurrent 与 describe.concurrent，加速纯函数测试；涉及共享状态时避免并发或加锁
- 使用 beforeEach/afterEach 做清理，避免用例间污染；推荐通过依赖注入隔离外部依赖（时间/随机/网络/存储）
- 模块隔离：vi.mock('module') + 动态导入保持 hoist 规则；Jest 有自动 mock 与手动 mock，两者策略不同

计时器与异步模式：
```ts
import { it, expect, vi } from 'vitest';
it('debounce runs once after 300ms', () => {
  vi.useFakeTimers(); // modern timers
  const fn = vi.fn();
  // debounce 示例略
  vi.advanceTimersByTime(299); expect(fn).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);   expect(fn).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
```
- 推荐使用现代 fake timers（Vitest/Jest 默认）以获得稳定行为；对 Promise+setTimeout 组合注意微任务与宏任务顺序

覆盖率与变更集策略：
- 本地：Vitest `vitest run --coverage`，Jest `jest --coverage`
- CI 门禁：设置 coverageThreshold（Jest）或 thresholds（Vitest）；建议按“整体阈值 + 关键目录更高阈值”
- 变更集：在 CI 中对比变更文件（git diff）并优先运行受影响测试；结合 Codecov/覆盖率评论对 PR 做增量检查

TS/ESM 常见兼容：
- Vitest 原生 TS/ESM 友好；Jest 在 ESM 场景需配置 transform 与 `"type":"module"` 的兼容（或使用 babel-jest）
- 对 ESM 模块 mock：Vitest 中使用 `vi.mock('module', async () => ({ default: ... }))`；注意顶层 await/动态导入的时序

示例化片段（Mock 差异点）：
```ts
// Vitest
vi.mock('./api', () => ({ fetchUser: async (id) => ({ id, name: 'Alice' }) }));
const { getUserName } = await import('./service');
await expect(getUserName('1')).resolves.toBe('Alice');

// Jest
jest.mock('./api', () => ({ fetchUser: async (id) => ({ id, name: 'Alice' }) }));
const { getUserName } = require('./service');
await expect(getUserName('1')).resolves.toBe('Alice');
```