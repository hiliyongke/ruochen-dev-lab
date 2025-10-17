# 集合与内置类型深潜（Map/Set/WeakMap/WeakSet 与 API 全景）

本章系统梳理 ES 集合类型的语义、复杂度与适用场景：Object vs Map、Set 与数组去重、WeakMap/WeakSet 的可达性与 GC 语义，并给出高频模式与陷阱。

## 1. 何时用 Object，何时用 Map？

对比要点：
- 键类型：Object 仅字符串/符号键；Map 支持任意值（对象、函数等）
- 顺序：Object 属性枚举顺序有规则但不直观；Map 保证插入顺序迭代
- 大小：Object 无 size，需手动统计；Map.size O(1)
- 原型链：Object 受原型链影响（可能命中继承属性）；Map 无原型污染问题
- 性能：频繁增删/查大量键时 Map 更稳定

示例（任意键）：
```js
const key = { id: 1 };
const m = new Map();
m.set(key, 'value');
console.log(m.get(key)); // 'value'
```

建议：
- 需要“字典/哈希表”且键非字符串时，用 Map
- 需 JSON 序列化/简单配置对象时，用 Object

## 2. Map API 全景与模式

常用 API：
- set(key, value), get(key), has(key), delete(key), clear()
- size, keys(), values(), entries(), forEach()
- 默认迭代为 entries()，可用 [...map] 展开

频繁模式：
- 对象聚合到 Map：
```js
const list = [{id:1,n:'a'},{id:2,n:'b'}];
const byId = new Map(list.map(x => [x.id, x]));
console.log(byId.get(2).n); // 'b'
```
- 值分组（grouping）：
```js
const arr = ['a','bb','c'];
const groups = arr.reduce((m, s) => {
  const k = s.length;
  if (!m.has(k)) m.set(k, []);
  m.get(k).push(s);
  return m;
}, new Map());
```

陷阱：
- set 链式可写但注意可读性
- Map 与 JSON：需自定义序列化（转数组或对象）

## 3. Set API 全景与模式

常用 API：
- add(value), has(value), delete(value), clear()
- size, keys()/values()/entries()（值=键）
- 默认迭代为 values()

去重/集合运算：
```js
const uniq = [...new Set([1,2,2,3])]; // [1,2,3]

const A = new Set([1,2,3]);
const B = new Set([2,3,4]);
const inter = new Set([...A].filter(x => B.has(x)));           // 交集
const diff  = new Set([...A].filter(x => !B.has(x)));          // 差集
const union = new Set([...A, ...B]);                           // 并集
```

对象引用语义：
```js
const s = new Set();
s.add({x:1});
console.log(s.has({x:1})); // false（不同引用）
```

## 4. Object vs Map 快速判定

- JSON/配置/静态键：Object
- 频繁增删/未知键/引用键：Map
- 需保持插入顺序且频繁遍历：Map
- 原型安全（防原型污染）：Map

## 5. WeakMap/WeakSet：可达性与 GC 语义

要点：
- WeakMap 的键必须是对象，且“弱引用”：当键仅被 WeakMap 引用时可被 GC 回收
- WeakSet 类似，但只存对象值
- 不可枚举、无 size（为保证 GC 可回收性）

典型用途：
- 关联私有数据，不泄漏内存
```js
const priv = new WeakMap();
class Model {
  constructor() {
    priv.set(this, { cache: new Map() });
  }
  get cache() { return priv.get(this).cache; }
}
```
- 对象级缓存（memoization），随对象释放自动清理
```js
const cache = new WeakMap();
function heavy(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const r = compute(obj); cache.set(obj, r); return r;
}
```

注意：
- 不能遍历 WeakMap/WeakSet；只适用于“附着型”私有数据与缓存

## 6. 复杂度与性能提示（概略）

- Map/Set 查找/插入/删除：平均 O(1)，碰撞与实现细节可能影响常数项
- Object 属性访问：平均 O(1)，但需考虑原型链与键字符串化开销
- 遍历：Map/Set 基于迭代协议，for...of 性能良好；需避免在热路径做多次扩展/拷贝

## 7. 迭代与转换

- Map/Set 均可用 Array.from 转数组
```js
const m = new Map([['a',1],['b',2]]);
const arr = Array.from(m); // [['a',1],['b',2]]
const obj = Object.fromEntries(m); // {a:1,b:2}
```
- 对象转 Map：
```js
const o = { a:1, b:2 };
const m2 = new Map(Object.entries(o));
```

## 8. 原型与可枚举性的坑

- for...in 会枚举可枚举自有属性与原型上的可枚举属性（不推荐对“字典”用）
- Object.keys 只枚举自有可枚举属性；Reflect.ownKeys 包含 symbol
- Map/Set 的 for...of 更直观，避免原型干扰

## 9. 常见陷阱与最佳实践

- Map 键为对象时必须持有同一引用；需要值比较时自行设计 key（如 JSON.stringify，但需注意顺序/性能）
- 不要把需要序列化的结构长久保存在 Map/Set 中而不做持久化策略
- WeakMap 仅在需“随对象释放自动清理”时使用；否则用 Map
- 使用 Object.create(null) 创建“无原型字典”可规避原型污染

## 10. FAQ（本章）

- 为什么 Map.has({}) 为 false？对象键按引用比较，需使用同一对象引用
- 如何序列化 Map/Set？使用 [...map] / [...set] 或 Object.fromEntries(map)
- WeakMap 为什么没有 size/遍历？为保证键可被 GC 回收；不可观测其内容大小
- Object 与 Map 谁更快？取决于场景与实现；普遍认为 Map 在大量动态键场景更稳定

## 参考
- ECMAScript 规范：Map/Set/WeakMap/WeakSet
- MDN：Map、Set、WeakMap、WeakSet
- 数据结构选型与复杂度分析