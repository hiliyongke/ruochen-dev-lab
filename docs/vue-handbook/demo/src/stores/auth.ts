import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    avatar: '/avatars/demo.png',
    createdAt: new Date('2024-01-01')
  }
]

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userInfo = computed(() => user.value)

  // 方法
  const login = async (credentials: { username: string; password: string }) => {
    isLoading.value = true
    
    try {
      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟认证逻辑
      const foundUser = mockUsers.find(u => u.username === credentials.username)
      
      if (!foundUser) {
        throw new Error('用户不存在')
      }

      // 模拟密码验证（实际项目中应该在后端进行）
      if (credentials.password !== 'demo123') {
        throw new Error('密码错误')
      }

      // 更新状态
      user.value = foundUser
      token.value = 'mock-jwt-token-' + Date.now()
      
      // 保存到本地存储
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(foundUser))

      return foundUser
    } catch (error) {
      // 清除状态
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initialize = () => {
    // 从本地存储初始化状态
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        // 解析失败时清除无效数据
        logout()
      }
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user.value) {
      throw new Error('用户未登录')
    }

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新用户信息
    user.value = { ...user.value, ...profileData }
    localStorage.setItem('user', JSON.stringify(user.value))

    return user.value
  }

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    
    // 计算属性
    isAuthenticated,
    userInfo,
    
    // 方法
    login,
    logout,
    initialize,
    updateProfile
  }
})