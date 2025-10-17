# 05. 软件包管理

> 引言：装软件看似简单，装对版本、装得可维护才重要。掌握包管理器与 nvm，你就能把“环境问题”变成“可控变量”。

你将学到：
- 不同发行版的包管理器差异与常用操作
- 如何用 nvm 管理 Node 版本，避免全局安装带来的权限问题
- 常见故障（apt 锁、权限冲突）的识别与处理

## 各发行版

- Debian/Ubuntu：apt、apt-get
- CentOS/RHEL：yum、dnf
- 通用：snap、brew（macOS）

## 常用操作（Ubuntu 示例）

```bash
sudo apt update
sudo apt install -y nginx
apt list --installed | grep nginx
sudo apt remove -y nginx
sudo apt purge -y nginx
sudo apt autoremove -y
```

## Node 与 nvm

```bash
# 安装 nvm（以官方脚本为准）
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# 重新加载环境
source ~/.bashrc  # 或 ~/.zshrc
nvm install --lts
nvm use --lts
node -v && npm -v
```

## 命令解剖与对照

- apt 与 apt-get（Ubuntu/Debian）
  - apt 更友好的 UI，apt-get 更“脚本友好”；日常用 apt 即可
  - remove vs purge：purge 会移除配置文件（更干净）
```bash
sudo apt update && sudo apt install -y nginx
sudo apt remove -y nginx
sudo apt purge -y nginx
sudo apt autoremove -y
```
- yum/dnf（CentOS/RHEL）
```bash
sudo yum install -y nginx
sudo yum remove -y nginx
sudo yum clean all
```
- 查看已安装与版本
```bash
apt list --installed | grep nginx
apt-cache policy nginx
```
- nvm 管理 Node（避免 sudo npm -g）
```bash
nvm install --lts
nvm use --lts
npm -v && node -v
```

## 问题排查清单
- apt 锁被占：
  - 可能有未完成的安装/更新；确认无进程后可尝试：
```bash
sudo rm -f /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock
sudo dpkg --configure -a
sudo apt -f install
```
- 源超时/证书问题：切换更近的镜像源（企业内网可设本地代理）
- 版本不符：用 apt-cache policy 查看可用版本并 pin 版本
- npm 权限：不要 sudo npm -g；用 nvm 或给项目内本地安装

## 安全提示
- 对生产环境做变更前先 dry-run 或在同版本测试机演练
- 锁版本/固定源，避免“升级意外”带来的连锁问题