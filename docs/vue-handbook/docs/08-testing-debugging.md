# 08. Vue 测试和调试

## 测试的重要性

良好的测试可以保证代码质量，减少 bug，提高开发效率。Vue 应用通常需要三种类型的测试：单元测试、组件测试和端到端测试。

## 单元测试

### 1. 测试工具配置

```javascript
// jest.config.js
module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testMatch: [
    '**/tests/unit/**/*.spec.[jt]s?(x)',
    '**/__tests__/*.[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js'
  ]
}
```

### 2. 工具函数测试

```javascript
// utils/math.spec.js
import { add, multiply } from '@/utils/math'

describe('数学工具函数', () => {
  test('加法函数', () => {
    expect(add(1, 2)).toBe(3)
    expect(add(-1, 1)).toBe(0)
  })
  
  test('乘法函数', () => {
    expect(multiply(2, 3)).toBe(6)
    expect(multiply(0, 5)).toBe(0)
  })
})
```

## 组件测试

### 1. 测试环境设置

```javascript
// tests/unit/setup.js
import { config } from '@vue/test-utils'

config.global.mocks = {
  $t: (msg) => msg
}

config.global.stubs = {
  'router-link': true
}
```

### 2. 基础组件测试

```javascript
// tests/unit/Counter.spec.js
import { mount } from '@vue/test-utils'
import Counter from '@/components/Counter.vue'

describe('Counter 组件', () => {
  test('渲染初始计数', () => {
    const wrapper = mount(Counter)
    expect(wrapper.text()).toContain('计数: 0')
  })
  
  test('点击按钮增加计数', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('计数: 1')
  })
  
  test('接收 props', () => {
    const wrapper = mount(Counter, {
      props: {
        initialCount: 10
      }
    })
    expect(wrapper.text()).toContain('计数: 10')
  })
})
```

### 3. 异步操作测试

```javascript
// tests/unit/AsyncComponent.spec.js
import { mount, flushPromises } from '@vue/test-utils'
import AsyncComponent from '@/components/AsyncComponent.vue'

describe('异步组件', () => {
  test('异步数据加载', async () => {
    const wrapper = mount(AsyncComponent)
    
    // 初始状态
    expect(wrapper.text()).toContain('加载中...')
    
    // 等待异步操作完成
    await flushPromises()
    
    // 验证加载后的状态
    expect(wrapper.text()).toContain('数据加载完成')
  })
})
```

## 路由测试

### 1. 路由组件测试

```javascript
// tests/unit/UserProfile.spec.js
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import UserProfile from '@/views/UserProfile.vue'

const routes = [
  { path: '/user/:id', component: UserProfile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

describe('用户资料页面', () => {
  test('显示用户ID', async () => {
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [router]
      },
      props: {
        id: '123'
      }
    })
    
    expect(wrapper.text()).toContain('用户ID: 123')
  })
})
```

## Vuex 测试

### 1. Store 单元测试

```javascript
// tests/unit/store/counter.spec.js
import { createStore } from 'vuex'
import counterModule from '@/store/modules/counter'

describe('counter store 模块', () => {
  let store
  
  beforeEach(() => {
    store = createStore({
      modules: {
        counter: counterModule
      }
    })
  })
  
  test('初始状态', () => {
    expect(store.state.counter.count).toBe(0)
  })
  
  test('increment mutation', () => {
    store.commit('counter/increment')
    expect(store.state.counter.count).toBe(1)
  })
  
  test('incrementAsync action', async () => {
    await store.dispatch('counter/incrementAsync')
    expect(store.state.counter.count).toBe(1)
  })
})
```

### 2. 组件中的 Vuex 测试

```javascript
// tests/unit/CounterWithStore.spec.js
import { mount, createLocalVue } from '@vue/test-utils'
import { createStore } from 'vuex'
import CounterWithStore from '@/components/CounterWithStore.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('带 Store 的计数器', () => {
  let store
  let actions
  
  beforeEach(() => {
    actions = {
      increment: jest.fn()
    }
    
    store = createStore({
      modules: {
        counter: {
          namespaced: true,
          state: { count: 5 },
          actions
        }
      }
    })
  })
  
  test('调用 increment action', async () => {
    const wrapper = mount(CounterWithStore, {
      store,
      localVue
    })
    
    await wrapper.find('button').trigger('click')
    expect(actions.increment).toHaveBeenCalled()
  })
})
```

## 端到端测试

### 1. Cypress 配置

```javascript
// cypress.json
{
  "baseUrl": "http://localhost:8080",
  "integrationFolder": "tests/e2e/specs",
  "fixturesFolder": "tests/e2e/fixtures",
  "supportFile": "tests/e2e/support/index.js",
  "pluginsFile": "tests/e2e/plugins/index.js",
  "video": false
}
```

### 2. 端到端测试示例

```javascript
// tests/e2e/specs/user_journey.spec.js
describe('用户完整流程', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  
  it('可以完成登录和浏览', () => {
    // 登录
    cy.get('[data-test="login-button"]').click()
    cy.get('[data-test="username"]').type('testuser')
    cy.get('[data-test="password"]').type('password')
    cy.get('[data-test="submit"]').click()
    
    // 验证登录成功
    cy.contains('欢迎, testuser').should('be.visible')
    
    // 浏览页面
    cy.get('[data-test="dashboard-link"]').click()
    cy.url().should('include', '/dashboard')
    
    // 执行操作
    cy.get('[data-test="create-item"]').click()
    cy.get('[data-test="item-name"]').type('测试项目')
    cy.get('[data-test="save"]').click()
    
    // 验证结果
    cy.contains('测试项目').should('be.visible')
  })
})
```

## 调试技巧

### 1. Vue Devtools 使用

Vue Devtools 是强大的调试工具，可以：
- 查看组件层次结构
- 检查组件状态和 props
- 跟踪事件和状态变化
- 性能分析

### 2. 自定义调试工具

```javascript
// utils/debug.js
export const debug = {
  logComponent(name, data) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${name}]`, data)
    }
  },
  
  trackPerformance(name, fn) {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now()
      const result = fn()
      const end = performance.now()
      console.log(`[性能] ${name}: ${end - start}ms`)
      return result
    }
    return fn()
  }
}

// 在组件中使用
export default {
  mounted() {
    debug.logComponent('MyComponent', this.$data)
    
    debug.trackPerformance('复杂计算', () => {
      return this.heavyComputation()
    })
  }
}
```

### 3. 错误边界

```vue
<template>
  <div>
    <ErrorBoundary>
      <UnstableComponent />
    </ErrorBoundary>
  </div>
</template>

<script>
// ErrorBoundary.vue
export default {
  data() {
    return {
      error: null
    }
  },
  errorCaptured(err, vm, info) {
    this.error = err
    console.error('错误捕获:', err, info)
    // 阻止错误继续向上传播
    return false
  },
  render() {
    if (this.error) {
      return this.$slots.error 
        ? this.$slots.error({ error: this.error })
        : h('div', '出错了')
    }
    return this.$slots.default()
  }
}
</script>
```

## 测试最佳实践

### 1. 测试命名规范

```javascript
// 好的命名
describe('UserProfile 组件', () => {
  test('当用户未登录时显示登录按钮', () => {})
  test('当用户登录时显示用户信息', () => {})
})

// 不好的命名
describe('测试用户', () => {
  test('测试1', () => {})
  test('测试2', () => {})
})
```

### 2. 测试数据管理

```javascript
// tests/factories/user.js
export const createUser = (overrides = {}) => ({
  id: 1,
  name: '测试用户',
  email: 'test@example.com',
  ...overrides
})

// 在测试中使用
test('显示用户信息', () => {
  const user = createUser({ name: '自定义用户' })
  const wrapper = mount(UserProfile, {
    props: { user }
  })
  expect(wrapper.text()).toContain('自定义用户')
})
```

### 3. 测试覆盖率目标

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

## 总结

测试和调试是 Vue 应用开发的重要环节。通过合理的测试策略和有效的调试工具，可以大大提高代码质量和开发效率。