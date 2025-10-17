# 13. 文件传输与备份

> 引言：稳定的传输与可靠的备份，是一切发布与恢复的基石。选对工具、约定清晰，就能降低操作成本与事故风险。

你将学到：
- 上传/下载的常见方式：scp、rsync、SFTP
- 大文件/大量小文件的传输策略与断点续传
- 差量/镜像/快照备份与恢复演练
- 定时任务的落地与常见坑位

## 基础工具对比

- scp：一次性、小体量、简单直传
- rsync：增量、断点续传、删除对齐、排除规则
- SFTP：交互式/GUI 客户端常用（如 FileZilla、Transmit）
- HTTP 下载：curl/wget（拉取依赖/构建产物）

::: tip 选择建议
- 发布/同步：优先 rsync（增量、可对齐）
- 临时小量：scp 够用
- 跨平台 GUI：SFTP 客户端
:::

## 上传与下载

```bash
# scp：上传整个目录
scp -r dist/ user@server:/var/www/site

# rsync：增量同步 + 删除目标多余文件（谨慎）
rsync -avz --delete dist/ user@server:/var/www/site

# rsync：忽略某些文件/目录
rsync -avz --delete --exclude ".DS_Store" --exclude "node_modules" ./ user@server:/var/www/app

# SFTP（交互式）
sftp user@server
sftp> put -r dist/ /var/www/site
```

::: warning 风险提示
--delete 会删除目标多余文件，上线前请先在测试环境验证，或临时去掉 --delete 观测差异。
:::

## 大文件与断点续传

```bash
# rsync 断点续传
rsync -avzP big.tar.gz user@server:/data/backup/
# -P 等价于 --partial --progress；必要时加 --inplace 减少额外空间占用
```

小文件极多时的加速建议：
- 打包再传：先 tar -czf 再 rsync（减少元数据开销）
- 或使用 rsync --checksum 在内容变更时才传输（权衡 CPU 开销）

## 压缩与归档

```bash
# 打包压缩（保留相对路径）
tar -C /var/www/site -czf site-$(date +%F).tgz .

# 解压到目标目录
tar -xzf site-2025-10-14.tgz -C /var/www/site/releases/2025-10-14
```

::: tip 目录建议
打包时用 -C 切换到上级，避免生成过深路径；归档目录建议按日期或版本号归档，便于回滚。
:::

## 差量/镜像/快照备份

- 镜像备份：对齐为“目标=来源”的镜像（rsync --delete）
- 差量备份：仅备份变更部分（rsync 默认即增量）
- 快照备份：硬链接复用未变更文件，节省空间

```bash
# 快照式备份（基于硬链接）
# 初始全量
rsync -a --delete /data/ app@backup:/backup/snapshots/$(date +%F)-full
# 之后按日增量（与上一版本硬链接未变更文件）
rsync -a --delete --link-dest=/backup/snapshots/2025-10-13-full \
  /data/ app@backup:/backup/snapshots/2025-10-14
```

::: warning 文件系统要求
--link-dest 要求源与目标在同一挂载内管理链接关系；跨盘/跨机需注意限制。复杂场景建议用专门备份工具。
:::

## 数据库轻量备份示例（可选）

```bash
# MySQL
mysqldump -u user -p --single-transaction --routines --triggers dbname | gzip > db-$(date +%F).sql.gz

# PostgreSQL
PGPASSWORD=pass pg_dump -U user -d dbname -F c -f db-$(date +%F).dump
```

::: tip 恢复校验
备份只有在“能恢复”时才有意义。抽样做恢复演练，校验完整性与耗时。
:::

## 定时任务（crontab）

```bash
# 编辑定时任务
crontab -e

# 每日 02:30 打包站点并增量同步到备份机
30 2 * * * tar -C /var/www/site -czf /backup/site-$(date +\%F).tgz . && rsync -avz /backup/site-*.tgz backup@10.0.0.2:/backup/site/
```

::: details 常见问题
- 环境变量：cron 环境不同于交互式 shell，必要时写绝对路径或在脚本内 source 环境
- 错误输出：将 2>&1 重定向到日志，便于排查
- 时间与时区：注意服务器时区与夏令时
:::

## ZMODEM rz/sz 传输（终端内直传）

> 适用：在 Xshell、SecureCRT、iTerm2（配合脚本）等支持 ZMODEM 的终端中，直接在 SSH 会话里“秒传”文件，免去中间工具。

安装：
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y lrzsz

# CentOS/RHEL
sudo yum install -y lrzsz

# macOS（本机）
brew install lrzsz
```

常用：
```bash
# 服务器会话内执行，弹出本地文件选择对话框（由终端实现）
rz           # 接收（从本地上传到服务器当前目录）

# 服务器会话内执行，导出文件（由终端接收）
sz filename  # 发送（从服务器下载到本地）
```

iTerm2 配置提示（可选）：
- 安装 iterm2-zmodem 脚本，配置 Triggers 以自动识别 rz/sz 协议
- rz/sz 依赖终端的 ZMODEM 支持，不同客户端操作略有差异

::: warning 注意
- rz/sz 在“服务器端”执行命令，由“客户端终端”负责弹窗与保存路径
- 大量小文件建议先打包再传，提高效率
:::

## 恢复与回滚建议

- 预案清单：恢复顺序（配置→静态→数据库→服务）、验证项、回滚点
- 原子切换：软链切换当前版本（ln -sfn），失败即切回
- 验证窗口：健康检查、核心页面/接口抽样、自检脚本

## 易错点
- rsync --delete 未演练导致删除目标多余文件
- 用 scp 传大量小文件效率低，未先打包
- cron 环境变量缺失导致脚本运行失败

## 练习题（含答案）
1) 使用 rsync 做增量同步并保留进度显示与断点续传
```bash
rsync -avzP ./dist/ user@server:/var/www/site/
```
2) 编写每日 02:30 定时备份任务（含打包与远端同步）
```bash
30 2 * * * tar -C /var/www/site -czf /backup/site-$(date +\%F).tgz . && rsync -avz /backup/site-*.tgz backup@10.0.0.2:/backup/site/
```

## 延伸阅读
- rsync 官方文档与 --link-dest 快照策略
- crontab 环境注意事项
- ZMODEM/iTerm2 配置指引