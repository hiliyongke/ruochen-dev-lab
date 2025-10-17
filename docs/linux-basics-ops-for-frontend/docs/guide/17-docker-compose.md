# 17. Docker Compose 实战（前端运维向）

> 引言：Compose 让你用一份 YAML 在本机或测试环境“一键编排”多容器（如 Nginx + Node + Redis）。本章聚焦最常用的字段与开发/生产分层方法，保证可复制、可扩展、可迁移。

你将学到
- compose.yaml 基本结构与常用字段：services/volumes/networks/env/profiles/depends_on/healthcheck
- 开发与生产分层：override 文件、.env 与变量插值、profiles 的环境切换
- 启停、日志与排错的高频命令套路

## 背景与核心概念
- Compose：用 YAML 声明运行多个容器服务的参数、依赖关系与网络/卷。
- 结构：services（核心）、volumes（持久化）、networks（网络拓扑）、configs/secrets（可选）。
- 适用场景：本地开发、集成联调、轻量测试。生产通常迁移到编排器（如 Kubernetes）。

## 最小可用示例（含健康检查与依赖）
```yaml
# compose.yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
    depends_on:
      api:
        condition: service_healthy
  api:
    image: node:22-alpine
    working_dir: /app
    command: ["node", "server.js"]
    volumes:
      - ./server:/app
    environment:
      NODE_ENV: production
      PORT: "3000"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 5
volumes: {}
networks: {}
```

说明
- depends_on 仅控制“容器启动顺序”，配合 condition: service_healthy 才能等到“就绪”。
- healthcheck 用轻量 HTTP/命令探测，避免昂贵操作。
- 挂载 dist 为只读（:ro），防止容器修改构建产物。

## 常用字段速览与范式

services
- image/build：使用现有镜像或本地 Dockerfile 构建
- command/entrypoint：覆盖启动命令
- environment/env_file：注入环境变量或从文件加载
- ports：主机:容器 端口映射（字符串写法避免 YAML 解析问题）
- volumes：挂载本地目录/命名卷/只读标记
- depends_on：控制启动顺序与就绪条件（service_started/service_healthy）
- healthcheck：test/interval/timeout/retries/start_period
- restart：no/always/on-failure/unless-stopped（开发谨慎使用，避免掩盖问题）

volumes
```yaml
volumes:
  data: {}         # 命名卷，持久化数据
```

networks
```yaml
networks:
  default:
    driver: bridge # 同一 compose 默认同网段，互相用“服务名”互访
```

环境变量与 .env
- .env 文件位于 compose.yaml 同目录时自动生效
- 变量插值：如 "${PORT:-3000}" 提供默认值
- 建议：敏感数据不要放 .env，改用 env_file（本地）或 secrets（生产）

profiles（环境开关）
```yaml
services:
  adminer:
    image: adminer
    profiles: ["dev"]
```
- 运行时开启：docker compose --profile dev up -d

## 开发与生产分层

文件分层
- 基础文件：compose.yaml（通用）
- 开发覆盖：compose.override.yaml（默认自动加载）
- 生产覆盖：compose.prod.yaml（按需选择性加载）

示例（基础 + 覆盖）
```yaml
# compose.yaml（基础）
services:
  api:
    build: ./server
    environment:
      NODE_ENV: production
      PORT: "${PORT:-3000}"
    ports:
      - "${API_PORT:-3000}:3000"

# compose.override.yaml（开发专用）
services:
  api:
    environment:
      NODE_ENV: development
    volumes:
      - ./server:/app
    command: ["npm","run","dev"]
```

按环境启动
```bash
# 开发（基础 + override 自动加载）
docker compose up -d

# 生产（基础 + prod）
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

compose.prod.yaml 示例（只读与资源限制）
```yaml
services:
  api:
    image: registry.example.com/fe/api:1.0.0
    read_only: true
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: "512M"
```
提示
- deploy.resources 在 Swarm/部分平台生效；本地 docker engine 对该段支持有限，用 run 参数替代。
- 生产严格控制写入目录与日志策略，避免容器层日志无限增长。

.env 与变量插值优先级
- CLI 环境变量 > .env 文件变量 > compose 文件默认值
- 建议在 compose 中总是为关键变量提供默认值以提升可复制性

profiles 组织环境/可选组件
```bash
# 开启 dev 与 tools 两个 profile
docker compose --profile dev --profile tools up -d
```

## 常用命令与操作套路
```bash
docker compose up -d                 # 启动（含构建）
docker compose build                 # 仅构建
docker compose ps                    # 状态
docker compose logs -f api           # 跟某个服务日志
docker compose exec api sh           # 进入容器
docker compose down                  # 停止并删除容器/网络（保留卷）
docker compose down -v               # 连同卷一并删除（谨慎）
docker compose config                # 展开/校验最终合并后的配置
```

## 排错与诊断套路（现象 → 定位 → 解决）
- 端口冲突
  - 定位：compose up 日志与 docker ps；宿主机同端口占用（参见第 15 章）
  - 解决：更换主机端口或释放占用进程；校验 ports 写法 "host:container"
- 服务未就绪导致下游 502/超时
  - 定位：depends_on 是否仅控制“启动”而非“就绪”？
  - 解决：为上游配置 healthcheck，并使用 condition: service_healthy
- 卷权限/换行符导致脚本不可执行（Mac/Windows）
  - 定位：容器内 ls -l、file 脚本；查看 git 的换行符策略
  - 解决：修正可执行位与换行符，或在 Dockerfile 中统一处理
- 容器互访失败
  - 定位：是否在同一 network？是否使用服务名访问？
  - 解决：确保同 compose 下默认网络；跨 compose 需自定义共享网络

## 易错点与最佳实践
- 用 depends_on 当“就绪检测”但未配 healthcheck
- 把敏感变量放在 .env 或写死在 YAML（改用 secrets/外部注入）
- 把开发挂载（:delegated/:cached）误用在生产
- 忽略 docker compose config，导致多文件合并后的实际配置与预期不一致
- 不为关键变量提供默认值，导致复制到新环境时失败

## 实操练习（含答案）
1) 为 api 服务增加 healthcheck，并让 web 在 api 就绪后再启动
```yaml
api:
  healthcheck:
    test: ["CMD","wget","-qO-","http://localhost:3000/health"]
    interval: 10s
    timeout: 3s
    retries: 5
web:
  depends_on:
    api:
      condition: service_healthy
```

2) 使用 override 与 .env 切换开发/生产参数
- .env：
```
API_PORT=4000
```
- 命令：
```bash
docker compose up -d
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

3) 展开与校验最终配置
```bash
docker compose config
```

## 常见问题与排错（现象 → 定位 → 解决）

- 端口冲突（bind: address already in use）
  - 定位：docker compose up 输出与 docker ps；检查宿主占用：lsof -i :8080 或 ss -lntp
  - 解决：调整 ports 的宿主端口（"8081:80"），或释放占用进程（参见第15章端口与占用）

- 服务未就绪导致 502/超时
  - 定位：web 依赖 api，但 depends_on 是否仅控制“启动而非就绪”
  - 解决：为 api 配置 healthcheck，并在 web 中使用 condition: service_healthy

- 卷权限/换行符导致脚本不可执行
  - 定位：容器内 ls -l 与 file 查看换行符；Mac/Windows 常见 CRLF 问题
  - 解决：统一 LF；确保可执行位（chmod +x）；必要时在 Dockerfile 里处理

- 环境变量未生效
  - 定位：docker compose config 展开最终配置，检查变量插值
  - 解决：确认 .env 所在目录与运行命令路径一致；或用 --env-file 显式指定

- 跨容器访问失败（Name not resolved/Connection refused）
  - 定位：是否在同一个 compose 网络；访问是否使用“服务名:端口”
  - 解决：默认网络下使用服务名互访；跨 compose 用自定义共享 network

- 卷数据丢失（down 后数据不见）
  - 定位：是否使用了匿名卷或绑定挂载路径错误
  - 解决：持久化使用命名卷；避免 down -v 误删数据卷；重要数据提前备份

- 资源不足导致容器频繁重启
  - 定位：docker compose ps、docker logs；查看系统资源（free/top）
  - 解决：限制或提升资源（deploy.resources 或运行参数），优化应用占用

诊断命令速查
```bash
docker compose ps
docker compose logs -f api
docker compose exec api sh
docker compose config               # 展开合并配置（强烈建议先看再跑）
```

## 与 Kubernetes 的映射与迁移建议

对象与字段对照（常见关键点）
| Compose 概念/字段 | Kubernetes 对象/字段 | 说明 |
|---|---|---|
| services           | Deployment/StatefulSet | 服务编排与副本管理 |
| image/build        | container.image / CI 构建 | 迁移时将本地构建移入 CI |
| command/entrypoint | container.command/args | 启动命令与参数 |
| environment/env_file | env / ConfigMap / Secret | 区分公开配置与敏感信息 |
| ports              | Service.port/targetPort/NodePort | 外部暴露由 Service/Ingress 负责 |
| volumes            | Volume / PVC / StorageClass | 持久化需声明 PVC 与存储类 |
| depends_on         | readinessProbe/startupProbe | 就绪依赖用探针与滚动策略表达 |
| healthcheck        | readinessProbe/livenessProbe | 探针更细粒度且由 kubelet 执行 |
| networks           | Cluster 网络 + Service DNS | 集群内统一扁平网络与服务发现 |
| profiles/overrides | 多环境清单/命名空间/Helm values | 用命名空间与 values 分层管理 |

迁移建议（Compose → K8s）
- 配置分离：env_file → ConfigMap；敏感项 → Secret（避免明文）
- 端口暴露：ports → Service（ClusterIP/NodePort/LoadBalancer），对外统一经 Ingress
- 健康检查：healthcheck → Readiness/Liveness/Startup Probe（分别用于接入流量/自愈/冷启动）
- 数据持久化：volumes → PVC + StorageClass，规划容量/访问模式
- 资源与扩缩：deploy.resources → Deployment resources 与 HPA（按指标扩缩）
- 多环境：override/profiles → 命名空间 + 不同 values（Helm/Kustomize）
- 回滚与发布：docker compose up --build → kubectl apply + rollout（status/history/undo）

实践提示
- 在迁移前先为服务补齐“探针/资源/只读与最小权限”，便于直接落地到 K8s
- 使用 kubectl diff 预览变更；用 metrics 与日志系统完善可观测性

## 关联阅读
- Compose 规范与 profiles
- Healthcheck 与就绪依赖
- 多环境 compose 组织模式
- 与 Kubernetes 的对象映射（见第 18 章）