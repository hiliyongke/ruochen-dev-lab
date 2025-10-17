import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: '常见 Linux 使用命令指南（前端工程师适用）',
  description: '面向前端工程师的基础运维与常用 Linux 命令速查，覆盖文件、权限、进程、网络、日志、磁盘、SSH、安全与常见实战场景。',
  lastUpdated: true,
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    outline: 'deep',
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/01-quickstart' }
    ],
    sidebar: [
      {
        text: '入门',
        items: [
          { text: '00. 命令行基础与使用习惯', link: '/guide/00-cli-basics' },
          { text: '01. 快速上手与环境准备', link: '/guide/01-quickstart' },
          { text: '02. 文件与目录操作', link: '/guide/02-files-and-dirs' }
        ]
      },
      {
        text: '基础运维',
        items: [
          { text: '03. 权限与用户管理', link: '/guide/03-permissions-and-users' },
          { text: '04. 进程与服务管理', link: '/guide/04-process-and-service' },
          { text: '05. 软件包管理', link: '/guide/05-package-management' },
          { text: '06. 网络与排错', link: '/guide/06-network-and-troubleshooting' },
          { text: '07. 日志与监控', link: '/guide/07-logs-and-monitoring' },
          { text: '08. 磁盘与存储', link: '/guide/08-disk-and-storage' },
          { text: '09. SSH 与安全', link: '/guide/09-ssh-and-security' },
          { text: '15. 端口与进程占用排查', link: '/guide/15-ports-and-occupancy' }
        ]
      },
      {
        text: '实战',
        items: [
          { text: '10. 常用一键脚本示例', link: '/guide/10-one-liners-and-scripts' },
          { text: '11. Nginx 基础与反向代理', link: '/guide/11-nginx-and-reverse-proxy' },
          { text: '12. 前端工程运维场景速查', link: '/guide/12-frontend-ops-playbook' },
          { text: '13. 文件传输与备份', link: '/guide/13-transfer-and-backup' },
          { text: '14. 跳板机与堡垒机（SSH Jump/Proxy）', link: '/guide/14-bastion-and-ssh-jump' }
        ]
      },
      {
        text: '容器与编排',
        items: [
          { text: '16. Docker 基础', link: '/guide/16-docker-basics' },
          { text: '17. Docker Compose 实战', link: '/guide/17-docker-compose' },
          { text: '18. Kubernetes 入门（前端运维向）', link: '/guide/18-kubernetes-basics' }
        ]
      },
      {
        text: '附录',
        items: [
          { text: '20. 附录：Cheatsheet / 自测', link: '/guide/20-appendix-cheatsheet' },
          { text: '19. 命令与术语详解', link: '/guide/19-commands-and-terms' }
        ]
      }
    ],
    socialLinks: [
      // 可在此添加你的仓库或主页链接
    ],
    footer: {
      message: '内容仅用于学习与日常运维，注意在测试环境先演练。',
    }
  }
});