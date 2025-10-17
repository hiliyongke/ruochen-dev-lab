# Symbol 和 迭代器 (Iterator)

ES6 引入了两种深刻影响 JavaScript 语言底层机制的概念：`Symbol` 和 `Iterator`。`Symbol` 是一种全新的原始数据类型，而 `Iterator` 是一种接口，为各种不同的数据结构提供了统一的访问机制。

## 1. Symbol

`Symbol` 是 ES6 引入的第七种原始数据类型（前六种是 `Undefined`、`Null`、`Boolean`、`String`、`Number`、`Object`，后来 ES2020 又加入了 `BigInt`）。

`Symbol()` 函数会返回一个 **symbol** 类型的值，该类型具有静态属性和静态方法。它的静态属性会暴露几个内建的成员对象；它的静态方法会暴露全局的 symbol 注册，且类似于内建对象类，但作为构造函数来说它并不完整，因为它不支持 `new Symbol()` 语法。

每个从 `Symbol()` 返回的 symbol 值都是**唯一的**。

### 基本用法

```javascript
// 创建 Symbol
let s1 = Symbol();
let s2 = Symbol();

console.log(s1 === s2); // false

// 可以接受一个字符串作为描述，主要用于调试
let s3 = Symbol('foo');
let s4 = Symbol('foo');

console.log(s3 === s4); // false
console.log(s3.toString()); // "Symbol(foo)"
```

### 作为对象属性键

`Symbol` 的主要用途是作为对象的属性名，创建一个独一无二、绝不重复的键。这可以有效地防止属性名冲突。

```javascript
const mySymbol = Symbol();

// 写法一
const a = {};
a[mySymbol] = 'Hello!';

// 写法二
const b = {
  [mySymbol]: 'Hello!'
};

// 写法三
const c = {};
Object.defineProperty(c, mySymbol, { value: 'Hello!' });

console.log(a[mySymbol]); // "Hello!"
```

**注意**：使用 `Symbol` 作为属性名时，该属性是**不可枚举的**。它不会出现在 `for...in`、`for...of` 循环中，也不会被 `Object.keys()`、`Object.getOwnPropertyNames()`、`JSON.stringify()` 返回。

但是，它也不是私有属性，可以通过 `Object.getOwnPropertySymbols()` 和 `Reflect.ownKeys()` 来获取。

```javascript
const obj = {
  [Symbol('my_key')]: 1,
  enum: 2,
  nonEnum: 3
};

console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(my_key)]
console.log(Reflect.ownKeys(obj)); // ["enum", "nonEnum", Symbol(my_key)]
```

### 内置的 Symbol 值

ES6 还提供了一些内置的 `Symbol` 值，它们指向语言内部使用的方法，被称为“知名符号”（Well-known Symbols）。通过重新定义这些 `Symbol` 属性，我们可以改变对象的原生行为。

其中最重要的一个就是 `Symbol.iterator`。

## 2. 迭代器 (Iterator)

迭代器（Iterator）是一种接口，或者说是一种协议。任何数据结构只要部署了 `Iterator` 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。

### `Iterator` 的作用

1.  为各种数据结构，提供一个统一的、简便的访问接口。
2.  使得数据结构的成员能够按某种次序排列。
3.  ES6 创造了一种新的遍历命令：`for...of` 循环。`Iterator` 接口主要供 `for...of` 消费。

### `Iterator` 的遍历过程

一个数据结构如果具有 `Symbol.iterator` 属性，并且该属性是一个函数，那么它就是“可迭代的”（iterable）。

调用这个 `[Symbol.iterator]()` 函数，会返回一个“迭代器对象”（iterator object）。这个迭代器对象具有一个 `next()` 方法。

每次调用 `next()` 方法，都会返回一个包含 `value` 和 `done` 两个属性的对象。
-   `value`：当前成员的值。
-   `done`：一个布尔值，表示遍历是否结束。

```javascript
const arr = ['a', 'b', 'c'];
const it = arr[Symbol.iterator](); // 获取迭代器对象

console.log(it.next()); // { value: 'a', done: false }
console.log(it.next()); // { value: 'b', done: false }
console.log(it.next()); // { value: 'c', done: false }
console.log(it.next()); // { value: undefined, done: true }
```

### 原生具备 Iterator 接口的数据结构

-   `Array`
-   `Map`
-   `Set`
-   `String`
-   `TypedArray`
-   函数的 `arguments` 对象
-   `NodeList` 对象

这些数据结构都可以直接使用 `for...of` 循环。

```javascript
for (let char of 'hello') {
  console.log(char); // h, e, l, l, o
}
```

### `for...of` 循环

`for...of` 循环的本质就是不断调用数据结构的 `[Symbol.iterator]()` 方法返回的迭代器对象的 `next()` 方法，直到 `done` 变为 `true`。

### 自定义 Iterator

我们可以为一个普通对象部署 `Iterator` 接口，让它也能够被 `for...of` 循环遍历。

```javascript
const myIterable = {
  data: [10, 20, 30],
  [Symbol.iterator]: function() {
    let index = 0;
    const data = this.data;
    return {
      next: function() {
        if (index < data.length) {
          return { value: data[index++], done: false };
        } else {
          return { value: undefined, done: true };
        }
      }
    };
  }
};

for (const item of myIterable) {
  console.log(item); // 10, 20, 30
}
```

理解 `Symbol.iterator` 是理解 `for...of`、解构赋值、扩展运算符（`...`）等众多 ES6 特性背后工作原理的关键。