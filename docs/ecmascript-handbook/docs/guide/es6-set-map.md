# Set 和 Map 数据结构

ES6 引入了两种新的数据结构：`Set` 和 `Map`。它们为处理集合数据提供了更强大、更专门的工具。

## 1. Set

`Set` 是一种类似于数组的数据结构，但其所有成员的值都是**唯一的**，没有重复值。

### 创建 Set

你可以通过 `new Set()` 创建一个空的 Set，或者传入一个可迭代对象（如数组）来初始化。

```javascript
const s = new Set();

// 传入数组，重复的元素会被自动忽略
const setFromArray = new Set([1, 2, 3, 4, 3, 2]);
console.log(setFromArray); // Set(4) { 1, 2, 3, 4 }
```

### 实例属性和方法

-   `set.size`: 返回 Set 实例的成员总数。
-   `set.add(value)`: 添加某个值，返回 Set 结构本身（可以链式调用）。
-   `set.delete(value)`: 删除某个值，返回一个布尔值，表示删除是否成功。
-   `set.has(value)`: 返回一个布尔值，表示该值是否为 Set 的成员。
-   `set.clear()`: 清除所有成员，没有返回值。

```javascript
const mySet = new Set();

mySet.add(1).add(5).add(5); // 添加重复值无效
console.log(mySet.size); // 2

console.log(mySet.has(1)); // true
console.log(mySet.has(3)); // false

mySet.delete(5);
console.log(mySet.has(5)); // false

mySet.clear();
console.log(mySet.size); // 0
```

### 遍历 Set

Set 提供了多种遍历方法。

-   `set.keys()`: 返回键名的遍历器。
-   `set.values()`: 返回键值的遍历器。
-   `set.entries()`: 返回键值对的遍历器。
-   `set.forEach()`: 使用回调函数遍历每个成员。

由于 Set 结构没有键名，只有键值（或者说键名和键值是同一个值），所以 `keys()` 和 `values()` 方法的行为完全一致。

```javascript
const set = new Set(['red', 'green', 'blue']);

for (let item of set.keys()) {
  console.log(item); // red, green, blue
}

for (let item of set.values()) {
  console.log(item); // red, green, blue
}

// entries() 返回的键和值相同
for (let item of set.entries()) {
  console.log(item); // ["red", "red"], ["green", "green"], ["blue", "blue"]
}

// Set 结构的实例默认可遍历，其默认遍历器生成函数就是它的 values() 方法
console.log(Set.prototype[Symbol.iterator] === Set.prototype.values); // true
// 因此，可以直接使用 for...of 循环
for (let x of set) {
  console.log(x); // red, green, blue
}
```

### 常见用例：数组去重

利用 Set 成员唯一的特性，可以非常方便地实现数组去重。

```javascript
const array = [1, 2, 5, 2, 1, 8];
const uniqueArray = [...new Set(array)]; // 或者 Array.from(new Set(array))
console.log(uniqueArray); // [1, 2, 5, 8]
```

## 2. Map

JavaScript 的对象（Object）本质上是字符串到值的对应，但 `Map` 结构为“值-值”的对应提供了真正的实现。它是一种键值对的集合，其中**任何类型的值**（包括对象）都可以作为一个键。

### 创建 Map

```javascript
const m = new Map();

// 传入一个包含键值对数组的数组
const mapFromArray = new Map([
  ['name', 'Yorke'],
  ['age', 30]
]);
```

### 实例属性和方法

-   `map.size`: 返回 Map 结构的成员总数。
-   `map.set(key, value)`: 设置键名 `key` 对应的键值为 `value`，然后返回整个 Map 结构（可以链式调用）。
-   `map.get(key)`: 读取 `key` 对应的键值，如果找不到 `key`，返回 `undefined`。
-   `map.has(key)`: 返回一个布尔值，表示某个键是否在当前 Map 对象之中。
-   `map.delete(key)`: 删除某个键，返回 `true`。如果删除失败，返回 `false`。
-   `map.clear()`: 清除所有成员，没有返回值。

```javascript
const myMap = new Map();
const keyObject = { a: 1 };

myMap.set('name', 'Gemini');
myMap.set(keyObject, 'This is an object key');

console.log(myMap.get('name'));      // 'Gemini'
console.log(myMap.get(keyObject)); // 'This is an object key'

console.log(myMap.has(keyObject)); // true
myMap.delete(keyObject);
console.log(myMap.has(keyObject)); // false
```

### 遍历 Map

Map 的遍历方法与 Set 类似。

-   `map.keys()`: 返回键名的遍历器。
-   `map.values()`: 返回键值的遍历器。
-   `map.entries()`: 返回所有成员的遍历器。
-   `map.forEach()`: 遍历 Map 的所有成员。

Map 的默认遍历器接口是 `entries()` 方法。

```javascript
const map = new Map([
  ['F', 'no'],
  ['T',  'yes'],
]);

for (let key of map.keys()) {
  console.log(key); // "F", "T"
}

for (let value of map.values()) {
  console.log(value); // "no", "yes"
}

// 直接使用 for...of 循环，获取的是 entries
for (let [key, value] of map) {
  console.log(key, value); // "F" "no", "T" "yes"
}
```

### 与 Object 的区别

-   **键的类型**：`Object` 的键只能是字符串或者 `Symbol`，而 `Map` 的键可以是任意值。
-   **键的顺序**：`Map` 的键是有序的（按插入顺序），而 `Object` 的键在某些情况下顺序是不确定的。
-   **大小**：`Map` 的大小可以通过 `size` 属性直接获取，而 `Object` 的大小需要手动计算。
-   **性能**：对于频繁增删键值对的场景，`Map` 通常比 `Object` 有更好的性能。

**结论**：当你的数据需要映射关系，并且键的类型不确定，或者需要频繁操作数据时，`Map` 是比 `Object` 更好的选择。