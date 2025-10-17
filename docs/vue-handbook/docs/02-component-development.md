# 02. Vue 组件开发

> 本书采用 Vue 3 与 Composition API，并在状态管理章节使用 Pinia（非 Vuex）。本章以 Options API 入门为主，同时配套提供等价的 script setup 写法，便于读者迁移到推荐风格。

## 什么是组件？

组件是 Vue 最强大的特性之一，它允许我们将 UI 拆分为独立、可复用的代码片段。每个组件都有自己的作用域，可以包含模板、逻辑和样式。

### 组件的基本结构（Options API）

```vue
<template>
  <div class="counter">
    <h3>{{ title }}</h3>
    <p>计数: {{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  props: {
    title: { type: String, default: '计数器' },
    initialCount: { type: Number, default: 0 }
  },
  data() {
    return { count: this.initialCount }
  },
  methods: {
    increment() { this.count++ },
    decrement() { this.count-- }
  },
  computed: {
    isPositive() { return this.count > 0 }
  }
}
</script>

<style scoped>
.counter { border: 1px solid #ddd; padding: 20px; margin: 10px; border-radius: 8px; }
.counter h3 { color: #2c3e50; margin-top: 0; }
button { margin: 0 5px; padding: 8px 16px; border: 1px solid #3498db; background: #3498db; color: #fff; border-radius: 4px; cursor: pointer; }
button:hover { background: #2980b9; }
</style>
```

### 等价写法（Composition API + script setup）

```vue
<template>
  <div class="counter">
    <h3>{{ title }}</h3>
    <p>计数: {{ count }}</p>
    <button @click="count++">+1</button>
    <button @click="count--">-1</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '计数器' },
  initialCount: { type: Number, default: 0 }
})

const count = ref(props.initialCount)
const isPositive = computed(() => count.value > 0)
</script>

<style scoped>
/* 同上 */
</style>
```

## 组件注册

### 全局注册

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import Counter from './components/Counter.vue'

const app = createApp(App)
app.component('Counter', Counter) // 全局注册
app.mount('#app')
```

### 局部注册（Options API）

```vue
<template>
  <div>
    <LocalCounter :initial-count="5" />
  </div>
</template>

<script>
import LocalCounter from './components/LocalCounter.vue'
export default { name: 'App', components: { LocalCounter } }
</script>
```

### 局部注册（script setup）

```vue
<template>
  <LocalCounter :initial-count="5" />
</template>

<script setup>
import LocalCounter from './components/LocalCounter.vue'
</script>
```

## Props 与单向数据流

Props 是父组件向子组件传递数据的方式，遵循单向数据流：父更新向下流动，子不得直接修改来自父的 prop。

### Props 验证

```js
export default {
  props: {
    title: String,
    value: [String, Number],
    requiredProp: { type: String, required: true },
    optionalProp: { type: Number, default: 100 },
    config: { type: Object, default: () => ({ enabled: true, timeout: 3000 }) },
    status: { validator: v => ['success','warning','danger'].includes(v) }
  }
}
```

### 错误与正确示例

错误：直接修改 prop（或通过引用链式修改）
```vue
<script>
export default {
  props: { modelValue: String },
  mounted() {
    // 错误：直接修改来自父组件的值
    this.modelValue = 'new value'
  }
}
</script>
```

正确：使用本地副本或 v-model 向上更新
```vue
<!-- 本地副本（用于内部可变状态） -->
<script>
export default {
  props: { initialValue: String },
  data() { return { internalValue: this.initialValue } },
  watch: { initialValue(v){ this.internalValue = v } }
}
</script>
```

```vue
<!-- v-model（推荐） -->
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>
<script>
export default {
  props: { modelValue: String },
  emits: { 'update:modelValue': v => typeof v === 'string' }
}
</script>
```

```vue
<!-- 父组件用 computed setter 映射到 Pinia/本地状态 -->
<script setup>
import { ref, computed } from 'vue'
const message = ref('')
const msgProxy = computed({
  get: () => message.value,
  set: v => (message.value = v)
})
</script>
<template>
  <Child v-model="msgProxy" />
</template>
```

## 自定义事件与 emits 校验

Options API：
```vue
<!-- Child.vue -->
<template>
  <button @click="$emit('save', { id: 1 })">保存</button>
</template>
<script>
export default {
  emits: { save: payload => payload && typeof payload.id === 'number' }
}
</script>
```

script setup：
```vue
<script setup>
const emit = defineEmits({
  save: payload => payload && typeof payload.id === 'number'
})
</script>
```

v-model 多个绑定与修饰符：
```vue
<!-- 父 -->
<Child v-model:title="title" v-model:checked.number="count" />
```
```vue
<!-- 子 -->
<script setup>
const props = defineProps({ title: String, checked: Number, titleModifiers: Object, checkedModifiers: Object })
const emit = defineEmits(['update:title','update:checked'])
</script>
```

## 插槽 (Slots)

默认插槽与具名插槽：
```vue
<!-- BaseLayout.vue -->
<template>
  <header><slot name="header">默认头部</slot></header>
  <main><slot>默认内容</slot></main>
  <footer><slot name="footer">默认底部</slot></footer>
</template>
```

作用域插槽（解构写法）：
```vue
<!-- TodoList.vue -->
<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <slot :todo="todo">{{ todo.text }}</slot>
    </li>
  </ul>
</template>

<!-- 使用方 -->
<TodoList :todos="todos">
  <template #default="{ todo }">
    <span :class="{ completed: todo.completed }">{{ todo.text }}</span>
  </template>
</TodoList>
```

## 动态组件

更安全的实现：返回组件对象映射，避免字符串注册名不匹配导致不渲染。

Options API：
```vue
<template>
  <div>
    <button v-for="tab in tabs" :key="tab" @click="currentTab = tab">{{ tab }}</button>
    <component :is="currentTabComponent" class="tab" />
  </div>
</template>

<script>
import Home from './components/Home.vue'
import Posts from './components/Posts.vue'
import Archive from './components/Archive.vue'

export default {
  components: { Home, Posts, Archive },
  data() {
    return { currentTab: 'Home', tabs: ['Home','Posts','Archive'] }
  },
  computed: {
    currentTabComponent() {
      const map = { Home, Posts, Archive }
      return map[this.currentTab]
    }
  }
}
</script>
```

script setup：
```vue
<script setup>
import { ref, computed } from 'vue'
import Home from './components/Home.vue'
import Posts from './components/Posts.vue'
import Archive from './components/Archive.vue'

const tabs = ['Home','Posts','Archive']
const currentTab = ref('Home')
const currentTabComponent = computed(() => ({ Home, Posts, Archive }[currentTab.value]))
</script>
<template>
  <button v-for="tab in tabs" :key="tab" @click="currentTab = tab">{{ tab }}</button>
  <component :is="currentTabComponent" />
</template>
```

## 组件最佳实践

1) 命名规范
- 组件名（name）使用 PascalCase；文件名 PascalCase 或 kebab-case 二选一，但项目内保持一致。
- 避免过度缩写，保证语义清晰。

2) 单一职责
- 每个组件只关注一个明确的功能，拆分可复用单元。

3) 组件文档与约定
```vue
<!--
/**
 * @name UserCard
 * @prop {Object} user - 用户信息
 * @prop {Boolean} showActions - 是否显示操作
 * @event edit - 编辑事件
 * @event delete - 删除事件
 */
-->
```

4) 性能建议
- 避免在模板中直接调用重计算函数；使用 computed/memo 化。
- v-once 仅用于真正静态的内容。
- 使用异步组件与按需加载：
```js
components: { AsyncComponent: () => import('./AsyncComponent.vue') }
```

## 实战示例：Todo 应用（简版）

```vue
<!-- TodoApp.vue -->
<template>
  <div class="todo-app">
    <TodoHeader @add-todo="addTodo" />
    <TodoList :todos="todos" @toggle-todo="toggleTodo" @delete-todo="deleteTodo" />
    <TodoFooter :stats="stats" />
  </div>
</template>

<script>
import TodoHeader from './TodoHeader.vue'
import TodoList from './TodoList.vue'
import TodoFooter from './TodoFooter.vue'

export default {
  components: { TodoHeader, TodoList, TodoFooter },
  data: () => ({ todos: [] }),
  computed: {
    stats() {
      const total = this.todos.length
      const completed = this.todos.filter(t => t.completed).length
      return { total, completed }
    }
  },
  methods: {
    addTodo(text) {
      if (!text?.trim()) return
      this.todos.push({ id: Date.now(), text: text.trim(), completed: false })
    },
    toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) todo.completed = !todo.completed
    },
    deleteTodo(id) { this.todos = this.todos.filter(t => t.id !== id) }
  }
}
</script>
```

## 常见坑

- 直接修改 prop 或通过引用链修改父数据。
- 在模板内频繁调用重计算函数导致性能问题。
- emits 未校验 payload，事件载荷不一致。
- 动态组件以字符串引用但未完成对应注册，导致组件不渲染。
- 未处理 v-model 多绑定与修饰符的接收与透传。

## 小练习

- 封装一个 Input 组件：支持 v-model、.trim/.number 修饰符；提供 prefix/suffix 插槽；emits 校验。
- 将 Tabs 组件抽象为受控组件：外部通过 v-model:active 控制选中项，内部点击时发出 update:active。

## 与 demo 对应路径

- demo/src/examples/ch02-components/Counter.vue
- demo/src/examples/ch02-components/ChildComponent.vue
- demo/src/examples/ch02-components/ParentComponent.vue
- demo/src/examples/ch02-components/DynamicTabs.vue
- demo/src/examples/ch02-components/tabs/Home.vue
- demo/src/examples/ch02-components/tabs/Posts.vue
- demo/src/examples/ch02-components/tabs/Archive.vue
- demo/src/examples/ch02-components/todo/TodoApp.vue
- demo/src/examples/ch02-components/todo/TodoHeader.vue
- demo/src/examples/ch02-components/todo/TodoList.vue
- demo/src/examples/ch02-components/todo/TodoFooter.vue

## 总结

本章学习了组件创建/注册、Props 与单向数据流（配合 v-model）、自定义事件与 emits 校验、插槽、动态组件以及若干最佳实践，并配套了等价的 script setup 写法，便于迁移到 Composition API。

下一章我们将进入状态管理 Pinia，学习如何在组件外部统一管理状态并与组件联动。