# GitHub Pages 自动部署指南

## 概述

本项目已配置 GitHub Actions 自动部署，当代码推送到 `main` 分支时，会自动构建 VitePress 站点并部署到 GitHub Pages。

## 部署步骤

### 1. 启用 GitHub Pages

1. 在 GitHub 仓库中，进入 **Settings** → **Pages**
2. 在 **Source** 部分选择 **GitHub Actions**
3. 保存设置

### 2. 配置仓库名称（重要）

由于 VitePress 配置中的 `base` 路径设置为 `/ruochen-dev-lab/`，请确保：

- 仓库名称为 `ruochen-dev-lab`
- 或者修改 `docs/.vitepress/config.ts` 中的 `base` 配置：

```typescript
base: process.env.NODE_ENV === 'production' ? '/你的仓库名称/' : '/',
```

### 3. 推送代码触发部署

将代码推送到 `main` 分支后，GitHub Actions 会自动：

1. 安装 Node.js 和依赖
2. 构建 VitePress 站点
3. 部署到 GitHub Pages

## 查看部署状态

1. 进入仓库的 **Actions** 标签页
2. 查看 **Deploy VitePress site to Pages** 工作流运行状态
3. 部署成功后，访问 `https://你的用户名.github.io/ruochen-dev-lab/`

## 手动触发部署

如果需要手动触发部署：

1. 进入 **Actions** 标签页
2. 选择 **Deploy VitePress site to Pages** 工作流
3. 点击 **Run workflow** 按钮

## 故障排除

### 构建失败

- 检查 Node.js 版本兼容性（当前配置为 Node.js 18）
- 查看 Actions 日志中的详细错误信息

### 页面显示 404

- 确认仓库名称与 `base` 配置匹配
- 检查 GitHub Pages 设置是否正确
- 确保构建产物路径正确（`docs/.vitepress/dist`）

### 资源加载失败

- 检查静态资源路径是否正确
- 确认所有相对路径在部署后正常工作

## 自定义配置

如需修改部署配置，请编辑 `.github/workflows/deploy.yml` 文件。

## 本地测试

部署前建议在本地测试构建：

```bash
npm run docs:build
npm run docs:preview
```