# 18. Kubernetes 入门（前端运维向）

> 引言：Kubernetes（K8s）是容器编排事实标准。本章面向前端/轻运维，聚焦“把服务跑起来—可观测—可回滚”的最小闭环与高频操作，避免过度概念负担。

你将学到
- Pod / Deployment / Service / Ingress 的关系与最小上线闭环
- kubectl 常用命令与“命令-输出-解释”三段式用法
- 滚动更新、回滚、查看日志与事件的标准流程
- Service 类型对比、Ingress 前置条件、探针与资源（Requests/Limits）建议
- 分层排错套路与高频错误词典

## 背景与核心概念

- Pod：K8s 中最小的调度单元，通常承载 1 个主容器（可含辅容器）。
- Deployment：声明式控制器，管理无状态服务的副本数、滚动发布与回滚。
- Service（服务）：为一组 Pod 提供稳定访问入口与负载均衡。常见类型：
  - ClusterIP：集群内访问（默认）。
  - NodePort：在每个节点开放端口用于集群外访问（简单暴露）。
  - LoadBalancer：由云厂商或外部 LB 提供公网/专网入口。
  - Headless（clusterIP: None）：不做负载，提供直达 Pod 的 DNS 记录。
- Ingress（入口）：七层路由，按域名/路径把流量转发到 Service。需要预先安装 Ingress Controller（如 Nginx Ingress、Traefik）。
- Namespace：逻辑隔离与资源配额边界。建议区分 dev/staging/prod。
- Requests/Limits：调度与限流的资源配额，避免互相“抢资源”与 OOM。

术语与对象速览
- 滚动更新（RollingUpdate）：逐步替换旧副本，保证服务可用性。
- 回滚（Rollback）：恢复到历史修订版本。
- 探针（Probe）：就绪（Readiness）/ 存活（Liveness）健康检查。

## 快速上手（最小闭环）

前置条件
- 客户端：kubectl ≥ 1.26，已配置 kubeconfig（能 kubectl get nodes）。
- 集群：能拉取镜像（如配置了 imagePullSecrets），已安装 Ingress Controller 才能使用 Ingress。
- DNS：域名解析指向 Ingress LB；本地调试可通过 hosts 映射。

最小可运行示例

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fe
  labels: { app: fe }
spec:
  replicas: 2
  selector:
    matchLabels: { app: fe }
  template:
    metadata:
      labels: { app: fe }
    spec:
      containers:
        - name: fe
          image: registry.example.com/fe/my-fe:1.0.0
          ports:
            - containerPort: 80
          # 建议：设置资源与探针（示例值可按服务调整）
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet: { path: /healthz, port: 80 }
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 2
            failureThreshold: 3
          livenessProbe:
            httpGet: { path: /healthz, port: 80 }
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: fe-svc
  labels: { app: fe }
spec:
  type: ClusterIP
  selector: { app: fe }
  ports:
    - name: http
      port: 80
      targetPort: 80
---
# ingress.yaml（需集群已安装 Ingress Controller）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fe-ing
  annotations:
    # 视 Controller 而定（示例：nginx）
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  ingressClassName: nginx
  rules:
    - host: fe.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: fe-svc
                port:
                  number: 80
```

说明
- Deployment：副本数 replicas；labels/selector 必须匹配。
- Service：selector 选择一组 Pod，port 是服务对外端口，targetPort 指向容器端口。
- Ingress：需 ingressClassName 与已安装的 Controller 一致；host 需解析到 LB。
- 资源与探针：给出合理默认，避免“能跑但不稳”。

NodePort 简化暴露（无 Ingress 场景）：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: fe-svc-nodeport
spec:
  type: NodePort
  selector: { app: fe }
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080   # 30000-32767 范围
```

## 常用操作/命令清单

```bash
# 上线/更新（幂等）
kubectl apply -f deployment.yaml -f service.yaml -f ingress.yaml
# 解释：apply 会创建或更新；重复执行安全。可配合 kubectl diff 先看变更。

# 查看与排查
kubectl get pods -o wide
kubectl get svc,ing
kubectl describe pod <pod-name>          # 事件/挂载/探针/镜像拉取信息
kubectl logs -f deploy/fe --tail=200     # 聚合 Deployment 的 Pod 日志
kubectl exec -it deploy/fe -- sh         # 进入容器排查（busybox/alpine 可能为 sh）

# 滚动更新与回滚
kubectl set image deploy/fe fe=registry.example.com/fe/my-fe:1.0.1
kubectl rollout status deploy/fe
kubectl rollout history deploy/fe
kubectl rollout undo deploy/fe --to-revision=3

# 其他实用
kubectl diff -f deployment.yaml          # 预览配置差异
kubectl explain deployment.spec.strategy # 查看字段含义
kubectl top pod -A                       # 需安装 metrics-server
```

## 排错与诊断套路

分层定位（Pod → Service → Ingress → DNS/证书）
- Pod 层：镜像可拉取？容器能启动？探针是否通过？资源是否足够？
- Service 层：selector 是否匹配？Endpoints 是否存在且数量正确？
- Ingress 层：规则与 ingressClass 是否匹配？Controller 正常？TLS/证书有效？
- DNS/证书：域名是否正确解析到 LB？证书是否覆盖对应域名？

快速定位命令
```bash
# 1) 事件与状态
kubectl get events --sort-by=.lastTimestamp -A | tail -50
kubectl describe pod <pod> | sed -n '/Events/,$p'

# 2) Service/Endpoints 对照
kubectl get svc fe-svc -o wide
kubectl get endpoints fe-svc -o wide

# 3) Ingress 与 Controller
kubectl get ing fe-ing -o wide
kubectl describe ing fe-ing

# 4) 从容器内验证连通
kubectl exec -it deploy/fe -- sh -lc 'wget -qO- http://127.0.0.1:80/healthz'

# 5) 资源与压力
kubectl top pod,node
```

高频错误词典（现象 → 定位 → 解决）
- ImagePullBackOff/ErrImagePull
  - 定位：describe Pod 看事件；校验镜像名/Tag 与 imagePullSecrets。
  - 解决：修正镜像地址/凭证；测试网络可达性。
- CrashLoopBackOff
  - 定位：kubectl logs 看错误；检查启动命令与配置；探针是否过严。
  - 解决：放宽 initialDelaySeconds/timeout；修复应用启动错误。
- OOMKilled
  - 定位：describe Pod 的状态与退出原因；kubectl top 看内存。
  - 解决：提高 memory requests/limits 或优化应用内存。
- Pending
  - 定位：调度事件；节点 taints/tolerations；资源配额。
  - 解决：扩容/释放资源；配置容忍或调整 requests。
- Service 无法访问
  - 定位：get endpoints 数量为 0？selector 是否匹配 label？容器端口是否暴露正确？
  - 解决：修正 selector/端口；确保容器监听 0.0.0.0。
- Ingress 404/证书问题
  - 定位：host/pathType/ingressClass 是否正确；证书域名匹配。
  - 解决：修正规则与证书；检查 Controller 日志。

## 易错点与最佳实践

- 勿用 delete + apply 作为发布与回滚手段；使用 rollout 保持可追溯与平滑升级。
- 必配 Requests/Limits，建议起步值（前端静态服务示例）：
  - requests: cpu 100m / memory 128Mi；limits: cpu 500m / memory 512Mi（按压测调整）。
- 探针路径应命中“健康检查”端点，避免昂贵操作；就绪探针用于流量接入前的检查，存活探针用于重启异常容器。
- Label/Selector 必须对齐；变更 label 需同步更新 selector，否则 Service 无后端。
- 机密与配置分离：使用 Secret/ConfigMap；镜像私服使用 imagePullSecrets。
- Ingress 前置必须满足：已安装 Controller、ingressClassName 匹配、DNS 指向 LB、证书覆盖域名。
- 命名空间隔离环境；避免在 default 直接部署生产服务。

## 实操练习（含答案）

1) 发布新镜像并确认发布完成，然后回滚到上一个版本
```bash
# 发布
kubectl set image deploy/fe fe=registry.example.com/fe/my-fe:1.0.1
kubectl rollout status deploy/fe
# 历史与回滚
kubectl rollout history deploy/fe
kubectl rollout undo deploy/fe --to-revision=1
```

2) 定位 Service 无后端的问题
```bash
kubectl get endpoints fe-svc -o wide
# 如为 <none> 或 0 个地址，检查 selector 与 Pod labels 是否匹配
kubectl get pods -l app=fe -o wide
kubectl describe svc fe-svc
```

3) 为现有 Deployment 补充资源与探针（示例）
```bash
kubectl patch deploy fe --type='merge' -p '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "fe",
          "resources": {
            "requests": {"cpu":"100m","memory":"128Mi"},
            "limits": {"cpu":"500m","memory":"512Mi"}
          },
          "readinessProbe": {"httpGet":{"path":"/healthz","port":80},"initialDelaySeconds":5,"periodSeconds":5},
          "livenessProbe": {"httpGet":{"path":"/healthz","port":80},"initialDelaySeconds":10,"periodSeconds":10}
        }]
      }
    }
  }
}'
```

## Service 类型对比表格

| 类型 | 作用 | 可访问范围 | 典型场景 | 优点 | 注意事项 |
|---|---|---|---|---|---|
| ClusterIP（默认） | 在集群内提供稳定虚拟 IP | 集群内 | 服务间调用、后端组件 | 简单稳定、内部负载 | 仅内网可见；排错看 Endpoints |
| NodePort | 在每个节点开放端口 | 集群外（节点IP:nodePort） | 简单对外暴露、临时联调 | 配置简单、无需 Ingress | 端口范围 30000-32767；无七层能力 |
| LoadBalancer | 云厂商或外部LB分配入口 | 公网/专网 | 生产对外入口、东西向LB | 自动分配公网IP/LB能力 | 依赖外部LB；计费/配额限制 |
| Headless（clusterIP: None） | 不做LB，返回Pod直连 | 依赖DNS直连Pod | 有状态/直连、服务发现 | 直连、可自定义LB | 客户端需实现重试/熔断 |

提示
- 对外统一入口建议优先 Ingress（七层路由、证书、更细粒度控制）。
- 非云环境可用 NodePort + 外部 Nginx/HAProxy 组合对外暴露。

## 压测基线建议

目标
- 验证探针与资源限额设置的合理性，建立 P50/P90/P99 延迟、错误率、吞吐的“上线基线”。

建议流程
1) 预热：1-3 分钟，避免冷启动/缓存抖动。
2) 梯度加压：逐步提高并发/请求率（如 50/100/200...），观察延迟曲线与错误率。
3) 观测：配合 kubectl top、应用日志与 APM 指标（CPU/内存/GC/连接数）。
4) 调参：根据瓶颈调整 requests/limits、连接池、探针阈值与副本数。
5) 回归：发布后对关键接口做小流量灰度与对比。

示例（本地/容器内）：
```bash
# wrk 示例
wrk -t4 -c100 -d60s http://fe.example.com/

# k6 示例（open-model）
k6 run -e TARGET=http://fe.example.com - <<'EOF'
import http from "k6/http";
import { sleep } from "k6";
export const options = { stages: [
  { duration: "1m", target: 50 },
  { duration: "2m", target: 100 },
  { duration: "2m", target: 200 },
  { duration: "1m", target: 0 },
]};
export default function () {
  http.get(__ENV.TARGET + "/healthz");
  sleep(0.1);
}
EOF
```

观测要点
- 延迟：P99 明显陡增通常意味着队列/CPU 饱和或下游瓶颈。
- 资源：CPU 长期接近 limits 会触发限流；内存逼近 limits 易 OOMKilled。
- 网络：检查容器监听 0.0.0.0、Service Endpoints 数量与 Ingress 连接复用。

## 关联阅读
- Kubernetes 官方文档：Workloads（Deployment）、Services、Ingress、Probes、Resource Management
- kubectl Cheat Sheet 与 kubectl explain
- Nginx Ingress Controller 文档与常用注解
- 生产最佳实践：资源限制、健康检查、灰度与发布策略