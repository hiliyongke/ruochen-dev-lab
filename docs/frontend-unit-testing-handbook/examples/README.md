# Examples 目录

本目录提供可运行的前端测试示例，覆盖：
- React (react-basic)
- Vue 3 (vue3-basic)
- Next.js (nextjs-app)
- Nuxt (nuxt-app)
- Node + MSW (node-msw) — 已提供可运行示例

使用建议：
1) 进入对应子目录，阅读 README 安装依赖与运行测试
2) 结合小册对应章节（02/03/05/06/07/09/15）练习与扩展

## 运行与覆盖
- 安装依赖与运行测试（以某示例为例）
  ```
  cd examples/<example>
  npm ci   # 或 npm i
  npm test # 若定义了 test 脚本；否则可用 npx vitest run
  ```
- 生成覆盖率（建议）
  ```
  npx vitest run --coverage
  # 报告目录：examples/<example>/coverage/
  # lcov：examples/<example>/coverage/lcov.info
  ```
- CI 集成
  - GitHub：已配置 codecov/codecov-action@v4，上报 examples/**/coverage/lcov.info
  - GitLab：已配置官方 uploader，需在变量中提供 CODECOV_TOKEN