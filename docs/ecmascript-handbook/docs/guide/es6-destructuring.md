# 解构赋值 (Destructuring Assignment)

ES6 引入的解构赋值语法是一种便捷的从数组或对象中提取数据并赋值给变量的方式。它极大地简化了代码，使其更易读、更精简。

## 1. 数组的解构赋值

数组的解构赋值是基于元素的位置进行匹配的。

### 基本用法

```javascript
// ES5 写法
var arr = [1, 2, 3];
var a = arr[0];
var b = arr[1];
var c = arr[2];

// ES6 解构赋值
const [a, b, c] = [1, 2, 3];
console.log(a); // 1
console.log(b); // 2
console.log(c); // 3
```

### 跳过元素

你可以通过在相应位置留空来跳过某些元素。

```javascript
const [, , third] = ["foo", "bar", "baz"];
console.log(third); // "baz"
```

### Rest 元素

使用 rest 语法（`...`）可以将数组中剩余的元素收集到一个新的数组中。

```javascript
const [head, ...tail] = [1, 2, 3, 4];
console.log(head); // 1
console.log(tail); // [2, 3, 4]
```

**注意**：Rest 元素必须是解构模式中的最后一个元素。

### 默认值

解构赋值允许你为变量指定一个默认值。当对应位置的元素不存在或值为 `undefined` 时，默认值就会生效。

```javascript
const [x, y = 'default'] = ['a'];
console.log(x); // 'a'
console.log(y); // 'default'

const [m, n = 'default'] = ['a', undefined];
console.log(n); // 'default'

const [p, q = 'default'] = ['a', null];
console.log(q); // null (因为 null 是一个有效值)
```

### 变量交换

解构赋值为交换两个变量的值提供了一种非常简洁的写法。

```javascript
let a = 1;
let b = 3;

[a, b] = [b, a];

console.log(a); // 3
console.log(b); // 1
```

## 2. 对象的解构赋值

对象的解构赋值与数组不同，它不是基于位置，而是基于属性名进行匹配。

### 基本用法

变量名必须与对象的属性名相同。

```javascript
const person = { name: 'Yorke', age: 30 };
const { name, age } = person;

console.log(name); // 'Yorke'
console.log(age); // 30
```

### 赋值给新的变量名

如果你想使用不同于属性名的变量名，可以使用冒号（`:`）语法。

```javascript
const person = { name: 'Yorke', age: 30 };
const { name: personName, age: personAge } = person;

console.log(personName); // 'Yorke'
console.log(personAge); // 30
// console.log(name); // ReferenceError: name is not defined
```

这里的 `name` 是匹配模式，`personName` 才是真正的变量名。

### 默认值

对象的解构赋值同样支持默认值。

```javascript
const { city = 'Unknown' } = { name: 'Yorke', age: 30 };
console.log(city); // 'Unknown'

// 也可以和重命名结合使用
const { country: nation = 'China' } = {};
console.log(nation); // 'China'
```

### Rest 属性

对象的 rest 属性（`...`）用于将一个对象中未被解构的、可枚举的属性收集到一个新对象中。

```javascript
const person = { name: 'Yorke', age: 30, city: 'Shanghai', country: 'China' };
const { name, ...rest } = person;

console.log(name); // 'Yorke'
console.log(rest); // { age: 30, city: 'Shanghai', country: 'China' }
```

### 嵌套解构

如果对象或数组是嵌套的，你也可以使用嵌套的解构模式来提取深层数据。

```javascript
const company = {
  name: 'TechCorp',
  location: {
    city: 'San Francisco',
    country: 'USA'
  },
  employees: [
    { name: 'Alice', role: 'Developer' },
    { name: 'Bob', role: 'Designer' }
  ]
};

const {
  location: { city },
  employees: [ firstEmployee ]
} = company;

console.log(city); // 'San Francisco'
console.log(firstEmployee); // { name: 'Alice', role: 'Developer' }
```

## 3. 函数参数的解构赋值

解构赋值在处理函数参数时尤其有用，特别是当函数接受一个包含多个配置项的 `options` 对象时。

```javascript
// 传统方式
function drawChart(options) {
  const width = options.width || 800;
  const height = options.height || 600;
  const data = options.data || [];
  // ...
}

// 使用解构赋值
function drawChart({ width = 800, height = 600, data = [] }) {
  console.log(width, height, data);
  // ...
}

drawChart({
  width: 1024,
  data: [1, 2, 3]
}); // 输出: 1024 600 [1, 2, 3]
```

这种写法不仅代码更少，而且让函数的参数一目了然。

## 4. 常见用例

-   **从对象中提取值**：例如从 `props` 或 `state` 中提取值在 React 组件中非常常见。
-   **函数返回多个值**：函数可以通过返回一个数组或对象，让调用者方便地通过解构获取多个返回值。
    ```javascript
    function getCoords() {
      return { x: 10, y: 20 };
    }

    const { x, y } = getCoords();
    ```
-   **模块导入**：`import` 语法本身就是解构赋值的一种应用。
    ```javascript
    import { useState, useEffect } from 'react';