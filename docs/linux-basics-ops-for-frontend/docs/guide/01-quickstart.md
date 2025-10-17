# 01. 快速上手与环境准备

> 引言：这章帮你把“环境与心智”一次配齐。搞清 Linux 为什么重要、它大致长什么样、常见目录放了什么，从此不再“心里没谱”，后面操作才更稳。

你将学到：
- 为什么前端也该掌握 Linux 基础（部署、排错与自动化）
- Linux 的核心构成：内核、发行版、包管理器、systemd、Shell
- 常见目录的作用与放置约定，改配置与看日志应该去哪儿
- 推荐的最小安装工具清单与安全习惯

## 引言：为什么写这本小册
- 面向谁：主要为前端工程师与偏应用层开发者，偶尔需要自管服务器、排错与部署。
- 写作目标：少而精，优先讲“常用且高收益”的命令与套路，降低学习曲线。
- 使用方式：建议先通读“基础篇”（00、01、02、03），遇到问题再查“场景篇”（06、11、10）。

## 为什么要学 Linux（对前端也很关键）
- 一致的运行环境：Node、Nginx、CI/CD、容器编排多数跑在 Linux。
- 排错效率：日志定位、端口占用、网络联通、磁盘预警都离不开命令行。
- 自动化与稳定性：把“可重复的人工动作”变为脚本/服务，减少人为失误。
- 职业通用力：跨端/全栈/平台工程化都离不开 Linux 基本功。

## 什么是 Linux（一句话认知框架）
- Linux 内核：负责进程、内存、文件系统、设备等底层能力。
- 发行版（Distribution）：在内核之上打包生态与工具链（Ubuntu、Debian、CentOS/RHEL、Alma/Rocky、Arch…）。
- 包管理器：apt（Ubuntu/Debian）、yum/dnf（CentOS/RHEL），用于安装/升级/卸载软件。
- 初始化系统：systemd 管理“服务”的生命周期（start/stop/restart/logs）。
- Shell：与系统交互的命令行解释器（bash/zsh），脚本与日常命令都在这里发生。

## Linux 常见目录速览（入门必备）
- / 根目录：一切皆文件，从这里出发
- /home：普通用户的家目录（个人文件、配置）
- /root：root 用户的家目录（谨慎操作）
- /etc：系统与服务的配置文件（Nginx、ssh、systemd…）
- /var：可变数据（日志/var/log、缓存、队列）
- /usr：用户层应用与库（/usr/bin 可执行程序）
- /opt：第三方软件的安装位置（可选用）
- /tmp：临时文件（系统重启可能清理）
- /proc：内核与进程的“伪文件系统”（查看进程/内核信息）
- /dev：设备文件（磁盘、终端等设备的抽象）

::: tip 小贴士
- 配置通常在 /etc，日志常在 /var/log
- 应用代码常放 /var/www 或 /opt，按团队约定为准
- 修改配置后多用“dry-run/测试命令”（例如 nginx -t）再重载
:::


> 建议先快速浏览第 “00. 命令行基础与使用习惯”，再回到本章开始实践。

### 命令行基础快速入门（极简版）
- 帮助：command --help；man command（q 退出，/ 搜索）
- 组合：cmd1 | cmd2 管道；> 覆盖输出；>> 追加；2> 错误
- 通配符：*.log 由 shell 展开；正则请用 grep -E
- 安全范式：删除/替换前先 echo 或 -print 预演
- 定位命令：which/command -v，PATH 决定搜索顺序
- sudo 提权：仅在需要时使用；配置 sudoers 更精细（见第 3 章）


适用读者：前端工程师，需完成自建/维护服务器上的基础运维工作（构建、部署、排错、监控）。

## 核心理念

- 最小必要：只学实战必备的 20% 命令，覆盖 80% 问题。
- 可复制：提供可直接粘贴的命令片段，附带安全提示与干跑方式。
- 先定位后修复：日志、进程、网络三板斧。

## 常见发行版与差异

- Debian/Ubuntu：apt、systemd 常见，云主机默认较多。
- CentOS/RHEL：yum/dnf、systemd。
- macOS（本地）：作为客户端运维工具环境（ssh、curl、brew），命令基本通用。

## 必装工具一览

- 基础：curl, wget, vim/nano, git, unzip/zip, tar, htop/top, net-tools 或 iproute2
- 网络排错：telnet, nc, dig, traceroute, tcpdump
- 日志与文本：less, tail, grep, awk, sed, jq
- Node/前端：nvm, node, pnpm/npm/yarn
- Nginx：反向代理与静态资源托管

::: info 示例（Ubuntu）
```bash
sudo apt update && sudo apt install -y curl wget vim git unzip zip tar htop net-tools jq dnsutils telnet netcat-traditional
```
:::

## 基本术语

- TTY/PTY：终端会话；使用 screen/tmux 保证远程任务不中断。
- PATH：可执行文件搜索路径；which/whereis 查找命令位置。
- 权限：rwx 与 755/644；sudo、sudoers 概念。

## 安全与风险提示

- 任何删除类命令（rm、dd、mkfs）务必先 dry-run 或加交互确认。
- 涉及生产服务，先在测试环境演练；命令前加 echo 验证参数。

## 推荐配置

- 常用别名（~/.bashrc 或 ~/.zshrc）：
```bash
alias ll='ls -alF'
alias gs='git status -sb'
alias please='sudo $(fc -ln -1)'  # 重试上一条命令并加 sudo
```

- SSH 免密登录（见第 9 章）提升效率。

## 易错点
- 将 /etc 与 /var 的职责混淆：配置在 /etc，运行数据在 /var
- 直接用 root 做所有操作，增加误操作风险
- 未使用 dry-run/测试命令（如 nginx -t）就重载配置

## 练习题（含答案）
1) 说明 /etc、/var、/opt 的适用场景并举例
- /etc：系统与服务配置（如 /etc/nginx/nginx.conf）
- /var：日志与缓存（如 /var/log/nginx/error.log）
- /opt：第三方软件安装位置
2) 给出一次安全的 Nginx 配置变更流程
- 修改配置 → nginx -t 校验 → systemctl reload nginx → 验证

## 延伸阅读
- Filesystem Hierarchy Standard (FHS)
- Ubuntu Server Guide：目录与服务
- systemd 入门手册