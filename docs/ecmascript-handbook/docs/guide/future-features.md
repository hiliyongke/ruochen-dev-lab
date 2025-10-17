# 展望未来：TC39 提案

ECMAScript 的发展是一个持续不断的过程。除了已经发布的正式标准，TC39 技术委员会还在不断地审核和推进新的语言特性提案。当一个提案达到 **Stage 3 (候选阶段)** 时，就意味着它的设计已经非常稳定，API 不会再有大的变动，并且很快就会被包含在未来的 ECMAScript 标准中。

本章节将介绍一些处于 Stage 3 且备受关注的重要提案，帮助你提前了解 JavaScript 的未来。

## Decorators (装饰器)

装饰器是一种特殊的声明，它可以附加到类声明、方法、访问器、属性或参数上，以某种方式修改其行为。这个特性在很多其他语言（如 Python, C#）中早已存在，并被 TypeScript 广泛采用，现在它终于要正式进入 JavaScript 了。

装饰器提供了一种声明式的语法来进行元编程（Metaprogramming），让代码更简洁、更具可读性。

**核心概念：**

-   装饰器本质上是一个函数，它在**类定义时**执行（而不是在实例化时）。
-   它接收被装饰的目标（如类、方法）作为参数，并可以选择性地返回一个新的目标来替换它。

**示例：记录方法调用**

下面是一个简单的例子，我们创建一个 `@log` 装饰器来记录一个类方法的调用。

```javascript
// 这是一个方法装饰器
function log(originalMethod, context) {
  const methodName = String(context.name);

  function replacementMethod(...args) {
    console.log(`LOG: Entering method '${methodName}'.`);
    const result = originalMethod.call(this, ...args);
    console.log(`LOG: Exiting method '${methodName}'.`);
    return result;
  }

  return replacementMethod;
}

class Calculator {
  @log
  add(a, b) {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3);

// 控制台输出:
// LOG: Entering method 'add'.
// LOG: Exiting method 'add'.
```

在这个例子中，`@log` 装饰器“包装”了原始的 `add` 方法，在它执行前后添加了日志输出，而没有侵入性地修改 `Calculator` 类的内部代码。

装饰器的应用场景非常广泛，包括但不限于：
-   数据绑定（如 Web Components）
-   依赖注入
-   日志、性能监控
-   权限校验

## Temporal: 全新的日期/时间 API

长期以来，JavaScript 内置的 `Date` 对象因其设计缺陷（如可变性、API 混乱、时区处理困难）而备受诟病。开发者通常需要依赖 `moment.js` 或 `date-fns` 等第三方库来处理复杂的日期和时间操作。

**Temporal** 是一个全新的、现代化的内置日期/时间 API，旨在彻底解决这些问题。它被设计为 `Date` 对象的直接替代品。

**核心优势：**

1.  **不可变性 (Immutability)**: 所有 `Temporal` 对象都是不可变的。任何修改操作（如增加一天）都会返回一个新的 `Temporal` 对象，而不是修改原始对象，这使得代码更安全、更可预测。
2.  **清晰的 API**: 提供了设计良好、语义明确的 API，将“日期”、“时间”、“时区”等不同概念分离成不同的对象类型。
3.  **完整的时区支持**: 内置了对 IANA 时区数据库的全面支持，轻松处理时区转换和夏令时问题。
4.  **跨平台兼容**: 旨在提供一种标准的、跨所有 JavaScript 环境一致的日期/时间处理方式。

**主要对象类型：**

-   `Temporal.Instant`: 表示一个精确的时间点（纳秒精度），与时区无关，类似于 `Date` 对象但不可变。
-   `Temporal.ZonedDateTime`: 表示一个带时区的、人类可读的日期和时间。
-   `Temporal.PlainDate`: 表示一个不带时区和时间的日期（如 `2025-10-14`）。
-   `Temporal.PlainTime`: 表示一个不带日期和时区的时间（如 `14:30:00`）。
-   `Temporal.Duration`: 表示一个时间段（如 “3小时20分钟”）。

**示例：**

```javascript
// 获取当前带时区的日期时间
const now = Temporal.Now.zonedDateTimeISO();
console.log(now.toString()); // e.g., "2025-10-14T14:30:00.123456789+08:00[Asia/Shanghai]"

// 创建一个特定日期
const independenceDay = Temporal.PlainDate.from({ year: 1776, month: 7, day: 4 });

// 计算两个日期之间的差值
const today = Temporal.Now.plainDateISO();
const diff = today.since(independenceDay);
console.log(`距离美国独立日已经过去了 ${diff.years} 年 ${diff.months} 月 ${diff.days} 日。`);

// 增加时间
const meeting = Temporal.PlainDateTime.from({ year: 2025, month: 10, day: 15, hour: 10 });
const oneHourLater = meeting.add({ hours: 1 });
console.log(oneHourLater.toString()); // "2025-10-15T11:00:00"
```

`Temporal` 是一个非常庞大但功能强大的提案，它的引入将彻底改变 JavaScript 中处理日期和时间的方式。

随着 TC39 流程的推进，未来还会有更多激动人心的特性加入到 JavaScript 中，我们拭目以待。