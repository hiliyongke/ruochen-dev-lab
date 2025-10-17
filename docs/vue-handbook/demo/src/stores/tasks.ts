import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilter } from '@/types/task'

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: '1',
    title: '学习 Vue 3 基础',
    description: '掌握 Vue 3 的核心概念和 Composition API',
    completed: true,
    priority: 'high',
    dueDate: new Date('2024-01-15'),
    tags: ['学习', 'Vue'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    title: '完成项目实战',
    description: '基于 Vue 3 开发一个完整的任务管理应用',
    completed: false,
    priority: 'medium',
    dueDate: new Date('2024-02-01'),
    tags: ['项目', '实战'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '3',
    title: '性能优化研究',
    description: '学习 Vue 应用的性能优化技巧',
    completed: false,
    priority: 'low',
    tags: ['优化', '性能'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  }
]

export const useTasksStore = defineStore('tasks', () => {
  // 状态
  const tasks = ref<Task[]>(mockTasks)
  const filter = ref<TaskFilter>('all')
  const searchQuery = ref('')
  const isLoading = ref(false)

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
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return result
  })

  const stats = computed(() => ({
    total: tasks.value.length,
    completed: tasks.value.filter(task => task.completed).length,
    active: tasks.value.filter(task => !task.completed).length,
    overdue: tasks.value.filter(task => 
      task.dueDate && !task.completed && task.dueDate < new Date()
    ).length
  }))

  const tasksByPriority = computed(() => ({
    high: tasks.value.filter(task => task.priority === 'high'),
    medium: tasks.value.filter(task => task.priority === 'medium'),
    low: tasks.value.filter(task => task.priority === 'low')
  }))

  // 方法
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    tasks.value.push(newTask)
    return newTask
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const taskIndex = tasks.value.findIndex(task => task.id === id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = {
        ...tasks.value[taskIndex],
        ...updates,
        updatedAt: new Date()
      }
      return tasks.value[taskIndex]
    }
    return null
  }

  const deleteTask = (id: string) => {
    const taskIndex = tasks.value.findIndex(task => task.id === id)
    if (taskIndex !== -1) {
      tasks.value.splice(taskIndex, 1)
      return true
    }
    return false
  }

  const toggleTaskCompletion = (id: string) => {
    const task = tasks.value.find(task => task.id === id)
    if (task) {
      task.completed = !task.completed
      task.updatedAt = new Date()
      return task
    }
    return null
  }

  const setFilter = (newFilter: TaskFilter) => {
    filter.value = newFilter
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const clearCompleted = () => {
    tasks.value = tasks.value.filter(task => !task.completed)
  }

  const getTaskById = (id: string) => {
    return tasks.value.find(task => task.id === id)
  }

  const getTasksByTag = (tag: string) => {
    return tasks.value.filter(task => task.tags.includes(tag))
  }

  // 模拟 API 调用
  const fetchTasks = async () => {
    isLoading.value = true
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      // 在实际项目中，这里会调用真实的 API
      return tasks.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    tasks: readonly(tasks),
    filter: readonly(filter),
    searchQuery: readonly(searchQuery),
    isLoading: readonly(isLoading),
    
    // 计算属性
    filteredTasks,
    stats,
    tasksByPriority,
    
    // 方法
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    setFilter,
    setSearchQuery,
    clearCompleted,
    getTaskById,
    getTasksByTag,
    fetchTasks
  }
})