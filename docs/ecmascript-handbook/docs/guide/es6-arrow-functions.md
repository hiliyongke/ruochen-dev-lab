# 箭头函数 (Arrow Functions)

箭头函数是 ES6 中引入的一种新的函数语法。它提供了一种更简洁的方式来书写函数表达式，并且在处理 `this` 指向时与传统函数有显著不同。

## 1. 基本语法

箭头函数使用“箭头”（`=>`）来定义。

```javascript
// 传统函数表达式
const add = function(a, b) {
  return a + b;
};

// 使用箭头函数
const addArrow = (a, b) => {
  return a + b;
};

console.log(add(1, 2));      // 3
console.log(addArrow(1, 2)); // 3
```

### 语法简化

箭头函数在特定情况下可以进一步简化：

-   **单个参数**：如果函数只有一个参数，可以省略参数外面的括号。
    ```javascript
    const square = x => {
      return x * x;
    };
    ```

-   **单个返回语句**：如果函数体只有一条 `return` 语句，可以省略花括号 `{}` 和 `return` 关键字。
    ```javascript
    const square = x => x * x;

    // 等同于
    // const square = (x) => { return x * x; };
    ```

-   **没有参数**：如果没有参数，需要使用一对空括号 `()`。
    ```javascript
    const sayHello = () => {
      console.log('Hello!');
    };
    ```

-   **返回对象**：如果函数直接返回一个对象字面量，需要用括号 `()` 将对象包裹起来，以避免与函数体的花括号 `{}` 混淆。
    ```javascript
    // 错误语法：会被解析为函数体，而不是返回对象
    // const getPerson = () => { name: 'Yorke' };

    // 正确语法
    const getPerson = () => ({ name: 'Yorke' });
    ```

## 2. 核心特性：词法 `this`

箭头函数与普通函数最核心的区别在于 `this` 的指向。

-   **普通函数**：`this` 的值在函数被调用时确定，取决于函数的调用方式（谁调用了它）。
-   **箭头函数**：它没有自己的 `this` 绑定。它会捕获其所在上下文（即定义时所在的作用域）的 `this` 值，作为自己的 `this` 值。这个 `this` 值在函数的整个生命周期内都保持不变。

这个特性完美地解决了在回调函数中 `this` 指向混乱的问题。

### 示例：对比普通函数和箭头函数

让我们看一个经典的例子：

```javascript
function Timer() {
  this.seconds = 0;

  // 使用普通函数作为回调
  setInterval(function() {
    this.seconds++; // 这里的 `this` 指向什么？
    // 在非严格模式下，它指向 window 对象
    // 在严格模式下，它是 undefined
    // 无论哪种情况，它都不指向 Timer 实例
    console.log(this.seconds);
  }, 1000);
}

// const timer = new Timer(); // 会输出 NaN 或报错
```

在过去，我们通常用 `that = this` 或 `.bind(this)` 来解决这个问题：

```javascript
function TimerWorkaround() {
  this.seconds = 0;
  const that = this; // 方案一：保存 this
  setInterval(function() {
    that.seconds++;
    console.log(that.seconds);
  }, 1000);
}

// const timer2 = new TimerWorkaround(); // 正常工作
```

而使用箭头函数，问题迎刃而解：

```javascript
function TimerArrow() {
  this.seconds = 0;

  setInterval(() => {
    // 箭头函数从定义它的地方（TimerArrow 函数）捕获了 this
    // 这里的 this 正确地指向 TimerArrow 的实例
    this.seconds++;
    console.log(this.seconds);
  }, 1000);
}

const timer3 = new TimerArrow(); // 正常工作，每秒输出 1, 2, 3...
```

## 3. 其他区别与注意事项

除了 `this` 之外，箭头函数还有一些其他的重要特性：

-   **不能作为构造函数**：不能使用 `new` 命令，否则会抛出一个错误。
    ```javascript
    const Person = (name) => {
      this.name = name;
    };
    // const me = new Person('Yorke'); // Uncaught TypeError: Person is not a constructor
    ```

-   **没有 `arguments` 对象**：箭头函数内部没有 `arguments` 对象。但你可以使用 **rest 参数**（`...args`）来达到同样的目的。
    ```javascript
    function printArgs() {
      console.log(arguments);
    }
    printArgs(1, 2, 3); // [Arguments] { '0': 1, '1': 2, '2': 3 }

    const printArgsArrow = (...args) => {
      // console.log(arguments); // ReferenceError: arguments is not defined
      console.log(args);
    };
    printArgsArrow(1, 2, 3); // [1, 2, 3]
    ```

-   **没有 `prototype` 属性**。
    ```javascript
    const fn = () => {};
    console.log(fn.prototype); // undefined
    ```

-   **不能用作 Generator 函数**：不能使用 `yield` 关键字。

## 总结：何时使用箭头函数？

-   当你需要一个函数，并且希望它内部的 `this` 与其定义时的上下文保持一致时，箭头函数是最佳选择。这在 `setTimeout`, `setInterval`, `Promise.then`, 数组方法（如 `map`, `filter`）的回调中非常有用。
-   当你只是需要一个简短的回调函数，并且不关心 `this` 的指向时，箭头函数的简洁语法也非常方便。

**不适合使用箭头函数的场景**：

-   **对象的方法**：当给一个对象定义方法时，如果方法中需要使用 `this` 指向该对象本身，不要使用箭头函数。
    ```javascript
    const person = {
      name: 'Yorke',
      sayHi: () => {
        // this 指向全局对象 (window) 或 undefined
        console.log(`Hi, I'm ${this.name}`);
      },
      sayHiCorrectly: function() {
        // this 指向 person 对象
        console.log(`Hi, I'm ${this.name}`);
      }
    };
    person.sayHi(); // "Hi, I'm undefined"
    person.sayHiCorrectly(); // "Hi, I'm Yorke"
    ```
-   **需要动态 `this` 的场景**：例如在给 DOM 元素绑定事件监听时，你可能希望 `this` 指向该 DOM 元素。