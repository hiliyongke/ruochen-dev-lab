# 03. 状态管理：以 Pinia 为主

> 本书采用 Vue 3 + Composition API，并以 Pinia 作为默认状态管理方案。Vuex 内容仅作背景与对比参考。

## 为什么需要状态管理？
当多个组件需要共享状态或在复杂层级间传递数据时，仅靠 props/事件会变得笨拙。集中式状态管理可带来：
- 单一数据源，状态可预测
- 更好调试与可追踪性（时间旅行、快照等）
- 明确的读/写边界，便于协作与维护

## Pinia 核心概念
- store：保存状态、getters（派生状态）与 actions（修改状态，支持异步）
- defineStore(id, options)：定义一个可在任意组件中使用的独立 store
- 与 Composition API 深度融合，类型友好

### 示例：计数器与待办
```ts
// stores/counter.ts
import { defineStore } from 'pinia'
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { double: (s) => s.count * 2 },
  actions: {
    increment() { this.count++ },
    async incrementAsync() {
      await new Promise(r => setTimeout(r, 500))
      this.count++
    }
  }
})
```

```ts
// stores/todos.ts
import { defineStore } from 'pinia'
export type Filter = 'all' | 'active' | 'completed'
export interface Todo { id: number; text: string; completed: boolean; createdAt: Date }

export const useTodosStore = defineStore('todos', {
  state: () => ({ todos: [] as Todo[], filter: 'all' as Filter }),
  getters: {
    filteredTodos(state) {
      if (state.filter === 'completed') return state.todos.filter(t => t.completed)
      if (state.filter === 'active') return state.todos.filter(t => !t.completed)
      return state.todos
    }
  },
  actions: {
    add(text: string) {
      const v = text.trim(); if (!v) return
      this.todos.push({ id: Date.now(), text: v, completed: false, createdAt: new Date() })
    },
    toggle(id: number) {
      const t = this.todos.find(t => t.id === id); if (t) t.completed = !t.completed
    },
    remove(id: number) { this.todos = this.todos.filter(t => t.id !== id) },
    setFilter(f: Filter) { this.filter = f }
  }
})
```

### 在应用中安装与使用
```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
createApp(App).use(createPinia()).mount('#app')
```

```vue
<!-- CounterPinia.vue -->
<template>
  <div>
    <p>count: {{ counter.count }}</p>
    <p>double: {{ counter.double }}</p>
    <button @click="counter.increment()">+1</button>
    <button @click="counter.incrementAsync()">异步+1</button>
  </div>
</template>
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter' /* 或相对路径 */
const counter = useCounterStore()
</script>
```

```vue
<!-- TodosPinia.vue -->
<template>
  <div>
    <div class="ops">
      <input v-model="text" @keyup.enter="add" placeholder="新增待办" />
      <select v-model="filter" @change="todos.setFilter(filter)">
        <option value="all">全部</option>
        <option value="active">未完成</option>
        <option value="completed">已完成</option>
      </select>
    </div>
    <ul>
      <li v-for="t in todos.filteredTodos" :key="t.id">
        <label><input type="checkbox" :checked="t.completed" @change="todos.toggle(t.id)" /> {{ t.text }}</label>
        <button @click="todos.remove(t.id)">删除</button>
      </li>
      <li v-if="!todos.filteredTodos.length" class="empty">暂无数据</li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useTodosStore, type Filter } from '@/stores/todos'
const todos = useTodosStore()
const text = ref(''); const filter = ref<Filter>('all')
function add() { todos.add(text.value); text.value = '' }
</script>
<style scoped>
.ops { display:flex; gap:8px; margin-bottom:8px }
.empty { color:#999; font-style:italic }
</style>
```

## 与 Composition API/composable 的关系
- 小型/局部状态：优先使用 ref/reactive + 组合函数（composable）
- 跨页面/全局共享状态：使用 Pinia（更好的组织、持久化、调试支持）
二者可互补：在 Pinia 的 actions 中调用 composable；或在组件中混合使用。

## Vuex 与 Pinia 对比（简述）
- API 简洁：Pinia 更少样板；直接在 actions 修改 this 即可
- 类型支持：Pinia 更佳
- 生态：Pinia 为 Vue 官方推荐，Vuex 4 仍可用但不再推荐新项目采用
- 迁移：Vuex 迁移到 Pinia 通常较为平滑（state/getters/actions 概念对应）

## 持久化与插件
可使用 pinia-plugin-persistedstate 等插件实现部分状态持久化。
示例（略）。建议只持久化必要字段（如 token），避免放入敏感信息或大对象。

## 最佳实践
- 模块按领域划分（auth、user、cart、orders...）
- 避免在模板中做重计算，派生逻辑放 getters
- actions 中封装异步与业务，组件只负责调用
- TS 明确 state 与返回类型，减少隐式 any
- 谨慎持久化，设置白名单与版本迁移策略

## 与 demo 对应路径
- demo/src/stores/counter.ts
- demo/src/stores/todos.ts
- demo/src/examples/ch03-state/CounterPinia.vue
- demo/src/examples/ch03-state/TodosPinia.vue

## 总结
本章完成 Pinia 的核心用法与最佳实践，推荐以 Pinia 管理跨组件共享状态；下一章将讲解 Vue Router 的路由管理与守卫。