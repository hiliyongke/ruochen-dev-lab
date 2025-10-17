# 12. 附录：Cheatsheet / 自测

> 引言：这一章是“随身卡片”和“自测清单”。遇到问题先翻卡片；要升级就做题自测，查漏补缺。

你将学到：
- 高频命令与参数的速查索引
- 覆盖“部署、排错、权限、磁盘”的自测题目
- 常用模板位点：systemd/Nginx/logrotate/原子发布

## 常用命令一览

- 系统与资源：uptime, top/htop, free -h, vmstat, iostat
- 文件与目录：ls -la, du -sh, df -h, find, grep -R, sed, awk, tar
- 网络：curl -I/-v, ping, nc -vz, ss -lntp, dig, traceroute
- 进程与服务：ps aux, systemctl, journalctl
- 权限：chmod, chown, groups, id
- 传输：scp, rsync
- 版本控制：git status/log/diff

## 自测题（简答）

1) 如何定位 502 的根因？列出至少 3 个排查步骤。
2) 如何以最小风险发布一个静态站点更新？
3) 当 3000 端口被占用时，你如何处置？
4) 如何为 Node 服务配置 systemd 且保证日志可查看？
5) 磁盘告警后你的优先级动作列表是什么？

## 模板清单

- systemd 服务模板（第 4 章）
- Nginx 反代模板（第 11 章）
- logrotate 模板（第 7 章）
- 原子发布脚本（第 10 章）