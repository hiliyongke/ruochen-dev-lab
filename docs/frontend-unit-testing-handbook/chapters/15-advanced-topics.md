# 高阶专题：变异测试、性质测试、契约与 Monorepo

本章旨在把“质量门禁”从覆盖率扩展到“测试有效性”和“协作边界稳定性”，并给出在大仓（Monorepo）下的工程化实践。

## 1) 变异测试（StrykerJS）
目标：检验测试是否能“杀死变异”，发现看似有覆盖但断言薄弱的代码。
- 核心指标：Mutation Score（建议 ≥ 60% 起步，逐步提升）
- 适用场景：核心算法库、关键分支逻辑、易漏断言模块

快速上手（Jest/Vitest 项目）：
```bash
# 安装
npm i -D @stryker-mutator/core @stryker-mutator/jest-runner # 或 @stryker-mutator/vitest-runner
# 初始化
npx stryker init
# 运行
npx stryker run
```
stryker.conf 示例要点：
- 仅对关键目录启用，避免全仓过慢
- 与 CI 集成，只在“关键包/变更集”下跑

优化建议：
- 避免依赖外部网络/时间：对异步与计时器使用假实现与可控时钟
- 与覆盖率联动：对 Mutation 失败的文件要求更严格的 Branch 覆盖

## 2) 契约测试（Pact）
目标：保证前后端/服务间的接口契约不被破坏，避免环境依赖导致的集成波动。
- Provider/Consumer 模式：前端作为 Consumer，后端作为 Provider
- 契约流转：前端生成 Pact 文件，上传至 Pact Broker；后端在 CI 中验证契约

前端消费端示例（思想）：
```ts
// api.ts
export async function getUser(id: string) {
  const r = await fetch(`/api/users/${id}`);
  if (!r.ok) throw new Error('bad');
  return r.json();
}
```
```ts
// api.pact.test.ts（使用 @pact-foundation/pact）
import { PactV3 } from '@pact-foundation/pact';
import path from 'node:path';
import { getUser } from './api';

const pact = new PactV3({
  dir: path.resolve(process.cwd(), 'pacts'),
  consumer: 'fe-app',
  provider: 'user-service'
});

it('contract: get user', async () => {
  pact.addInteraction({
    states: [{ description: 'user exists' }],
    uponReceiving: 'a request for user',
    withRequest: { method: 'GET', path: '/api/users/1' },
    willRespondWith: { status: 200, body: { id: '1', name: 'Neo' } }
  });
  await pact.executeTest(async (mockServer) => {
    const json = await (await fetch(mockServer.url + '/api/users/1')).json();
    expect(json).toMatchObject({ id: '1', name: 'Neo' });
  });
});
```
CI 集成与门禁：
- Consumer 侧在 PR 产出 pact 文件并推送 Broker
- Provider 侧在其 CI 拉取最新契约并验证；验证失败阻止上线
- 与 E2E 区分：契约测试更快、更稳定、定位更明确

## 3) Monorepo 测试与覆盖工程化
目标：在多包/多应用的大仓中，做到“只测受影响的模块”“高效合并报告”“差异覆盖门禁”。

关键策略：
- 受影响测试（Affected Only）：使用 Turborepo/Nx 的依赖图，只运行受影响包测试；简化版用路径过滤
- 覆盖合并：各包输出 lcov/info，根仓合并后上报（Codecov/自建私服）
- 差异门禁：结合 coverage json-summary + 变更文件列表，只校验变更集
- 缓存与并行：按包/目录并行跑，启用 pnpm store 和构建缓存

Turborepo（示例思路）：
```json
// turbo.json 片段
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "test": {
      "outputs": ["coverage/**"],
      "cache": true
    }
  }
}
```
```bash
# 只跑受影响
pnpm dlx turbo run test --filter="...[HEAD~1]"
```

Nx（示例思路）：
- 使用 nx affected:test 基于 git 计算受影响图
- 输出覆盖并在根目录汇总后上传（详见覆盖章节的“报告合并与上报”）

实践清单：
- 将“受影响测试 + 差异覆盖门禁”作为 PR 必选项
- 关键包单独设置更高阈值；对自动生成或第三方桥接代码建立豁免清单
- 统一 fake timers/MSW/随机种子，提升测试确定性，降低 Flaky

## 4) 与性质测试（fast-check）的协同（可选）
- 使用 fast-check 为关键纯函数引入“性质约束”，有效发现边界条件
- 与变异测试搭配可显著提高 Mutation Score

变异测试（Stryker）：
- 目的：用“变异”验证测试有效性，识别水测
- 使用：
  - 安装：npm i -D @stryker-mutator/core @stryker-mutator/vitest-runner
  - 配置 stryker.conf.json：
```json
{
  "$schema": "https://stryker-mutator.io/stryker.schema.json",
  "testRunner": "vitest",
  "mutate": ["src/**/*.ts?(x)"],
  "reporters": ["html", "progress"],
  "tempDirName": ".stryker-tmp"
}
```
- 关注 Mutation Score，优先提升关键模块的有效断言

性质测试（fast-check）：
- 通过随机生成满足性质的输入来找边界问题
```ts
import { test, expect } from 'vitest';
import fc from 'fast-check';
import { reverse } from './reverse';

test('reversing twice yields original', () => {
  fc.assert(
    fc.property(fc.string(), (s) => {
      expect(reverse(reverse(s))).toBe(s);
    })
  );
});
```

契约测试（Pact）：
- 前端作为 Consumer，与后端就接口契约达成一致，避免集成期才暴露不兼容
- 做法：在单元测试阶段用 Pact 生成 consumer 合同，并在后端 CI 校验
- 适用：BFF/微服务拆分明显的团队

组件级 E2E（Playwright Component Testing）：
- 介于单元与 E2E：在真实浏览器中测试组件行为与样式
- 适合：富交互/动画/可访问性验证
- 可与 Testing Library 查询结合提升可读性

快照测试的边界：
- 避免对大 DOM 全量快照；更推荐精确断言或最小化 inline snapshot
- 对动态时间/随机数，先稳定化（fake timers/seed）

Monorepo 测试策略（pnpm workspaces / Turborepo）：
- 每包各自 vitest.config.ts，根目录统一 task：pnpm -r test
- 基于依赖图的增量测试：仅运行受改动影响的包
- 覆盖率按包上报与汇总（Codecov 子项目/路径映射）

## 示例入口
- 变异测试：scripts/stryker.conf.json 与 package.json scripts: "stryker run"
- 性质测试：examples/react-basic/src/utils 纯函数 + tests/property.spec.ts
- 契约测试：pacts/ 与 api.pact.test.ts（Consumer 示例）
- Monorepo 受影响测试：turbo.json + pnpm dlx turbo run test --filter="...[HEAD~1]"

## Checklist
- [ ] 核心模块启用变异测试并设目标分数
- [ ] 关键纯函数添加性质测试用例
- [ ] 前后端契约测试接入 Broker 并在 CI 校验
- [ ] 受影响测试与覆盖合并在 Monorepo 生效

## 常见错误排查
- Stryker 运行极慢：缩小 mutate 范围到关键目录
- Pact 验证失败：检查契约版本匹配与字段严格度
- Monorepo 受影响测试无效：确认依赖图配置与过滤表达式