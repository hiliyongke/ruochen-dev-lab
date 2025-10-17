import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页 - Vue 手册演示',
      requiresAuth: false,
      showNav: true,
      showFooter: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录 - Vue 手册演示',
      requiresAuth: false,
      requiresGuest: true,
      showNav: false,
      showFooter: false
    }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/Tasks.vue'),
    meta: {
      title: '任务管理 - Vue 手册演示',
      requiresAuth: true,
      showNav: true,
      showFooter: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      title: '个人中心 - Vue 手册演示',
      requiresAuth: true,
      showNav: true,
      showFooter: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到 - Vue 手册演示',
      showNav: true,
      showFooter: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回页面时保持滚动位置
    if (savedPosition) {
      return savedPosition
    }
    // 新页面滚动到顶部
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 检查认证状态
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // 检查访客状态（已登录用户不能访问登录页）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

// 路由后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加页面统计等逻辑
  if (import.meta.env.DEV) {
    console.log(`路由跳转: ${from.path} → ${to.path}`)
  }
})

export default router