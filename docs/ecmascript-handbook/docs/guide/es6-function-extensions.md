# 函数的扩展

ES6 对函数进行了多项重要扩展，使得函数的定义和使用更加灵活、直观。其中最核心的两个改进是**参数默认值**和**rest 参数**。

## 1. 函数参数的默认值

在 ES6 之前，我们通常通过在函数体内进行逻辑判断来为参数设置默认值。

```javascript
// ES5 写法
function log(x, y) {
  y = y || 'World';
  console.log(x, y);
}

log('Hello'); // Hello World
log('Hello', 'Yorke'); // Hello Yorke
log('Hello', ''); // Hello World ('' 被认为是 falsy 值，导致 bug)
```

这种写法有一个明显的缺陷：当传入的参数 `y` 的值是 `false`、`0`、`''`、`null` 或 `undefined` 等 "falsy" 值时，默认值会意外地生效。

ES6 允许直接在参数定义后面，使用 `=` 来为参数指定默认值。

```javascript
// ES6 写法
function log(x, y = 'World') {
  console.log(x, y);
}

log('Hello'); // Hello World
log('Hello', 'Yorke'); // Hello Yorke
log('Hello', ''); // Hello ('' 是一个有效的参数值)
```

只有当一个参数的值严格等于 `undefined` 时，默认值才会生效。

```javascript
log('Hello', undefined); // Hello World
log('Hello', null); // Hello null
```

### 与解构赋值结合

参数默认值可以与解构赋值结合使用，这在处理复杂的 `options` 对象时非常强大。

```javascript
function fetchApi({ url, method = 'GET', headers = {} }) {
  console.log(`Fetching from ${url} with method ${method}`);
  // ...
}

fetchApi({ url: '/api/users' });
// "Fetching from /api/users with method GET"
```

## 2. rest 参数

rest 参数（形式为 `...变量名`）用于获取函数的多余参数，并将它们放入一个数组中。

```javascript
function sum(...numbers) {
  let total = 0;
  for (const num of numbers) {
    total += num;
  }
  return total;
}

console.log(sum(1, 2, 3));    // 6
console.log(sum(1, 2, 3, 4)); // 10
```

### 与 `arguments` 对象的区别

rest 参数的出现，旨在取代 `arguments` 对象。`arguments` 对象并非一个真正的数组，它是一个类数组对象，你不能直接使用 `map`, `filter` 等数组方法。而 rest 参数是一个**真正的数组**，你可以使用所有数组方法。

```javascript
function sortNumbers() {
  // arguments 不是真数组，没有 sort 方法，需要转换
  return Array.prototype.slice.call(arguments).sort();
}

const sortNumbersRest = (...numbers) => {
  // numbers 是真数组，可以直接调用 sort
  return numbers.sort();
};
```

此外，rest 参数只包含那些没有对应形参的参数，而 `arguments` 对象包含了传给函数的所有参数。

```javascript
function foo(a, ...rest) {
  console.log('a:', a);
  console.log('rest:', rest);
  console.log('arguments:', arguments);
}

foo(1, 2, 3, 4);
// a: 1
// rest: [2, 3, 4]
// arguments: { '0': 1, '1': 2, '2': 3, '3': 4 }
```

**注意**：rest 参数之后不能再有其他参数，它必须是函数参数列表的最后一个。

```javascript
// 错误语法
// function f(a, ...b, c) { ... }
```

## 3. 扩展运算符 (Spread Operator)

扩展运算符也是三个点（`...`），但它的作用与 rest 参数相反。它不是收集，而是**展开**一个数组。

虽然它可以用在很多地方（如数组字面量、对象字面量），但在函数调用中使用时，它可以将一个数组展开为独立的参数序列。

```javascript
const numbers = [4, 3, 8, 5];

// ES5 apply
Math.max.apply(null, numbers); // 8

// ES6 扩展运算符
Math.max(...numbers); // 8
```

这提供了一种更直观、更易读的方式来将数组元素作为函数的参数。

## 4. name 属性

ES6 增强了函数的 `name` 属性，使其能更准确地返回函数名。

```javascript
function doSomething() {}
console.log(doSomething.name); // "doSomething"

const fn = function() {};
console.log(fn.name); // "fn"

const boundFn = doSomething.bind({});
console.log(boundFn.name); // "bound doSomething"

console.log((() => {}).name); // "" (匿名箭头函数)