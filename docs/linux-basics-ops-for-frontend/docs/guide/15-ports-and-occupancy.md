# 15. 端口与进程占用排查

> 引言：80/443/3000/3306 等端口被占用，是最常见且最“卡进度”的问题。本章给出从“谁在占”到“如何解决”的闭环清单。

你将学到：
- 监听与连接状态的判定：ss/lsof 的组合拳
- 快速找到“谁”占用了“哪个端口”，以及如何优雅释放
- 常见冲突来源与解决路径（重复启动、防火墙、僵尸进程）

## 快速定位：谁在用端口？

```bash
# 查看监听（Listening）进程
ss -lntp | grep ':3000 '

# 或用 lsof（可能需要 sudo）
sudo lsof -i :3000
```

输出关注：
- 进程 PID/名称（如 node、nginx）
- 用户/工作目录（用于判断是否是当前项目）
- 连接状态（LISTEN、ESTAB、TIME_WAIT）

## 常见场景与处置

- 重复启动同一服务
  - 现象：新实例启动失败，提示 EADDRINUSE
  - 处置：定位旧 PID，优雅停止或重启
    ```bash
    # systemd 管理的服务
    sudo systemctl status app -l
    sudo systemctl restart app

    # 临时跑的进程（实在不行才用 kill）
    ps aux | grep node
    kill PID        # 优雅
    kill -9 PID     # 强制（不推荐，最后手段）
    ```

- 端口被历史调试进程占用（屏幕分离会话残留）
  - 处置：列出会话并退出/杀掉
    ```bash
    screen -ls   # 或 tmux ls
    # 进入后正常退出，或在会话外 tmux kill-session -t <name>
    ```

- Nginx/反代冲突（已占用 80/443）
  - 处置：确认是否应由 Nginx 监听，应用改用上游端口（如 3000/4000），通过反向代理暴露

- 防火墙/端口未开放但无占用
  - 处置：确认连通性与防火墙规则（见第 06 章）
    ```bash
    # 本机是否监听
    ss -lntp | grep ':443 '
    # 远端连通性
    nc -vz example.com 443
    # UFW 示例（谨慎）
    sudo ufw status
    ```

## 进阶：连接状态观察

```bash
# 查看已建立连接（ESTAB）与等待队列
ss -antp | awk '$1 ~ /ESTAB|SYN-SENT|TIME-WAIT|CLOSE-WAIT/ {print}'
```

判断要点：
- CLOSE_WAIT 激增：上游未正确关闭连接，检查应用释放行为
- SYN-SENT 多：对端未响应，检查网络/防火墙/反代链路

::: details 常见问题
- macOS 无 ss：可用 lsof -nP -iTCP:3000 -sTCP:LISTEN
- 需 root 才能看全量进程信息：加 sudo
- 端口释放仍失败：确认是否由容器/namespace 隔离导致（进入容器内排查）
:::

## 易错点
- 误把“无监听”当“端口被占用”（实际是防火墙/安全组问题）
- kill -9 作为常态使用，忽略优雅停止
- 反代与应用同时监听 80 导致冲突

## 练习题（含答案）
1) 找出占用 3000 的进程并优雅释放
```bash
sudo lsof -i :3000
sudo systemctl restart app || kill PID
```
2) 判别是端口冲突还是防火墙问题
```bash
ss -lntp | grep ':3000 ' || true
nc -vz host 3000 || true
sudo ufw status || true
```

## 延伸阅读
- lsof/ss 使用手册
- Linux 网络与防火墙基础
- Nginx 反代端口规划