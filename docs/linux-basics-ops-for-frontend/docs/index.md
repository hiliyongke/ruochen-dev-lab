---
layout: home
title: 常见 Linux 使用命令指南（前端工程师适用）
titleTemplate: 前端工程师也能稳做基础运维
hero:
  name: Linux 命令指南
  text: 前端工程师也能稳做基础运维
  tagline: 高频场景＋命令解剖＋安全范式，少踩坑、快复现、稳上线
  actions:
    - theme: brand
      text: 立即开始
      link: /guide/01-quickstart
    - theme: alt
      text: 快速速查
      link: /guide/12-frontend-ops-playbook
features:
  - title: 场景化
    details: 以“问题→定位→处置”组织，端口占用、502/504、磁盘爆满…拿来就用
  - title: 初学者友好
    details: 每条命令都配“命令解剖/为何这样/常见坑/安全提示”，看得懂也能用得对
  - title: 安全范式
    details: 默认给出 dry-run/预演与回滚策略，最大限度避免误操作
  - title: 贴近前端
    details: Vite/Next/Nuxt 部署、Nginx 反代、Node 服务守护一站式说明
---

# 欢迎

这是一份面向前端工程师的 Linux 基础运维指南。你将学习到：
- 文件/权限/进程/网络/日志/磁盘/SSH/安全的实用命令
- 场景化排错方法（端口占用、白屏/报错、磁盘爆满…）
- 容器与编排的最小闭环（Docker/Compose/K8s）

快速导航：
- 新人入门：/guide/00-cli-basics → /guide/01-quickstart → /guide/02-files-and-dirs
- 常见问题速查：/guide/12-frontend-ops-playbook
- 端口占用排查：/guide/15-ports-and-occupancy
- 文件传输与备份（含 rz/sz）：/guide/13-transfer-and-backup
- Nginx 反向代理与 HTTPS：/guide/11-nginx-and-reverse-proxy
- Docker 与编排：/guide/16-docker-basics → /guide/17-docker-compose → /guide/18-kubernetes-basics

提示：
- 本站所有“危险操作”均附安全提示；生产环境务必先在测试环境演练
- 若你需要把本站一键发布到 Pages/CDN，可与我说明，我可协助自动化部署