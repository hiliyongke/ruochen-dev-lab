# 22. Nginx SSL/TLS 与 HTTP/2 深入补强（安全加固/兼容性权衡）

> 目标：在生产环境中安全、可靠地启用与维护 TLS/HTTP2（可选预研 HTTP/3），给出可直接落地的 Nginx 配置与运维策略，同时权衡旧设备/区域的兼容性。

你将学到
- TLS 策略矩阵（协议、密码套件、证书与密钥管理）
- OCSP Stapling、Session Tickets 的开启与治理
- 客户端证书认证（mTLS）与端到端 TLS 取舍
- ALPN 与 HTTP/2 性能优化（连接复用、队头阻塞规避）
- 兼容性与回退策略（旧系统/老浏览器）
- HTTP/3（QUIC）预研与风险提示
- 实操清单与排错流程

## 1. TLS 策略矩阵（推荐基线）

- 协议：TLSv1.2 + TLSv1.3（禁用 TLSv1.0/1.1）
- 密码套件：
  - TLS1.3：由协议内定（推荐默认即可）
  - TLS1.2：优选 ECDHE+AESGCM（兼容度高/安全性好）
- 前向保密（PFS）：确保证书与套件支持 ECDHE
- 证书与私钥：
  - 权限最小化：仅 Nginx 可读（600/640）
  - 自动续期与平滑 reload（certbot/acme.sh）
- SNI/ALPN：启用 SNI；HTTP/2 依赖 ALPN

示例（策略基线，按需调整）
```nginx
server {
  listen 443 ssl http2;
  server_name example.com;

  ssl_certificate     /etc/nginx/certs/example.crt;
  ssl_certificate_key /etc/nginx/certs/example.key;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:TLS_AES_128_GCM_SHA256';
  ssl_prefer_server_ciphers on;

  # 会话与性能优化
  ssl_session_timeout 1d;
  ssl_session_cache shared:SSL:10m;

  # 开启 OCSP Stapling（需提供链证书与可达的 OCSP）
  ssl_stapling on;
  ssl_stapling_verify on;
  resolver 1.1.1.1 8.8.8.8 valid=300s ipv6=off;
  resolver_timeout 5s;

  # 可选：HTTP → HTTPS 跳转（单独80端口server中）
  # HSTS：谨慎（参考第11章补充）
}
```

## 2. OCSP Stapling（在线吊销检查）

- 原理：服务端在 TLS 握手时“关联返回”证书状态，减少客户端在线查询延迟
- 前置条件：完整链证书（包含中间证书）；Nginx 能访问 OCSP 端点
- 风险与运维：
  - OCSP 端点不可达会导致握手延迟/失败（合理的 resolver 与超时）
  - 建议监控 ssl_stapling 与证书有效期，提前告警

## 3. Session Tickets（会话票据）

- 优点：减少握手成本，提高复用率
- 风险：服务端重启或 Key 轮换策略不当可能导致会话失效；Key 管理不当有安全隐患
- 建议：
  - 开启会话票据并配置合理的轮换
  - 对高安全场景，考虑禁用或加强 Key 生命周期管理（商业需求权衡）

## 4. 客户端证书认证（mTLS）

- 场景：内部 API、B2B 通道、零信任增强
- 要点：
  - 配置 `ssl_client_certificate` 与验证 `ssl_verify_client`
  - 区分公共入口与内部入口；避免误对公网强制 mTLS
```nginx
server {
  listen 443 ssl http2;
  server_name internal.example.com;

  ssl_client_certificate /etc/nginx/certs/ca.crt;
  ssl_verify_client on;               # 可选：optional

  location / {
    if ($ssl_client_verify != SUCCESS) { return 403; }
    proxy_pass http://10.0.0.11:3000;
  }
}
```
- 运维：证书吊销与更新流程要明确；支持 CRL/OCSP 验证（成本与复杂度评估）

## 5. 端到端 TLS 与 TLS 终止取舍

- TLS 终止（推荐默认）：Nginx 边界终止，内网到上游走明文或内网 TLS
- 端到端 TLS（更安全）：Nginx → 上游也走 TLS
  - 上游证书校验：`proxy_ssl_server_name on; proxy_ssl_name upstream.example.com;`
  - 性能与复杂度提升：证书分发与管理成本上升
```nginx
location /api/ {
  proxy_ssl_server_name on;
  proxy_pass https://upstream.example.com;
}
```

## 6. HTTP/2 性能优化与兼容性

- 关键点：ALPN 协商、连接复用、多路复用提升并发效率
- 优化建议：
  - 启用 http2 并校验协商是否成功（curl -I --http2）
  - 长缓存与压缩（gzip/brotli），减少重复传输
  - 动态内容谨慎开启 server push（已弃用/浏览器支持退潮）
- 兼容性权衡：
  - 极旧设备或代理不支持 http2，可保留兼容路径（http/1.1）
  - 对有兼容要求的地区/终端，考虑仅 TLS1.2（必要时放宽 Cipher）

## 7. HTTP/3（QUIC）预研（可选）

- 优势：UDP 传输、连接迁移，对弱网/移动端改善明显
- 风险：回源/中间网络设备兼容、观测与告警链路需适配
- Nginx 开源版支持度受限（需第三方分支/模块或使用 Nginx Quic 分支、或借助代理如 Caddy/Cloudflare）
- 建议：灰度试点，对关键入口进行 A/B，对指标与日志做适配；明确回退策略

## 8. 证书生命周期与自动化

- 使用 certbot 或 acme.sh 自动签发与续期（建议 60~75 天提前续期）
- 平滑 reload：续期后 `nginx -t && nginx -s reload`
- 证书监控：到期时间、链证完整性、OCSP 状态；异常报警与应急预案

## 9. 排错与验证

- TLS 握手失败：检查证书链、权限、协议/套件；`openssl s_client -connect example.com:443 -tls1_2 -servername example.com`
- HTTP/2 协商失败：确认 ALPN；`curl -I --http2 -sS https://example.com/`
- OCSP stapling：`openssl s_client -connect example.com:443 -status -servername example.com | grep -i "OCSP Response"`
- 端到端 TLS：`proxy_ssl_*` 配置与上游证书校验；必要时抓包确认

## 10. 最佳实践清单（可直接执行）

- [ ] 禁用 TLS1.0/1.1，仅启用 TLS1.2/1.3
- [ ] 采用 ECDHE+AESGCM；确认 PFS 与 ALPN 正常
- [ ] 启用 OCSP Stapling 并监控链路与有效期
- [ ] 评估 Session Tickets 并制定 Key 轮换策略
- [ ] 需要零信任场景启用 mTLS，并明确吊销与更新流程
- [ ] 按需启用 HTTP/2；评估老终端兼容；保留回退路径
- [ ] 证书全流程自动化与平滑 reload；到期提前告警
- [ ] 建立 TLS/HTTP2 的观测与告警（握手失败率、协商失败、证书到期）

## 参考资料
- Nginx 文档：ngx_http_ssl_module、HTTP/2
- Mozilla SSL/TLS 配置指南
- OpenSSL 命令行参考
- certbot / acme.sh 官方文档
- HTTP/3/QUIC 相关 RFC 与实现说明