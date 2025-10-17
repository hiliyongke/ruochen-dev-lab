# 类 (Classes)

在 ES6 之前，JavaScript 的面向对象编程是基于原型链和构造函数实现的，语法上与其他语言（如 Java, C++）差异较大，对初学者不够友好。ES6 引入了 `class` 关键字，提供了一套更清晰、更简洁的语法来创建对象和处理继承。

需要明确的是，JavaScript 的 `class` 本质上只是一个**语法糖**。它的底层实现依然是基于原型链和原型继承，并没有引入新的面向对象继承模型。

## 1. 基本语法

使用 `class` 关键字来定义一个类。类名通常采用大驼峰命名法（PascalCase）。

```javascript
class Point {
  // 构造函数，用于创建和初始化实例对象
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // 类的方法
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

// 使用 new 关键字创建实例
const p = new Point(1, 2);
console.log(p.toString()); // "(1, 2)"

console.log(typeof Point); // "function"
console.log(Point === Point.prototype.constructor); // true
```

-   `constructor` 方法是类的默认方法，通过 `new` 命令生成对象实例时，自动调用该方法。一个类必须有 `constructor` 方法，如果没有显式定义，一个空的 `constructor` 方法会被默认添加。
-   类的方法都定义在 `prototype` 对象上面，在类中定义方法时，不需要 `function` 关键字，方法之间也不需要逗号分隔。

## 2. Getter 和 Setter

类中的属性也可以设置存值函数（setter）和取值函数（getter）。

```javascript
class Rectangle {
  constructor(width, height) {
    this._width = width;
    this._height = height;
  }

  // Getter
  get area() {
    return this._width * this._height;
  }

  // Setter
  set width(value) {
    if (value <= 0) {
      throw new Error('Width must be positive.');
    }
    this._width = value;
  }
}

const rect = new Rectangle(10, 5);
console.log(rect.area); // 50 (像访问属性一样调用 getter)

rect.width = 20; // 像给属性赋值一样调用 setter
console.log(rect.area); // 100
```

## 3. 静态方法 (Static Methods)

如果在一个方法前，加上 `static` 关键字，就表示该方法不会被实例继承，而是直接通过类来调用。这些方法通常用于实现一些与类实例无关的辅助功能。

```javascript
class MathHelper {
  static add(a, b) {
    return a + b;
  }
}

const sum = MathHelper.add(5, 10); // 直接通过类调用
console.log(sum); // 15

// const mh = new MathHelper();
// mh.add(1, 2); // TypeError: mh.add is not a function
```

父类的静态方法可以被子类继承。

## 4. 继承 (Inheritance)

`class` 可以通过 `extends` 关键字实现继承，这比 ES5 的原型链继承写法清晰和方便了很多。

### `extends` 和 `super`

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a noise.`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    // 1. 调用父类的 constructor(name)
    super(name);
    this.breed = breed;
  }

  // 2. 重写父类的方法
  speak() {
    console.log(`${this.name} barks.`);
  }

  // 3. 调用父类的方法
  makeNoise() {
    super.speak(); // 调用父类的 speak 方法
  }
}

const d = new Dog('Mitzie', 'Golden Retriever');
d.speak();     // "Mitzie barks."
d.makeNoise(); // "Mitzie makes a noise."
```

**`super` 关键字的关键点**：

1.  **作为函数调用** (`super(...)`)：在子类的 `constructor` 中，`super()` 代表父类的构造函数。**子类的 `constructor` 必须在使用 `this` 之前调用 `super()`**，因为它负责创建 `this` 对象并继承父类的属性。
2.  **作为对象使用** (`super.method`)：在子类的普通方法中，`super` 指向父类的原型对象，可以用来调用父类的方法。

## 5. 注意事项

-   **不存在提升**：与函数不同，类声明不存在变量提升（hoisting）。你必须先定义类，然后才能使用它。
-   **严格模式**：类和模块的内部，默认就是严格模式，所以你不需要使用 `'use strict';`。
-   **`new` 命令**：类必须使用 `new` 命令来调用，否则会报错。

`class` 语法的引入，让 JavaScript 的面向对象编程变得更加标准化和易于理解，是 ES6 最重要的特性之一。