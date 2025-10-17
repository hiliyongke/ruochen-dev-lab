# 10. 常用一键脚本示例

> 引言：把“会做”变成“做一次就够”。这里收录了经常复用的脚本片段，贴上环境变量就能跑，重在思路与可迁移性。

你将学到：
- 零停机静态站发布的原子切换思路（软链 + reload）
- 联调与自检脚本的组织方式与容错手法
- 服务器大文件统计的实现与格式化输出技巧

## 零停机发布（Nginx 静态站）

```bash
set -euo pipefail
BUILD_DIR=dist
TARGET=/var/www/site
TMP=/tmp/site-$(date +%s)

rsync -avz --delete "$BUILD_DIR"/ server:"$TMP"/
ssh server "ln -sfn $TMP $TARGET && sudo systemctl reload nginx"
```

说明：先上传到临时目录，原子切换软链，reload 生效。

## 快速检查 80/443 服务链路

```bash
set -e
host=$1
echo "DNS:"; dig +short "$host"
echo "80:";  nc -vz "$host" 80 || true
echo "443:"; nc -vz "$host" 443 || true
echo "HTTP:"; curl -I --max-time 5 "http://$host" || true
echo "HTTPS:"; curl -I --max-time 5 "https://$host" || true
```

## 统计服务器 Top10 大文件

```bash
sudo find / -type f -printf '%s %p\n' 2>/dev/null | sort -nr | head -n 10 | awk '{printf "%0.2f MB  %s\n", $1/1024/1024, substr($0,index($0,$2))}'

## 易错点
- 脚本未开启严格模式（set -euo pipefail）导致静默失败
- 未对变量加引号导致路径空格问题
- 在生产直接运行“删除类”脚本，缺少 dry-run

## 练习题（含答案）
1) 为零停机发布脚本加入 dry-run 开关
```bash
# 通过 DRY_RUN 环境变量控制
if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY_RUN: rsync/ln/systemctl 将被跳过"
else
  rsync -avz --delete "$BUILD_DIR"/ server:"$TMP"/
  ssh server "ln -sfn $TMP $TARGET && sudo systemctl reload nginx"
fi
```
2) 写一个脚本检查 80/443 连通与 HTTP/HTTPS 响应
```bash
host=$1; nc -vz "$host" 80 || true; nc -vz "$host" 443 || true; curl -I "http://$host" || true; curl -I "https://$host" || true
```

## 延伸阅读
- Bash Pitfalls（常见坑）
- ShellCheck（脚本静态检查）
- Google Shell Style Guide