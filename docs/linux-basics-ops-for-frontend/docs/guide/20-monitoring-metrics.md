# 20. 监控指标与告警实践（可用性/吞吐/延迟/错误率）

> 目标：为前端运维/轻运维提供一套可落地的监控指标与告警方案，覆盖可用性、吞吐、延迟、错误率与资源饱和度；给出 Prometheus 查询与告警规则、Nginx 指标采集路径和黑盒探测方法。

你将学到
- 指标分类与 SLI/SLO/SLA 基本概念
- 核心四象限：可用性、吞吐、延迟、错误率（加：饱和度）
- Nginx/系统/黑盒探测的指标采集与最小配置
- Prometheus 查询与告警规则（多时间窗、多烧损率）
- 仪表盘与告警治理最佳实践

## 1. 概念与指标框架

- SLI（Service Level Indicator）：服务水平指标（例如 2xx 比例、p95 延迟）
- SLO（Service Level Objective）：目标值（例如 28 天内 2xx ≥ 99.9%）
- SLA（Service Level Agreement）：对外承诺（含违约条款）
- 四象限＋1
  - 可用性：成功率/探测通过率
  - 吞吐：RPS/QPS、带宽
  - 延迟：p50/p90/p95/p99
  - 错误率：4xx/5xx 比例
  - 饱和度：CPU/内存/FD/磁盘/连接数

建议
- 仪表盘顶层只放“少而关键”的红线指标（成功率、p95 延迟、5xx 比例），其余下钻查看
- 指标统一命名与标签约束，避免高基数

## 2. Nginx 指标采集与关键指标

方式一：nginx-prometheus-exporter（推荐）
- 路径：Nginx 暴露 stub_status 或专用指标，再由 exporter 拉取并转为 Prometheus 指标
- 关键指标（不同发行或控制器指标名略有差异）：
  - nginx_connections_active / accepted / handled
  - nginx_http_requests_total{status}
  - nginx_upstream_requests_total{status,upstream}
  - nginx_upstream_response_ms_bucket/sum/count（若存在直方图）
  - 自定义：以日志导出延迟直方图（Ingress Controller 通常已提供）

方式二：Ingress/Nginx 控制器自带指标
- 部署 Nginx Ingress Controller 时启用 metrics，配套 prometheus scraping

补充：系统资源
- node_exporter：CPU、mem、disk、net、fd
- process_exporter 或 cAdvisor（容器化）查看 Nginx/上游服务资源占用

## 3. 黑盒探测（合成监控）

- blackbox_exporter：对外发起 HTTP/TCP/ICMP 探测，验证“用户视角”的可用性
- 最小配置（HTTP 2xx 探测）：
```
# prometheus.yml 抓取 blackbox_exporter
- job_name: blackbox
  metrics_path: /probe
  params:
    module: [http_2xx]
  static_configs:
    - targets:
      - https://fe.example.com/
      - https://api.example.com/health
  relabel_configs:
    - source_labels: [__address__]
      target_label: __param_target
    - source_labels: [__param_target]
      target_label: instance
    - target_label: __address__
      replacement: blackbox-exporter:9115
```
关注结果：probe_success、probe_http_status_code、probe_duration_seconds

## 4. Prometheus 查询示例（按 5m 窗口）

吞吐（RPS）
```
sum by (instance) (rate(nginx_http_requests_total[5m]))
```

错误率（5xx 比例）
```
sum(rate(nginx_http_requests_total{status=~"5.."}[5m]))
/
sum(rate(nginx_http_requests_total[5m]))
```

4xx 比例（可用于前端路由/鉴权问题观察）
```
sum(rate(nginx_http_requests_total{status=~"4.."}[5m]))
/
sum(rate(nginx_http_requests_total[5m]))
```

可用性（2xx 比例近似）
```
sum(rate(nginx_http_requests_total{status=~"2.."}[5m]))
/
sum(rate(nginx_http_requests_total[5m]))
```

延迟直方图（若有 histogram 指标）
```
histogram_quantile(0.95, sum by (le) (rate(nginx_upstream_response_ms_bucket[5m])))
```

活动连接数
```
sum(nginx_connections_active)
```

黑盒可用性
```
avg_over_time(probe_success[5m])
```

## 5. 告警规则（多时间窗、多烧损率）

思路
- 避免“单阈值、单窗”引发的抖动与漏报
- 使用 SLO 多烧损（multi-burn-rate）：短窗快速发现、大窗过滤噪声

示例：服务可用性 SLO=99.9%（错误预算 0.1%）

短窗（5m）快速告警（5% 错误率）
```
- alert: HighErrorRateFast
  expr: |
    ( sum(rate(nginx_http_requests_total{status=~"5.."}[5m])) 
      / sum(rate(nginx_http_requests_total[5m])) ) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High 5xx error rate (fast window)"
    description: "5xx ratio > 5% (5m)"
```

长窗（1h）确认告警（1% 错误率）
```
- alert: HighErrorRateSlow
  expr: |
    ( sum(rate(nginx_http_requests_total{status=~"5.."}[1h])) 
      / sum(rate(nginx_http_requests_total[1h])) ) > 0.01
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "High 5xx error rate (slow window)"
    description: "5xx ratio > 1% (1h)"
```

延迟（p95 > 800ms）
```
- alert: HighLatencyP95
  expr: histogram_quantile(0.95, sum by (le) (rate(nginx_upstream_response_ms_bucket[5m]))) > 0.8
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "High p95 latency"
    description: "p95 latency > 800ms for 10m"
```

黑盒可用性（连续失败）
```
- alert: ProbeDown
  expr: avg_over_time(probe_success[5m]) < 1
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Blackbox probe failed"
    description: "HTTP probe failed for 5 minutes"
```

资源饱和度（示例）
```
- alert: HighCPU
  expr: avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance) < 0.1
  for: 10m
  labels:
    severity: warning
```

## 6. 仪表盘与视图建议

- 顶层：成功率、p95 延迟、5xx 比例、RPS
- 上游维度：按 upstream/service 分组的 5xx 与 p95
- 资源维度：CPU/mem/disk I/O/带宽
- 黑盒：关键入口/站点的探测结果
- 下钻：按路径/path、状态码、实例维度查看

## 7. 告警治理

- 去重/抑制：相同根因聚合；下游失败抑制上游风暴
- 值班友好：夜间“warning”减少噪声，工作时段更敏感
- Runbook：每条告警附排障步骤与相关仪表盘链接
- 验证：定期演练（故障注入/流量回放），检验阈值与流程

## 8. 实操清单（可直接执行）

- [ ] 部署 nginx-prometheus-exporter 或启用 Ingress metrics
- [ ] 部署 node_exporter 与 blackbox_exporter
- [ ] 为 Nginx/黑盒配置抓取任务（Prometheus）
- [ ] 上线顶层仪表盘（成功率、p95、5xx、RPS）
- [ ] 配置多窗多级告警规则，并编写 Runbook
- [ ] 周期性复盘阈值与 SLO，按业务演进调整

## 参考资料
- Prometheus 官方文档：histogram_quantile、rate、recording rules
- nginx-prometheus-exporter、Nginx Ingress Controller 指标说明
- SRE Workbook：SLO 与错误预算