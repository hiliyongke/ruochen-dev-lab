# 19. 命令与术语详解（新手强化版）

> 引言：把高频命令与术语集中讲清楚，每条命令配“命令解剖/安全提示”。遇事先干跑（dry-run），再执行。

## 端口与连接：ss / lsof
- ss：查看套接字与连接（更快）
```bash
ss -lntp                    # 监听中的 TCP（-l 监听 -n 不反查 -t TCP -p 进程）
ss -antp | grep ESTAB       # 已建立连接
ss -antp | grep ':3000 '    # 关注特定端口
```
- lsof：列出打开的文件/端口
```bash
sudo lsof -i :3000          # 哪个进程占用 3000
sudo lsof -p <pid> | head   # 该进程打开了哪些文件/套接字
```
安全提示：普通用户看不到全部信息；需要 sudo 提升。

## 文本搜索：grep / 正则
```bash
grep -RIn "ERROR" /var/log  # 递归/行号/忽略二进制
grep -E "foo|bar" file      # 扩展正则
grep -RIn --exclude-dir=node_modules "TODO" .
```
小贴士：用 -- 来终止选项；先用 grep 观察范围，再执行替换。

## 查找与清理：find（干跑优先）
```bash
# 干跑：列出匹配文件
sudo find /var/log -type f -name "*.gz" -mtime +30 -print
# 真删（确认后再做）
sudo find /var/log -type f -name "*.gz" -mtime +30 -delete
# 更灵活：按大小/空文件
find . -type f -size +100M -print
find . -type f -empty -print
```
命令解剖：-mtime +N 表示早于 N 天；-delete 放最后；危险操作先 -print 审核。

## 服务与日志：systemctl / journalctl
```bash
sudo systemctl status app -l
sudo systemctl enable --now app
sudo systemctl daemon-reload          # 修改 unit 后必做
sudo journalctl -u app -n 200 -f      # 跟随最新日志
sudo journalctl -u app --since "1 hour ago"
```
术语：unit 指 systemd 的服务定义；Environment/EnvironmentFile 可以注入环境变量。

## 网络快速判定：curl / nc / dig
```bash
curl -vI https://example.com         # 协议层排错首选（握手/重定向/状态）
curl -L http://example.com           # 跟随 30x
nc -vz host 443                      # 验证 TCP 端口连通
dig +short example.com               # DNS 解析值
```
误判规避：ping 成功≠HTTP 可用；nc 成功≠应用就绪。

## Docker 高频命令
```bash
docker images                         # 镜像列表
docker ps -a                          # 容器列表（含退出）
docker logs -f <container>            # 跟日志
docker exec -it <container> sh        # 进入容器
docker cp <container>:/path ./path    # 拷文件
docker build -t name:tag .            # 构建镜像
docker run -d -p 8080:80 --name web nginx:alpine
docker system df                      # 空间占用
docker image prune -f                 # 清理悬挂镜像（谨慎）
```
小贴士：避免 latest；优先多阶段构建；容器内避免 root 身份跑生产。

## Compose 小抄
```bash
docker compose up -d
docker compose logs -f api
docker compose exec api sh
docker compose down
```
概念：depends_on 控制顺序非就绪；需配 healthcheck 或 service_healthy 条件。

## K8s 常用 kubectl
```bash
kubectl get pods -o wide
kubectl describe pod <pod>
kubectl logs -f deploy/fe --tail=200
kubectl exec -it deploy/fe -- sh
kubectl apply -f k.yaml
kubectl rollout status deploy/fe
kubectl rollout undo deploy/fe --to-revision=3
```
习惯：所有“真相”在 describe 的 Events；apply 幂等、rollout 可回滚。

## SSH 快捷用法
```bash
ssh-keygen -t ed25519 -C "you@example.com"
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
ssh host-alias                   # 配合 ~/.ssh/config
scp -r dist/ host:/var/www/site  # 小量文件
rsync -avz --delete dist/ host:/var/www/site  # 增量同步（谨慎 --delete）
```
加固要点：仅密钥、禁 root、限制 MaxAuthTries、连接复用与保活。

## Nginx 运维小抄
```bash
sudo nginx -t; sudo systemctl reload nginx
tail -f /var/log/nginx/error.log
curl -vI https://app.example.com
```
反代必备：proxy_http_version 1.1、Host 头、X-Real-IP、Upgrade/Connection。

## 易错点总表
- 把 shell 通配符当正则；批量操作不做 dry-run
- systemd 改动后忘记 daemon-reload
- Docker 使用 latest；容器内 root 跑生产
- Compose 用 depends_on 当就绪检查
- K8s 不看 describe 事件就盲猜
- SSH ForwardAgent 长期开启；root 直连未禁
- Nginx 未透传 Host 或忘记 WebSocket 升级头

## 练习题（含答案）
1) ss 与 lsof 分别定位 3000 端口占用
```bash
ss -lntp | grep ':3000 '
sudo lsof -i :3000
```
2) 用 find 安全删除 7 天前的 .log.gz
```bash
find . -type f -name "*.log.gz" -mtime +7 -print
find . -type f -name "*.log.gz" -mtime +7 -delete
```

## 延伸阅读
- man ss, man lsof, man grep, man find, man systemctl, man journalctl
- Dockerfile/Compose/Kubernetes 官方文档
- OpenSSH 与 Nginx 官方手册