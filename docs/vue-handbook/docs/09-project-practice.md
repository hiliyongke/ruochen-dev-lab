# 09. Vue 项目实战

## 项目规划

在开始实际开发前，需要进行详细的项目规划。

### 1. 需求分析

```markdown
# 任务管理应用需求

## 核心功能
- 用户认证（登录/注册）
- 任务创建、编辑、删除
- 任务分类和标签
- 任务搜索和过滤
- 任务统计和报表

## 技术需求
- Vue 3 + Composition API
- Vue Router 路由管理
- Pinia 状态管理
- TypeScript 支持
- 响应式设计
- PWA 支持
```

### 2. 项目结构设计

```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   └── features/       # 功能组件
├── views/              # 页面组件
├── stores/             # 状态管理
├── composables/        # 组合式函数
├── utils/              # 工具函数
├── types/              # TypeScript 类型定义
├── assets/             # 静态资源
├── router/             # 路由配置
└── plugins/            # 插件配置
```

## 环境配置

### 1. Vue CLI 项目创建

```bash
# 创建项目
vue create task-manager

# 选择配置
? Please pick a preset: 
  Default ([Vue 3] babel, eslint) 
❯ Manually select features

? Check the features needed for your project:
 ◉ Babel
 ◉ TypeScript
 ◉ Progressive Web App (PWA) Support
 ◉ Router
 ◉ Vuex
 ◉ CSS Pre-processors
 ◉ Linter / Formatter
 ◉ Unit Testing
 ◉ E2E Testing
```

### 2. 额外依赖安装

```bash
# 状态管理
npm install pinia @pinia/nuxt

# UI 组件库
npm install element-plus @element-plus/icons-vue

# 工具库
npm install dayjs lodash-es

# 开发工具
npm install @vue/test-utils jest @types/jest -D
```

### 3. 配置文件

```javascript
// vue.config.js
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  pwa: {
    name: '任务管理器',
    themeColor: '#42b983',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
    }
  }
})
```

## 核心功能实现

### 1. 认证系统

```vue
<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <el-form :model="form" :rules="rules" ref="loginForm">
      <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="用户名" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="form.password" type="password" placeholder="密码" />
      </el-form-item>
      <el-button type="primary" @click="handleLogin" :loading="loading">
        登录
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const loginForm = ref()

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    loading.value = true
    await authStore.login(form)
    router.push('/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

### 2. 任务管理 Store

```typescript
// src/stores/tasks.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilter } from '@/types/task'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const filter = ref<TaskFilter>('all')
  const searchQuery = ref('')

  // 计算属性
  const filteredTasks = computed(() => {
    let result = tasks.value

    // 按状态过滤
    if (filter.value === 'active') {
      result = result.filter(task => !task.completed)
    } else if (filter.value === 'completed') {
      result = result.filter(task => task.completed)
    }

    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      )
    }

    return result
  })

  const stats = computed(() => ({
    total: tasks.value.length,
    completed: tasks.value.filter(task => task.completed).length,
    active: tasks.value.filter(task => !task.completed).length
  }))

  // 方法
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    tasks.value.push(newTask)
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const task = tasks.value.find(task => task.id === id)
    if (task) {
      Object.assign(task, updates)
    }
  }

  const deleteTask = (id: string) => {
    tasks.value = tasks.value.filter(task => task.id !== id)
  }

  return {
    tasks,
    filter,
    searchQuery,
    filteredTasks,
    stats,
    addTask,
    updateTask,
    deleteTask
  }
})
```

### 3. 任务列表组件

```vue
<!-- src/components/TaskList.vue -->
<template>
  <div class="task-list">
    <div class="filters">
      <el-radio-group v-model="filter">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="active">未完成</el-radio-button>
        <el-radio-button label="completed">已完成</el-radio-button>
      </el-radio-group>
      
      <el-input 
        v-model="searchQuery" 
        placeholder="搜索任务..." 
        class="search-input"
      />
    </div>

    <div class="tasks">
      <task-item 
        v-for="task in filteredTasks" 
        :key="task.id"
        :task="task"
        @update="handleUpdate"
        @delete="handleDelete"
      />
    </div>

    <div class="stats">
      <span>总计: {{ stats.total }}</span>
      <span>已完成: {{ stats.completed }}</span>
      <span>未完成: {{ stats.active }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TaskItem from './TaskItem.vue'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/types/task'

const tasksStore = useTasksStore()

const filter = computed({
  get: () => tasksStore.filter,
  set: (value) => tasksStore.filter = value
})

const searchQuery = computed({
  get: () => tasksStore.searchQuery,
  set: (value) => tasksStore.searchQuery = value
})

const filteredTasks = computed(() => tasksStore.filteredTasks)
const stats = computed(() => tasksStore.stats)

const handleUpdate = (task: Task) => {
  tasksStore.updateTask(task.id, task)
}

const handleDelete = (taskId: string) => {
  tasksStore.deleteTask(taskId)
}
</script>
```

## 类型定义

```typescript
// src/types/task.ts
export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type TaskFilter = 'all' | 'active' | 'completed'

// src/types/user.ts
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  createdAt: Date
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
```

## 路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/Tasks.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
```

## 样式和主题

```scss
// src/styles/variables.scss
$primary-color: #42b983;
$secondary-color: #35495e;
$danger-color: #f56c6c;
$warning-color: #e6a23c;
$success-color: #67c23a;

$breakpoints: (
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px
);

// src/styles/mixins.scss
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// src/styles/global.scss
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &--primary {
    background: $primary-color;
    color: white;
    
    &:hover {
      background: darken($primary-color, 10%);
    }
  }
}
```

## 部署配置

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Server
      uses: easingthemes/ssh-deploy@main
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        TARGET: /var/www/task-manager
```

## 总结

本章通过一个完整的任务管理应用项目，展示了 Vue 3 在实际项目中的应用。涵盖了从项目规划、环境配置到核心功能实现的完整流程。在实际开发中，还需要考虑错误处理、性能优化、测试覆盖等方面。