# FAQ 专章（按主题汇总）

本章按主题聚合常见问题与解决方案，并提供跳转到对应深入章节。

## 目录
- 语言语义与运行时
- 异步与事件循环
- 模块与打包
- 集合与内置类型
- 二进制与并发
- 正则表达式
- 时间与国际化
- 数值与 BigInt
- 错误处理与调试
- 内存与资源管理
- 工具链与兼容性

---

## 语言语义与运行时
Q: 为什么 let/const 在声明前访问会报错（TDZ）？
A: 这是暂时性死区语义，变量在绑定创建与初始化之间不可访问。详见 /guide/language-semantics

Q: 箭头函数内的 this 为什么不随调用方变化？
A: 箭头函数不绑定 this，捕获定义处的词法 this。详见 /guide/language-semantics

Q: for...of 与 for...in 的差异？
A: for...of 基于迭代协议产出值；for...in 枚举可枚举键。详见 /guide/iteration-generators 与 /guide/language-semantics

---

## 异步与事件循环
Q: 为什么 Promise 回调先于 setTimeout 执行？
A: Promise.then 进入微任务队列，setTimeout 属于宏任务，事件循环会先清空微任务。详见 /guide/language-semantics

Q: 如何捕获未处理的 Promise 拒绝？
A: 浏览器使用 unhandledrejection 事件；Node 使用 process.on('unhandledRejection')。详见 /guide/error-debugging

---

## 模块与打包
Q: ESM 与 CommonJS 如何互操作？
A: 需要明确默认导出/命名导出映射与打包器处理策略。详见 /guide/modules-bundling 与 /guide/es6-modules

Q: 动态 import 的最佳实践是什么？
A: 使用 import() 做按需加载与代码分割，搭配条件导入与错误边界。详见 /guide/modules-bundling 与 /guide/tooling-compat

Q: Tree-shaking 为什么无效？
A: 可能因副作用标记缺失（package.json sideEffects）、动态访问、配置不当。详见 /guide/modules-bundling

---

## 集合与内置类型
Q: Map 和 Object 该如何选择？
A: 需要键类型、遍历顺序、性能表现等不同；Map 在大量增删查改更稳定。详见 /guide/collections-deep-dive

Q: WeakMap/WeakSet 的典型场景？
A: 私有数据、缓存、避免内存泄漏（弱引用不阻止 GC）。详见 /guide/collections-deep-dive 与 /guide/memory-resource

---

## 二进制与并发
Q: TypedArray 与 DataView 如何选择？
A: 同构批量数值用 TypedArray；跨宽度/端序控制用 DataView。详见 /guide/binary-performance

Q: SharedArrayBuffer 在浏览器不可用？
A: 需启用跨源隔离（COOP/COEP）。详见 /guide/binary-performance

---

## 正则表达式
Q: 命名捕获组与后行断言如何使用？
A: 使用 `(?<name>...)` 与 `(?<=...)`/`(?<!...)`，注意兼容性与 v/u/y/s 标志。详见 /guide/regex-guide

Q: 如何避免回溯灾难？
A: 控制量词与分支结构，使用原子组/占有量词（取决于实现）或重写模式。详见 /guide/regex-guide

---

## 时间与国际化
Q: Intl 与 Temporal 的关系？
A: Intl 是国际化格式化 API；Temporal 为新一代时间模型（对比 Date 的改进）。详见 /guide/time-i18n

Q: 如何正确格式化本地化数字/日期？
A: 使用 Intl.NumberFormat/DateTimeFormat，避免手写格式。详见 /guide/time-i18n

---

## 数值与 BigInt
Q: BigInt 与 Number 能混算吗？
A: 不能直接混算，需要显式转换；注意序列化与 JSON 限制。详见 /guide/numbers-bigint

Q: 精度问题如何规避？
A: 使用整数缩放、BigInt 或专用库，谨慎处理小数运算。详见 /guide/numbers-bigint

---

## 错误处理与调试
Q: 同时支持同步与异步错误的最佳实践？
A: 统一错误边界，异步链路使用 try/catch+await 或 Promise.catch，并处理未捕获事件。详见 /guide/error-debugging

Q: 如何定位构建后堆栈？
A: 使用 source map，确保映射上传/内联并在生产限制泄漏。详见 /guide/error-debugging

---

## 内存与资源管理
Q: WeakRef/FinalizationRegistry 能解决内存泄漏吗？
A: 它们是补充手段，不是泄漏“银弹”；应优先管理可达性、解除引用与取消监听。详见 /guide/memory-resource

Q: 缓存该用哪种结构？
A: 小型临时缓存可用 Map/WeakMap；需淘汰策略时使用 LRU 等封装。详见 /guide/memory-resource 与 /guide/collections-deep-dive

---

## 工具链与兼容性
Q: polyfill、ponyfill、sham 有何区别？
A: polyfill 修改全局；ponyfill 提供独立函数；sham 在不完整环境下部分模拟。详见 /guide/tooling-compat

Q: 如何制定兼容目标？
A: 使用 Browserslist/engines 统一目标，Babel preset-env + core-js 按需注入。详见 /guide/tooling-compat

---

如需按主题快速定位，请参阅“主题导航”：/guide/topics-overview