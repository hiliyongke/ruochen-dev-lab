# 错误处理与调试（同步/异步错误、unhandledrejection、Error cause/stack）

本章覆盖同步与异步错误、Promise/async 错误传递、全局未捕获错误与未处理拒绝、Error cause/stack、调试与 Source Map、最佳实践与 FAQ。

## 1. 同步与异步错误基础

同步错误：
```js
function parseJson(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    // 分类与补充上下文
    throw new Error('Invalid config JSON', { cause: e });
  }
}
```

异步错误（回调/事件）不会被外层 try/catch 捕获：
```js
try {
  setTimeout(() => { throw new Error('async'); }, 0);
} catch (e) {
  // 不会执行
}
```

## 2. Promise 与 async/await 的错误

Promise 链：
```js
doTask()
  .then(x => step(x))
  .catch(err => handle(err)) // 捕获链上错误
  .finally(cleanup);
```

async/await 等价处理：
```js
async function main() {
  try {
    const x = await doTask();
    await step(x);
  } catch (err) {
    handle(err);
  } finally {
    cleanup();
  }
}
```

并发 vs 串行：
- 串行 await：逐个等待，错误在第一个失败处抛出
- 并发：使用 Promise.all/settled 收敛错误
```js
const [a, b] = await Promise.all([fa(), fb()]); // 任何一个失败都会 reject
const results = await Promise.allSettled([fa(), fb()]); // 不中断，需自查结果
```

## 3. 全局错误与未处理拒绝

浏览器：
```js
window.addEventListener('error', (e) => {
  // 未捕获异常（同步/某些异步边界）
  report(e.error || e.message, e.filename, e.lineno, e.colno);
});

window.addEventListener('unhandledrejection', (e) => {
  // 未处理的 Promise 拒绝
  report(e.reason);
});
```

Node.js：
```js
process.on('uncaughtException', (err) => {
  report(err);
  // 建议记录后优雅退出（状态可能不一致）
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  report({ reason, promise: p });
  // 视策略决定是否转为异常
});
```

建议：
- 将全局捕获作为兜底日志与告警，不替代局部的显式错误处理
- 对关键事务（支付、下单等）必须就地捕获并回滚/补偿

## 4. Error cause 与堆栈（stack）

Error cause（ES2022）：
```js
try {
  load();
} catch (e) {
  throw new Error('Failed to init', { cause: e });
}
```

堆栈与 Source Map：
- 浏览器/Node 均提供 error.stack，格式实现相关
- 生产构建启用 Source Map（隐藏/上传到监控平台）以还原源码行号
- 前端上报时附加环境信息（版本、路由、用户动作摘要）

## 5. 常见陷阱与诊断

- try/catch 不会捕获异步回调中的异常，用 Promise/async 或在回调内部自行捕获
- 串行 await 导致性能问题：应合并为 Promise.all/settled 并集中处理错误
- 吞错：空 catch 或 then 的第二参数可能隐藏问题，统一使用 catch 分支
- 资源泄漏：在 finally 中做清理；使用 AbortController 控制中止
```js
const ctrl = new AbortController();
try {
  const res = await fetch(url, { signal: ctrl.signal });
  // ...
} catch (e) {
  if (e.name !== 'AbortError') report(e);
} finally {
  // 清理引用/计时器/监听器
}
```

## 6. 调试策略

- 日志分级：debug/info/warn/error + 关键字段（traceId、userId、route）
- 断点与条件断点：在关键路径与边界条件设置条件断点
- 网络与性能面板：定位超时/慢响应引发的错误链
- 依赖与版本对齐：锁定包版本，排查因构建/polyfill 导致的环境差异

## 7. 示例：统一错误收敛器

```js
function withGuard(fn, onError) {
  return (...args) => {
    try {
      const res = fn(...args);
      if (res && typeof res.then === 'function') {
        return res.catch(onError);
      }
      return res;
    } catch (e) {
      return onError(e);
    }
  };
}

const safeHandler = withGuard(async (req) => {
  const data = await fetchData(req.id);
  return render(data);
}, (err) => {
  report(err);
  return { ok: false, message: 'Internal Error' };
});
```

## 8. FAQ（本章）

- 为什么全局捕获也没记录到某些错误？错误被局部钩子吞掉或跨域/沙箱限制，需在核心路径显式上报
- 如何区分业务错误与系统错误？定义错误码/类层次，业务错误正常返回并提示，系统错误记录并告警
- Promise 链哪里丢错了？任何 then 分支抛错都应由后续 catch 捕获，缺失 catch 会触发 unhandledrejection

## 9. 兼容与版本

- Error cause：ES2022+
- 全局捕获与事件名：现代浏览器/Node 均支持；细节因版本不同
- Source Map：构建工具与部署平台需配合（隐藏/上传/访问控制）

## 参考
- MDN：Error、Error cause、window.onerror、unhandledrejection
- Node 文档：process 事件、诊断报告
- 前端监控与 Source Map 上传实践