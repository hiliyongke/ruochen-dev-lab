# CI/CD 集成与分层策略

目标：
- PR 必跑测试，失败不得合并
- 覆盖率阈值守门
- 按层次分组加速（单元快、E2E 慢）

GitHub Actions 示例（Vitest）：
```yaml
name: test
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run test:run
```

缓存与加速：
- 使用 pnpm + 缓存 node_modules
- 拆分 job 并行（lint/test/build）

报告：
- 覆盖率产出 html 作 artifact
- 失败用例快照附加到 PR

矩阵与缓存（GitHub Actions 示例）：
```yaml
name: test
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ matrix.node }} }
      - uses: actions/cache@v4
        with:
          path: ~/.pnpm-store
          key: pnpm-${{ runner.os }}-${{ matrix.node }}-${{ hashFiles('pnpm-lock.yaml') }}
      - run: corepack enable
      - run: pnpm i --frozen-lockfile
      - run: pnpm test:run
      - name: Upload coverage html
        uses: actions/upload-artifact@v4
        with: { name: coverage-html, path: coverage }
```

覆盖率门禁与上报（Codecov）：
```yaml
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run test:run
      - name: Upload to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
          fail_ci_if_error: true
```

选择性测试（变更集）：
- 在 Monorepo 中优先运行受影响包的测试：根据 git diff 解析依赖图（Turborepo/Nx），或按路径过滤
```bash
# 简例：仅运行改动路径相关测试
CHANGED=$(git diff --name-only origin/main...HEAD | grep '^packages/' | cut -d/ -f2 | sort -u)
for PKG in $CHANGED; do pnpm --filter "packages/${PKG}" test:run; done
```

Flaky 处置：
- 先稳定测试（fake timers/seed/MSW/正确断言时机），重试只是兜底
- 记录不稳定用例并输出报表，阻止合并直至修复

GitLab CI 示例（Vitest + 覆盖与缓存）：
```yaml
stages: [lint, test]
variables:
  NODE_ENV: test
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .pnpm-store
    - node_modules/
test:
  stage: test
  image: node:20
  before_script:
    - corepack enable
    - pnpm i --frozen-lockfile
  script:
    - pnpm test:run
  artifacts:
    when: always
    paths:
      - coverage
    expire_in: 7 days
```

差异覆盖门禁（GitHub/GitLab 通用思路）：
- 在 CI 中先运行覆盖并生成 json-summary，然后用脚本比对变更文件（见“覆盖率章节：增量/差异覆盖门禁”）
- 若使用 Codecov，添加官方 Action 或 GitLab Uploader，并启用 PR/MR 状态检查（fail_ci_if_error: true）

选择性测试（变更集）在 CI：
- GitHub Actions：先计算变更路径，再分发到 matrix 中并行执行（大仓库加速明显）
```yaml
  selective:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: corepack enable
      - run: pnpm i --frozen-lockfile
      - id: diff
        run: echo "changed=$(git diff --name-only origin/main...HEAD | tr '\n' ' ')" >> $GITHUB_OUTPUT
      - name: Run tests for changed packages
        run: |
          CHANGED_PKGS=$(echo "${{ steps.diff.outputs.changed }}" | grep '^packages/' | cut -d/ -f2 | sort -u || true)
          for P in $CHANGED_PKGS; do pnpm --filter "packages/${P}" test:run; done
```

常见 CI 陷阱与优化：
- 未缓存依赖/构建产物：使用 Actions Cache 或 GitLab cache
- 未上传失败用例信息：将覆盖 html、截图/日志等作为 artifact 附在 PR/MR
- 覆盖报告不稳定：固定 Node 版本与测试随机种子（如 faker.seed），并控制 fake timers/网络模拟以提高确定性

## 示例入口
- GitHub Actions 最小工作流：.github/workflows/test.yml（参考上述片段）
- GitLab CI 最小工作流：.gitlab-ci.yml（参考上述片段）
- 选择性测试：scripts/selective-test.mjs（按路径过滤）

## Checklist
- [ ] PR 必跑测试并设为必需检查
- [ ] 覆盖率上报与阈值门禁启用
- [ ] 受影响测试加速（Turborepo/Nx/路径过滤）
- [ ] 缓存策略与 Node 版本矩阵配置齐全

## 常见错误排查
- CI 缓存未命中：检查 key 使用 lockfile 哈希
- Codecov 上传失败：确认 token/私仓权限与 lcov 路径
- 选择性测试空集：diff 对比主干引用是否正确（origin/main）