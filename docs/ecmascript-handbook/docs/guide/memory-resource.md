# 内存与资源管理（WeakRef/FinalizationRegistry/可达性）

本章聚焦可达性与垃圾回收（GC）语义、弱引用结构 WeakRef 与 FinalizationRegistry 的用途与边界，以及缓存/资源回收的实用模式与风险提示。

## 1. 可达性与 GC 概念

- 可达性（Reachability）：从一组根对象（全局对象、当前调用栈、闭包里引用等）通过引用链可达的对象会保活；不可达对象可被 GC 回收。
- JS 引擎的 GC 是非确定性的：无法精确预测回收时间与顺序。
- 开发者不应依赖“析构函数式”的回收时机来驱动业务逻辑。

图示（简化可达性）：
```mermaid
flowchart LR
Root[根对象] --> A[对象A]
A --> B[对象B]
C[对象C(仅被弱引用)] -.弱引用.-> B
```

## 2. WeakRef：弱引用

作用：
- WeakRef 持有的对象引用不影响 GC 回收；当仅剩弱引用指向目标时，目标可被回收。
- 使用场景：缓存、跨层引用避免泄漏。

示例：
```js
let obj = { heavy: new Array(1e5).fill(0) };
const wr = new WeakRef(obj);

function readMaybe() {
  const target = wr.deref(); // 可能返回对象或 undefined（已被GC回收）
  if (target) {
    // 使用 target
  } else {
    // 重新创建或跳过
  }
}
obj = null; // 移除强引用，目标可被回收（时间不确定）
```

注意：
- deref() 返回值不稳定，下一刻可能变为 undefined。
- 不要把 deref() 的结果长期缓存为强引用；违背弱引用初衷。

## 3. FinalizationRegistry：终结注册表

作用：
- 在对象变为不可达并回收后，调度一个回调以执行“善后”逻辑（如移除映射表中的条目）。
- 回调执行时间与批次不确定；可能延后，甚至在进程结束前不执行。

示例：
```js
const registry = new FinalizationRegistry((heldValue) => {
  // 对应对象被回收后调用
  cleanupStore.delete(heldValue.key);
});

function track(obj, key) {
  cleanupStore.set(key, { ts: Date.now() });
  registry.register(obj, { key }, obj); // obj 用作 unregister token
}

// 取消注册（如生命周期结束时）
function untrack(obj) {
  registry.unregister(obj);
}
```

注意：
- 回调中不可依赖目标对象（已被回收），只能使用 heldValue。
- 不要在回调中进行重资源、阻塞或关键业务逻辑。

## 4. 常见模式与实践

- 缓存（memoization）+ 弱引用：
  - Key 是对象场景：WeakMap/WeakRef 避免缓存导致对象保活。
  - Value 可用 WeakRef 包裹，失效后按需重建。
```js
const cache = new WeakMap();
function expensive(obj) {
  const ref = cache.get(obj);
  const hit = ref?.deref();
  if (hit) return hit;
  const val = compute(obj);
  cache.set(obj, new WeakRef(val));
  return val;
}
```

- 资源句柄与登记清理：
  - 当对象回收后，清理映射结构/统计信息。
```js
const FR = new FinalizationRegistry(({ id }) => {
  openHandles.delete(id);
});
function createHandle(id) {
  const handle = { id };
  openHandles.set(id, handle);
  FR.register(handle, { id }, handle);
  return handle;
}
function closeHandle(handle) {
  openHandles.delete(handle.id);
  FR.unregister(handle);
}
```

## 5. 与 WeakMap/WeakSet 的关系

- WeakMap/WeakSet 基于弱引用键的结构，键仅被弱引用持有时可被回收。
- 不可枚举、无 size，适合“附着型”数据而非全量遍历场景。
- WeakRef/FinalizationRegistry 是更低层的控制；优先使用 WeakMap/WeakSet，只有在需要更细粒度时再用 WeakRef/FinalizationRegistry。

## 6. 风险与反模式

- 业务依赖回收时机：回收非确定，禁止用作关键流程触发器。
- 将弱引用结果长期转强：deref 后长时间持有强引用会使对象不再可回收。
- 在终结回调里执行昂贵操作或访问已无效资源：容易导致卡顿与隐患。
- 过度优化：在无明确泄漏/内存压力证据时不必引入弱引用复杂度。

## 7. 性能与调试

- 观测内存：使用性能面板/堆快照（Heap Snapshot）分析可达路径与泄漏来源。
- 定位泄漏：检查全局缓存、事件监听未移除、定时器/闭包持有、单例生命周期。
- 在单测/CI 中增加内存基线告警，避免回归。

## 8. FAQ（本章）

- 为什么 FinalizationRegistry 回调迟迟不执行？GC 时机不确定，且回调可能被批处理延后；不应依赖其时序。
- deref 一直能拿到对象，是不是不会回收？可能仍有其他强引用；确认引用链与快照。
- WeakMap 能遍历吗？不能；它的设计就是让键可被 GC，不提供可枚举能力。

## 9. 兼容与版本

- WeakRef/FinalizationRegistry：现代浏览器与 Node 14+（部分需特性标志）支持；旧环境不可 polyfill 完全语义。
- WeakMap/WeakSet：ES2015 起广泛支持。

## 参考
- ECMAScript：WeakRef、FinalizationRegistry、WeakMap/WeakSet
- MDN：WeakRef、FinalizationRegistry、调试内存泄漏