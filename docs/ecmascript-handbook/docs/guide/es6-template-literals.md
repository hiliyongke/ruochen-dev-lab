# 模板字符串 (Template Literals)

在 ES6 之前，拼接字符串是一件比较繁琐的事情，特别是当字符串中包含许多变量或需要换行时。ES6 引入的模板字符串（也称模板字面量）彻底改变了这一现状。

## 1. 基本语法

模板字符串使用反引号（`` ` ``）来包裹，而不是传统的单引号（`'`）或双引号（`"`）。

```javascript
// 传统字符串
const str1 = 'This is a traditional string.';
const str2 = "This is also a traditional string.";

// 模板字符串
const templateStr = `This is a template literal.`;
```

## 2. 字符串插值 (Interpolation)

这是模板字符串最核心、最常用的功能。你可以在字符串中通过 `${expression}` 的语法直接嵌入任何有效的 JavaScript 表达式（变量、运算、函数调用等）。

### 嵌入变量

```javascript
const name = 'Yorke';
const greeting = `Hello, ${name}!`;

console.log(greeting); // "Hello, Yorke!"
```

这比传统的字符串拼接方式要清晰得多：

```javascript
// 传统方式
const greetingOld = 'Hello, ' + name + '!';
```

### 嵌入表达式

你可以嵌入任意表达式，包括算术运算、函数调用等。

```javascript
const a = 5;
const b = 10;
console.log(`Fifteen is ${a + b} and not ${2 * a + b}.`);
// "Fifteen is 15 and not 20."

function getFee(isMember) {
  return isMember ? '$2.00' : '$10.00';
}
console.log(`The fee is ${getFee(true)}.`);
// "The fee is $2.00."
```

## 3. 多行字符串

模板字符串完美支持多行文本。字符串中的所有空格、缩进和换行符都会被保留。

```javascript
// 传统方式需要使用 \n 或 +
const multiLineOld = 'This is the first line.\n' +
'This is the second line.';

// 使用模板字符串
const multiLineNew = `This is the first line.
This is the second line.`;

console.log(multiLineNew);
/*
输出:
This is the first line.
This is the second line.
*/
```

这在生成 HTML 模板时尤其有用：

```javascript
const user = { name: 'Yorke', email: 'yorke@example.com' };

const template = `
  <div class="user-card">
    <h2>${user.name}</h2>
    <p>Email: ${user.email}</p>
  </div>
`;
```

## 4. 标签模板 (Tagged Templates)

这是一个更高级的用法。如果一个模板字符串紧跟在一个函数名后面，该模板字符串会被“标签化”处理。这个函数（称为“标签函数”）会接收到被解析后的模板字符串的各个部分作为参数。

标签函数的第一个参数是一个字符串数组，包含了模板字符串中被插值表达式分割开的纯字符串部分。其余的参数则是各个插值表达式的求值结果。

### 语法

```javascript
myTag`Hello ${name}, how are you ${time}?`;

function myTag(strings, name, time) {
  // strings 是 ['Hello ', ', how are you ', '?']
  // name 是 'Yorke'
  // time 是 'today'
  // ... 在这里可以对字符串和变量进行自定义处理
}
```

### 示例：安全 HTML

一个常见的用例是过滤 HTML 字符串，防止 XSS 攻击。

```javascript
function safeHTML(strings, ...values) {
  let result = strings[0];
  values.forEach((value, i) => {
    // 对插入的变量进行转义
    const escapedValue = String(value)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">");
    result += escapedValue + strings[i + 1];
  });
  return result;
}

const untrustedInput = "<script>alert('XSS');</script>";
const html = safeHTML`<p>Here is the user input: ${untrustedInput}</p>`;

console.log(html);
// 输出: <p>Here is the user input: <script>alert('XSS');</script></p>
// 这样渲染到页面上就是安全的
```

标签模板为你提供了一个强大的元编程能力，允许你在字符串拼接之前，对模板的各个部分进行自定义的逻辑处理。著名的库如 `styled-components` 和 `lit-html` 都重度依赖此特性。