# 03. 权限与用户管理

> 引言：权限不只是“能不能执行”的问题，更是“安全边界”。拿捏好 chmod/chown 与 sudoers，就能在“够用与安全”之间找到平衡。

你将学到：
- rwx 与八进制权限的直觉理解，以及属主/属组的关系
- 最小权限落地：静态站/Nginx 的合理权限模型
- visudo 配置 sudo 白名单的安全姿势
- 常见坑：npm 全局安装权限、目录 777 的隐患

## 基础概念

- 三元权限：user/group/others 与 rwx 位。
- 八进制：755= rwx r-x r-x；644= rw- r-- r--。
- 所有权：chown user:group file
- 提权：sudo、sudoers、NOPASSWD 配置（需谨慎）

## 常用命令

```bash
id            # 查看当前用户/组
whoami        # 当前用户名
groups USER   # 用户所属组
chmod 644 file
chmod -R 755 /var/www
chown -R www-data:www-data /var/www/app
```

## 实战：为前端静态站点设置最小权限

- 代码目录：属主为部署用户，Nginx 仅读
```bash
sudo chown -R deploy:deploy /var/www/site
sudo chmod -R u=rwX,g=rX,o=rX /var/www/site
```

## 实战：限定 sudo 权限

::: warning 风险提示
编辑 sudoers 前请使用 visudo 打开，避免语法错误导致无法 sudo。
:::

- 编辑 sudoers（使用 visudo 保证语法校验）
```bash
# 允许 deploy 用户无密码重启 nginx 与 systemctl reload nginx
deploy ALL=(root) NOPASSWD: /usr/sbin/nginx, /bin/systemctl reload nginx
```

::: details 常见问题
- npm 全局安装权限冲突：使用 nvm 与每用户 node 安装，避免 sudo npm -g。
- 目录 777 带来的安全隐患：优先精确权限；临时目录用 sticky bit（/tmp 默认）。
:::

## 命令解剖（看得懂就能用得对）

- chmod 模式位
```bash
# 八进制：u/g/o 三组位，每位 r=4 w=2 x=1
chmod 644 file   # u=rw, g=r, o=r
chmod 755 dir    # u=rwx, g=rx, o=rx（常见于目录/可执行）
# 符号式：更适合“增删某一位”
chmod g+w file   # 给属组加写权限
chmod o-x dir    # 去掉 others 的执行位
```
- 目录与执行位
  - 目录的 x 代表“可进入（traverse）”，没有 x 则 cd 不进去，即使 r 能列名
- chown 与 chgrp
```bash
sudo chown user:group path -R  # 递归修改属主与属组
sudo chgrp www-data -R /var/www
```
- umask（默认创建权限的“掩码”）
```bash
umask          # 查看，如 0022
# 文件默认 666-umask, 目录默认 777-umask
```
- sudoers（最小权限白名单）
```bash
# 仅允许 deploy 无密码执行 nginx 测试与 reload
deploy ALL=(root) NOPASSWD: /usr/sbin/nginx -t, /bin/systemctl reload nginx
```

## 场景化练习（可复制）

- 场景1：Nginx 托管静态站，确保 web 用户仅读
```bash
sudo chown -R deploy:deploy /var/www/site
sudo chmod -R u=rwX,g=rX,o=rX /var/www/site
# Nginx 仅需读/遍历，不需要写
```
- 场景2：日志目录让 Nginx 可写但他人不可改
```bash
sudo mkdir -p /var/log/myapp
sudo chown -R www-data:www-data /var/log/myapp
sudo chmod 750 /var/log/myapp
```
- 场景3：授予发布用户“仅能”重启指定服务
```bash
# 使用 visudo 编辑
deploy ALL=(root) NOPASSWD: /bin/systemctl restart myapp
```

## 安全提示
- 禁用“偷懒式 777”：目录缺 x 无法进入，文件缺 x 无法执行，按需给位更安全
- sudoers 变更先演练：命令路径要写绝对路径，避免被别名/路径劫持
- 团队规范：约定部署用户与 web 用户，避免混用 root