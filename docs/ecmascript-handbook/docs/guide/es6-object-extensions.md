# 对象的扩展

ES6 引入了多种简化对象字面量语法的方式，并添加了一些新的实用方法，如 `Object.assign()` 和 `Object.is()`。

## 1. 属性简写 (Property Shorthand)

当你想创建一个对象，且其属性名与你的变量名相同时，ES6 允许你只写一次。

```javascript
const name = 'Yorke';
const age = 30;

// ES5 写法
const personOld = {
  name: name,
  age: age
};

// ES6 属性简写
const personNew = {
  name,
  age
};

console.log(personNew); // { name: 'Yorke', age: 30 }
```

这种简写在从函数返回对象时也特别有用。

## 2. 方法简写 (Method Shorthand)

在对象中定义方法时，可以省略 `: function` 这部分。

```javascript
// ES5 写法
const calculatorOld = {
  add: function(a, b) {
    return a + b;
  }
};

// ES6 方法简写
const calculatorNew = {
  add(a, b) {
    return a + b;
  }
};

console.log(calculatorNew.add(2, 3)); // 5
```

这使得对象中的方法看起来更像 `class` 中的方法，语法更加统一。

## 3. 计算属性名 (Computed Property Names)

ES6 允许在对象字面量中使用方括号 `[]` 来包裹一个表达式，并将其结果作为属性名。

```javascript
const propKey = 'type';
const obj = {
  [propKey]: 'user',
  ['user_' + 'id']: 123
};

console.log(obj.type);    // 'user'
console.log(obj.user_id); // 123
```

这在需要动态创建属性名的场景下非常方便，例如根据不同的输入生成不同的对象结构。

## 4. `Object.assign()`

`Object.assign()` 方法用于将所有可枚举的自有属性从一个或多个源对象（sources）复制到目标对象（target）。它会返回修改后的目标对象。

**语法**：`Object.assign(target, ...sources)`

### 合并对象

这是 `Object.assign()` 最常见的用途。

```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };

const mergedObj = Object.assign({}, obj1, obj2);

console.log(mergedObj); // { a: 1, b: 3, c: 4 }
```

-   `Object.assign` 会修改并返回第一个参数（`target`）。为了不修改原始对象，我们通常传入一个空对象 `{}` 作为 `target`。
-   如果源对象有相同的属性，后面的源对象的属性会覆盖前面的。

### 浅拷贝 (Shallow Copy)

`Object.assign()` 执行的是**浅拷贝**，而不是深拷贝。如果源对象的属性值是一个对象，那么它只会复制这个对象的引用。

```javascript
const source = {
  a: 1,
  b: { c: 2 }
};

const clone = Object.assign({}, source);

console.log(clone.b === source.b); // true

// 修改克隆对象的嵌套属性
clone.b.c = 3;

// 源对象也被修改了
console.log(source.b.c); // 3
```

要实现深拷贝，需要使用其他方法，例如 `JSON.parse(JSON.stringify(obj))`（有局限性）或第三方库（如 Lodash 的 `_.cloneDeep`）。

## 5. `Object.is()`

`Object.is()` 用于判断两个值是否为同一个值。它与严格相等运算符 `===` 的行为基本一致，但解决了 `===` 的两个特殊情况：

1.  `+0` 和 `-0`
2.  `NaN`

```javascript
// === 的行为
+0 === -0;      // true
NaN === NaN;    // false

// Object.is() 的行为
Object.is(+0, -0); // false
Object.is(NaN, NaN); // true
```

在绝大多数情况下，你仍然应该使用 `===`。只有在你需要精确处理 `+0/-0` 或 `NaN` 的场景下，`Object.is()` 才更有用。

## 6. 对象的扩展运算符 (`...`)

ES2018 (ES9) 引入了对象的 rest/spread 属性，用法与数组类似。

### Spread in Object Literals

扩展运算符（`...`）可以用于在对象字面量中“展开”一个对象的所有可枚举自有属性。

```javascript
const defaults = {
  theme: 'light',
  fontSize: 14
};

const userSettings = {
  fontSize: 16,
  showAvatar: true
};

const finalSettings = { ...defaults, ...userSettings };

console.log(finalSettings);
// { theme: 'light', fontSize: 16, showAvatar: true }
```

这提供了一种比 `Object.assign()` 更简洁、更声明式的方式来合并或克隆对象（同样是浅拷贝）。