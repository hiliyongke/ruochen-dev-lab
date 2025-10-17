# 14. 跳板机与堡垒机（SSH Jump/Proxy）

> 引言：在多环境隔离与合规要求下，跳板机/堡垒机是常态。掌握 SSH 的跳转与转发能力，连得上、连得稳，还能更安全更高效。

你将学到：
- 什么是跳板机/堡垒机，典型访问路径
- 一跳/多跳登录：ssh -J 与 ProxyJump / ProxyCommand
- 端口转发：本地/远程/动态（SOCKS）代理
- 连接稳定性与安全注意事项

## 基础概念

- 跳板机（Jump Host）：暴露在外网，用来中转到内网主机
- 堡垒机（Bastion）：在跳转基础上提供审计、权限、审批等能力
- 典型路径：本地 → 跳板机 → 目标主机

## 快速开始：ssh -J

```bash
# 通过 jump.example.com 跳转到 10.0.0.10
ssh -J user@jump.example.com user@10.0.0.10
```

## ~/.ssh/config（推荐）

```ini
Host jump
  HostName jump.example.com
  User jumpuser
  IdentityFile ~/.ssh/id_ed25519

Host app-prod
  HostName 10.0.0.10
  User deploy
  ProxyJump jump
  IdentityFile ~/.ssh/id_ed25519
  ServerAliveInterval 60
  ServerAliveCountMax 3
```

使用：
```bash
ssh app-prod
scp -r dist/ app-prod:/var/www/site
rsync -avz --delete dist/ app-prod:/var/www/site
```

::: tip 多跳
多跳时可链式使用 ProxyJump：ProxyJump jump1,jump2
:::

## ProxyCommand（兼容老环境）

```ini
Host app-prod-old
  HostName 10.0.0.20
  User deploy
  ProxyCommand ssh -W %h:%p jump
```

## 端口转发

- 本地转发（LocalForward）：把“目标服务端口”映射到本地
```ini
Host app-db
  HostName 10.0.0.11
  User deploy
  ProxyJump jump
  LocalForward 5433 127.0.0.1:5432
```
连接本地 5433 即等于连接远端 5432。

- 远程转发（RemoteForward）：把“本地端口”暴露给远端（谨慎使用）
```ini
Host app-remote
  HostName 10.0.0.12
  User deploy
  ProxyJump jump
  RemoteForward 18080 127.0.0.1:8080
```

- 动态代理（SOCKS5）
```bash
# 在本地 1080 开启 SOCKS5 代理，浏览器设置使用 127.0.0.1:1080 即可
ssh -D 1080 -N -J user@jump.example.com user@10.0.0.10
```

## 连接稳定性与复用

```ini
Host *
  ServerAliveInterval 30
  ServerAliveCountMax 3
  TCPKeepAlive yes
  ControlMaster auto
  ControlPath ~/.ssh/cm-%r@%h:%p
  ControlPersist 10m
```

::: info 说明
- ControlMaster 连接复用可显著加快多次 ssh/scp/rsync 操作
- 某些环境禁用复用，可按需调整
:::

## 安全注意事项

- 限制 Agent 转发：ForwardAgent 默认关闭，谨慎开启，避免私钥被滥用
- 最小权限：堡垒机仅开放必要命令与目标，结合审计
- 主机指纹：首次连接确认，避免 MITM；变更指纹需核实来源
- 审计合规：遵循团队流程（审批、授权时长、录屏/命令审计）

::: details 常见问题
- known_hosts 冲突：Host key changed 报错时，确认后清理对应条目（~/.ssh/known_hosts）
- 连接易断：增加 ServerAliveInterval/Count；或使用 mosh（需环境支持）
- sftp/rsync 走跳板：配置 ProxyJump 后可直接使用别名主机
:::

## 易错点
- 跳板机放开过多权限未审计
- 长期开启 ForwardAgent 导致风险
- 多跳链路未配置保活，弱网下易断

## 练习题（含答案）
1) 使用 ProxyJump 配置本地端口转发访问远端数据库
```ini
Host db
  HostName 10.0.0.11
  User deploy
  ProxyJump jump
  LocalForward 5433 127.0.0.1:5432
```
2) 为常用主机开启连接复用以提升 scp/rsync 体验
```ini
Host *
  ControlMaster auto
  ControlPath ~/.ssh/cm-%r@%h:%p
  ControlPersist 10m
```

## 延伸阅读
- OpenSSH：ProxyJump/ProxyCommand 文档
- Bastion 最佳实践与合规建议
- mosh：弱网远程终端方案