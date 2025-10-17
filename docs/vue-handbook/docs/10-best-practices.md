# 10. Vue 最佳实践

## 代码组织规范

### 1. 项目结构规范

```
src/
├── assets/           # 静态资源
│   ├── images/       # 图片文件
│   ├── styles/       # 样式文件
│   └── fonts/        # 字体文件
├── components/       # 组件
│   ├── base/        # 基础组件
│   ├── business/    # 业务组件
│   └── layout/      # 布局组件
├── views/           # 页面组件
├── stores/          # 状态管理
├── composables/     # 组合式函数
├── utils/           # 工具函数
├── types/           # 类型定义
├── router/          # 路由配置
├── plugins/         # 插件配置
└── api/             # API 接口
```

### 2. 文件命名规范

```javascript
// 组件文件使用 PascalCase
UserProfile.vue
TaskList.vue

// 工具函数使用 camelCase
formatDate.js
debounce.js

// 类型定义使用 PascalCase
User.ts
Task.ts

// 常量使用 UPPER_SNAKE_CASE
API_ENDPOINTS.js
ERROR_CODES.js
```

## 组件开发规范

### 1. 组件命名规范

```vue
<!-- 好的命名 -->
<UserProfile />
<TaskListItem />
<BaseButton />

<!-- 不好的命名 -->
<userProfile />      <!-- 应该使用 PascalCase -->
<task-list-item />   <!-- 在模板中应该使用 kebab-case -->
```

### 2. Props 规范

```vue
<script>
export default {
  props: {
    // 基础类型检查
    title: String,
    
    // 多个可能的类型
    value: [String, Number],
    
    // 必填项
    requiredProp: {
      type: String,
      required: true
    },
    
    // 默认值
    optionalProp: {
      type: Number,
      default: 0
    },
    
    // 对象默认值使用工厂函数
    config: {
      type: Object,
      default: () => ({ enabled: true })
    },
    
    // 自定义验证
    status: {
      validator: value => ['pending', 'success', 'error'].includes(value)
    }
  }
}
</script>
```

### 3. 事件命名规范

```vue
<!-- 好的事件命名 -->
<CustomComponent @update:value="handleUpdate" />
<CustomComponent @user-selected="handleSelect" />

<!-- 不好的事件命名 -->
<CustomComponent @updateValue="handleUpdate" />  <!-- 应该使用 kebab-case -->
<CustomComponent @userSelected="handleSelect" /> <!-- 应该使用 kebab-case -->
```

## 状态管理规范

### 1. Store 组织规范

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  
  const fetchUser = async () => {
    // API 调用
  }
  
  return {
    user: readonly(user),
    isAuthenticated,
    fetchUser
  }
})

// stores/tasks.ts
export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const filter = ref<TaskFilter>('all')
  
  const filteredTasks = computed(() => {
    // 过滤逻辑
  })
  
  return {
    tasks: readonly(tasks),
    filter,
    filteredTasks
  }
})
```

### 2. 状态更新规范

```typescript
// 好的做法：使用 actions
const updateTask = (id: string, updates: Partial<Task>) => {
  const task = tasks.value.find(task => task.id === id)
  if (task) {
    Object.assign(task, updates)
    task.updatedAt = new Date()
  }
}

// 不好的做法：直接修改状态
// tasks.value[0].completed = true // 避免直接修改
```

## 样式开发规范

### 1. CSS 命名规范

```scss
// 使用 BEM 命名规范
.task-list {
  &__header {
    // 头部样式
  }
  
  &__item {
    // 项目样式
    
    &--completed {
      // 完成状态样式
    }
  }
}

// 使用 CSS Modules 或 Scoped CSS
<style scoped>
.task-item {
  // 组件样式
}
</style>
```

### 2. 响应式设计规范

```scss
// 使用移动优先的响应式设计
.container {
  padding: 20px;
  
  @include respond-to('md') {
    padding: 40px;
  }
  
  @include respond-to('lg') {
    padding: 60px;
  }
}
```

## 性能优化规范

### 1. 组件优化

```vue
<template>
  <!-- 使用 v-show 替代 v-if 进行频繁切换 -->
  <div v-show="isVisible">内容</div>
  
  <!-- 使用 computed 缓存计算结果 -->
  <div>{{ computedValue }}</div>
  
  <!-- 使用 v-once 优化静态内容 -->
  <h1 v-once>{{ staticTitle }}</h1>
</template>

<script>
export default {
  computed: {
    computedValue() {
      // 复杂计算
      return this.heavyComputation()
    }
  }
}
</script>
```

### 2. 列表渲染优化

```vue
<template>
  <!-- 使用 key 属性 -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- 虚拟滚动优化长列表 -->
  <virtual-list :items="largeList" :item-height="50">
    <template v-slot:default="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </virtual-list>
</template>
```

## 错误处理规范

### 1. 全局错误处理

```javascript
// main.js
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 错误:', err, info)
  // 发送错误报告
  reportError(err)
}

// 组件错误边界
export default {
  errorCaptured(err, vm, info) {
    this.error = err
    return false // 阻止错误继续传播
  }
}
```

### 2. API 错误处理

```typescript
// utils/api.ts
class ApiError extends Error {
  constructor(message, code, status) {
    super(message)
    this.code = code
    this.status = status
  }
}

export const api = {
  async request(url, options = {}) {
    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new ApiError(
          '请求失败',
          response.status,
          response.statusText
        )
      }
      
      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        // 处理 API 错误
        handleApiError(error)
      } else {
        // 处理网络错误
        handleNetworkError(error)
      }
      throw error
    }
  }
}
```

## 测试规范

### 1. 测试文件组织

```
tests/
├── unit/           # 单元测试
│   ├── components/ # 组件测试
│   ├── utils/      # 工具函数测试
│   └── stores/     # Store 测试
├── e2e/            # 端到端测试
│   ├── specs/      # 测试用例
│   └── support/    # 测试支持文件
└── fixtures/       # 测试数据
```

### 2. 测试命名规范

```javascript
// 好的测试命名
describe('UserProfile 组件', () => {
  test('当用户未登录时显示登录按钮', () => {})
  test('当用户登录时显示用户信息', () => {})
})

// 不好的测试命名
describe('测试用户', () => {
  test('测试1', () => {})
  test('测试2', () => {})
})
```

## 代码质量规范

### 1. ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}
```

### 2. Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 80,
  "vueIndentScriptAndStyle": true
}
```

## 文档规范

### 1. 组件文档

```vue
<!--
/**
 * @name UserProfile
 * @description 用户资料展示组件
 * 
 * @prop {Object} user - 用户信息对象
 * @prop {Boolean} editable - 是否可编辑
 * 
 * @event update - 用户信息更新事件
 * @event delete - 用户删除事件
 * 
 * @example
 * <UserProfile 
 *   :user="user" 
 *   :editable="true"
 *   @update="handleUpdate"
 * />
 */
-->
```

### 2. 工具函数文档

```javascript
/**
 * 格式化日期
 * @param {Date} date - 要格式化的日期
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期字符串
 * 
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // '2023-12-25'
 */
export function formatDate(date, format) {
  // 实现
}
```

## 团队协作规范

### 1. Git 提交规范

```bash
# 提交信息格式
feat: 添加用户登录功能
fix: 修复任务列表显示问题
docs: 更新 README 文档
style: 调整代码格式
refactor: 重构用户认证逻辑
test: 添加用户组件测试
chore: 更新依赖包版本
```

### 2. 代码审查规范

```markdown
# 代码审查清单

## 功能实现
- [ ] 功能是否按需求实现
- [ ] 是否有边界情况处理
- [ ] 错误处理是否完善

## 代码质量
- [ ] 代码是否符合编码规范
- [ ] 是否有重复代码
- [ ] 命名是否清晰准确

## 性能和安全
- [ ] 是否有性能问题
- [ ] 是否有安全漏洞
- [ ] 内存管理是否合理

## 测试
- [ ] 测试覆盖是否充分
- [ ] 测试用例是否合理
- [ ] 边界测试是否完整
```

## 总结

遵循最佳实践可以显著提高代码质量、可维护性和团队协作效率。这些规范应该根据具体项目需求进行调整，并在团队中达成共识。最重要的是保持一致性，让代码易于理解和维护。