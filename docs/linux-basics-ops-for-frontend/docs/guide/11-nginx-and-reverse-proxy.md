# 11. Nginx 与反向代理（前端运维向）

> 引言：Nginx 是最常用的 Web 服务器与反向代理。作为前端/轻运维，掌握“静态资源托管 + 反向代理 + SSL/TLS + HTTP/2 + 限流”的最小闭环与排错套路，足以覆盖 80% 的场景。

你将学到
- 静态站点与反向代理的最小可运行配置
- SSL/TLS 与 HTTP/2 配置要点（含自签/Let’s Encrypt 提示）
- 限流、超时、缓冲与常见优化
- 常见 4xx/5xx 错误的定位与解决
- 实操练习与参考资料

## 背景与核心概念
- 反向代理（Reverse Proxy）：客户端 → Nginx → 上游服务（Upstream），实现负载均衡、缓存、TLS 终止等。
- Server Block（虚拟主机）：按域名/端口区分站点配置。
- 上游（Upstream）：一组后端服务实例，Nginx 通过 proxy_pass 转发。
- TLS 终止：在 Nginx 完成加解密，后端走内网明文或内网 TLS。

## 最小可运行示例

静态站点
```nginx
server {
  listen 80;
  server_name fe.example.com;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # 基础安全头（可按需增减）
  add_header X-Content-Type-Options nosniff;
  add_header X-Frame-Options SAMEORIGIN;
}
```

反向代理（单上游）
```nginx
upstream api_upstream {
  server 127.0.0.1:3000;
  # 可扩展为多实例并使用负载策略：least_conn; ip_hash; 等
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_connect_timeout 5s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;

    proxy_pass http://api_upstream;
  }
}
```

说明
- try_files 保证单页应用路由可用。
- 反代务必补齐 X-Forwarded-* 头，便于后端获取真实来源与协议。

## 启用 SSL/TLS 与 HTTP/2

示例（证书已就绪）
```nginx
server {
  listen 443 ssl http2;
  server_name fe.example.com;

  ssl_certificate     /etc/nginx/certs/fe.crt;
  ssl_certificate_key /etc/nginx/certs/fe.key;

  # 基本 TLS 安全建议（按需调整兼容性）
  ssl_session_timeout 1d;
  ssl_session_cache shared:MozSSL:10m;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:TLS_AES_128_GCM_SHA256';
  ssl_prefer_server_ciphers on;

  root /usr/share/nginx/html;
  index index.html;

  # HSTS（仅在确认全站 HTTPS 且了解影响后开启）
  # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  location / {
    try_files $uri $uri/ /index.html;
  }
}

# HTTP 自动跳转到 HTTPS
server {
  listen 80;
  server_name fe.example.com;
  return 301 https://$host$request_uri;
}
```

证书获取提示
- Let’s Encrypt：使用 certbot 或 acme.sh 自动签发与续期；生产推荐。
- 自签证书：适合内网/测试；需在客户端/系统信任该根证书。
- 证书与私钥权限：仅对 nginx 用户/进程可读，避免泄露。

HTTP/2
- listen 443 ssl http2 即可启用；对多路复用、首包延迟优化更友好。
- 静态资源配合压缩（gzip/br）与长缓存，可显著提升加载性能。

## 限流、超时与缓冲

连接/请求限流（按 IP）
```nginx
# 定义限流区（共享内存 10MB，约存数万令牌）
limit_req_zone $binary_remote_addr zone=req_zone:10m rate=10r/s;

server {
  listen 443 ssl http2;
  server_name api.example.com;

  location / {
    limit_req zone=req_zone burst=20 nodelay;
    proxy_pass http://api_upstream;
  }
}
```

基础优化
- 超时：proxy_connect_timeout/proxy_read_timeout 结合后端性能与网络实际设定。
- 缓冲：proxy_buffering on; proxy_buffers 16 16k; proxy_busy_buffers_size 24k;（按响应大小与并发调优）。
- 压缩：gzip on; gzip_types text/css application/javascript application/json;（或使用 brotli 模块）。
- 上传：client_max_body_size 10m（按业务需求设置）。

## 常见 4xx/5xx 排错

排错总览（现象 → 定位 → 解决）
- 4xx 客户端类
  - 400 Bad Request：证书/协议不匹配、Header 异常
    - 定位：error_log；抓包/浏览器开发者工具
    - 解决：确认 TLS 协议与证书链；检查上游期望的 Header
  - 404 Not Found：路径或 try_files 配置不当
    - 定位：access_log Uri 与实际路径；location 命中情况
    - 解决：SPA 使用 try_files ... /index.html；静态文件路径核对
  - 413 Payload Too Large：上传超限
    - 定位：error_log 显示 “client intended to send too large body”
    - 解决：调大 client_max_body_size，并评估上游限额

- 5xx 服务端类
  - 500 Internal Server Error：上游异常或 Nginx 子配置错误
    - 定位：error_log；上游应用日志
    - 解决：回滚/修复上游；核查 include 的子配置语法
  - 502 Bad Gateway：上游未启动/未监听/协议不匹配
    - 定位：curl 直连上游；检查 upstream server 与 proxy_pass 协议（http/https）
    - 解决：启动上游/修正监听与协议；确认容器/主机连通性
  - 504 Gateway Timeout：上游响应超时
    - 定位：超时阈值与上游耗时
    - 解决：提升 proxy_read_timeout；优化上游性能/慢查询/冷启动

诊断命令
```bash
nginx -t                         # 语法检查
nginx -s reload                  # 平滑加载配置
tail -f /var/log/nginx/access.log /var/log/nginx/error.log
curl -I https://fe.example.com/  # 仅请求响应头
```

## 实操练习（含答案）
1) 为静态站点启用 HTTPS 与 HTTP/2，并强制 80 → 443 跳转
- 关键配置：listen 443 ssl http2；ssl_certificate/key；80 端口 301 跳转

2) 为 /api 添加 IP 限流 10 r/s，突发 20
```nginx
limit_req_zone $binary_remote_addr zone=req_zone:10m rate=10r/s;
location /api {
  limit_req zone=req_zone burst=20 nodelay;
  proxy_pass http://api_upstream;
}
```

3) 排查 502：确认上游监听与协议
- curl http://127.0.0.1:3000/health
- 检查 proxy_pass 与 upstream 是否一致（http vs https）

## HSTS 与预加载（preload）注意事项

HSTS 强制浏览器在一段时间内仅通过 HTTPS 访问你的域名，可阻止降级与中间人攻击；但“预加载”具有较强不可逆性，需谨慎灰度。

必备条件（进入浏览器 HSTS preload 列表前）：
- 必须包含 includeSubDomains，且 max-age ≥ 31536000（1 年）
- 建议同时配置从 HTTP 到 HTTPS 的 301 跳转
- 提交 https://hstspreload.org 并等待浏览器合入

风险与回滚：
- 一旦进入 preload 列表，浏览器会“永远视为 HTTPS 站点”；即便撤销线上配置，也需等浏览器后续版本更新才能解除
- 误将测试/灰度域名加入将导致长期不可用
- 回滚：设置 Strict-Transport-Security 为 max-age=0 并等待列表更新（周期长）

灰度建议：
- 先在低风险子域验证
- 先只启用 HSTS（含 includeSubDomains），观察 2-4 周再考虑提交 preload
- 确保证书续期自动化与 reload 流程可靠，避免证书过期造成全站不可达

示例（谨慎使用 preload）：
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

---

## 典型反向代理场景示例集

1) SPA/静态 + API（同域不同路径，规避跨域）
```nginx
server {
  listen 443 ssl http2;
  server_name app.example.com;

  root /var/www/site/current;
  location / {
    try_files $uri /index.html;
  }

  # 同域代理 /api → 后端，避免浏览器 CORS
  location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 30s;
  }
}
```
提示：若前后端分域（api.example.com），需在后端/网关设置 CORS（Access-Control-Allow-*）与凭证策略。

2) WebSocket 代理（IM/实时推送/热更新）
```nginx
server {
  listen 443 ssl http2;
  server_name ws.example.com;

  location /socket/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 60s; # 适当放宽，避免空闲断开
  }
}
```
要点：必须设置 Upgrade/Connection 头；read_timeout 需结合业务特性调整。

3) 多实例后端负载（least_conn/ip_hash）
```nginx
upstream api_upstream {
  # 被动健康参数（发生错误/超时才触发）
  server 10.0.0.11:3000 max_fails=3 fail_timeout=10s;
  server 10.0.0.12:3000 max_fails=3 fail_timeout=10s;
  keepalive 64;
  # 可选策略：
  # least_conn;   # 最少连接
  # ip_hash;      # 简易会话粘性（NAT/代理场景粘性可能受影响）
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_pass http://api_upstream;
    proxy_next_upstream error timeout http_502 http_503 http_504;
  }
}
```
说明：
- 开源版 Nginx 为被动健康检查；主动健康检查需第三方模块或商业版（Nginx Plus）
- 更复杂的粘性可由上游应用/网关实现（如基于 cookie/session）
- 建议结合探针/告警，异常实例及时下线或弹性伸缩

---

## 关联阅读
- Nginx 官方文档：HTTP Core、HTTP SSL、HTTP Upstream、Limit Request
- Mozilla SSL/TLS 配置指南
- Let’s Encrypt/certbot 与 acme.sh
- Brotli/gzip 压缩与静态资源缓存策略