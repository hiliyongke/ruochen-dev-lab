# 全书风格与结构校对清单（掘金小册规范映射）

章节结构（逐章核查）
- 封面三要素：标题/副标题（可选）/作者
- 导读：面向谁、能学到什么、预计用时
- 学习目标：3–5 条可验证目标（行为动词，如“实现/掌握/能解释”）
- 正文分节：每节有小标题，段落不超过 6 行；图示适度（Mermaid/结构图）
- 代码：可运行、关键注释、避免大段无解释
- 小结：3–5 条要点回顾
- 练习：3–5 题，含提示或答案链接/位置说明
- 延伸阅读：官方文档/经典文章/社区精选

写作风格
- 口语化但专业：术语首次中英对照，后续中文为主
- 先结论后推导：每节开头给出“做法/结论”
- 反例对照：每章至少 1 处“常见坑 vs 正确做法”
- 图胜于字：优先图示/表格总结关键差异
- 一致性：术语表优先；单位/变量命名统一；中英文空格规范（中英文之间留空格）

代码规范
- TypeScript：显式类型优先；导出需使用 export；无 try/catch，错误使用 console.error 输出
- 组件：函数组件 + Hooks，使用 Tailwind 进行样式
- 引入：第三方库使用包名；本地模块使用相对路径，路径准确
- 文件大小：单文件不超过 300 行；按模块拆分
- 可访问性：交互元素使用 button/input；设置 cursor 与 :hover/:focus 状态

工程规范
- Vite + TS + Tailwind + TDesign 版本与配置固定
- PostCSS: tailwindcss + autoprefixer
- 允许主机：vite.config.ts 中 server.allowedHosts = true，host = '0.0.0.0'
- tsconfig.app.json：verbatimModuleSyntax=false，noUnusedLocals/Parameters=false
- 依赖安装清单：react-router-dom、swr、@tanstack/react-query、react-hook-form、zod、@hookform/resolvers、@reduxjs/toolkit、react-redux、zustand、jotai

逐章核查模板
- 术语对齐：是否与术语表一致
- 目标可验证：是否能通过练习/代码达成
- 代码运行：是否在示例面板有入口且可运行
- 图示齐备：必要流程/结构是否有图示
- 练习质量：是否包含 3–5 题，覆盖本章要点
- 延伸阅读：是否包含可靠来源，不少于 3 条
- 版本标注：是否注明 React/依赖版本差异与注意事项

评审流程
- 作者自查 → 技术评审（2 人）→ 编辑审校
- 统一在 PR 中引用本清单，逐项勾选并给出证据（链接/截图/运行结果）