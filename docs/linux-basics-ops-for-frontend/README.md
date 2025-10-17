# 常见 Linux 使用命令指南（前端工程师适用）

本仓库包含基于 VitePress 的文档站点与按章节拆分的内容。

## 本地开发

```bash
npm i -D vitepress
npm run docs:dev
```

访问本地地址（命令行会输出），开始预览文档。

## 构建与预览

```bash
npm run docs:build
npm run docs:preview
```

## 目录结构

- docs/.vitepress/config.ts 站点配置（导航、侧边栏）
- docs/index.md 主页
- docs/guide/*.md 分章节文档（按序号稳定排序）

提示：
- 若编辑器报“找不到模块 vitepress”，请先安装依赖（npm i -D vitepress）。
- 内容以“能用、好懂、可复制”为原则，涉及风险操作已添加警示与干跑思路。