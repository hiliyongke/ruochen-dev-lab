# 迭代与生成器

本章系统讲解迭代协议、可迭代对象、迭代器、生成器（Generator）、异步迭代（for await...of），并提供可复制的最小示例、常见陷阱与图示。

## 1. 迭代协议（Iteration Protocol）

要点：
- 可迭代对象（Iterable）：实现 Symbol.iterator 方法，返回迭代器。
- 迭代器（Iterator）：具有 next() 方法，返回 { value, done }。
- for...of、展开运算符(...)、数组解构等基于迭代协议工作。

最小示例（自定义 Iterable 与 Iterator）：
```js
const range = {
  start: 1,
  end: 3,
  [Symbol.iterator]() {
    let cur = this.start;
    const end = this.end;
    return {
      next() {
        if (cur <= end) return { value: cur++, done: false };
        return { value: undefined, done: true };
      }
    };
  }
};

console.log([...range]); // [1, 2, 3]
for (const x of range) console.log(x); // 1 2 3
```

常见用途：
- 自定义数据结构的遍历
- 惰性序列与流式消费

## 2. 生成器（Generator）与 yield/yield*

要点：
- function* 声明生成器函数，调用返回迭代器/可迭代对象。
- yield 挂起与恢复执行；yield* 可委托到另一个可迭代对象。
- 生成器的 next(value)/throw(error)/return(value) 可与内部双向通信。

示例（yield 与双向通信）：
```js
function* greet() {
  const name = yield '你的名字是？';
  return `你好，${name}`;
}
const it = greet();
console.log(it.next());        // { value: '你的名字是？', done: false }
console.log(it.next('Alice')); // { value: '你好，Alice', done: true }
```

示例（yield* 委托）：
```js
function* genA() { yield 1; yield 2; }
function* genB() { yield* genA(); yield 3; }
console.log([...genB()]); // [1, 2, 3]
```

陷阱与建议：
- 生成器与普通函数不同步执行，不要在不需要中断/恢复的场景滥用。
- 避免在热路径频繁创建生成器对象，注意开销。

## 3. 迭代协议与 for...of、展开、解构

示例：
```js
const iter = {
  [Symbol.iterator]() {
    let i = 0;
    return { next: () => ({ value: i++, done: i > 3 }) };
  }
};

const arr = [...iter];        // [0,1,2]
const [a, b] = iter;          // a=0, b=1
for (const x of iter) {}      // 0,1,2
```

注意：
- for...of 迭代“值”，与 for...in（枚举键）不同。
- 某些类数组（如 arguments、NodeList）在现代环境已实现可迭代，但老环境可能不支持。

## 4. 异步迭代与 for await...of

要点：
- 异步可迭代对象实现 Symbol.asyncIterator，返回带 async next() 的异步迭代器。
- for await...of 会等待每次迭代的 Promise 解决（resolve）。

示例（异步迭代）：
```js
const asyncRange = {
  start: 1, end: 3,
  [Symbol.asyncIterator]() {
    let cur = this.start;
    return {
      async next() {
        await new Promise(r => setTimeout(r, 10)); // 模拟异步
        if (cur <= asyncRange.end) return { value: cur++, done: false };
        return { value: undefined, done: true };
      }
    };
  }
};

(async () => {
  for await (const n of asyncRange) {
    console.log(n); // 1, 2, 3（逐步异步输出）
  }
})();
```

与 Promise 并发的关系：
- for await...of 是顺序等待；需要并发可预先收集 Promise 列表并用 Promise.all。

## 5. 与内置可迭代对象的关系

- 可迭代：Array、String、Map、Set、TypedArray、arguments、部分 DOM 集合。
- Map/Set 的默认迭代分别为 entries() 与 values()（视规范/实现），常用 Array.from 或扩展运算符转换。

示例：
```js
const m = new Map([['a',1], ['b',2]]);
for (const [k,v] of m) console.log(k, v); // a 1 / b 2

const s = new Set([1,2,3]);
console.log([...s]); // [1,2,3]
```

## 6. 可迭代与迭代器的组合与复用

技巧：在对象上同时实现 Symbol.iterator 与自定义迭代方法以支持多种消费方式。
```js
class Line {
  constructor(a, b) { this.a = a; this.b = b; }
  [Symbol.iterator]() {
    let done = false;
    return {
      next: () => done ? { done: true } : (done = true, { value: [this.a, this.b], done: false })
    };
  }
  toArray() { return [...this]; }
}
console.log(new Line(0, 1).toArray()); // [[0,1]]
```

## 7. 常见陷阱与误区

- 把 for...in 当作 for...of：for...in 遍历可枚举键，可能包含原型链属性；for...of 才是基于迭代协议的“值”遍历。
- 未返回 done:true：自定义迭代器若不正确终止，会造成无限循环。
- 与 Array.prototype 方法混用：某些方法（如 map/filter）要求数组，需先用 Array.from 转换可迭代对象。
- 异步可迭代顺序阻塞：for await...of 默认串行，如需并发需手动 all/settled。

## 8. 图示

迭代协议对象关系（简化）：
```mermaid
flowchart LR
A[Iterable] -- Symbol.iterator() --> B[Iterator]
B -- next() --> C{{{ value, done }}}
```

生成器委托（yield*）：
```mermaid
flowchart LR
G1[Generator A] -- yield* --> G2[Generator B]
G2 --> Out[消费者 for...of]
```

## FAQ（本章）
- 为什么自定义对象 for...of 失败？因为未实现 Symbol.iterator。
- for await...of 为什么很慢？因为默认串行等待，每步一个 await；改用并发收集后 Promise.all。
- 生成器和普通函数差异？生成器可中断/恢复执行，返回可迭代迭代器，支持双向通信。

## 兼容与版本
- ES2015：迭代协议、for...of、生成器
- ES2018：异步迭代与 for await...of
- 旧环境可通过 Babel + regenerator/runtime 提供兼容；注意性能与包体权衡。

## 参考与扩展阅读
- ECMAScript 语言规范：Iteration protocols, Generators, Async Iteration
- MDN：Iterators and Generators、for...of、for await...of
- Jake Archibald: In The Loop（理解事件循环与微/宏任务）