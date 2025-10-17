# 04. 进程与服务管理

> 引言：应用上线后，最常见的问题是“跑没跑、卡没卡、挂没挂”。这章教你用进程与服务的视角“看见系统”，并用 systemd 把服务管稳。

你将学到：
- ps/top/htop 等快速定位资源与进程的方法
- 后台运行的几种方式以及为何更推荐用 systemd/pm2
- 一份可复用的 Node 服务 systemd 单元模板与排查命令
- 端口占用、僵死进程与环境变量未生效的解决路径

## 进程与资源

```bash
ps aux | grep node
top           # 交互式，总览
htop          # 更友好（需安装）
free -h       # 内存
uptime        # 负载
vmstat 1 5    # 快速观测
```

## 场景化速查

- ps
  - 什么时候用：判断进程是否在、挂了几个副本、命令行参数。
  - 怎么用：ps aux | grep node | grep -v grep
  - 小坑：grep 自匹配可用 pgrep -fl node 或用 grep -v grep 过滤。
- top/htop
  - 什么时候用：机器“卡顿”时看 CPU/内存/Load 的第一视角。
  - 怎么用：top（按 1 看各 CPU），htop（更友好、可筛选/结束进程）。
  - 小坑：短时高负载不等于问题；结合 uptime 历史负载判断。
- systemctl
  - 什么时候用：以“服务”视角启停与开机自启。
  - 怎么用：sudo systemctl enable --now app; sudo systemctl status app -l
  - 小坑：修改 unit 后需 sudo systemctl daemon-reload；环境变量需写 Environment/File。
- journalctl
  - 什么时候用：看服务日志与最近异常堆栈。
  - 怎么用：sudo journalctl -u app -n 200 -f
  - 小坑：容器或非 systemd 进程无此日志；注意 --since/--until 时间窗。
- lsof/ss
  - 什么时候用：排查端口占用、连接状态。
  - 怎么用：lsof -i :3000；ss -lntp | grep 3000
  - 小坑：需要 root 才能看到完整进程名/所有者。

## 后台与会话保持

- &、nohup、disown
- 推荐：pm2 或 systemd 管理 Node 服务

```bash
# 临时：后台运行并输出日志文件
nohup node server.js > app.out 2>&1 & disown
```

## systemd 管理服务（推荐生产）

示例：/etc/systemd/system/app.service
```ini
[Unit]
Description=My Node App
After=network.target

[Service]
User=deploy
Group=deploy
WorkingDirectory=/var/www/app
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production
# 可选：环境文件
# EnvironmentFile=/var/www/app/.env

[Install]
WantedBy=multi-user.target
```

命令：
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now app
sudo systemctl status app -l
sudo journalctl -u app -n 200 -f
sudo systemctl restart app
```

## systemd 模板库（可直接复用）

### Node 服务（端口 3000）
```ini
[Unit]
Description=My Node App
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/var/www/app
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production
# 健康检查：超时与重启策略
StartLimitInterval=0
TimeoutStartSec=30
# 非 root 运行（建议）
User=deploy
Group=deploy

[Install]
WantedBy=multi-user.target
```

### 静态站（Nginx 托管）
- Nginx 自身用 systemd 管理，一般无需自定义 unit
- 采用“版本目录 + 软链 current”的原子切换，发布后 reload

### 反向代理上游健康（Nginx 片段）
```nginx
upstream app {
  server 127.0.0.1:3000 max_fails=3 fail_timeout=10s;
  keepalive 32;
}
server {
  listen 80;
  server_name example.com;
  location / {
    proxy_pass http://app;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_read_timeout 30s;
  }
}
```

::: tip 资源限制与自恢复
- 资源限制：可用 systemd 的 MemoryMax/CPUQuota 或在容器内限制
- 自恢复：Restart=always + 合理 RestartSec；配合探活端点 /health
:::

## 端口占用排查清单

- 确认监听：`ss -lntp | grep ':<PORT> '`
- 找到进程：`sudo lsof -i :<PORT>`
- 判断来源：看命令行/工作目录/用户
- 处置路径：
  1) systemd 管理：`sudo systemctl restart <service>`
  2) 临时进程：kill PID（必要时 -9）
  3) 反代冲突：确认是否应该由 Nginx 监听
- 防火墙与冲突：若本地未监听但外部不可达，检查防火墙/安全组（见第 06 章）

::: tip 小技巧
- pgrep -fl node 可避免 grep 自匹配
- 用 `journalctl -u <service> -n 200 -f` 边重启边看日志
:::

## Nginx 服务

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx
```

::: details 常见问题
- 端口被占用：lsof -i :3000 或 ss -lntp | grep 3000
- 进程僵死：使用 systemd+健康检查/超时；pm2 的重启策略。
- 环境变量未生效：systemd 下使用 Environment/EnvironmentFile。
:::