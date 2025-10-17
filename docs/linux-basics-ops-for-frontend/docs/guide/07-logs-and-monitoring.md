# 07. 日志与监控

> 引言：日志像“黑匣子”，监控像“体检报告”。看得见，才改得动。本章给你可复制的查日志套路与轻量监控建议。

你将学到：
- tail/journalctl 的高效使用，如何快速定位异常窗口
- grep/awk/jq 组合做定向检索与统计
- Logrotate 的基本配置与常见字段含义
- 监控四指标与告警建议（以问题感知为导向）

## 即时查看

```bash
tail -n 200 -f /var/log/nginx/error.log
journalctl -u app -n 200 -f
```

## 场景化速查

- tail
  - 什么时候用：实时追日志看“刚刚发生了什么”。
  - 怎么用：tail -n 200 -f /var/log/nginx/error.log
  - 小坑：轮转后句柄可能变化；配合 logrotate 使用 copytruncate。
- journalctl
  - 什么时候用：systemd 管理的服务日志统一查看。
  - 怎么用：journalctl -u app --since "1 hour ago" | grep -i error
  - 小坑：默认分页输出，可加 -n/-f；注意系统时间与时区。
- awk
  - 什么时候用：对 access.log 做按列统计。
  - 怎么用：awk '$9 ~ /5[0-9][0-9]/ {print $7}' access.log | sort | uniq -c | sort -nr | head
  - 小坑：字段分隔符随日志格式变化；先确认 log_format。
- jq
  - 什么时候用：结构化 JSON 日志过滤。
  - 怎么用：jq 'select(.level=="error") | .msg' app.json.log
  - 小坑：非 JSON 日志会解析失败；可用 grep 先初筛。

## 搜索与过滤

```bash
# 最近 1 小时内的 ERROR
journalctl -u app --since "1 hour ago" | grep -i "error"

# Nginx 4xx/5xx 统计 Top10 Path
awk '$9 ~ /4[0-9][0-9]|5[0-9][0-9]/ {print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head
```

## Node 应用日志

- 结构化日志（JSON）+ jq 过滤
```bash
# pm2/自定义输出
cat app.log | jq 'select(.level == "error") | .msg'
```

## 监控建议

- 基础四类：CPU/内存/磁盘/网络
- 日志平台：ELK/EFK，或轻量 filebeat+Logrotate
- 警报：磁盘阈值、服务存活、接口错误率

## Logrotate 基础

:::

## 易错点
- 仅看 access.log 不看 error.log，错过关键异常
- 没有按时间窗口过滤，导致排错范围过大
- 日志轮转后跟踪的文件句柄未更新，tail -f 看到的不是最新

## 练习题（含答案）
1) 统计 Nginx 过去 1 小时 5xx 路径 Top10
```bash
awk '$9 ~ /5[0-9][0-9]/ {print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head
```
2) 用 journalctl 查看某服务最近 200 行并过滤 ERROR
```bash
journalctl -u app -n 200 | grep -i ERROR
```

## 延伸阅读
- Journalctl 官方指南
- Logrotate 手册与常用选项
- SRE 指标四象限与日志实践 details 配置示例（/etc/logrotate.d/app）
```
/var/www/app/logs/*.log {
  daily
  rotate 14
  compress
  missingok
  notifempty
  copytruncate
}
```
:::