# 11. 前端工程运维场景速查

> 引言：这些都是一线最常遇到的“老问题”。按场景给出从“构建→守护→反代→排错”的闭环清单，用时即查，省去反复搜索。

你将学到：
- Vite/Next/Nuxt 的部署骨架与 systemd/Nginx 配套
- 静态站发布的稳妥流程与回滚策略
- 白屏/报错的现场定位顺序与回溯技巧
- HTTPS 与证书续期的落地建议

## 场景 A：Vite/Next/Nuxt 应用部署

- 构建
```bash
pnpm i --frozen-lockfile
pnpm build
```
- Node 服务守护（systemd）
见第 4 章服务示例，监听 3000 端口。
- 反向代理（Nginx）
```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

## 场景 B：前端静态站（VitePress/静态站）

- 构建：pnpm build
- 发布：rsync 到 /var/www/site；原子软链切换（见第 10 章）

## 场景 C：白屏/接口错误快速定位

1) curl -v 请求接口，确认状态码与跨域
2) tail -f 应用日志，查异常栈
3) Nginx error.log 观察 upstream 超时/502
4) ss、lsof 检查端口与进程
5) 回滚到上一构建产物验证

## 场景 D：磁盘爆满导致构建失败

- df -h、du -sh 定位
- 清理历史产物与日志（见第 8 章）
- 配置 logrotate 和构建产物保留策略

## 场景 E：HTTPS 配置（Let’s Encrypt + Nginx）

### 1) 获取与自动续期（certbot）
```bash
# 安装（Ubuntu 示例）
sudo apt update && sudo apt install -y certbot python3-certbot-nginx
# 自动配置 Nginx 并签发证书（按提示选择域名）
sudo certbot --nginx -d example.com -d www.example.com
# 模拟续期（dry-run）
sudo certbot renew --dry-run
```
注意：
- 证书默认存放 /etc/letsencrypt；续期由 systemd/cron 执行
- 首次签发需 80 端口可访问（HTTP-01 验证），若被占用需临时放通

### 2) 手写 Nginx HTTPS（含强制跳转与 HSTS）
```nginx
server {
  listen 80;
  server_name example.com www.example.com;
  return 301 https://example.com$request_uri;
}

server {
  listen 443 ssl http2;
  server_name example.com;

  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```
提示：
- HSTS 一旦开启会被浏览器缓存，先在灰度域名验证，再推广到主域
- http2 建议开启；证书路径与权限需确保 Nginx 可读

### 3) 静态站（无反代）HTTPS
```nginx
server {
  listen 80;
  server_name static.example.com;
  return 301 https://static.example.com$request_uri;
}
server {
  listen 443 ssl http2;
  server_name static.example.com;
  root /var/www/site/current;
  index index.html;
  ssl_certificate /etc/letsencrypt/live/static.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/static.example.com/privkey.pem;
}
```

## Nginx 常见误配置清单

- 未加 proxy_set_header Host $host 导致后端多租户/路由异常
- 忘记 proxy_http_version 1.1 + Upgrade/Connection 升级头，WebSocket 断连
- proxy_read_timeout 太短，后端慢请求被过早切断
- root 与 alias 混用/路径末尾斜杠错误导致 404
- server_name 漏写 www 或泛域名，导致证书/路由错配
- 证书路径/权限错误，nginx -t 未通过仍 reload
- 未强制跳转 https 或 HSTS 配置过早全站生效（应先灰度）

::: tip 快速自检
- nginx -t; systemctl reload nginx
- curl -v/--http2 看重定向/协议/证书
- error.log 关注 upstream 超时/连接复用
:::

## 易错点
- 反代链路未透传 Host/真实 IP
- SSL 证书续期后未 reload
- WebSocket 未设置升级头

## 练习题（含答案）
1) 为 SSR 应用补全反代片段，保证 WebSocket 升级与超时合理
```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_read_timeout 30s;
```

## 延伸阅读
- Nginx 官方文档：HTTP/Proxy/Stream 模块
- Mozilla SSL 配置生成器
- certbot 用户指南