# 安全与合规

## 本章目的
- 在工程化流程中建立“预防—检测—响应”的安全闭环
- 提供依赖漏洞、许可证合规、密钥泄露、SAST、CSP/SRI 与 Source Map 管控的可复制方案与 CI 集成

## 覆盖范围与清单
- 依赖与许可证：osv-scanner / npm audit、license-checker（或 license-compliance 工具）
- 密钥泄露扫描：gitleaks / trufflehog（提交前与CI双保险）
- SAST（静态应用安全测试）：Semgrep（通用规则集，可增量）
- 前端安全策略：CSP、SRI、依赖完整性校验
- Source Map：生产私有上传（Sentry/自建）与产物内剔除
- SBOM/合规：Syft/CycloneDX 生成并归档，便于审计

## 依赖漏洞与许可证
安装与使用（任选其一）
```bash
# OSV-Scanner（推荐）
pnpm dlx osv-scanner --lockfile=pnpm-lock.yaml

# npm audit（配合pnpm也可触发）
pnpm audit --json

# 许可证清单
pnpm dlx license-checker --summary --production
```
策略
- 在 CI 中对高危漏洞（critical/high）直接拉红；中危（moderate）标记风险并创建议题
- 许可证白名单（MIT/Apache-2.0/BSD-3-Clause 等），黑名单（GPL-3.0-only 等）按公司政策配置

## 密钥泄露扫描（Secrets Scanning）
提交前门禁 + CI 双层防护
```bash
# 提交前（husky pre-commit）
pnpm add -D gitleaks
# .husky/pre-commit 中调用（示例）
pnpm dlx gitleaks protect --staged --verbose
```
CI 全量扫描（GitHub Actions）
```yml
- name: Secrets Scan
  run: pnpm dlx gitleaks detect --source . --no-git --verbose
```

## SAST：Semgrep（增量 + 全量）
安装与运行
```bash
pnpm add -D semgrep
# 全量
pnpm dlx semgrep scan --config=p/ci --error
# 仅扫描改动（PR）
pnpm dlx semgrep scan --config=p/ci --error --baseline-commit origin/main
```
说明
- p/ci 为官方推荐规则集，可按项目增删；对误报规则做 suppress 注释并提 PR 完善规则

## CSP/SRI 与资源完整性
- CSP 示例（Nginx/Headers）：default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example; connect-src 'self' https://api.example; img-src 'self' data:; style-src 'self' 'unsafe-inline'
- SRI：为外链脚本/样式加 integrity 与 crossorigin
- 依赖完整性：NPM 锁文件 + CI 固定 registry + 审计

## Source Map 私有上传
- 生产构建生成 Source Map，但不随产物对外暴露，改为私有上传（Sentry/自建服务器）
- Vite/Webpack：build.sourcemap=true；产物内不内联；CI 上传并在产物中移除 map 引用（或 server 拦截）

Sentry 上传示例（GitHub Actions）
```yml
- name: Upload Sentry sourcemaps
  run: |
    pnpm dlx @sentry/cli releases new "$GITHUB_SHA"
    pnpm dlx @sentry/cli releases files "$GITHUB_SHA" upload-sourcemaps ./dist --url-prefix "~/assets" --rewrite
    pnpm dlx @sentry/cli releases finalize "$GITHUB_SHA"
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: your-project
```

## SBOM 与合规报告
- 生成 SBOM（软件物料清单），便于审计与供应链风险治理
```bash
# Syft 生成 CycloneDX/Syft JSON
pnpm dlx syft packages dir:. -o cyclonedx-json > sbom.json
```
- 在 CI 中归档 sbom.json，供安全团队与法务检视

## GitHub Actions（安全合规模板）
.github/workflows/security.yml
```yml
name: Security
on:
  pull_request:
  push: { branches: [main] }
permissions:
  contents: read
jobs:
  deps-and-licenses:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm, registry-url: 'https://registry.npmjs.org/' }
      - run: pnpm i --frozen-lockfile
      - name: OSV Scanner
        run: pnpm dlx osv-scanner --lockfile=pnpm-lock.yaml
      - name: License Checker
        run: pnpm dlx license-checker --summary --production
  sast-and-secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Semgrep (baseline on PR)
        if: github.event_name == 'pull_request'
        run: pnpm dlx semgrep scan --config=p/ci --error --baseline-commit origin/main
      - name: Semgrep (full on main)
        if: github.ref == 'refs/heads/main'
        run: pnpm dlx semgrep scan --config=p/ci --error
      - name: Gitleaks
        run: pnpm dlx gitleaks detect --source . --no-git --verbose
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate SBOM
        run: pnpm dlx syft packages dir:. -o cyclonedx-json > sbom.json
      - uses: actions/upload-artifact@v4
        with: { name: sbom, path: sbom.json }
```

## GitLab CI（片段）
```yml
stages: [audit, sast, sbom]
audit:
  stage: audit
  image: node:20
  script:
    - corepack enable && npm i -g pnpm
    - pnpm i --frozen-lockfile
    - pnpm dlx osv-scanner --lockfile=pnpm-lock.yaml
    - pnpm dlx license-checker --summary --production
sast:
  stage: sast
  image: node:20
  script:
    - pnpm dlx semgrep scan --config=p/ci --error
sbom:
  stage: sbom
  image: node:20
  script:
    - pnpm dlx syft packages dir:. -o cyclonedx-json > sbom.json
  artifacts:
    paths: [sbom.json]
```

## 权限与治理
- Token 最小权限：NPM automation token、GitHub/GitLab CI 最小权限 scope
- 保护分支：强制 PR 流程、状态检查（lint/test/security 必须通过）
- 日志脱敏：避免 secrets 输出到日志；敏感命令禁用调试输出
- 漏洞响应：明确责任人/响应时限/回滚策略，形成 runbook

## 度量与落地建议
- 周期性审计：高危漏洞为 0，中危存量压降；许可证黑名单为 0
- 可视化看板：漏洞趋势、密钥泄露事件、规则误报率
- 与发布门禁联动：严重问题禁止发布

## 常见坑与 FAQ
- “误报太多”：精简规则集、白名单与 suppressed 注释并定期审查
- “工具太慢影响 CI”：在 PR 跑增量，在主分支/夜间任务跑全量
- “Source Map 泄露”：确保只向私有端点上传，不随产物分发

## 参考链接
- OSV-Scanner: https://github.com/google/osv-scanner
- Semgrep: https://semgrep.dev
- Gitleaks: https://github.com/gitleaks/gitleaks
- Sentry: https://docs.sentry.io/cli/releases/#sourcemaps
- Syft(CycloneDX/Syft JSON): https://github.com/anchore/syft