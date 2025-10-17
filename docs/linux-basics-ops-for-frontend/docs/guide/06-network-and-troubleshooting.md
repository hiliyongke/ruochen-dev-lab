# 06. 网络与排错

> 引言：线上问题十有八九与“连没连上”有关。学会用 curl/ss/dig 等工具从“连通→端口→DNS→路由”逐步缩小范围，就不会“盲猜”。

你将学到：
- 基础连通性检测的组合拳：ping/curl/nc
- 监听与连接态的判断：ss/lsof 的高频用法
- DNS 与路由的排查路径：dig/traceroute/ip
- Nginx 反代常见 502/504 的定位思路与 CDN 缓存问题

## 连通性

```bash
ping -c 4 example.com
curl -I https://example.com
curl -v http://127.0.0.1:3000/health
telnet example.com 443      # 或
nc -vz example.com 443
```

## 端口与监听

```bash
ss -lntp | grep 3000   # 监听 TCP 3000
ss -antp | grep ESTAB  # 已建立连接
sudo lsof -i :80
```

## DNS 与路由

```bash
dig example.com +short
traceroute example.com
ip a        # 查看 IP
ip r        # 路由
```

## 场景化速查

- curl
  - 什么时候用：接口联调、跨域/重定向/证书问题定位。
  - 怎么用：curl -vI https://example.com; curl -v http://127.0.0.1:3000/health
  - 小坑：默认不跟随 301/302，需 -L；超时用 --max-time。
- ping
  - 什么时候用：粗略判断网络连通（ICMP）。
  - 怎么用：ping -c 4 api.example.com
  - 小坑：服务器可能禁 ping；不代表 TCP 服务可用。
- nc/telnet
  - 什么时候用：测试 TCP 端口通不通。
  - 怎么用：nc -vz example.com 443
  - 小坑：只测连通不测协议；HTTPS 还需 curl 验证握手/证书。
- ss/lsof
  - 什么时候用：定位谁在监听、连接状态是否拥塞。
  - 怎么用：ss -lntp | grep 80；sudo lsof -i :443
  - 小坑：生产上 ss 更快更准；需 root 看全量信息。
- dig
  - 什么时候用：DNS 解析是否异常/劫持。
  - 怎么用：dig +short example.com；dig @8.8.8.8 example.com
  - 小坑：本地 /etc/hosts 会短路 DNS；注意 CDN CNAME。
- traceroute
  - 什么时候用：路由跳数过多/某个环节丢包。
  - 怎么用：traceroute example.com
  - 小坑：不同网络运营商路径差异大；偶发丢包不一定是问题。

::: details Nginx 反代排错速查
- nginx -t 校验配置
- curl -v 观察 301/302/4xx/5xx
- 日志：/var/log/nginx/access.log, error.log
- 常见 502/504：后端进程挂了/超时；查看 upstream 健康与超时配置
:::

::: tip CDN/缓存问题
- 添加调试 Header：Cache-Control: no-cache
- 强制回源/清缓存
- 前端静态文件带 content hash，配置长缓存
:::

## 命令解读与常见误判

- curl（协议层排错首选）
```bash
curl -vI https://example.com
# 关注点：* TLS 协商/证书摘要；> 请求行 与 < 响应头；Location 重定向；HTTP/2 标识
curl -vk https://self-signed.example.com     # -k 忽略证书（仅排错）
curl -L https://example.com                  # 跟随 30x
curl --max-time 5 http://127.0.0.1:3000/health
```
常见误判：能 ping 不代表 HTTP 可用；30x 未跟随导致误以为 301 是错误。

- ss（监听/连接态判定）
```bash
ss -lntp | grep ':80 '     # LISTEN
ss -antp | grep ESTAB      # 已建立
```
常见误判：LISTEN 存在≠服务就绪（应用可能未完全初始化）；需配合健康检查/日志。

- nc/telnet（端口连通）
```bash
nc -vz host 443
```
常见误判：nc 只测 TCP 握手成功，不代表上层协议健康（HTTPS 仍需 curl 验证）。

- dig（DNS 解析）
```bash
dig +short example.com
dig @8.8.8.8 example.com    # 对比本地与公共 DNS
```
常见误判：本机 /etc/hosts 会“短路”DNS；CDN 场景解析到 CNAME 不等于异常。

- traceroute（路径探测）
```bash
traceroute example.com
```
常见误判：中间跳数偶发超时不一定是故障；看整体延迟与终点可达性。

::: tip 输出阅读小抄
- curl：看协议握手、重定向链路、状态码、关键响应头（Cache-Control、CORS）
- ss：LISTEN/ESTAB/CLOSE_WAIT 数量与变化趋势
- nc：只验证四层连通；若失败，先查防火墙/安全组
:::

## 端口冲突 vs 防火墙（判别路径）

1) 本机是否在“监听”？
```bash
ss -lntp | grep ':<PORT> '
```
- 有监听：大概率是进程冲突（见第 15 章）
- 无监听：不是“被占用”，可能是端口未开放或访问路径不对

2) 远端连通性是否正常？
```bash
nc -vz host <PORT>
```

3) 防火墙/安全组
- 机器内 ufw/iptables；云厂商安全组策略
- 同网段机器互测，定位是“源问题/目的问题/链路问题”

::: details 经验法则
- “能在本机 curl 127.0.0.1 成功，但外网失败”多半是防火墙/安全组
- “偶发 5xx + CLOSE_WAIT 多”检查上游释放与超时设置
:::

## 易错点
- 能 ping 不等于能访问 HTTP：ICMP 与 TCP/HTTP 不同层
- nc 成功不代表应用就绪：只验证四层握手
- 看到 LISTEN 就当服务可用：需看健康检查或实际 HTTP 响应
- CDN 命中导致内容非最新：需加 no-cache 或回源验证

## 练习题（含答案）
1) 本机服务 3000 端口外网不可访问，给出三步最小判定
```bash
# 本机是否监听
ss -lntp | grep ':3000 '
# 外部连通性（从同网段/跳板机）
nc -vz your-host 3000
# 防火墙/安全组（示例：ufw）
sudo ufw status
```
2) 诊断一个 HTTPS 证书问题（自签名/过期）
```bash
curl -vI https://self-signed.example.com
# 观察 TLS 协商/证书摘要；必要时 -k 验证仅为证书问题
```

## 延伸阅读
- man curl, man ss, man nc, man dig, man traceroute
- Cloudflare/阿里云 CDN 缓存排错指南
- Google SRE：监控与排错的黄金信号