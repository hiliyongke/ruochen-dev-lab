/**
 * 工具函数库 - 提供常用的辅助函数
 */

/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式类型，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm' | 'relative' = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  
  if (format === 'relative') {
    return getRelativeTime(d)
  }
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`
  } else {
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

/**
 * 获取相对时间描述
 * @param date 日期对象
 * @returns 相对时间字符串
 */
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return '刚刚'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}小时前`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}天前`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}周前`
  }
  
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(null, args)
    }
  }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 生成唯一ID
 * @param prefix ID前缀
 * @returns 唯一ID字符串
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 本地存储工具函数
 */
export const storage = {
  /**
   * 设置存储项
   */
  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('LocalStorage set failed:', error)
    }
  },
  
  /**
   * 获取存储项
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.warn('LocalStorage get failed:', error)
      return defaultValue || null
    }
  },
  
  /**
   * 移除存储项
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('LocalStorage remove failed:', error)
    }
  },
  
  /**
   * 清空所有存储
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('LocalStorage clear failed:', error)
    }
  }
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 数组去重
 * @param array 要去重的数组
 * @returns 去重后的数组
 */
export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * 数组按字段去重
 * @param array 要去重的数组
 * @param key 去重的字段名
 * @returns 去重后的数组
 */
export function uniqueArrayByKey<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    return seen.has(value) ? false : seen.add(value)
  })
}

/**
 * 等待指定时间
 * @param ms 等待时间（毫秒）
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 生成随机颜色
 * @returns 十六进制颜色值
 */
export function generateRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

/**
 * 获取数据类型
 * @param value 要检测的值
 * @returns 数据类型字符串
 */
export function getType(value: any): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

/**
 * 安全获取对象属性值
 * @param obj 对象
 * @param path 属性路径
 * @param defaultValue 默认值
 * @returns 属性值或默认值
 */
export function get(obj: any, path: string, defaultValue: any = undefined): any {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    result = result?.[key]
    if (result === undefined || result === null) {
      return defaultValue
    }
  }
  
  return result !== undefined ? result : defaultValue
}