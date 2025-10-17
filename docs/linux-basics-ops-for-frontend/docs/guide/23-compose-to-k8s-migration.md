# 23. Compose → Kubernetes 迁移对照（概念映射与最小示例）

> 目标：帮助前端运维/轻运维将现有 Docker Compose 服务平滑迁移到 Kubernetes，掌握对象映射关系、最小示例与常见坑，提供半自动迁移工具与校验清单。

你将学到
- Compose 与 K8s 的对象映射（services/networks/volumes/env/healthcheck）
- K8s 中的 Deployment/Service/ConfigMap/Secret/Ingress/PVC 设计
- 最小可运行迁移示例（从 docker-compose.yml 到一组 YAML）
- 半自动工具（kompose）与手工优化要点
- 资源、健康探针、存储与网络的常见坑位与排错方法

## 1. 概念映射总览

Compose → K8s 对照
- services → Deployment（或 StatefulSet）+ Service
- image/env/command → Pod 容器字段（image/env/command/args）
- ports → Service（ClusterIP/NodePort）或 Ingress（HTTP入口）
- environment → ConfigMap（普通配置）/Secret（敏感配置）
- volumes → PersistentVolumeClaim（PVC）/emptyDir/configMap/secret volume
- depends_on → 不直接等价，用 Readiness 探针/InitContainer/控制器排队
- healthcheck → livenessProbe/readinessProbe/startupProbe
- networks → K8s CNI 提供 Pod 网络；Service/Ingress 暴露与服务发现
- restart → 控制器保证（Deployment 会重建 Pod），无需 restart: always
- scaling → replicas（水平扩展）；HPA（按指标自动扩缩）

## 2. 示例：原始 docker-compose.yml

```yaml
version: "3.8"
services:
  api:
    image: ghcr.io/example/api:1.2.3
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      REDIS_URL: redis://redis:6379
    volumes:
      - api-data:/var/lib/app
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 3

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  api-data:
  redis-data:
```

注意
- 在 Compose 中，`REDIS_URL=redis://redis:6379` 依赖同网络下的服务名解析；在 K8s 使用 Service 名称解析（`redis.default.svc.cluster.local` 或直接 `redis`）。

## 3. 迁移后的 K8s 最小清单

建议按组件拆分为多个文件，便于独立管理。

1) Namespace（可选）
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
```

2) ConfigMap/Secret（环境变量）
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: app
data:
  NODE_ENV: "production"
  REDIS_URL: "redis://redis:6379"

# 若含敏感信息，改用 Secret（base64 编码）
# apiVersion: v1
# kind: Secret
# metadata:
#   name: api-secret
#   namespace: app
# type: Opaque
# data:
#   TOKEN: base64-encoded
```

3) Redis 存储（PVC + Deployment + Service）
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-data
  namespace: app
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: app
spec:
  replicas: 1
  selector:
    matchLabels: { app: redis }
  template:
    metadata:
      labels: { app: redis }
    spec:
      containers:
        - name: redis
          image: redis:7
          ports:
            - containerPort: 6379
          volumeMounts:
            - name: data
              mountPath: /data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: redis-data
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: app
spec:
  selector: { app: redis }
  ports:
    - name: redis
      port: 6379
      targetPort: 6379
  type: ClusterIP
```

4) API 部署（Deployment + Service）
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: api-data
  namespace: app
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: app
spec:
  replicas: 2
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: ghcr.io/example/api:1.2.3
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef: { name: api-config }
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 3
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
            timeoutSeconds: 5
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits:   { cpu: "500m", memory: "512Mi" }
          volumeMounts:
            - name: data
              mountPath: /var/lib/app
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: api-data
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: app
spec:
  selector: { app: api }
  ports:
    - name: http
      port: 3000
      targetPort: 3000
  type: ClusterIP
```

5) 对外入口（Ingress 或 NodePort）
```yaml
# Ingress（需集群安装 Ingress Controller）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  namespace: app
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 3000
```

## 4. 半自动迁移：kompose

- 用法：`kompose convert -f docker-compose.yml` 自动生成 K8s 清单
- 优点：快速起步，覆盖常见字段
- 必须手工优化的点：
  - 健康探针：将 healthcheck 转换为 readiness/liveness
  - 存储：将匿名/命名 volumes 映射为 PVC，并选择合适的 StorageClass
  - 入口：根据暴露策略选择 Service 类型（ClusterIP/NodePort/LoadBalancer）与 Ingress
  - 资源：requests/limits 与副本数（replicas）
  - 安全：环境变量拆分为 ConfigMap/Secret；敏感信息使用 Secret

## 5. 常见坑与对策

- depends_on 不等价：通过 ReadinessProbe 或 InitContainer 等待上游就绪；或在应用内部做重试
- 端口暴露策略变化：
  - Compose 映射到宿主端口；K8s 内部默认 ClusterIP，仅集群内可达
  - 对外需 Ingress/LoadBalancer/NodePort，按实际环境选择
- DNS 与服务发现：
  - K8s Service 名称解析为 `svc.namespace.svc.cluster.local`；也可直接用短名 `svc` 同命名空间
- 存储语义：
  - 宿主机挂载 → PVC（RWO/ROX/RWX）取决于后端存储（NFS/Ceph/Rook/云盘）
  - 开发/测试可用 emptyDir，生产应使用持久卷
- 健康探针：
  - readiness 表示“可接收流量”；liveness 表示“需重启”；startup 用于冷启动慢的服务
- 资源与弹性：
  - 设置 requests/limits 与 HPA（需指标支撑）
- 日志与采集：
  - 标准输出（stdout/stderr）由集群采集（Fluent Bit/Filebeat DaemonSet）
- 安全与权限：
  - Pod 安全上下文、ServiceAccount、RBAC；避免容器以 root 运行（按需）

## 6. 迁移校验清单（SOP）

- [ ] 用 kompose 生成初稿，并分组件拆分文件
- [ ] 将环境变量拆分为 ConfigMap/Secret（敏感信息放 Secret）
- [ ] 健康探针：补齐 readiness/liveness/startupProbe
- [ ] 存储：为有状态数据创建 PVC，并选择合适 StorageClass
- [ ] 入口：按需创建 Ingress 或设置 Service 类型
- [ ] 资源与副本：设置 requests/limits 与 replicas；必要时 HPA
- [ ] 日志与监控：采集 stdout/stderr；接入指标与黑盒探测
- [ ] 滚动发布与回滚：Deployment 默认滚动，配置 maxUnavailable/maxSurge
- [ ] 灰度：按命名空间/标签进行灰度，验证后再扩展

## 7. 命令与验证

```bash
# 应用清单
kubectl apply -f ns.yaml
kubectl apply -f config.yaml
kubectl apply -f redis.yaml
kubectl apply -f api.yaml
kubectl apply -f ingress.yaml

# 观察就绪
kubectl get pods -n app
kubectl describe pod -n app -l app=api
kubectl get svc,ing -n app

# 端到端验证
curl -sS https://api.example.com/health
```

## 参考资料
- Kompose 官方文档
- Kubernetes 文档：Deployment/Service/Ingress/ConfigMap/Secret/PVC
- K8s 探针：liveness/readiness/startupProbe
- 存储与 StorageClass 最佳实践