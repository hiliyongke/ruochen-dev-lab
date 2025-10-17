# let 和 const 命令

在 ECMAScript 2015 (ES6) 出现之前，我们通常使用 `var` 关键字来声明变量。`var` 存在一些问题，比如变量提升（hoisting）和没有块级作用域，这在大型项目中容易导致意想不到的 bug。

为了解决这些问题，ES6 引入了两个新的变量声明命令：`let` 和 `const`。

## let 命令

`let` 用于声明一个块级作用域的局部变量。与 `var` 相比，它有以下几个关键特性：

### 1. 块级作用域

`let` 声明的变量只在它所在的代码块（通常是 `{}` 包围的区域）内有效。

```javascript
function testVar() {
  if (true) {
    var name = 'Yorke';
    console.log(name); // 输出: Yorke
  }
  console.log(name); // 输出: Yorke (var 声明的变量泄露到了函数作用域)
}

function testLet() {
  if (true) {
    let name = 'Yorke';
    console.log(name); // 输出: Yorke
  }
  // console.log(name); // Uncaught ReferenceError: name is not defined
}

testVar();
testLet();
```

这个特性使得 `let` 非常适合在 `for` 循环中使用，因为循环变量 `i` 只在循环体内有效。

```javascript
for (let i = 0; i < 3; i++) {
  console.log('循环内:', i);
}
// console.log('循环外:', i); // Uncaught ReferenceError: i is not defined
```

### 2. 不存在变量提升

`var` 声明的变量会存在“变量提升”现象，即变量可以在声明之前使用，值为 `undefined`。而 `let` 必须先声明后使用。

```javascript
console.log(a); // 输出: undefined
var a = 1;

// console.log(b); // Uncaught ReferenceError: Cannot access 'b' before initialization
let b = 2;
```

### 3. 暂时性死区 (Temporal Dead Zone, TDZ)

在代码块内，使用 `let` 命令声明变量之前，该变量都是不可用的。这在语法上，称为“暂时性死区”。

```javascript
var tmp = 123;

if (true) {
  // TDZ 开始
  // tmp = 'abc'; // ReferenceError
  // console.log(tmp); // ReferenceError

  let tmp; // TDZ 结束
  console.log(tmp); // undefined

  tmp = 456;
  console.log(tmp); // 456
}
```

### 4. 不可重复声明

在同一个作用域内，`let` 不允许重复声明同一个变量。

```javascript
let message = 'Hello';
// let message = 'World'; // Uncaught SyntaxError: Identifier 'message' has already been declared
```

## const 命令

`const` 用于声明一个只读的常量。一旦声明，常量的值就不能被改变。

```javascript
const PI = 3.14159;
console.log(PI); // 3.14159

// PI = 3.14; // Uncaught TypeError: Assignment to constant variable.
```

`const` 具有和 `let` 相同的特性：

-   块级作用域
-   不存在变量提升
-   存在暂时性死区
-   不可重复声明

### `const` 的本质

`const` 实际上保证的，并非变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动。

-   **对于基本类型的数据**（如数值、字符串、布尔值），值就保存在变量指向的那个内存地址，因此等同于常量。
-   **对于引用类型的数据**（如对象、数组），变量指向的内存地址，保存的只是一个指向实际数据的指针。`const` 只能保证这个指针是固定的，至于它指向的数据结构是不是可变的，就完全不能控制了。

```javascript
const person = {
  name: 'Yorke'
};

// 可以修改对象的属性
person.name = 'Gemini';
console.log(person.name); // Gemini

// 但不能将 person 指向另一个对象
// person = { name: 'Alpha' }; // TypeError: Assignment to constant variable.

const arr = [];
arr.push('A'); // 可以
arr.push('B'); // 可以
// arr = ['C']; // TypeError
```

因此，在使用 `const` 声明对象或数组时，要特别注意这一点。

## 总结与实践建议

-   **告别 `var`**：在新的项目中，你应该完全避免使用 `var`。
-   **优先使用 `const`**：`const` 可以保证变量不会被意外修改，使代码更具可预测性。当一个变量需要被重新赋值时，再使用 `let`。
-   **`let` 用于循环和可变变量**：`let` 是 `for` 循环和需要重新赋值的场景的最佳选择。

遵循这些简单的规则，可以让你的代码更加健壮和易于维护。