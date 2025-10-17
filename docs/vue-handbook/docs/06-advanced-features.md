# 06. Vue 高级特性

## 自定义指令

自定义指令允许我们直接操作 DOM 元素，实现一些特殊的功能。

### 指令的基本结构

```javascript
// 全局注册指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 局部注册指令
export default {
  directives: {
    focus: {
      mounted(el) {
        el.focus()
      }
    }
  }
}
```

### 指令钩子函数

```javascript
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode, prevVnode) {
    // 参见下面小节
  },
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {}
}
```

### 实用自定义指令示例

```vue
<template>
  <div>
    <!-- 点击外部关闭 -->
    <div v-click-outside="closeMenu" class="menu">
      点击外部关闭我
    </div>
    
    <!-- 复制到剪贴板 -->
    <input v-model="text" v-copy="text">
    <button v-copy="text">复制</button>
    
    <!-- 权限控制 -->
    <button v-permission="'admin'">管理员按钮</button>
    
    <!-- 图片懒加载 -->
    <img v-lazy="imageUrl" alt="懒加载图片">
    
    <!-- 防抖 -->
    <input v-debounce:300="search" placeholder="搜索...">
    
    <!-- 水印 -->
    <div v-watermark="'机密文件'">重要内容</div>
  </div>
</template>

<script>
// 点击外部关闭指令
const clickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// 复制到剪贴板指令
const copy = {
  mounted(el, binding) {
    el.addEventListener('click', () => {
      const text = binding.value
      navigator.clipboard.writeText(text).then(() => {
        console.log('复制成功')
      }).catch(err => {
        console.error('复制失败:', err)
      })
    })
  }
}

// 权限控制指令
const permission = {
  mounted(el, binding) {
    const userRole = 'user' // 从 store 或全局状态获取
    const requiredRole = binding.value
    
    if (userRole !== requiredRole) {
      el.style.display = 'none'
    }
  }
}

export default {
  directives: {
    clickOutside,
    copy,
    permission
  },
  data() {
    return {
      text: '要复制的文本'
    }
  },
  methods: {
    closeMenu() {
      console.log('关闭菜单')
    },
    search(query) {
      console.log('搜索:', query)
    }
  }
}
</script>
```

## 插件开发

Vue 插件是一种强大的扩展机制，可以为 Vue 添加全局功能。

### 插件的基本结构

```javascript
// plugins/my-plugin.js
const MyPlugin = {
  install(app, options) {
    // 添加全局方法或属性
    app.config.globalProperties.$myMethod = () => {
      console.log('这是我的方法')
    }
    
    // 添加全局资源
    app.directive('my-directive', {
      mounted(el, binding) {
        // 指令逻辑
      }
    })
    
    // 注入组件选项
    app.mixin({
      created() {
        // 混入逻辑
      }
    })
    
    // 提供全局配置
    app.provide('myPluginOptions', options)
  }
}

export default MyPlugin
```

### 使用插件

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import MyPlugin from './plugins/my-plugin'

const app = createApp(App)

app.use(MyPlugin, {
  someOption: true
})

app.mount('#app')
```

## 渲染函数和 JSX

当模板语法不够灵活时，可以使用渲染函数或 JSX。

### 渲染函数基础

```vue
<script>
import { h } from 'vue'

export default {
  data() {
    return {
      title: 'Hello World',
      items: ['Item 1', 'Item 2', 'Item 3']
    }
  },
  render() {
    return h('div', { class: 'container' }, [
      h('h1', this.title),
      h('ul', this.items.map(item => 
        h('li', item)
      ))
    ])
  }
}
</script>
```

### JSX 使用

```vue
<script>
export default {
  data() {
    return {
      message: 'Hello JSX',
      count: 0
    }
  },
  render() {
    return (
      <div class="app">
        <h1>{this.message}</h1>
        <p>计数: {this.count}</p>
        <button onClick={() => this.count++}>
          点击我
        </button>
      </div>
    )
  }
}
</script>
```

## 函数式组件

函数式组件是无状态、无实例的组件，性能更高。

### 函数式组件示例

```vue
<!-- FunctionalComponent.vue -->
<template functional>
  <div class="functional-component">
    <h3>{{ props.title }}</h3>
    <p>{{ props.content }}</p>
    <button @click="listeners.click">点击</button>
  </div>
</template>

<script>
export default {
  functional: true,
  props: {
    title: String,
    content: String
  }
}
</script>
```

### 渲染函数中的函数式组件

```javascript
// FunctionalComponent.js
export default {
  functional: true,
  render(h, context) {
    const { props, listeners } = context
    return h('div', { class: 'functional' }, [
      h('h3', props.title),
      h('p', props.content),
      h('button', {
        on: {
          click: listeners.click
        }
      }, '点击')
    ])
  }
}
```

## 异步组件

异步组件可以按需加载，优化应用性能。

### 基本异步组件

```javascript
// 全局注册异步组件
app.component('AsyncComponent', () => import('./AsyncComponent.vue'))

// 局部注册
export default {
  components: {
    AsyncComponent: () => import('./AsyncComponent.vue')
  }
}
```

### 高级异步组件配置

```javascript
const AsyncComponent = defineAsyncComponent({
  // 加载函数
  loader: () => import('./AsyncComponent.vue'),
  
  // 加载中显示的组件
  loadingComponent: LoadingComponent,
  
  // 加载失败显示的组件
  errorComponent: ErrorComponent,
  
  // 延迟显示加载组件的时间（默认 200ms）
  delay: 200,
  
  // 超时时间（默认无超时）
  timeout: 3000,
  
  // 定义组件是否可挂起
  suspensible: false,
  
  // 错误处理函数
  onError(error, retry, fail, attempts) {
    if (error.message.match(/fetch/) && attempts <= 3) {
      // 重试获取错误，最多重试3次
      retry()
    } else {
      // 注意，retry/fail 类似于 promise 的 resolve/reject
      fail()
    }
  }
})
```

## 总结

本章介绍了 Vue 的高级特性：
- 自定义指令的创建和使用
- 插件开发机制
- 渲染函数和 JSX
- 函数式组件
- 异步组件加载

这些高级特性为 Vue 应用开发提供了更大的灵活性和性能优化空间。