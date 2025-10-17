# 09. SSH 与安全

> 引言：连得上，才谈得上运维；连得稳，才能谈安全与效率。本章从连接到加固，给你一套默认可用的 SSH 实践。

你将学到：
- 生成与管理 SSH 密钥、配置多主机别名
- scp/rsync 在发布与同步中的差异与选择
- 基础加固：仅密钥登录、fail2ban/ufw 与最小权限原则
- 团队离职回收与密钥轮换的操作建议

## 基础

```bash
# 生成密钥（不覆盖现有）
ssh-keygen -t ed25519 -C "you@example.com"
# 上传公钥到服务器
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
```

~/.ssh/config
```ini
Host my-server
  HostName 1.2.3.4
  User deploy
  IdentityFile ~/.ssh/id_ed25519
  Port 22
```

## 常见操作

```bash
ssh my-server
scp -r dist/ my-server:/var/www/site
rsync -avz --delete dist/ my-server:/var/www/site
```

## 场景化速查

- ssh
  - 什么时候用：登录服务器执行一次性操作/排错。
  - 怎么用：ssh -i ~/.ssh/id_ed25519 deploy@1.2.3.4；结合 ~/.ssh/config 使用别名 ssh my-server
  - 小坑：首次连接指纹校验；端口非 22 需 -p 指定或 config 配置。
- scp
  - 什么时候用：简单、少量文件的单次上传下载。
  - 怎么用：scp -r dist/ my-server:/var/www/site
  - 小坑：不擅长大体量/增量同步；会全量重传。
- rsync
  - 什么时候用：发布/备份的增量同步与对齐。
  - 怎么用：rsync -avz --delete dist/ my-server:/var/www/site
  - 小坑：--delete 会删除目标多余文件，先在测试环境验证；带宽受制网路与压缩比。

## 加固建议

- 关闭密码登录，启用仅密钥认证
- fail2ban/ufw 基础防护
- 最小权限原则：限定 sudo 范围
- 定期更换密钥，及时回收离职人员权限

## SSH 最佳实践清单

- 密钥算法：优先 ed25519，强口令保护私钥
- 服务器加固（/etc/ssh/sshd_config）：
```ini
PasswordAuthentication no
PermitRootLogin no
MaxAuthTries 3
ClientAliveInterval 60
ClientAliveCountMax 3
```
- 连接复用（本机 ~/.ssh/config）：
```ini
Host *
  ServerAliveInterval 30
  ServerAliveCountMax 3
  TCPKeepAlive yes
  ControlMaster auto
  ControlPath ~/.ssh/cm-%r@%h:%p
  ControlPersist 10m
```
- 代理与跳板：ProxyJump 优先，老环境可用 ProxyCommand；谨慎开启 ForwardAgent（默认关闭）
- 指纹与 known_hosts：首次确认指纹；变更需核实后更新 known_hosts
- 防护：启用 fail2ban 基础规则，UFW 仅放通必要端口（22/80/443 等）

## 易错点
- 仅关闭密码登录但仍允许 root 登录
- ForwardAgent 长期开启，存在私钥被滥用风险
- 未设置连接保活，易在弱网环境下间歇断连

## 练习题（含答案）
1) 关闭密码登录并禁止 root 直连
```ini
# /etc/ssh/sshd_config
PasswordAuthentication no
PermitRootLogin no
# 重载
sudo systemctl reload sshd
```
2) 配置跳板机与连接复用
```ini
# ~/.ssh/config
Host jump
  HostName jump.example.com
  User jumpuser
Host app
  HostName 10.0.0.10
  User deploy
  ProxyJump jump
Host *
  ControlMaster auto
  ControlPath ~/.ssh/cm-%r@%h:%p
  ControlPersist 10m
```

## 延伸阅读
- OpenSSH 手册：ssh/sshd_config 选项大全
- Mozilla Infosec：SSH 加固建议
- mosh 项目：弱网下更稳的远程终端