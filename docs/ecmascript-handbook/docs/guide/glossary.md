# 术语词汇表（统一基线）

为确保全站术语一致性，以下为中英文对照与使用规范（加粗为推荐中文表述）。

- Iteration Protocol：**迭代协议**
- Iterable：**可迭代对象**
- Iterator：**迭代器**
- Generator：**生成器**
- Async Iterator：**异步迭代器**
- yield / yield*：**yield / yield\***
- Promise：**Promise**
- async/await：**async/await**
- Event Loop：**事件循环**
- Microtask / Macrotask：**微任务 / 宏任务**
- Scope / Hoisting / TDZ：**作用域 / 提升 / 暂时性死区**
- this binding：**this 绑定**
- Execution Context：**执行上下文**
- Closure：**闭包**
- Prototype / Prototype Chain：**原型 / 原型链**
- Class Fields / Private Fields：**类字段 / 私有字段**
- Module / ESM / CJS：**模块 / ESM / CJS**
- Dynamic import：**动态导入**
- import.meta：**import.meta**
- Tree-shaking：**摇树优化**
- Proxy：**代理**
- Reflect：**Reflect（反射 API）**
- Property Descriptor：**属性描述符**
- Object Extensibility：**对象可扩展性**
- TypedArray / ArrayBuffer / DataView：**类型化数组 / ArrayBuffer / DataView**
- SharedArrayBuffer / Atomics：**共享 ArrayBuffer / Atomics**
- BigInt：**BigInt（大整数）**
- Intl.*：**国际化 API**
- Temporal（proposal）：**Temporal（提案）**
- WeakMap / WeakSet / WeakRef / FinalizationRegistry：**WeakMap / WeakSet / 弱引用 / 终结注册表**
- Unicode Property Escapes：**Unicode 属性类（正则）**
- Lookbehind assertions：**后行断言**
- dotAll flag (s)：**dotAll 标志 s**
- polyfill / ponyfill / sham：首次出现写作“polyfill（垫片）”，正文统一小写 polyfill；库侧优先 ponyfill（不污染全局）；sham 表示能力受限的替代实现

使用规则：
- 首次出现采用“中文（英文）”形式，之后仅用中文或英文其一，但需全章一致。
- API 名称、代码标识保持英文原文，周边文字使用中文描述。
- 版本与阶段：ES2015/ES6、ES2018 等；TC39: Stage 0–4 保留英文 Stage 表记。