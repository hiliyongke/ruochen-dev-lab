export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
}