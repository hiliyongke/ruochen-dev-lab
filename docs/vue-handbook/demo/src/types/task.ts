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

export interface TaskFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  tags: string[]
}

export interface TaskStats {
  total: number
  completed: number
  active: number
  overdue: number
}