# 21. 脚本可移植性与兼容性实践（POSIX/GNU/BSD/macOS）

> 目标：编写“一次编写、多平台执行”的高可移植 Shell 脚本，覆盖 POSIX 与 Bash 差异、GNU/BSD 常用工具差异（Linux 与 macOS）、路径/编码/本地化/权限等常见坑，并提供可直接落地的模板与替代方案。

你将学到
- POSIX sh 与 Bash 的差异与取舍
- GNU 与 BSD 工具（sed/awk/find/xargs/date/readlink/getopt等）差异
- 脚本健壮性：set -euo pipefail、trap、临时文件/锁文件、退出码
- 跨平台检测与条件分支、/usr/bin/env 的使用
- 常见陷阱与替代方案清单
- 高可移植脚本模板与单元测试建议

## 1. 基础原则与执行环境

- Shebang：优先使用 env 寻址，避免路径差异
```sh
#!/usr/bin/env sh     # POSIX 首选
# 或（需要 Bash 特性的场景）
#!/usr/bin/env bash
```

- 最小依赖：优先用 POSIX 内建与通用命令，避免依赖发行版特有工具
- 明确标准：能用 POSIX sh 实现的优先用 sh；确需 Bash 特性（数组、正则 [[ ]]、扩展通配）再声明 bash
- 本地化与编码：固定 locale，避免排序/大小写/小数点等差异
```sh
export LC_ALL=C LANG=C
```

## 2. 健壮性与错误处理

- 强化选项
```sh
# POSIX 友好：-e 出错退出；-u 未定义变量即错误；-f 禁止通配展开；-C 避免重定向覆盖
set -eu
# 若为 bash/zsh，增加：
# set -o pipefail
```

- 退出码与失败显式化
```sh
die() { echo "ERROR: $*" >&2; exit 1; }
cmd || die "cmd failed"
```

- trap 与临时资源回收
```sh
TMP="$(mktemp -d 2>/dev/null || mktemp -d -t tmp)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT INT TERM
```

- 锁文件（避免并发）
```sh
LOCK="/tmp/my.lock"
if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK"
  flock -n 9 || die "another instance running"
else
  # 简易锁（不具备跨系统强一致性）
  if [ -e "$LOCK" ]; then die "another instance"; fi
  echo $$ >"$LOCK"
  trap 'rm -f "$LOCK"; exit' EXIT INT TERM
fi
```

## 3. GNU/BSD 工具常见差异与替代方案

- sed
  - GNU 支持 -r（ERE），BSD 常用 -E
  - 就地编辑：GNU/BSD 都支持 -i，但 BSD 常需 -i ''（空扩展名）
```sh
# 兼容写法（推荐 -E）
sed -E 's/foo(bar)?/baz/g' file
# 就地编辑（BSD/macOS）
sed -i '' -E 's/old/new/g' file
# GNU
sed -i -E 's/old/new/g' file
```

- awk
  - gawk 扩展多；尽量使用 POSIX awk 语法；小心 asorti/asort 的可用性
  - 指定分隔符与安全引用，避免 locale 干扰
```sh
awk -F'\t' 'BEGIN{OFS="\t"} {print $1, tolower($2)}' file
```

- find 与 xargs
  - -print0 与 xargs -0 可移植性较好（GNU/BSD 支持）
  - -maxdepth/-mindepth 在 BSD 可用但历史版本差异较大；可用“find . -type f -depth 1”替代或条件分支
```sh
find . -type f -print0 | xargs -0 -I{} echo "{}"
```

- date
  - GNU date 支持 -d/--date，BSD/macOS 使用 -v 偏移
```sh
# 取昨天日期（YYYY-MM-DD）
case "$(uname)" in
  Darwin|FreeBSD) date -v-1d +%F ;;
  *)              date -d "yesterday" +%F ;;
esac
```

- readlink/realpath
  - macOS 自带 readlink 不支持 -f；可用 Python/Perl 或 POSIX 组合替代
```sh
# 尝试 realpath；否则回退 Python
realpath() { command -v realpath >/dev/null && realpath "$1" || python3 - <<'PY'
import os,sys; print(os.path.realpath(sys.argv[1]))
PY
; }
```

- getopt
  - GNU getopt 与 BSD getopt 不兼容；POSIX getopts 更可移植（不支持长选项）
```sh
# POSIX getopts 示例
usage() { echo "Usage: $0 [-f file] [-v]"; exit 2; }
v=0; f=""
while getopts ":f:v" opt; do
  case "$opt" in
    f) f="$OPTARG" ;;
    v) v=1 ;;
    *) usage ;;
  esac
done
```

## 4. 跨平台检测与条件分支

- 基于 uname 与命令能力检测
```sh
OS="$(uname -s)"
has() { command -v "$1" >/dev/null 2>&1; }

if [ "$OS" = "Darwin" ]; then
  echo "macOS detected"
elif [ "$OS" = "Linux" ]; then
  echo "Linux detected"
fi

if has gsed; then SED="gsed"; else SED="sed"; fi
```

- 包管理差异（仅作为说明）
  - Debian/Ubuntu: apt；CentOS/RHEL: yum/dnf；Alpine: apk；macOS: brew
  - 用条件分支封装安装步骤，或提示用户手动安装

## 5. 路径/权限/换行符/文本处理陷阱

- 路径与空格：引用变量："$var"；使用 IFS 安全读取
- 权限与 sudo：避免在脚本中无条件 sudo；必要时提示并退出
- 换行符：CRLF → LF；git config core.autocrlf=input；dos2unix 非必须环境可用 tr -d '\r'
- 文件编码：统一 UTF-8；确保 locale=C 时不影响解析
- 临时文件：mktemp；避免使用可预测路径（/tmp/xxx）

## 6. 网络与超时/重试的可移植实现

- curl/wget 任选其一；优先检测可用命令
```sh
fetch() {
  if has curl; then curl -fsSL --retry 3 --connect-timeout 5 "$@"
  elif has wget; then wget -qO- --tries=3 --timeout=5 "$@"
  else die "need curl or wget"
  fi
}
```

- timeout
  - GNU coreutils 有 timeout；macOS 可用 gtimeout（brew coreutils）或 perl/python 实现
```sh
# 兼容 timeout
if has timeout; then
  timeout 5s cmd
elif has gtimeout; then
  gtimeout 5s cmd
else
  # 简易超时（后台+sleep+kill），略
  :
fi
```

## 7. 高可移植脚本模板（可直接使用）

```sh
#!/usr/bin/env sh
set -eu
# shellcheck disable=SC3040 # 若使用 dash/sh，避免 bash-only 语法
export LC_ALL=C LANG=C

die() { echo "ERROR: $*" >&2; exit 1; }
has() { command -v "$1" >/dev/null 2>&1; }

TMP="$(mktemp -d 2>/dev/null || mktemp -d -t tmp)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT INT TERM

OS="$(uname -s)"
case "$OS" in
  Darwin) SED="sed"; DATE_YESTERDAY() { date -v-1d +%F; } ;;
  Linux)  SED="sed"; DATE_YESTERDAY() { date -d "yesterday" +%F; } ;;
  *)      SED="sed"; DATE_YESTERDAY() { echo "unknown"; } ;;
esac

# 参数解析（POSIX getopts）
VERBOSE=0; FILE=""
usage() { echo "Usage: $0 [-v] [-f file]"; exit 2; }
while getopts ":vf:" opt; do
  case "$opt" in
    v) VERBOSE=1 ;;
    f) FILE="$OPTARG" ;;
    *) usage ;;
  esac
done

[ -n "$FILE" ] || die "-f file is required"
[ -r "$FILE" ] || die "file not readable: $FILE"

# 示例：兼容 sed 编辑
$SED -E 's/foo/bar/g' "$FILE" >"$TMP/out"
mv "$TMP/out" "$FILE"

[ "$VERBOSE" -eq 1 ] && echo "yesterday=$(DATE_YESTERDAY)"
echo "done"
```

## 8. 测试与质量保障

- ShellCheck：静态分析（brew install shellcheck 或 apt/yum 安装）
- shfmt：格式化（避免风格差异）
- bats：Bash 自动化测试（若用 bash 特性）
- CI：在 Ubuntu/macOS 双环境跑脚本测试，确保行为一致

## 9. 实操清单（可直接执行）

- [ ] 采用 `#!/usr/bin/env sh`（或明确需要 bash 时用 bash）
- [ ] 全局 `set -eu`（bash/zsh 再加 pipefail）
- [ ] 固化 `LC_ALL=C`，避免 locale 干扰
- [ ] 使用 `mktemp` 与 `trap` 做资源清理
- [ ] 参数解析统一用 POSIX `getopts`
- [ ] sed/awk/find/date/readlink/getopt 等提供 BSD/GNU 兼容分支或替代
- [ ] curl/wget 二选一封装；提供超时/重试
- [ ] 提供锁文件或 flock 方案，防止并发
- [ ] 引入 ShellCheck/shfmt，在 Linux 与 macOS CI 双跑
- [ ] 脚本头部注释说明：依赖/环境/返回码/示例

## 参考资料
- POSIX Shell Command Language
- ShellCheck/shfmt 官方文档
- GNU 与 BSD 工具手册（sed/awk/find/xargs/date/getopt）
- macOS 与主流 Linux 发行版手册（manpages）