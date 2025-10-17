# 08. 磁盘与存储

> 引言：磁盘告警是最影响交付心情的突发事件。学会“先看哪儿、再清什么、怎么不再发生”，就能从容应对。

你将学到：
- df/du/ncdu 的定位节奏与各自适用场景
- 清理策略：日志轮转、构建产物保留、缓存治理
- 常见清理命令的安全范式与预演手法
- Docker 环境下的额外注意事项

## 快速总览

```bash
df -h            # 分区使用率
du -sh *         # 当前目录体积
sudo ncdu /      # 交互式查看（需安装）
```

## 清理策略

- 日志轮转：logrotate
- 历史构建产物：保留 N 版
- Nginx 缓存与临时文件：定期清理
- Docker 环境（如有）：docker system prune（谨慎）

## 常见清理命令

```bash
# 删除 7 天前的 .log 压缩包
find /var/log -type f -name "*.gz" -mtime +7 -delete

# 清理 node_modules 缓存（CI 场景按需）
npm cache verify
```

风险提示：删除命令前先用 -print 预览。
```bash
find /path -type f -name "*.tmp" -mtime +3 -print
```

## 命令解剖（df/du/find）

- df：看“分区”使用率（宏观）
```bash
df -h                # 人类可读单位
df -hT               # 带文件系统类型
```
- du：看“目录/文件”体积（微观）
```bash
du -sh *             # 当前层级大小
sudo du -xh / | sort -h | tail   # 快速找到最大目录（-x 同一文件系统）
```
- find 清理的安全范式
```bash
# 先预演（-print），确认匹配范围再执行删除
find /var/log -type f -name "*.gz" -mtime +7 -print
# 确认无误后再删除
find /var/log -type f -name "*.gz" -mtime +7 -delete
```

## 排查清单（从快到准）
1) df -h 确认是哪个分区告警
2) du -sh /var /home /opt … 缩小范围
3) ncdu / 交互确认“真凶”目录
4) find 结合 -mtime/-size 精准定位大文件
5) 日志是否未轮转/卡死：检查 logrotate 与 journald 限制
6) Docker 占用：docker system df; docker image prune -f（谨慎）

## 常见坑与对策
- 删除后空间不回收：文件仍被进程占用（deleted 但句柄没关），用 lsof | grep deleted 定位并重启进程
- 跨挂载点统计混乱：du 缺 -x 会跨到其他分区
- 一次删太猛：建议分批删除，或先压缩归档再删

## 安全提示
- 永远先 -print 预演；涉及系统级目录（/var、/etc）务必细粒度匹配
- logrotate 配置改动要用 logrotate -d 预演，再 -f 强制轮转验证

## 易错点
- 删除后空间不回收：进程仍持有文件句柄（lsof | grep deleted）
- du 未加 -x 跨挂载统计导致误判
- 一次性删除过量数据导致服务异常（建议分批或先归档）

## 练习题（含答案）
1) 找到 /var 下体积最大的 20 个目录
```bash
sudo du -xh /var | sort -h | tail -n 20
```
2) 预演并删除 30 天前的压缩日志
```bash
find /var/log -type f -name "*.gz" -mtime +30 -print
find /var/log -type f -name "*.gz" -mtime +30 -delete
```

## 延伸阅读
- ncdu 项目主页（交互式磁盘分析）
- journald 存储限制与清理
- Logrotate 高级用法