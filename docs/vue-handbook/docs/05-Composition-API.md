# 05. Vue 3 Composition API

## 什么是 Composition API？

Composition API 是 Vue 3 引入的一套新的 API，它提供了更灵活的方式来组织和复用组件逻辑。与 Options API 相比，Composition API 让代码的组织更加直观和可维护。

### 为什么需要 Composition API？

1. **更好的逻辑复用**：可以轻松提取和复用逻辑
2. **更灵活的组织**：按功能而不是选项类型组织代码
3. **更好的 TypeScript 支持**：更好的类型推断
4. **更小的打包体积**：Tree-shaking 友好

## 响应式基础

### ref 和 reactive

```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>用户: {{ user.name }}</p>
    <p>年龄: {{ user.age }}</p>
    <button @click="increment">+1</button>
    <button @click="updateUser">更新用户</button>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  setup() {
    // ref 用于基本类型
    const count = ref(0)
    
    // reactive 用于对象
    const user = reactive({
      name: '张三',
      age: 25
    })
    
    // 方法
    const increment = () => {
      count.value++ // 注意：ref 需要通过 .value 访问
    }
    
    const updateUser = () => {
      user.name = '李四'
      user.age = 30
    }
    
    // 返回模板中需要使用的数据和方法
    return {
      count,
      user,
      increment,
      updateUser
    }
  }
}
</script>
```

### 在模板中自动解包

```vue
<template>
  <!-- ref 在模板中自动解包，不需要 .value -->
  <p>{{ count }}</p>
  
  <!-- reactive 对象直接访问 -->
  <p>{{ user.name }}</p>
</template>
```

## 计算属性和监听器

### computed 计算属性

```vue
<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    const firstName = ref('张')
    const lastName = ref('三')
    
    // 计算属性
    const fullName = computed(() => {
      return firstName.value + lastName.value
    })
    
    const reversedName = computed({
      get: () => fullName.value.split('').reverse().join(''),
      set: (value) => {
        const names = value.split('')
        firstName.value = names[1] || ''
        lastName.value = names[0] || ''
      }
    })
    
    return {
      firstName,
      lastName,
      fullName,
      reversedName
    }
  }
}
</script>
```

### watch 和 watchEffect

```vue
<script>
import { ref, watch, watchEffect } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const message = ref('')
    const user = ref({ name: '张三', age: 25 })
    
    // watch 监听特定数据源
    watch(count, (newValue, oldValue) => {
      console.log(`count 从 ${oldValue} 变为 ${newValue}`)
      message.value = `计数已更新为: ${newValue}`
    })
    
    // 监听多个数据源
    watch([count, () => user.value.age], ([newCount, newAge], [oldCount, oldAge]) => {
      console.log(`计数: ${oldCount} -> ${newCount}, 年龄: ${oldAge} -> ${newAge}`)
    })
    
    // 深度监听对象
    watch(user, (newUser, oldUser) => {
      console.log('用户信息已更新', newUser)
    }, { deep: true })
    
    // watchEffect 自动追踪依赖
    watchEffect(() => {
      console.log(`当前计数: ${count.value}, 用户年龄: ${user.value.age}`)
    })
    
    return {
      count,
      message,
      user
    }
  }
}
</script>
```

## 生命周期钩子

Composition API 提供了一组与生命周期对应的函数。

```vue
<script>
import { 
  onBeforeMount, 
  onMounted, 
  onBeforeUpdate, 
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  ref
} from 'vue'

export default {
  setup() {
    const count = ref(0)
    const mounted = ref(false)
    
    onBeforeMount(() => {
      console.log('组件挂载前')
    })
    
    onMounted(() => {
      console.log('组件已挂载')
      mounted.value = true
    })
    
    onBeforeUpdate(() => {
      console.log('组件更新前')
    })
    
    onUpdated(() => {
      console.log('组件已更新')
    })
    
    onBeforeUnmount(() => {
      console.log('组件卸载前')
    })
    
    onUnmounted(() => {
      console.log('组件已卸载')
    })
    
    return {
      count,
      mounted
    }
  }
}
</script>
```

## 自定义 Hook

自定义 Hook 是 Composition API 最强大的特性之一，可以提取和复用逻辑。

### 创建自定义 Hook

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  const set = (value) => count.value = value
  
  const double = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)
  
  return {
    count,
    double,
    isEven,
    increment,
    decrement,
    reset,
    set
  }
}

// composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const data = ref(getStoredValue())
  
  function getStoredValue() {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`读取 localStorage 键 "${key}" 时出错:`, error)
      return defaultValue
    }
  }
  
  function setStoredValue(value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`设置 localStorage 键 "${key}" 时出错:`, error)
    }
  }
  
  watch(data, (newValue) => {
    setStoredValue(newValue)
  }, { deep: true })
  
  return data
}

// composables/useFetch.js
import { ref, onMounted } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)
  
  const fetchData = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }
  
  onMounted(fetchData)
  
  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}
```

### 在组件中使用自定义 Hook

```vue
<template>
  <div>
    <!-- 计数器 -->
    <div class="counter">
      <h3>计数器: {{ count }}</h3>
      <p>双倍: {{ double }}</p>
      <p>是否偶数: {{ isEven ? '是' : '否' }}</p>
      <button @click="increment">+1</button>
      <button @click="decrement">-1</button>
      <button @click="reset">重置</button>
    </div>
    
    <!-- 本地存储 -->
    <div class="storage">
      <input v-model="username" placeholder="用户名">
      <p>存储的用户名: {{ username }}</p>
    </div>
    
    <!-- 数据获取 -->
    <div class="fetch">
      <div v-if="loading">加载中...</div>
      <div v-else-if="error">错误: {{ error.message }}</div>
      <div v-else>
        <h4>用户列表</h4>
        <ul>
          <li v-for="user in users" :key="user.id">
            {{ user.name }} - {{ user.email }}
          </li>
        </ul>
        <button @click="refetchUsers">重新获取</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useCounter } from '../composables/useCounter'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useFetch } from '../composables/useFetch'

export default {
  setup() {
    // 使用计数器 Hook
    const counter = useCounter(10)
    
    // 使用本地存储 Hook
    const username = useLocalStorage('username', '')
    
    // 使用数据获取 Hook
    const { data: users, loading, error, refetch: refetchUsers } = useFetch('https://jsonplaceholder.typicode.com/users')
    
    return {
      ...counter,
      username,
      users,
      loading,
      error,
      refetchUsers
    }
  }
}
</script>
```

## Provide/Inject

Composition API 中的 provide 和 inject 可以实现跨组件通信。

### 提供数据

```vue
<!-- App.vue -->
<script>
import { provide, ref, reactive } from 'vue'
import ChildComponent from './ChildComponent.vue'

export default {
  components: { ChildComponent },
  setup() {
    const theme = ref('light')
    const user = reactive({
      name: '张三',
      role: 'admin'
    })
    
    // 提供数据给后代组件
    provide('theme', theme)
    provide('user', user)
    provide('updateTheme', (newTheme) => {
      theme.value = newTheme
    })
    
    return {
      theme,
      user
    }
  }
}
</script>
```

### 注入数据

```vue
<!-- DeepChild.vue -->
<script>
import { inject } from 'vue'

export default {
  setup() {
    // 注入祖先组件提供的数据
    const theme = inject('theme', 'light') // 默认值
    const user = inject('user')
    const updateTheme = inject('updateTheme')
    
    const toggleTheme = () => {
      updateTheme(theme === 'light' ? 'dark' : 'light')
    }
    
    return {
      theme,
      user,
      toggleTheme
    }
  }
}
</script>
```

## 模板引用和组件引用

### 模板引用

```vue
<template>
  <div>
    <input ref="inputRef" v-model="message">
    <button @click="focusInput">聚焦输入框</button>
    
    <ul>
      <li 
        v-for="item in items" 
        :key="item.id"
        :ref="setItemRef"
      >
        {{ item.text }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const inputRef = ref(null)
    const message = ref('')
    const items = ref([
      { id: 1, text: '项目1' },
      { id: 2, text: '项目2' },
      { id: 3, text: '项目3' }
    ])
    const itemRefs = ref([])
    
    const setItemRef = el => {
      if (el) {
        itemRefs.value.push(el)
      }
    }
    
    const focusInput = () => {
      inputRef.value?.focus()
    }
    
    onMounted(() => {
      console.log('输入框元素:', inputRef.value)
      console.log('项目元素:', itemRefs.value)
    })
    
    return {
      inputRef,
      message,
      items,
      setItemRef,
      focusInput
    }
  }
}
</script>
```

### 组件引用

```vue
<!-- ParentComponent.vue -->
<template>
  <div>
    <ChildComponent ref="childRef" />
    <button @click="callChildMethod">调用子组件方法</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

export default {
  components: { ChildComponent },
  setup() {
    const childRef = ref(null)
    
    const callChildMethod = () => {
      childRef.value?.someMethod()
    }
    
    return {
      childRef,
      callChildMethod
    }
  }
}
</script>

<!-- ChildComponent.vue -->
<script>
export default {
  setup() {
    const someMethod = () => {
      console.log('子组件方法被调用')
    }
    
    // 暴露给父组件的方法
    return {
      someMethod
    }
  }
}
</script>
```

## 组合式函数的最佳实践

### 1. 命名约定

```javascript
// 好的命名
useCounter.js
useLocalStorage.js
useFetch.js

// 不好的命名
counter.js        // 不清楚是 Hook
localStorage.js   // 可能被误解为工具函数
```

### 2. 返回值规范

```javascript
// 返回响应式对象
export function useFeature() {
  const data = ref(null)
  const loading = ref(false)
  
  return {
    data: readonly(data), // 只读版本
    loading: readonly(loading),
    // 方法
    fetchData: () => { /* ... */ }
  }
}
```

### 3. 参数处理

```javascript
// 支持配置选项
export function useFeature(options = {}) {
  const {
    immediate = true,
    defaultValue = null,
    onSuccess = () => {}
  } = options
  
  // ... 实现
}
```

### 4. 错误处理

```javascript
export function useApi(url) {
  const error = ref(null)
  
  const execute = async () => {
    try {
      // API 调用
    } catch (err) {
      error.value = err
      console.error('API 调用失败:', err)
    }
  }
  
  return {
    error: readonly(error),
    execute
  }
}
```

## 实战示例：待办事项应用

```vue
<template>
  <div class="todo-app">
    <h1>待办事项</h1>
    
    <!-- 添加待办 -->
    <div class="add-todo">
      <input 
        v-model="newTodo" 
        @keyup.enter="addTodo"
        placeholder="添加新待办..."
      >
      <button @click="addTodo">添加</button>
    </div>
    
    <!-- 过滤选项 -->
    <div class="filters">
      <button 
        v-for="filter in filters" 
        :key="filter"
        :class="{ active: currentFilter === filter }"
        @click="currentFilter = filter"
      >
        {{ filterLabels[filter] }}
      </button>
    </div>
    
    <!-- 待办列表 -->
    <ul class="todo-list">
      <li 
        v-for="todo in filteredTodos" 
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input 
          type="checkbox" 
          v-model="todo.completed"
        >
        <span @dblclick="editTodo(todo)">
          <input 
            v-if="todo === editingTodo"
            v-model="todo.text"
            @blur="editingTodo = null"
            @keyup.enter="editingTodo = null"
            v-focus
          >
          <span v-else>{{ todo.text }}</span>
        </span>
        <button @click="removeTodo(todo.id)">删除</button>
      </li>
    </ul>
    
    <!-- 统计信息 -->
    <div class="stats">
      <p>总计: {{ todos.length }}，已完成: {{ completedCount }}，未完成: {{ activeCount }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

// 自定义指令：自动聚焦
const vFocus = {
  mounted: (el) => el.focus()
}

export default {
  directives: { focus: vFocus },
  setup() {
    // 使用本地存储 Hook
    const todos = ref(JSON.parse(localStorage.getItem('todos') || '[]'))
    const newTodo = ref('')
    const currentFilter = ref('all')
    const editingTodo = ref(null)
    
    // 过滤选项
    const filters = ['all', 'active', 'completed']
    const filterLabels = {
      all: '全部',
      active: '未完成',
      completed: '已完成'
    }
    
    // 计算属性
    const completedCount = computed(() => 
      todos.value.filter(todo => todo.completed).length
    )
    
    const activeCount = computed(() => 
      todos.value.filter(todo => !todo.completed).length
    )
    
    const filteredTodos = computed(() => {
      switch (currentFilter.value) {
        case 'active':
          return todos.value.filter(todo => !todo.completed)
        case 'completed':
          return todos.value.filter(todo => todo.completed)
        default:
          return todos.value
      }
    })
    
    // 方法
    const addTodo = () => {
      if (newTodo.value.trim()) {
        todos.value.push({
          id: Date.now(),
          text: newTodo.value.trim(),
          completed: false,
          createdAt: new Date()
        })
        newTodo.value = ''
      }
    }
    
    const removeTodo = (id) => {
      todos.value = todos.value.filter(todo => todo.id !== id)
    }
    
    const editTodo = (todo) => {
      editingTodo.value = todo
    }
    
    // 保存到本地存储
    onMounted(() => {
      // 初始加载后设置监听
      // 实际应该使用 watch，这里简化演示
    })
    
    // 监听 todos 变化并保存
    const saveToLocalStorage = () => {
      localStorage.setItem('todos', JSON.stringify(todos.value))
    }
    
    // 这里应该使用 watch，但为了简化演示，在方法中手动调用
    const wrappedAddTodo = () => {
      addTodo()
      saveToLocalStorage()
    }
    
    const wrappedRemoveTodo = (id) => {
      removeTodo(id)
      saveToLocalStorage()
    }
    
    return {
      todos,
      newTodo,
      currentFilter,
      editingTodo,
      filters,
      filterLabels,
      completedCount,
      activeCount,
      filteredTodos,
      addTodo: wrappedAddTodo,
      removeTodo: wrappedRemoveTodo,
      editTodo,
      saveToLocalStorage
    }
  }
}
</script>

<style scoped>
.todo-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.add-todo {
  display: flex;
  margin-bottom: 20px;
}

.add-todo input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-todo button {
  margin-left: 10px;
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filters {
  margin-bottom: 20px;
}

.filters button {
  margin-right: 10px;
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.filters button.active {
  background: #42b983;
  color: white;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.todo-list input[type="checkbox"] {
  margin-right: 10px;
}

.todo-list span {
  flex: 1;
  cursor: pointer;
}

.todo-list button {
  margin-left: 10px;
  padding: 5px 10px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.stats {
  margin-top: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
```

## 总结

本章深入学习了 Vue 3 Composition API 的核心概念：
- 响应式基础：ref 和 reactive
- 计算属性和监听器
- 生命周期钩子
- 自定义 Hook 的创建和使用
- Provide/Inject 跨组件通信
- 模板引用和组件引用

Composition API 为 Vue 开发带来了更大的灵活性和更好的代码组织方式，是现代 Vue 应用的推荐写法。