# 02. 文件与目录操作

> 引言：文件与目录是日常运维的“地基”。看、找、改、打包与传输，基本功扎实，问题处理就“有手感”。这章既有参数速览，也有高频场景模板。

你将学到：
- ls/cp/mv/rm/tar/find/grep 的高频参数与安全范式
- 如何快速定位大文件、批量替换配置、稳妥地删除
- 压缩/解压与跨机传输的常见组合
- 避坑：通配符、路径空格与 CRLF 编码问题

## 核心命令与常用参数速览

- ls：-l 详情，-a 包含隐藏，-h 人类可读，-t 时间排序
  - 示例：ls -lah /var/www
- cd/pwd：目录切换与当前路径
- mkdir：-p 递归创建；rmdir 删除空目录
  - 示例：mkdir -p /var/www/site/releases/2025-10-14
- cp/mv：-r 递归，-i 交互确认，-n 不覆盖，-v 详情
  - 示例：cp -a src/ dst/ 保留属性；mv -i a b
- rm：-i 交互，-r 递归，-f 强制（高危谨慎）
  - 安全范式：
    1) find ... -print 预览
    2) 确认无误后再 -delete 或配合 -exec rm
- du/df：du -sh 目录体积；df -h 分区使用
- tar/zip：
  - tar -czf out.tgz dir/；tar -xzf file.tgz -C /dest
  - zip -r out.zip dir/；unzip -d /dest file.zip
- find/grep：
  - find . -name "*.log" -mtime +7 -size +10M
  - grep -RIn "pattern" .（-i 忽略大小写，-n 行号）
- 权限相关：chmod/chown/chgrp（详见第 3 章）
- 查看内容：cat、less、head、tail -n 100 -f

::: tip 提示
- 通配符属于 shell 展开；grep 的正则匹配与之不同
- 路径包含空格时使用引号："My Folder/file.txt"
:::

## 场景化速查

- ls
  - 什么时候用：快速判断目录里“最近改动/体积/权限”等。
  - 怎么用：ls -laht /var/www 以时间倒序查看；ls -l /etc/nginx/*.conf 看权限/属主。
  - 小坑：ls -l 看到的大小是文件，不是目录占用，统计目录请用 du -sh。
- find
  - 什么时候用：清理老旧/大体积文件，或按模式批量处理。
  - 怎么用：
    - find . -name "*.log" -mtime +7 -delete 先改成 -print 预演，再执行 -delete
    - find / -type f -size +500M -exec ls -lh {} \; 2>/dev/null
  - 小坑：-delete 无回退；先 -print 验证路径与范围；用 -maxdepth/-mindepth 控制层级。
- grep
  - 什么时候用：在代码或日志里快速定位关键字/错误。
  - 怎么用：grep -RIn --color "ECONNRESET" /var/log/app
  - 小坑：通配符是 shell 行为，grep 使用正则；忽略大小写用 -i，性能优先可限制路径。
- tar/zip
  - 什么时候用：打包日志、静态资源或迁移归档。
  - 怎么用：tar -czf logs.tgz /var/log/nginx; tar -xzf logs.tgz -C /tmp/extracted
  - 小坑：打包时尽量用 -C 切换到上级目录，避免生成“深路径”；注意落盘空间。
- rm
  - 什么时候用：批量删除临时/缓存/历史产物。
  - 怎么用：find ... -print → 确认 → find ... -delete 或 -exec rm
  - 小坑：rm -rf 路径空格与 * 扩展风险大；对不可恢复删除务必预演并加引号。


## 命令解剖（看得懂就能用得对）

- cp（复制）
```bash
cp -a src/ dst/     # -a 归档：等价 -dR --preserve=all，保留权限/时间/符号链接
cp -r src/ dst/     # 递归目录（不保留属性）
cp -i fileA fileB   # 覆盖前交互确认；或用 -n 表示不覆盖
```
小坑：跨分区/不同文件系统时 -a 的保留能力受限；覆盖风险可加 -i 或先备份 .bak。

- mv（移动/改名）
```bash
mv -i old new       # 交互确认
mv -n src/ dst/     # 不覆盖已有文件
```
小坑：不同分区 mv 会退化为“复制+删除”，时间较长；注意路径空格需加引号。

- rm（删除，危险命令）
```bash
# 安全范式：先预演，再删除
find /path -type f -name "*.tmp" -print        # 预演
find /path -type f -name "*.tmp" -delete       # 确认后删除
```
小坑：rm -rf 与通配符组合极易误删；路径包含空格/通配符时务必加引号或先 echo。

- find（查找与批处理）
```bash
find . -name "*.log" -mtime +7 -size +10M -print
find . -type f -name "*.log" -exec gzip -9 {} \;      # 批量压缩
find . -type f -empty -delete                         # 删除空文件
```
要点：-maxdepth/-mindepth 控层级；-print 预演；-exec 末尾 \; 或 +（批量更快）。

- grep（内容搜索）
```bash
grep -RIn --color "ERROR" /var/log
grep -E "foo|bar" file.txt        # 扩展正则
grep -v "ignore-this" file.txt    # 取反过滤
```
要点：通配符是 shell 行为，grep 用正则；全局递归目录更快可考虑 rg（ripgrep）。

- tar/zip（打包/解包）
```bash
tar -czf out.tgz dir/                 # 创建压缩包
tar -xzf out.tgz -C /dest             # 解包到目录
tar -czf logs.tgz -C /var/log nginx   # 用 -C 避免深路径
zip -r out.zip dir/ && unzip -d /dest out.zip
```
小坑：打包大目录先确认磁盘空间；使用 -C 降低路径嵌套。

- rsync（高效同步/传输）
```bash
# 本地→远程，保留权限与时间，显示进度，删除目标多余文件（谨慎 --delete）
rsync -avzP --delete ./dist/ user@host:/var/www/site/releases/2025-10-14/
# 原子切换：软链指向最新发布目录
ssh user@host 'ln -sfn /var/www/site/releases/2025-10-14 /var/www/site/current && sudo systemctl reload nginx'
```
要点：-a 归档；-z 压缩；-P 断点续传/进度；--delete 会删除目标多余文件，务必确认路径。

::: warning 安全提示
- 涉及删除的命令务必先预演（find -print / rsync --dry-run）
- 路径包含空格请加引号；谨慎使用通配符与 sudo 组合
:::

## 常用命令

- 查看：ls -la、tree、du -sh、df -h
- 导航：cd、pwd
- 创建/复制/移动：mkdir -p、cp -r、mv
- 删除（谨慎）：rm -i、rm -rf（危险）
- 压缩/解压：tar、zip/unzip
- 内容查看：cat、less、head、tail -n 100 -f
- 搜索：find、grep -R、rg（ripgrep）
- 权限与所有权：chmod、chown、chgrp（详见第 3 章）

### 场景 1：快速定位大文件

```bash
# 当前目录前 20 个最大文件/目录
du -sh * 2>/dev/null | sort -h | tail -n 20
# 全局搜索大于 500MB 的文件
sudo find / -type f -size +500M -exec ls -lh {} \; 2>/dev/null | awk '{print $5, $9}'
```

### 场景 2：日志打包与传输

```bash
# 打包昨天日志并压缩
tar -czf logs-$(date -d "yesterday" +%F).tar.gz /var/log/nginx/*$(date -d "yesterday" +%Y%m%d)*

# 只打包匹配文件
tar -czf app-logs.tar.gz -C /var/log/app . --wildcards --no-anchored '*error*.log'

# 解压到指定目录
tar -xzf app-logs.tar.gz -C /tmp/extracted
```

### 场景 3：批量替换配置中某个域名

```bash
# 先预览：打印将被替换的行
grep -RIn --color=always 'old.example.com' /etc/nginx/sites-available

# 确认后批量替换（创建 .bak 备份）
sed -i.bak 's/old.example.com/new.example.com/g' /etc/nginx/sites-available/*.conf
```

### 场景 4：常见陷阱

- rm -rf . 与路径空格：使用引号或先 echo 再执行。
- 通配符扩展：慎用 sudo rm -rf /path/*；可改为 find -delete 并添加 -maxdepth 与 -mindepth 控制。
- 文本编码/换行符：dos2unix 工具处理 CRLF。

## 易错点
- 把 shell 通配符当正则用：grep 用正则，find -name 用通配符
- rm 与通配符联用未加引号：路径含空格会被拆词
- tar 打包过深路径：解压后层级混乱；用 -C 切换上级再打包
- rsync --delete 路径写反：会删除目标多余文件，务必先 --dry-run

## 练习题（含答案）
1) 仅删除当前目录 7 天前的 .log.gz 文件，先演练后执行
```bash
# 预演
find . -maxdepth 1 -type f -name "*.log.gz" -mtime +7 -print
# 执行
find . -maxdepth 1 -type f -name "*.log.gz" -mtime +7 -delete
```
2) 将 dist/ 同步到远端 releases/2025-10-14，并原子切换 current
```bash
rsync -avzP --dry-run ./dist/ user@host:/var/www/site/releases/2025-10-14/
rsync -avzP ./dist/ user@host:/var/www/site/releases/2025-10-14/
ssh user@host 'ln -sfn /var/www/site/releases/2025-10-14 /var/www/site/current && sudo systemctl reload nginx'
```

## 延伸阅读
- man find, man grep, man tar, man rsync
- The Art of Command Line（GitHub）
- ripgrep 项目主页（更快的 grep）