# 数值与大整数（BigInt/Math/精度/序列化）

本章系统梳理 JavaScript 数值体系：Number 与 BigInt 的语义差异、精度与舍入、序列化与 JSON 限制、与 TypedArray/二进制的关系、常见陷阱与最佳实践。

## 1. 数值模型概览

- Number：IEEE 754 双精度浮点（64-bit），能表示安全整数范围为 [-(2^53 - 1), 2^53 - 1]
- BigInt：任意精度整数（不支持小数），适合超大整数运算与计数场景

安全整数边界：
```js
Number.MAX_SAFE_INTEGER === 9007199254740991; // 2^53 - 1
(9007199254740991 + 1) === 9007199254740992;  // true
(9007199254740991 + 2) === 9007199254740992;  // true（精度丢失）
```

## 2. BigInt 基本用法与与 Number 的互操作

创建与字面量：
```js
const a = 123n;              // 字面量
const b = BigInt('9007199254740993'); // 从字符串
BigInt(42) === 42n;          // 从安全整数 Number
```

禁止隐式混算（会抛错）：
```js
1n + 2; // TypeError: Cannot mix BigInt and other types
```

显式转换：
```js
Number(10n) === 10; // 可行，若超出安全范围会损失精度
BigInt(1.5);        // RangeError（需整数）
```

比较与相等：
```js
10n == 10;  // true（宽松相等）
10n === 10; // false（严格相等考虑类型）
```

## 3. 精度、舍入与常见浮点陷阱

浮点误差示例：
```js
0.1 + 0.2 === 0.3; // false
```

解决策略：
- 使用整数缩放（以分/厘计价），结算时再缩放回小数
- 使用 BigInt 做整数精确运算（注意不支持小数）
- 使用专门的十进制库（decimal.js 等）处理金融/高精度小数

舍入与格式化：
```js
// 四舍五入到两位
const rounded = Math.round(1.005 * 100) / 100; // 1.01（注意浮点误差）
(1.005).toFixed(2); // "1.01"（实现差异可能导致边例不稳）
// 更稳妥：使用整数缩放后再除
```

## 4. Math 常用扩展与实用技巧

常用：
- Math.trunc/Math.sign/Math.hypot/Math.clz32/Math.imul
- Math.fround：转换为 32 位单精度，匹配 WebGL/TypedArray 行为
- Math.expm1/log1p/log10/log2：数值稳定性更好

示例：
```js
Math.trunc(-1.9); // -1
Math.sign(-0);    // -0（注意 -0 存在）
Object.is(-0, 0); // false（区分 +0 与 -0）
```

## 5. 序列化、JSON 与可移植性

JSON 不支持 BigInt：
```js
JSON.stringify(10n); // TypeError
```

回避策略：
- 显式转换为字符串或十六进制字符串
```js
const obj = { id: 12345678901234567890n };
const json = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v);
// 反序列化时再转回 BigInt
const revived = JSON.parse(json, (_, v) => /^\d+$/.test(v) ? BigInt(v) : v);
```

与 DOM/URL/结构化克隆：
- BigInt 在大多 DOM API/URL API 中不直接支持；应转换为字符串或 Number（在安全范围内）
- structuredClone 支持 BigInt，但注意跨环境兼容性

## 6. 与二进制的关系：TypedArray 与 DataView

- BigInt64Array / BigUint64Array：以 64 位宽度读写 BigInt
```js
const buf = new ArrayBuffer(8);
const i64 = new BigInt64Array(buf);
i64[0] = 42n;
console.log(i64[0]); // 42n
```

DataView 目前不直接提供 BigInt 读写方法（视环境），通常使用相应的 BigInt TypedArray 或自行组合高低 32 位。

注意端序：
- 多平台默认为小端；跨平台/协议应明确端序并统一封装

## 7. 性能与内存

- BigInt 运算相对 Number 慢，且占用更多内存；对性能敏感路径优先 Number（若精度允许）
- 尽量避免在热路径频繁进行类型往返转换（BigInt ↔ Number）
- 对批量数值计算，优先 TypedArray 并使用 fround/imul 等帮助 JIT 优化

## 8. 常见陷阱与最佳实践

- 混算报错：BigInt 与 Number 不可混用算术运算符（需显式转换）
- 比较语义：== 可做跨类型比较但可能引入隐患；推荐使用 === 并显式转换
- 负零 -0：在比较、序列化与 UI 显示时可能产生意外；使用 Object.is 区分
- 金融场景：避免使用浮点直接运算；使用整数缩放或专用十进制库
- JSON 与持久化：BigInt 需自定义序列化/反序列化策略

## 9. FAQ（本章）

- 为什么 1n + 1 报错？因为禁止隐式混算；请先转换为同一类型
- 如何在 JSON 中携带 BigInt？以字符串方式序列化，并在解析时转回 BigInt
- 需要高精度小数怎么办？BigInt 仅支持整数；使用十进制库或整数缩放
- BigInt 会更快吗？通常不会；它是为精度而设计，不是为性能

## 10. 参考

- ECMAScript BigInt 规范
- MDN：BigInt、Number、Math、TypedArray
- 数值稳定性与舍入实践（IEEE 754 资料）