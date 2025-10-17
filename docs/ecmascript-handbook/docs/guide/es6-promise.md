# Promise

在 JavaScript 中，很多操作都是异步的，例如网络请求、文件读写、定时器等。在 Promise 出现之前，我们主要依赖回调函数来处理这些异步操作的结果。当多个异步操作存在依赖关系时，就会形成所谓的“回调地狱”（Callback Hell），代码可读性和可维护性极差。

Promise 是 ES6 引入的异步编程解决方案，它是一个代表了异步操作最终完成（或失败）及其结果值的对象。

## 1. Promise 的三种状态

一个 Promise 实例必然处于以下三种状态之一：

1.  **Pending（进行中）**：初始状态，既不是成功，也不是失败。
2.  **Fulfilled（已成功）**：意味着操作成功完成。
3.  **Rejected（已失败）**：意味着操作失败。

Promise 的状态一旦从 `Pending` 变为 `Fulfilled` 或 `Rejected`，就不会再发生变化。这个过程是单向的，不可逆的。

## 2. 创建一个 Promise

我们可以通过 `new Promise()` 构造函数来创建一个 Promise 实例。它接受一个函数作为参数，这个函数被称为 `executor`。

`executor` 函数接受两个参数：`resolve` 和 `reject`。它们是两个由 JavaScript 引擎提供的函数。

-   `resolve(value)`：在异步操作成功时调用，将 Promise 的状态从 `Pending` 变为 `Fulfilled`，并将成功的结果 `value` 传递出去。
-   `reject(error)`：在异步操作失败时调用，将 Promise 的状态从 `Pending` 变为 `Rejected`，并将失败的原因 `error` 传递出去。

```javascript
const promise = new Promise((resolve, reject) => {
  // 执行一个异步操作，比如定时器
  setTimeout(() => {
    const success = true; // 模拟操作成功或失败
    if (success) {
      resolve('操作成功！'); // 将 Promise 置为 Fulfilled 状态
    } else {
      reject('操作失败！');  // 将 Promise 置为 Rejected 状态
    }
  }, 1000);
});
```

## 3. 使用 `.then()` 处理结果

`then()` 方法是 Promise 的核心，用于为 Promise 实例添加状态改变后的回调函数。它最多可以接受两个参数：

-   `onFulfilled`：当 Promise 状态变为 `Fulfilled` 时调用的函数。
-   `onRejected`：当 Promise 状态变为 `Rejected` 时调用的函数（可选）。

```javascript
promise.then(
  (value) => {
    // 成功的回调
    console.log('Success:', value);
  },
  (error) => {
    // 失败的回调
    console.log('Error:', error);
  }
);
```

### 链式调用

`.then()` 方法最强大的地方在于它可以**链式调用**。每个 `.then()` 方法都会返回一个新的 Promise 对象，这使得我们可以将多个异步操作串联起来。

```javascript
function step1() {
  return new Promise(resolve => {
    setTimeout(() => resolve('Step 1 finished'), 500);
  });
}

function step2(dataFromStep1) {
  console.log(dataFromStep1); // "Step 1 finished"
  return new Promise(resolve => {
    setTimeout(() => resolve('Step 2 finished'), 500);
  });
}

step1()
  .then(step2)
  .then(result => {
    console.log(result); // "Step 2 finished"
    console.log('All steps finished.');
  });
```

## 4. 使用 `.catch()` 捕获错误

`.catch(onRejected)` 方法是 `.then(null, onRejected)` 的语法糖，专门用于指定 `Rejected` 状态的回调函数。它使得错误处理更加清晰。

```javascript
const failingPromise = new Promise((resolve, reject) => {
  setTimeout(() => reject('Something went wrong!'), 1000);
});

failingPromise
  .then(value => {
    console.log('This will not be called.');
  })
  .catch(error => {
    // 捕获错误
    console.error('Caught an error:', error); // "Caught an error: Something went wrong!"
  });
```

Promise 的错误具有“冒泡”的特性。链式调用中任何一个环节的错误都会被后续的 `.catch` 捕获。

## 5. 使用 `.finally()`

`.finally(onFinally)` 方法在 ES2018 (ES9) 中引入。无论 Promise 最终是 `Fulfilled` 还是 `Rejected`，`finally` 中注册的回调函数都会被执行。

这非常适合执行一些清理操作，例如关闭加载动画、关闭数据库连接等。

```javascript
function processData() {
  console.log('Show loading spinner...');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟成功或失败
      Math.random() > 0.5 ? resolve('Data loaded') : reject('Failed to load');
    }, 1500);
  })
  .catch(err => {
    console.error(err);
    // 可以在 catch 后继续抛出错误，让后续的 catch 也能捕获
    throw err;
  })
  .finally(() => {
    // 无论成功或失败，都会执行
    console.log('Hide loading spinner.');
  });
}

processData();
```

## 6. 静态方法

Promise 对象还提供了一些有用的静态方法。

### `Promise.all(iterable)`

接收一个 Promise 数组作为参数。
-   当数组中**所有**的 Promise 都变为 `Fulfilled` 时，它返回的 Promise 才会 `Fulfilled`，并且结果是一个包含了所有 Promise 结果的数组。
-   只要数组中**任何一个** Promise 变为 `Rejected`，它返回的 Promise 就会立即 `Rejected`，并且结果是第一个失败的 Promise 的原因。

这非常适合处理多个相互不依赖的异步操作，并等待它们全部完成后再进行下一步。

```javascript
const p1 = Promise.resolve(3);
const p2 = 1337;
const p3 = new Promise((resolve) => setTimeout(resolve, 100, 'foo'));

Promise.all([p1, p2, p3]).then(values => {
  console.log(values); // [3, 1337, "foo"]
});
```

### `Promise.race(iterable)`

接收一个 Promise 数组作为参数。
-   只要数组中**任何一个** Promise 的状态发生改变（无论是 `Fulfilled` 还是 `Rejected`），它返回的 Promise 就会立即采用这个 Promise 的状态和结果。

这就像一场比赛，谁第一个到达终点，整个比赛就结束了。

```javascript
const promise1 = new Promise((resolve) => setTimeout(resolve, 500, 'one'));
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'two'));

Promise.race([promise1, promise2]).then((value) => {
  console.log(value); // "two" (promise2 更快)
});
```

### `Promise.resolve(value)` 和 `Promise.reject(reason)`

这两个方法用于快速创建一个已经处于 `Fulfilled` 或 `Rejected` 状态的 Promise。

```javascript
const resolvedPromise = Promise.resolve('Success');
resolvedPromise.then(v => console.log(v)); // "Success"

const rejectedPromise = Promise.reject(new Error('Failure'));
rejectedPromise.catch(e => console.error(e.message)); // "Failure"
```

## 7. 走向 `async/await`

虽然 Promise 解决了回调地狱，但链式的 `.then()` 在复杂逻辑下仍然可能显得冗长。ES2017 (ES8) 引入了 `async/await`，它是建立在 Promise 之上的语法糖，让我们能用更像同步代码的方式来书写异步逻辑，这将在后续章节详细介绍。