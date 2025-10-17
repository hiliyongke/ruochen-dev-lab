# 16. Docker 基础（前端运维向）

> 引言：容器是更轻量的“进程级虚拟化”。会用 Docker，可以在任意环境快速、可复现地跑起你的 Node/Nginx/静态站点。本文以“最小可运行 + 实战最佳实践”为主线，覆盖构建、运行、调试、安全、性能与与后续 Compose/K8s 的衔接。

你将学到
- 核心对象与关系：Image、Container、Registry、层与缓存
- 构建最佳实践与瘦身：多阶段构建、.dockerignore、层顺序、缓存/BuildKit
- 安全与合规：非 root、只读文件系统、密钥管理、镜像签名/SBOM
- 运行与调试：健康检查、日志到 STDOUT/FILE、资源/ulimit、网络常见问题
- 性能与发布：构建缓存、跨平台（buildx/QEMU）、CI 集成
- 与后续章节衔接：Compose → K8s 对照、镜像版本策略

## 背景与核心概念

- 镜像（Image）：只读模板（代码+依赖+运行环境），如 node:22-alpine。由多层（Layer）叠加而成，层具备缓存特性。
- 容器（Container）：镜像的运行实例，短生命周期、无状态（有状态需挂载卷/外部存储）。
- 仓库（Registry）：镜像存储（Docker Hub/私有 Harbor 等），镜像名通常为 registry/namespace/name:tag。
- 构建缓存：Docker 按 Dockerfile 指令层级缓存；层内容不变可复用，改变会导致该层及其后的层重建。

## 安装检查
```bash
docker version
docker info
# 核心字段：Server/Client 版本、Storage Driver、Cgroup、默认运行时等
```

## 快速上手（最小闭环）

一个前端静态站点的最小可运行 Dockerfile（多阶段瘦身）
```Dockerfile
# 1) 构建阶段（Node）
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build

# 2) 运行阶段（Nginx 仅托管静态产物）
FROM nginx:alpine
# 可选：切换时区/语言（按需）
# ENV TZ=Asia/Shanghai LANG=C.UTF-8
COPY --from=builder /app/dist/ /usr/share/nginx/html/
# 可选：自定义 Nginx 配置
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# 健康检查（容器层面）
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/healthz || exit 1
```

构建与启动
```bash
docker build -t my-fe:1.0.0 .
docker run -d --name fe -p 8080:80 my-fe:1.0.0
docker logs -f fe
```

说明
- 多阶段：将构建环境与运行环境解耦，显著减小体积、降低攻击面。
- HEALTHCHECK：与 K8s 探针思路一致，用于容器健康判定（重启策略依赖编排器）。
- 端口：-p 主机端口:容器端口；容器进程需监听 0.0.0.0 才能对外访问。

## 常用命令与命令解剖

拉取/列出/清理
```bash
docker pull node:22-alpine
docker images
docker ps -a
docker system df
docker image prune -f         # 清理悬挂镜像（谨慎）
```

一次性/守护态运行与调试
```bash
# 一次性开发容器：端口/卷/工作目录三件套
docker run --rm -it \
  -p 3000:3000 \
  -v "$PWD":/app \
  -w /app \
  node:22-alpine sh

# 守护态服务
docker run -d --name web -p 8080:80 nginx:alpine
docker logs -f --tail=200 web
docker exec -it web sh
docker stop web && docker rm web
```
解释
- --rm：退出即清理
- -it：交互
- -v/-w：映射代码与设定工作目录便于开发联调

## 构建最佳实践与瘦身

.dockerignore
```
node_modules
.git
dist
*.log
.env
```
- 避免不必要文件进入构建上下文，减少上传与缓存失效面。

层与缓存顺序优化（Node 应用范式）
```Dockerfile
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit    # 依赖层缓存稳定
COPY . .
RUN npm run build
```
- package*.json 变更才会使依赖层失效；尽量减少 COPY . . 前的变更。

使用轻量基镜像
- 优先 alpine 或 distroless（仅运行时，不含 Shell）；如需调试，可在调试构建中保留 Shell。

多阶段构建
- 将编译/打包与运行分离；运行镜像仅包含产物与运行时，减少 CVE 面与体积。

BuildKit 与缓存挂载
```bash
DOCKER_BUILDKIT=1 docker build -t my-fe:1.0.0 .
```
- 支持并行构建、更好的进度与缓存策略；可使用 --mount=type=cache 加速包管理器缓存（需配方支持）。

## 安全与合规

非 root 运行与最小权限
```Dockerfile
# 在运行镜像中创建非 root 用户
RUN addgroup -S app && adduser -S app -G app
USER app
```
- 避免容器内 root 带来的越权风险；配合 --read-only 与必要的可写挂载。

只读文件系统与写入目录最小化
```bash
docker run -d --read-only -p 8080:80 \
  -v /var/cache/nginx \
  my-fe:1.0.0
```

密钥与配置
- 不将密钥 bake 进镜像；通过环境变量、Docker Secret、挂载文件或编排器的 Secret/ConfigMap 注入。
- 私有仓库登录：docker login registry.example.com（使用凭据助手/凭据存储）。

镜像签名与 SBOM
- 签名：cosign sign/policy 验证来源可信。
- SBOM：syft 生成，grype 扫描已知漏洞；在 CI 中设定阈值（如高危阻断）。

固定版本与不可变引用
- 避免使用 latest；建议用版本号或 digest（name@sha256:...）确保可复现与可回滚。

## 运行与调试

健康检查
- Dockerfile HEALTHCHECK 或外部健康检查脚本；对 Web 服务建议暴露 /healthz 轻量端点。

日志策略
- 优先 STDOUT/STDERR，配合日志驱动/收集器；需要落盘时挂载卷并配置轮转（避免容器层日志无限增长）。

资源与 ulimit
```bash
docker run -d --name fe \
  --cpus=1.0 --memory=512m \
  --ulimit nofile=65535:65535 \
  my-fe:1.0.0
```
- 在开发/联调阶段模拟资源上限，有助于提前发现 OOM/句柄等问题。

网络常见问题
- 端口不可达：确认容器监听 0.0.0.0、-p 映射正确、主机防火墙/安全组放行。
- 跨容器通信：同一 docker network 内可用容器名互相访问；生产使用编排器的服务发现。

诊断命令速查
```bash
docker ps -a
docker logs -f --tail=200 <c>
docker inspect <c> | jq '.[0].State'
docker inspect <c> | jq '.[0].NetworkSettings.Ports'
docker events --since 1h
```

## 性能与发布

构建缓存与层复用
- 合理拆分层、稳定依赖层；CI 缓存 layer（如 GitHub Actions 的 cache/BuildKit 内置缓存）。

多架构与跨平台
```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t my-fe:1.0.0 --push .
```
- 基于 QEMU 的跨平台构建；对 Apple Silicon 与 x86 同时发布。

CI 集成要点
- 启用 BuildKit、缓存挂载、扫描（grype/trivy）、签名（cosign）、推送策略（分支/tag 决策）。
- 在 CI 中输出 SBOM，并设定安全阈值门禁。

## 与后续章节衔接

Compose → K8s 对照
- 服务编排：docker-compose.yml → K8s Deployment/StatefulSet
- 端口与服务：ports → Service（ClusterIP/NodePort/LoadBalancer）
- 依赖与环境：environment/volumes → ConfigMap/Secret/Volume/PVC
- 健康检查：healthcheck → Readiness/Liveness Probe
- 网络与入口：compose 默认网络 → K8s Ingress + Service

镜像版本策略
- 约定：生产使用显式版本或 digest；变更记录与回滚依赖“不可变”发布。

## 推送镜像（示例）
```bash
docker tag my-fe:1.0.0 registry.example.com/fe/my-fe:1.0.0
docker login registry.example.com
docker push registry.example.com/fe/my-fe:1.0.0
```

## 常见问题判别（现象 → 定位 → 解决）

- 容器频繁退出（CrashLoop）
  - 定位：docker logs/inspect.State.ExitCode；入口命令是否意外退出
  - 解决：修正启动命令；在编排器层放宽探针/重试策略
- 端口不可用
  - 定位：inspect Ports、容器进程监听地址、防火墙/安全组
  - 解决：监听 0.0.0.0；开放端口/策略；校验 -p 映射
- 空间占用过大
  - 定位：docker system df、du 检查卷与层
  - 解决：定向清理悬挂镜像/未使用卷；避免使用“全清理”破坏性命令
- 权限问题
  - 定位：卷中文件属主与容器用户不匹配
  - 解决：显式 --user 或在镜像内创建/切换用户；调整挂载目录权限

## 易错点与最佳实践

- 不要在生产使用 latest 标签；固定 tag 或 digest，保障可回滚
- 构建阶段与运行阶段分离（多阶段）；控制镜像体积与攻击面
- 默认使用非 root 用户 + 只读文件系统；最小权限原则
- 通过 .dockerignore 与层顺序稳定缓存；提升构建速度
- 日志默认输出到 STDOUT/STDERR；避免容器内无限制落盘
- 安全门禁纳入 CI：签名、SBOM、漏洞扫描

## 实操练习（含答案）

1) 写一个前后分离的多阶段 Dockerfile 并说明好处
- 答：构建层安装依赖与打包，运行层仅保留产物与运行时，体积更小、漏洞面更少，缓存更稳定。

2) 为现有镜像增加安全加固（非 root + 只读）
```Dockerfile
RUN addgroup -S app && adduser -S app -G app
USER app
```
```bash
docker run -d --read-only -p 8080:80 my-fe:1.0.0
```

3) 使用 buildx 发布多架构镜像（amd64/arm64）
```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t registry.example.com/fe/my-fe:1.0.1 --push .
```

## Distroless 与调试镜像的取舍

何时使用 Distroless（生产首选）
- 优点：体积小、仅包含运行时，减少攻击面与 CVE 面。
- 适用：生产环境稳定运行的服务、无需在容器内交互调试。
- 注意：无 shell/包管理器；排错需借助外部手段（侧车/临时调试镜像）。

如何进行调试（不牺牲生产镜像的最小化）
- 双镜像策略：同一源码构建两种镜像
  - 生产镜像：distroless 或 alpine 精简运行层。
  - 调试镜像：保留 shell/tools（如 busybox/alpine），仅在排障与联调时使用。
- 双 Tag 示例：my-fe:1.0.0（prod）与 my-fe:1.0.0-debug（含 sh/curl）
- 建议：在 CI 中仅允许 prod 镜像进入制品库“生产”通道，debug 镜像设定保留期并限制使用范围。

示例（双目标构建，生成 prod 与 debug 两个镜像）
```Dockerfile
# 构建阶段
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build

# 运行阶段（prod：distroless，仅示意）
FROM gcr.io/distroless/nginx AS prod
COPY --from=builder /app/dist/ /usr/share/nginx/html/
# 可根据需求拷贝最小 nginx 配置
# USER nonroot:nonroot  # 结合最小权限

# 运行阶段（debug：alpine，带 sh/curl 等）
FROM nginx:alpine AS debug
COPY --from=builder /app/dist/ /usr/share/nginx/html/
RUN apk add --no-cache curl bash # 仅在 debug 镜像保留工具
```
构建命令
```bash
docker build -t my-fe:1.0.0 --target prod .
docker build -t my-fe:1.0.0-debug --target debug .
```

调试建议
- 本地/临时环境使用 debug 镜像；生产仅部署 prod 镜像。
- 若需在线排错，优先“在外侧排错”（抓包/日志/探针），避免进入容器执行破坏性操作。

## CI 示例片段（GitHub Actions 与 GitLab CI）

GitHub Actions（buildx 多架构 + 推送 + SBOM/扫描 + 签名）
```yaml
name: build-and-push
on:
  push:
    tags: ["v*"]
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-qemu-action@v3
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: registry.example.com
          username: ${{ secrets.REGISTRY_USER }}
          password: ${{ secrets.REGISTRY_PASS }}
      - name: Build & Push (prod)
        uses: docker/build-push-action@v6
        with:
          context: .
          target: prod
          push: true
          tags: |
            registry.example.com/fe/my-fe:1.0.0
            registry.example.com/fe/my-fe:${{ github.ref_name }}
          platforms: linux/amd64,linux/arm64
          provenance: false
      - name: SBOM (syft)
        uses: anchore/sbom-action@v0
        with:
          image: registry.example.com/fe/my-fe:1.0.0
      # 如需签名（cosign），需配置 OIDC 或密钥
      # - name: Cosign sign
      #   run: cosign sign --yes registry.example.com/fe/my-fe:1.0.0
```

GitLab CI（buildx + 推送）
```yaml
stages: [build]
variables:
  DOCKER_DRIVER: overlay2
build:
  stage: build
  image: docker:24
  services:
    - docker:dind
  script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
    - docker buildx create --use
    - docker buildx build --platform linux/amd64,linux/arm64 \
        -t $CI_REGISTRY_IMAGE:1.0.0 \
        -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA \
        --push .
```
CI 提示
- 使用 secrets/变量存储凭据；避免把凭据 bake 进镜像。
- 在 CI 中加入扫描（trivy/grype）与签名（cosign），设置阻断阈值（高危即失败）。
- 对 debug 镜像单独通道与保留策略；生产仅允许 prod 镜像发布。

## 延伸阅读
- Dockerfile 最佳实践（官方）
- Distroless 镜像
- OCI 镜像规范与镜像签名（cosign）
- SBOM 与漏洞扫描（syft/grype/trivy）
- BuildKit 与 buildx 文档