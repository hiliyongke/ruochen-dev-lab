# 07. Vue 性能优化

## 为什么需要性能优化？

随着应用规模的增长，性能问题会逐渐显现。良好的性能优化可以提升用户体验，减少资源消耗，提高应用的可维护性。

## 组件优化

### 1. 合理使用 v-if 和 v-show

```vue
<template>
  <div>
    <!-- v-if 有更高的切换开销，适合条件很少改变的情况 -->
    <div v-if="isAdmin">
      管理员内容
    </div>
    
    <!-- v-show 有更高的初始渲染开销，适合频繁切换的情况 -->
    <div v-show="isVisible">
      频繁显示/隐藏的内容
    </div>
  </div>
</template>
```

### 2. 使用 computed 缓存计算结果

```vue
<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Item 1', price: 100 },
        { id: 2, name: 'Item 2', price: 200 },
        // ... 更多数据
      ]
    }
  },
  computed: {
    // 计算属性会被缓存，只有依赖变化时才会重新计算
    totalPrice() {
      return this.items.reduce((sum, item) => sum + item.price, 0)
    },
    
    expensiveItems() {
      return this.items.filter(item => item.price > 150)
    }
  }
}
</script>
```

### 3. 避免不必要的组件重新渲染

```vue
<template>
  <div>
    <!-- 使用 v-once 只渲染一次 -->
    <h1 v-once>{{ staticTitle }}</h1>
    
    <!-- 使用 key 帮助 Vue 识别节点 -->
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>
```

## 列表渲染优化

### 1. 使用 key 属性

```vue
<template>
  <ul>
    <!-- 错误的做法：使用索引作为 key -->
    <!-- <li v-for="(item, index) in items" :key="index">{{ item.name }}</li> -->
    
    <!-- 正确的做法：使用唯一标识作为 key -->
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

### 2. 虚拟滚动

对于超长列表，使用虚拟滚动技术。

```vue
<template>
  <div class="virtual-scroll" @scroll="handleScroll">
    <div class="scroll-content" :style="{ height: totalHeight + 'px' }">
      <div 
        v-for="item in visibleItems" 
        :key="item.id"
        class="item"
        :style="{ transform: `translateY(${item.offset}px)` }"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [], // 所有数据
      visibleItems: [], // 可见数据
      itemHeight: 50,
      visibleCount: 20,
      startIndex: 0
    }
  },
  computed: {
    totalHeight() {
      return this.items.length * this.itemHeight
    }
  },
  methods: {
    handleScroll(event) {
      const scrollTop = event.target.scrollTop
      this.startIndex = Math.floor(scrollTop / this.itemHeight)
      this.updateVisibleItems()
    },
    updateVisibleItems() {
      const endIndex = this.startIndex + this.visibleCount
      this.visibleItems = this.items
        .slice(this.startIndex, endIndex)
        .map((item, index) => ({
          ...item,
          offset: (this.startIndex + index) * this.itemHeight
        }))
    }
  }
}
</script>
```

## 事件处理优化

### 1. 事件防抖和节流

```javascript
// utils/debounce.js
export function debounce(func, wait, immediate) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

// utils/throttle.js
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <input v-model="searchQuery" @input="handleSearch">
    <button @click="handleClick">点击</button>
  </div>
</template>

<script>
import { debounce, throttle } from './utils'

export default {
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    handleSearch: debounce(function() {
      this.performSearch(this.searchQuery)
    }, 300),
    
    handleClick: throttle(function() {
      this.submitForm()
    }, 1000)
  }
}
</script>
```

## 内存管理优化

### 1. 及时清理定时器

```vue
<script>
export default {
  data() {
    return {
      timer: null,
      count: 0
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.count++
    }, 1000)
  },
  beforeUnmount() {
    // 重要：清理定时器防止内存泄漏
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
</script>
```

### 2. 清理事件监听器

```vue
<script>
export default {
  mounted() {
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('click', this.handleClick)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleClick)
  }
}
</script>
```

## 打包优化

### 1. 代码分割

```javascript
// router/index.js
const routes = [
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue')
  },
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ './views/Admin.vue')
  }
]
```

### 2. 第三方库按需引入

```javascript
// 错误：全量引入
// import ElementPlus from 'element-plus'

// 正确：按需引入
import { ElButton, ElInput } from 'element-plus'

const app = createApp(App)
app.use(ElButton)
app.use(ElInput)
```

## 运行时性能优化

### 1. 使用 Object.freeze()

```javascript
export default {
  data() {
    return {
      // 冻结大型静态数据，避免 Vue 将其转换为响应式
      largeStaticData: Object.freeze([
        // ... 大量静态数据
      ])
    }
  }
}
```

### 2. 合理使用 v-memo

```vue
<template>
  <div v-memo="[item.id, item.status]">
    <p>{{ item.name }}</p>
    <p>{{ item.description }}</p>
  </div>
</template>
```

## 开发工具和监控

### 1. Vue Devtools 性能分析

使用 Vue Devtools 的性能标签页分析组件渲染性能。

### 2. 性能监控

```javascript
// performance.js
export const performanceMonitor = {
  start(name) {
    performance.mark(`${name}-start`)
  },
  end(name) {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    const duration = performance.getEntriesByName(name)[0].duration
    console.log(`${name} 耗时: ${duration}ms`)
  }
}

// 在组件中使用
export default {
  mounted() {
    performanceMonitor.start('component-mount')
    // 组件逻辑
    performanceMonitor.end('component-mount')
  }
}
```

## 总结

性能优化是一个持续的过程，需要根据具体应用场景选择合适的优化策略。关键是要在开发过程中保持性能意识，定期进行性能测试和分析。