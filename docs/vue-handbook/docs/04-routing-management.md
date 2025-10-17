# 04. Vue 路由管理

## 什么是 Vue Router？

Vue Router 是 Vue.js 的官方路由管理器。它与 Vue.js 核心深度集成，让构建单页面应用（SPA）变得易如反掌。

### 路由的基本概念

- **路由**：根据 URL 路径映射到对应的组件
- **路由参数**：从 URL 中提取的动态值
- **嵌套路由**：路由中可以包含子路由
- **路由守卫**：控制路由的导航行为
- **编程式导航**：通过代码控制路由跳转

## Vue Router 安装和配置

### 安装和基本配置

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true,
      title: '首页'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: '关于我们'
    }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue'),
    props: true // 将路由参数作为 props 传递
  },
  {
    path: '/:pathMatch(.*)*', // 404 页面
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回滚动位置
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
```

### 在主应用中挂载路由

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 路由视图和导航

### RouterView 和 RouterLink

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <!-- 导航菜单 -->
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link :to="{ name: 'User', params: { id: 123 } }">
        用户页面
      </router-link>
    </nav>
    
    <!-- 路由出口 -->
    <router-view />
    
    <!-- 命名视图 -->
    <router-view name="sidebar" />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.router-link-active {
  font-weight: bold;
  color: #42b983;
}

.router-link-exact-active {
  border-bottom: 2px solid #42b983;
}
</style>
```

### 编程式导航

```vue
<template>
  <div>
    <button @click="goHome">返回首页</button>
    <button @click="goBack">返回</button>
    <button @click="goForward">前进</button>
    <button @click="goToUser(456)">用户456</button>
  </div>
</template>

<script>
export default {
  methods: {
    goHome() {
      this.$router.push('/')
    },
    goBack() {
      this.$router.back()
    },
    goForward() {
      this.$router.forward()
    },
    goToUser(id) {
      // 多种导航方式
      this.$router.push(`/user/${id}`)
      // 或者
      this.$router.push({ name: 'User', params: { id } })
      // 或者替换当前路由（不保留历史记录）
      // this.$router.replace({ name: 'User', params: { id } })
    },
    
    // 带查询参数
    search(query) {
      this.$router.push({
        path: '/search',
        query: { q: query, page: 1 }
      })
    }
  }
}
</script>
```

## 路由参数和查询

### 动态路由参数

```vue
<!-- User.vue -->
<template>
  <div>
    <h2>用户信息</h2>
    <p>用户ID: {{ $route.params.id }}</p>
    <p>通过 props 接收的ID: {{ id }}</p>
    
    <!-- 查询参数 -->
    <p>搜索关键词: {{ $route.query.q }}</p>
    <p>页码: {{ $route.query.page }}</p>
  </div>
</template>

<script>
export default {
  name: 'User',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  watch: {
    // 监听路由参数变化
    '$route.params.id': {
      handler(newId) {
        this.fetchUserData(newId)
      },
      immediate: true
    }
  },
  methods: {
    fetchUserData(userId) {
      console.log('获取用户数据:', userId)
      // 调用 API 获取用户数据
    }
  }
}
</script>
```

### 路由参数验证

```javascript
// router/index.js
{
  path: '/user/:id',
  component: User,
  props: (route) => ({
    id: parseInt(route.params.id),
    // 参数验证
    ...(route.params.id && !isNaN(route.params.id) ? {} : { id: null })
  })
}
```

## 嵌套路由

嵌套路由允许在组件内部定义子路由。

### 嵌套路由配置

```javascript
// router/index.js
{
  path: '/dashboard',
  component: Dashboard,
  children: [
    {
      path: '', // 默认子路由
      component: DashboardHome,
      meta: { title: '控制台首页' }
    },
    {
      path: 'profile',
      component: UserProfile,
      meta: { title: '个人资料' }
    },
    {
      path: 'settings',
      component: UserSettings,
      meta: { title: '设置' }
    }
  ]
}
```

### 嵌套路由组件

```vue
<!-- Dashboard.vue -->
<template>
  <div class="dashboard">
    <aside class="sidebar">
      <nav>
        <router-link to="/dashboard">首页</router-link>
        <router-link to="/dashboard/profile">个人资料</router-link>
        <router-link to="/dashboard/settings">设置</router-link>
      </nav>
    </aside>
    
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background: #f5f5f5;
  padding: 20px;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
```

## 路由守卫

路由守卫用于控制路由的导航行为，可以在导航前、导航后执行特定逻辑。

### 全局守卫

```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  // 页面标题设置
  document.title = to.meta.title || 'Vue App'
  
  // 认证检查
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  // 页面访问统计
  analytics.trackPageView(to.path)
})

router.beforeResolve((to, from, next) => {
  // 在所有组件内守卫和异步路由组件被解析之后调用
  next()
})
```

### 路由独享守卫

```javascript
{
  path: '/admin',
  component: Admin,
  beforeEnter: (to, from, next) => {
    if (isAdmin()) {
      next()
    } else {
      next('/unauthorized')
    }
  }
}
```

### 组件内守卫

```vue
<script>
export default {
  name: 'UserProfile',
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被验证前调用
    // 不能获取组件实例 `this`
    next(vm => {
      // 通过 `vm` 访问组件实例
      vm.fetchUserData(to.params.id)
    })
  },
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    this.fetchUserData(to.params.id)
    next()
  },
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    if (this.hasUnsavedChanges) {
      if (confirm('有未保存的更改，确定要离开吗？')) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  }
}
</script>
```

## 路由元信息和过渡效果

### 路由元信息

```javascript
{
  path: '/secret',
  component: SecretPage,
  meta: {
    requiresAuth: true,
    requiresAdmin: true,
    transition: 'fade'
  }
}
```

### 路由过渡效果

```vue
<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition 
        :name="route.meta.transition || 'fade'"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
```

## 路由懒加载

路由懒加载可以优化应用性能，按需加载组件。

### 基本懒加载

```javascript
// router/index.js
const routes = [
  {
    path: '/about',
    component: () => import('../views/About.vue')
  },
  {
    path: '/user/:id',
    component: () => import('../views/User.vue')
  }
]
```

### 分组懒加载

```javascript
// 使用 webpack 的魔法注释进行分组
const routes = [
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '../views/Admin.vue')
  },
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue')
  }
]
```

## 总结

本章详细介绍了 Vue Router 的核心功能：
- 路由的基本配置和使用
- 动态路由参数和查询参数
- 嵌套路由的实现
- 各种路由守卫的使用
- 路由过渡效果和懒加载

在下一章中，我们将学习 Vue 3 的 Composition API，这是 Vue 3 最重要的新特性之一。