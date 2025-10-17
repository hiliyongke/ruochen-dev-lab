/**
 * API接口模块 - 模拟后端API调用
 */

import { sleep } from './helpers'
import type { User, LoginData, RegisterData } from '@/types/user'
import type { Task, TaskFormData } from '@/types/task'

// 模拟数据存储
let mockUsers: User[] = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    avatar: '/avatars/avatar1.png',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

let mockTasks: Task[] = [
  {
    id: '1',
    title: '学习Vue 3 Composition API',
    description: '深入学习Vue 3的Composition API特性，包括setup函数、ref、reactive等',
    completed: false,
    priority: 'high',
    tags: ['学习', 'Vue'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    dueDate: new Date('2024-02-01')
  },
  {
    id: '2',
    title: '完成项目文档编写',
    description: '编写完整的项目文档，包括API文档、用户手册和技术规范',
    completed: true,
    priority: 'medium',
    tags: ['文档', '项目'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    dueDate: new Date('2024-01-20')
  },
  {
    id: '3',
    title: '代码重构优化',
    description: '对现有代码进行重构，提高代码质量和性能',
    completed: false,
    priority: 'low',
    tags: ['重构', '优化'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
]

// 模拟网络延迟
const simulateNetworkDelay = async () => {
  await sleep(Math.random() * 500 + 200) // 200-700ms延迟
}

// 模拟API错误
const simulateError = (errorRate: number = 0.1): boolean => {
  return Math.random() < errorRate
}

/**
 * 认证相关API
 */
export const authApi = {
  /**
   * 用户登录
   */
  async login(loginData: LoginData): Promise<{ user: User; token: string }> {
    await simulateNetworkDelay()
    
    if (simulateError(0.05)) {
      throw new Error('网络连接失败，请检查网络设置')
    }
    
    const user = mockUsers.find(u => 
      (u.username === loginData.username || u.email === loginData.username) && 
      loginData.password === '123456' // 模拟密码验证
    )
    
    if (!user) {
      throw new Error('用户名或密码错误')
    }
    
    const token = `mock_token_${user.id}_${Date.now()}`
    return { user, token }
  },
  
  /**
   * 用户注册
   */
  async register(registerData: RegisterData): Promise<{ user: User; token: string }> {
    await simulateNetworkDelay()
    
    if (simulateError(0.05)) {
      throw new Error('网络连接失败，请检查网络设置')
    }
    
    // 检查用户名和邮箱是否已存在
    const existingUser = mockUsers.find(u => 
      u.username === registerData.username || u.email === registerData.email
    )
    
    if (existingUser) {
      if (existingUser.username === registerData.username) {
        throw new Error('用户名已存在')
      } else {
        throw new Error('邮箱已存在')
      }
    }
    
    // 创建新用户
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: registerData.username,
      email: registerData.email,
      avatar: '/avatars/avatar2.png',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    mockUsers.push(newUser)
    
    const token = `mock_token_${newUser.id}_${Date.now()}`
    return { user: newUser, token }
  },
  
  /**
   * 获取当前用户信息
   */
  async getCurrentUser(token: string): Promise<User> {
    await simulateNetworkDelay()
    
    if (simulateError(0.02)) {
      throw new Error('Token已过期，请重新登录')
    }
    
    const userId = token.split('_')[2] // 从token中提取用户ID
    const user = mockUsers.find(u => u.id === userId)
    
    if (!user) {
      throw new Error('用户不存在')
    }
    
    return user
  },
  
  /**
   * 更新用户信息
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await simulateNetworkDelay()
    
    if (simulateError(0.05)) {
      throw new Error('更新失败，请重试')
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    return mockUsers[userIndex]
  },
  
  /**
   * 退出登录
   */
  async logout(): Promise<void> {
    await simulateNetworkDelay()
    // 模拟退出登录操作
  }
}

/**
 * 任务相关API
 */
export const tasksApi = {
  /**
   * 获取任务列表
   */
  async getTasks(userId: string): Promise<Task[]> {
    await simulateNetworkDelay()
    
    if (simulateError(0.03)) {
      throw new Error('获取任务列表失败')
    }
    
    // 模拟用户相关的任务数据
    return mockTasks.filter(task => task.id.startsWith(userId) || !task.id.includes('user'))
  },
  
  /**
   * 创建任务
   */
  async createTask(userId: string, taskData: TaskFormData): Promise<Task> {
    await simulateNetworkDelay()
    
    if (simulateError(0.05)) {
      throw new Error('创建任务失败')
    }
    
    const newTask: Task = {
      id: `task_${userId}_${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      completed: false,
      priority: taskData.priority,
      tags: taskData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined
    }
    
    mockTasks.push(newTask)
    return newTask
  },
  
  /**
   * 更新任务
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await simulateNetworkDelay()
    
    if (simulateError(0.05)) {
      throw new Error('更新任务失败')
    }
    
    const taskIndex = mockTasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      throw new Error('任务不存在')
    }
    
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    return mockTasks[taskIndex]
  },
  
  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<void> {
    await simulateNetworkDelay()
    
    if (simulateError(0.05)) {
      throw new Error('删除任务失败')
    }
    
    const taskIndex = mockTasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      throw new Error('任务不存在')
    }
    
    mockTasks.splice(taskIndex, 1)
  },
  
  /**
   * 切换任务完成状态
   */
  async toggleTaskCompletion(taskId: string): Promise<Task> {
    await simulateNetworkDelay()
    
    const taskIndex = mockTasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      throw new Error('任务不存在')
    }
    
    mockTasks[taskIndex].completed = !mockTasks[taskIndex].completed
    return mockTasks[taskIndex]
  }
}

/**
 * 通用API工具函数
 */
export const apiUtils = {
  /**
   * 处理API响应
   */
  async handleResponse<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise
    } catch (error) {
      console.error('API调用失败:', error)
      throw error
    }
  },
  
  /**
   * 重试机制
   */
  async retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0) {
        await sleep(delay)
        return this.retry(fn, retries - 1, delay * 2)
      }
      throw error
    }
  }
}

/**
 * 文件上传API（模拟）
 */
export const uploadApi = {
  /**
   * 上传文件
   */
  async uploadFile(file: File): Promise<{ url: string; filename: string; size: number }> {
    await simulateNetworkDelay()
    
    if (simulateError(0.1)) {
      throw new Error('文件上传失败')
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB限制
      throw new Error('文件大小超过限制')
    }
    
    // 模拟上传成功，返回文件URL
    return {
      url: `https://example.com/uploads/${Date.now()}_${file.name}`,
      filename: file.name,
      size: file.size
    }
  },
  
  /**
   * 删除文件
   */
  async deleteFile(fileUrl: string): Promise<void> {
    await simulateNetworkDelay()
    
    if (simulateError(0.05)) {
      throw new Error('文件删除失败')
    }
    
    // 模拟删除操作
    console.log(`删除文件: ${fileUrl}`)
  }
}

export default {
  auth: authApi,
  tasks: tasksApi,
  upload: uploadApi,
  utils: apiUtils
}