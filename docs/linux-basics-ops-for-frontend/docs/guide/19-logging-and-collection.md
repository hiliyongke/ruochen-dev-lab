# 19. 日志方案对比与采集实践（Nginx/系统日志）

> 目标：为前端运维/轻运维提供一套可直接落地的日志体系：掌握 Nginx 访问/错误日志的结构化配置、系统日志（systemd-journald/rsyslog）关系、日志轮转(logrotate)、以及常见采集链路（Fluent Bit/Filebeat→ELK/ClickHouse/对象存储）。附带排错方法与实操清单。

你将学到
- Nginx 访问/错误日志结构、字段与 JSON 结构化输出
- 系统日志栈（journald、rsyslog、logrotate）的职责分工与常见配置
- 日志轮转/保留策略与磁盘保护
- 采集/传输链路（Fluent Bit/Filebeat）的最小可运行配置
- 快速校验与排错思路（从日志格式→采集→索引/存储）

## 1. 日志体系总览

- 应用层：Nginx 访问日志 access.log、错误日志 error.log（可文本/JSON）
- 系统层：systemd-journald（内核与服务日志缓存）、rsyslog（传统 syslog 守护）
- 轮转层：logrotate 负责切割/压缩/保留策略
- 采集层：Fluent Bit/Filebeat 读取日志文件/系统缓冲，转发到 ES/ClickHouse/对象存储等
- 可观测性：结合指标（Prometheus）与链路追踪（OpenTelemetry），形成三板斧：日志+指标+追踪

建议
- 生产环境统一使用结构化日志（JSON），方便检索与统计
- 明确字段字典与日志级别，约束日志量（抽样/降噪）避免成本与磁盘压力

## 2. Nginx 日志配置（文本与 JSON）

默认访问日志（文本）
```nginx
http {
  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for" '
                  'rt=$request_time uct=$upstream_connect_time '
                  'urt=$upstream_response_time';
  access_log /var/log/nginx/access.log main;

  # 错误日志
  error_log /var/log/nginx/error.log warn;
}
```

JSON 结构化访问日志（推荐）
```nginx
http {
  log_format json escape=json '{'
    '"time_local":"$time_local",'
    '"remote_addr":"$remote_addr",'
    '"request":"$request",'
    '"status":$status,'
    '"body_bytes_sent":$body_bytes_sent,'
    '"request_time":$request_time,'
    '"upstream_addr":"$upstream_addr",'
    '"upstream_status":"$upstream_status",'
    '"upstream_response_time":"$upstream_response_time",'
    '"host":"$host",'
    '"uri":"$uri",'
    '"x_forwarded_for":"$http_x_forwarded_for",'
    '"referer":"$http_referer",'
    '"user_agent":"$http_user_agent"'
  '}';

  access_log /var/log/nginx/access.json.log json;
  error_log  /var/log/nginx/error.log warn;
}
```

字段要点
- request_time/upstream_response_time 用于延迟定位
- upstream_addr/status 快速判断后端实例与错误类型
- x_forwarded_for/remote_addr 辅助溯源（在代理层/NAT 下需结合真实客户端传递）

校验
```bash
nginx -t && nginx -s reload
tail -n 2 /var/log/nginx/access.json.log | jq .
```

## 3. 系统日志：journald 与 rsyslog

- systemd-journald：二进制日志缓存，提供 `journalctl` 查询
- rsyslog：传统 syslog 守护，可从 journald 读取再写入文件或远端
- 关系：多数发行版默认 journald 前端、rsyslog 后端（配置因发行版不同）

常用命令
```bash
# 查看 Nginx 服务日志（systemd 管理）
journalctl -u nginx -S -1h        # 最近1小时
journalctl -u nginx --since today  # 今日

# 关注系统级事件
journalctl -k -S -10m             # 最近10分钟内核日志
```

rsyslog 采集示例（将内核/服务日志转发到远端）
```
# /etc/rsyslog.d/50-forward.conf
*.* @@logs.example.com:514   # TCP
# 或者
*.* @logs.example.com:514    # UDP
```

注意
- journald 默认保留与上限策略可能导致磁盘占用增长：检查 /etc/systemd/journald.conf 中的 SystemMaxUse/RuntimeMaxUse
- 生产常见策略：保留近 N 天的日志 + 远端集中存储

## 4. 日志轮转（logrotate）

目标：控制单个日志文件大小与历史保留，避免磁盘被写满。

Nginx logrotate 示例（Debian/Ubuntu 类）
```
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
  daily
  rotate 14
  missingok
  compress
  delaycompress
  notifempty
  create 0640 www-data adm
  sharedscripts
  postrotate
    [ -s /run/nginx.pid ] && kill -USR1 "$(cat /run/nginx.pid)"
  endscript
}
```
说明
- USR1 向 Nginx 发送 reopen 信号，切换到新日志文件继续写入
- rotate 14 + compress 控制保留 14 天并压缩历史日志
- prod 场景建议结合磁盘监控/告警，提前预警

## 5. 日志采集与传输

方案选择
- Fluent Bit：轻量高性能，适合边缘/容器节点
- Filebeat：生态成熟，适配 ELK
- 远端目标：Elasticsearch/OpenSearch、ClickHouse、对象存储（S3 兼容）、Kafka 等

Fluent Bit 读取 Nginx JSON 文件 → Elasticsearch
```
# /etc/fluent-bit/fluent-bit.conf
[SERVICE]
  Parsers_File  parsers.conf

[INPUT]
  Name   tail
  Path   /var/log/nginx/access.json.log
  Parser json
  Tag    nginx.access

[OUTPUT]
  Name  es
  Match nginx.*
  Host  es.example.com
  Port  9200
  Index nginx-%Y.%m.%d
```

Filebeat 读取文本 → ES（内置 Nginx 模块）
```
# /etc/filebeat/filebeat.yml
filebeat.modules:
  - module: nginx
    access:
      enabled: true
      var.paths: ["/var/log/nginx/access.log*"]
    error:
      enabled: true
      var.paths: ["/var/log/nginx/error.log*"]

output.elasticsearch:
  hosts: ["es.example.com:9200"]
```

容器场景
- 优先输出到 stdout/stderr（结构化 JSON），用 DaemonSet（Fluent Bit/Filebeat）从容器运行时/日志目录采集
- Nginx Ingress Controller 已内置 JSON 日志与指标，建议与集群统一

## 6. 校验与排错流程

分层检查（从近到远）
1) 文件生成：nginx access/error 是否持续更新？权限/SELinux/AppArmor 是否阻挡？
2) 格式正确：JSON 能否被 jq 正确解析？字段是否齐全？
3) 轮转生效：logrotate 是否按期切割？USR1 是否触发成功？
4) 采集进程：Fluent Bit/Filebeat 日志是否报错（权限、偏移、解析器）？
5) 传输通路：网络/鉴权是否正常？目标端索引/表是否创建？
6) 检索结果：目标端是否可查询到预期字段/时间窗数据？

常用命令
```bash
sudo ls -lh /var/log/nginx/
sudo tail -f /var/log/nginx/access.json.log
sudo logrotate -df /etc/logrotate.d/nginx
sudo systemctl status fluent-bit filebeat
curl -s http://es.example.com:9200/_cluster/health | jq .
```

## 7. 最佳实践清单（可直接执行）

- [ ] 统一 Nginx 访问日志为 JSON，定义并固化字段字典
- [ ] 为 access/error 启用 logrotate，保留 14~30 天（结合磁盘与合规）
- [ ] journald 设置磁盘上限，避免日志挤占生产空间
- [ ] 选择 Fluent Bit 或 Filebeat，配置最小可用采集链路并接入目标端
- [ ] 建立“日志-指标-追踪”合流的告警视图（延迟/错误率与关键日志）
- [ ] 编写“排错 SOP”：出现 5xx/超时/突增延迟时的分层检查步骤
- [ ] 对高流量/高成本场景启用采样或降噪策略（黑名单/白名单/字段裁剪）

## 参考资料
- Nginx 官方文档：log_format、access_log、error_log
- systemd-journald、journalctl、rsyslog 官方指南
- logrotate 手册
- Fluent Bit/Filebeat 官方文档与 Nginx 模块
- Elastic/OpenSearch、ClickHouse 日志分析最佳实践