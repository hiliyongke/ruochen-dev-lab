# 模块化 (Modules: import/export)

在 ES6 之前，JavaScript 并没有一个原生的模块化标准。社区发展出了多种模块化方案，最著名的是 CommonJS (用于 Node.js) 和 AMD (用于浏览器)。这种混乱的局面直到 ES6 引入官方的模块化标准（ESM）才得以终结。

ESM 的设计思想是，在编译时就能确定模块的依赖关系，以及输入和输出的变量。这使得静态分析成为可能，带来了诸如 Tree-shaking（摇树优化）等诸多好处。

## 1. 模块的核心：`export` 和 `import`

一个文件就是一个模块。模块内部的变量、函数和类默认是私有的，外部无法访问。你需要使用 `export` 命令来显式地导出你希望暴露给其他模块的接口。然后，其他模块可以通过 `import` 命令来导入这些接口。

### 示例：创建一个模块

假设我们有一个 `utils.js` 模块，提供一些工具函数。

```javascript
// 文件: utils.js

// 导出变量
export const PI = 3.14;

// 导出函数
export function sum(...numbers) {
  return numbers.reduce((acc, num) => acc + num, 0);
}

// 导出类
export class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
}
```

### 导入并使用模块

现在，在另一个文件 `main.js` 中，我们可以导入并使用这些接口。

```javascript
// 文件: main.js

import { PI, sum, Person } from './utils.js';

console.log(PI); // 3.14

const total = sum(1, 2, 3, 4);
console.log(total); // 10

const user = new Person('Yorke');
user.greet(); // "Hello, I'm Yorke"
```

-   `import` 后面的 `{}` 中的变量名必须与 `export` 时使用的名称完全一致。
-   `import` 命令具有**提升效果**，会提升到整个模块的头部，首先执行。

## 2. 导出方式

主要有两种导出方式：**命名导出 (Named Exports)** 和 **默认导出 (Default Export)**。

### 命名导出 (Named Exports)

一个模块可以有多个命名导出。这是最常见的导出方式。

```javascript
// 写法一：在声明时直接导出
export const a = 1;
export function b() { /* ... */ }

// 写法二：使用 export 语句统一导出
const c = 3;
function d() { /* ... */ }
export { c, d };
```

导入时，使用 `{}` 语法。

### 默认导出 (Default Export)

一个模块**最多只能有一个**默认导出。`export default` 命令用于指定模块的默认输出。

```javascript
// 文件: my-component.js
export default function MyComponent() {
  // ...
}

// 或者导出一个类、一个对象等
// export default class { ... }
// export default { ... };
```

导入默认导出的接口时，`import` 后面不需要使用 `{}`，并且可以为导入的接口指定**任意名称**。

```javascript
// 文件: app.js
import AnyNameYouLike from './my-component.js';

// 使用 AnyNameYouLike
```

这在导出模块的核心功能（例如一个 React 组件或一个 Vue 组件）时非常有用。

### 混合使用

你可以在同一个模块中同时使用命名导出和默认导出。

```javascript
// a-module.js
export default function mainFunc() { /* ... */ }
export const helper = () => { /* ... */ };

// b-module.js
import main, { helper } from './a-module.js';
// `main` 是默认导出的别名
// `helper` 是命名导出的
```

## 3. 导入时的重命名和整体导入

### 重命名 `as`

如果导入的多个模块中有命名冲突，或者你想使用一个更具描述性的名字，可以使用 `as` 关键字进行重命名。

```javascript
import { sum as addNumbers } from './utils.js';

console.log(addNumbers(1, 5)); // 6
```

`export` 时也可以使用 `as`。

```javascript
function internalFunc() {}
export { internalFunc as publicFunc };
```

### 整体导入 `*`

使用星号（`*`）可以将一个模块中所有**命名导出**的接口都加载到一个对象上。

```javascript
// main.js
import * as Utils from './utils.js';

console.log(Utils.PI);
const total = Utils.sum(1, 2, 3);
const user = new Utils.Person('Gemini');
```

**注意**：`*` 只会导入命名导出的接口，默认导出 `export default` 会被忽略。

## 4. 在 HTML 中使用模块

要在浏览器中直接使用 ES 模块，你需要在 `<script>` 标签中添加 `type="module"` 属性。

```html
<!DOCTYPE html>
<html>
<body>
  <!-- 引入模块脚本 -->
  <script type="module" src="main.js"></script>
</body>
</html>
```

设置了 `type="module"` 的脚本会自动进入**严格模式**，并且拥有自己的顶级作用域，不会污染全局。

## 5. 模块的特性总结

-   **静态解析**：`import` 和 `export` 只能在模块的顶层使用，不能在代码块（如 `if` 语句）或函数中使用。这保证了依赖关系在编译时就是确定的。
-   **单例模式**：模块只会被加载和执行一次。之后再次 `import` 同一个模块，会直接使用缓存的导出结果。
-   **严格模式**：ES 模块自动运行在严格模式下。
-   **延迟执行**：模块代码的执行是延迟的。脚本会先解析 `import` 和 `export` 语句，构建依赖图，然后再按顺序执行代码。