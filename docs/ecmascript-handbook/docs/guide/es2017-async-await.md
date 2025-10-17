# async/await

`async/await` 是 ES2017 (ES8) 引入的异步编程终极解决方案。它本质上是建立在 Promise 之上的语法糖，旨在让我们能够以一种更接近同步代码的方式来书写和理解异步逻辑，彻底告别 `.then()` 链式调用的嵌套。

## 1. 基本语法

`async/await` 由两个关键字组成：`async` 和 `await`。

-   **`async`**：用于声明一个**异步函数**。`async` 函数会自动将其返回值包装成一个 `Fulfilled` 状态的 Promise 对象。
-   **`await`**：字面意思是“等待”。它必须在 `async` 函数内部使用。`await` 会暂停 `async` 函数的执行，等待其后的 Promise 对象的状态变为 `Fulfilled`，然后恢复执行并返回 Promise 的结果。如果等待的 Promise 变为 `Rejected`，`await` 会抛出这个错误。

### 示例：重写 Promise 链

让我们用 `async/await` 来重写之前 `Promise` 章节的链式调用示例。

```javascript
// Promise.then() 版本
function fetchUser() {
  return fetch('/api/user/1')
    .then(response => response.json())
    .then(user => fetch(`/api/posts?userId=${user.id}`))
    .then(response => response.json())
    .then(posts => {
      console.log('User posts:', posts);
    })
    .catch(error => {
      console.error('Failed to fetch user posts:', error);
    });
}
```

使用 `async/await`，代码变得线性且直观：

```javascript
// async/await 版本
async function fetchUserPosts() {
  try {
    const userResponse = await fetch('/api/user/1');
    const user = await userResponse.json();

    const postsResponse = await fetch(`/api/posts?userId=${user.id}`);
    const posts = await postsResponse.json();

    console.log('User posts:', posts);
  } catch (error) {
    console.error('Failed to fetch user posts:', error);
  }
}
```

代码的执行流程一目了然，就像阅读同步代码一样。

## 2. `async` 函数的返回值

`async` 函数总是隐式地返回一个 Promise。

-   如果 `async` 函数中 `return` 了一个非 Promise 的值（例如一个数字、字符串或对象），这个值会被自动包装成一个 `Fulfilled` 状态的 Promise。
    ```javascript
    async function getNumber() {
      return 42;
    }

    getNumber().then(value => {
      console.log(value); // 42
    });
    ```
-   如果 `async` 函数中 `return` 了一个 Promise，那么 `async` 函数的返回值就是这个 Promise。
    ```javascript
    async function getPromise() {
      return Promise.resolve('Hello');
    }

    getPromise().then(value => {
      console.log(value); // "Hello"
    });
    ```
-   如果 `async` 函数中抛出了一个错误，那么它会返回一个 `Rejected` 状态的 Promise。

## 3. 错误处理

在 `async/await` 中，我们使用标准的 `try...catch` 语句来捕获错误，这比 `.catch()` 方法更加统一和强大。

`await` 等待的 Promise 如果被 `reject`，`await` 表达式就会抛出这个错误。`try...catch` 可以捕获到这个错误并进行处理。

```javascript
async function mightFail() {
  try {
    const result = await new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Something went wrong!')), 1000);
    });
    // 这行代码不会执行
    console.log(result);
  } catch (error) {
    // 错误在这里被捕获
    console.error('Caught error:', error.message); // "Caught error: Something went wrong!"
  }
}

mightFail();
```

## 4. 并行操作 `Promise.all`

`await` 默认是串行执行的。如果你需要同时执行多个独立的异步操作，然后等待它们全部完成，应该将 `await` 与 `Promise.all()` 结合使用。

```javascript
async function fetchParallel() {
  try {
    // 错误的做法：串行执行，耗时会累加
    // const user = await fetch('/api/user');
    // const posts = await fetch('/api/posts');

    // 正确的做法：并行执行
    const [userResponse, postsResponse] = await Promise.all([
      fetch('/api/user'),
      fetch('/api/posts')
    ]);

    const user = await userResponse.json();
    const posts = await postsResponse.json();

    console.log(user, posts);
  } catch (error) {
    console.error('Failed to fetch in parallel:', error);
  }
}
```

## 5. 顶层 `await` (Top-level await)

在 ES2022 中，`await` 关键字可以在模块的顶层直接使用，而无需将其包裹在 `async` 函数中。这在一些场景下非常有用，例如：

-   动态加载模块：`const strings = await import(\`/i18n/${locale}\`);`
-   初始化资源：`const connection = await db.connect();`

```javascript
// 在一个模块的顶层 (e.g., main.js)
// (需要在支持此特性的环境中运行)

// const data = await fetch('/api/initial-data');
// console.log('Initial data loaded:', data.json());

// 模块的其余代码可以安全地使用 data
```

`async/await` 是现代 JavaScript 开发的必备技能，它极大地改善了异步代码的可读性和可维护性。务必熟练掌握它。