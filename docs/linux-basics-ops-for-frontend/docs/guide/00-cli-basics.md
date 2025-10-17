# 00. 命令行基础与使用习惯

> 引言：命令行就像你的“万能遥控器”。学会基本语法与习惯，你在后续章节遇到的 80% 问题都能更快拆解。别急着跑场景，先把基础垫厚，事半功倍。

你将学到：
- 命令的基本结构与帮助文档的高效查阅方式
- 管道、重定向、通配符与引号的正确使用
- PATH、环境变量与 sudo 权限的常见陷阱与最佳实践
- 文本三件套（grep/awk/sed）的入门用法与常见组合

本章帮助你建立统一的命令使用心智，读完再看后续章节会更顺畅。

## 1) 命令基本结构

- 形式：command [subcommand] [options] [args]
- 示例：
  - ls -la /var/www
  - git commit -m "feat: add x"
  - systemctl status nginx -l

约定：
- 短选项：-v -f 可组合 -vf
- 长选项：--verbose --force 通常不组合
- 帮助：-h 或 --help；手册：man command

## 2) 管道与重定向

- 管道：cmd1 | cmd2 把前者输出给后者作为输入
- 重定向：
  - 覆盖输出：> out.txt
  - 追加输出：>> out.txt
  - 仅错误：2> err.log
  - 标准与错误都重定向：> out.log 2>&1
- 常见组合：
  - ps aux | grep node | grep -v grep
  - journalctl -u app -n 500 | grep -i error

## 3) 通配符与引用

- 通配符（Shell 展开）：
  - * 任意字符
  - ? 单个字符
  - [abc] 字符集
- 正则表达式：grep/awk/sed 使用的匹配语法（与通配符不同）
- 引号：
  - " 双引号会保留变量展开（echo "$HOME"）
  - ' 单引号原样输出（echo '$HOME'）
  - 反引号/$(...) 命令替换（echo $(date)）

## 4) 环境变量与 PATH

- 查看/设置：echo $PATH；export PATH=/usr/local/bin:$PATH
- 定位可执行路径：which node / command -v node
- 临时变量：FOO=bar command（仅本次调用生效）
- 永久配置：~/.bashrc 或 ~/.zshrc

## 5) 管理权限

- sudo：以更高权限执行（需在 sudoers 中授权）
- su：切换用户
- 文件权限：rwx 与 755/644；详见第 3 章
- 风险命令（删除/覆盖）先 dry-run：echo、--dry-run、-print

## 6) 文档与帮助

- command --help（快速查看常用）
- man command（完整手册，q 退出、/ 搜索）
- tldr command（如有安装，速查）

## 7) 常用安全习惯

- 删除前先打印：find ... -print；确认后再加 -delete
- 引号包围路径以防空格：rm -rf "/path with space/*"
- 用 find -maxdepth/-mindepth 精准控制范围
- 用 --no-preserve-root 保底意识（谨慎 rm -rf /）
- 高危命令前先 echo 验证变量展开是否正确

## 8) 分页查看与导航

- less：less file.log；/keyword 搜索，n 下一个，q 退出
- tail -n 200 -f file 实时追加查看（Ctrl+C 退出）
- head/tail 快速截取；nl 编号显示

## 9) 文本三件套（入门）

- grep：模式过滤
  - grep -RIn "pattern" .
  - grep -i 忽略大小写，-n 显示行号，-R 递归
- awk：按列处理
  - awk '{print $1,$7}' access.log
  - awk -F, '{print $3}' data.csv
- sed：流编辑/替换
  - sed -n '1,50p' file 显示 1-50 行
  - sed -i.bak 's/old/new/g' file 原地替换并备份

## 10) 常见命令常用参数对照（速记）

- ls：-l 详情 -a 全部 -h 人类可读 -t 时间排序
- cp：-r 递归 -a 保留属性 -i 交互确认 -v 详细
- mv：-i 交互 -v 详细 -n 不覆盖已存在
- rm：-i 交互 -r 递归 -f 强制（谨慎）
- tar：
  - 打包压缩：tar -czf out.tgz dir/
  - 解压：tar -xzf file.tgz -C /dest
- find：
  - find . -name "*.log" -mtime +7 -size +10M
  - -exec ... {} \; 或 -delete（谨慎）
- grep：-R 递归 -n 行号 -i 忽略大小写 -E 扩展正则
- curl：-I 仅响应头 -v 调试 -L 跟随重定向 --max-time 超时
- ss/lsof：ss -lntp 查看监听；lsof -i :3000 看占用

建议：本章配合第 02、06 章一起阅读，先“基础”，再“场景”。

## 易错点
- 把通配符当正则用：grep 用正则，shell 通配符在执行前展开
- 未加引号导致路径含空格被拆词
- 未区分标准输出与错误输出，排错信息被忽略

## 练习题（含答案）
1) 将命令的标准输出与错误分别写入不同文件
```bash
command > out.log 2> err.log
```
2) 用管道串联两个命令过滤 ERROR 并统计行数
```bash
journalctl -u app | grep -i ERROR | wc -l
```

## 延伸阅读
- man bash, man zsh：Shell 基础
- The Art of Command Line（GitHub）
- tldr 项目：速查版命令手册