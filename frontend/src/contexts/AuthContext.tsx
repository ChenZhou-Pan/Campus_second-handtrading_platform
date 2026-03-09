import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  loginByCode: (phone: string, code: string) => Promise<void>
  register: (data: {
    username: string
    password: string
    phone?: string
    email?: string
    code?: string
  }) => Promise<void>
  logout: () => void
  updateUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authService.getCurrentUser()
          setUser(response.data)
        } catch (error) {
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password)
      if (response.data?.user) {
        setUser(response.data.user)
      } else {
        throw new Error('登录失败：未返回用户信息')
      }
    } catch (error: any) {
      // 重新抛出错误，让页面组件处理
      throw error
    }
  }

  const loginByCode = async (phone: string, code: string) => {
    try {
      const response = await authService.loginByCode(phone, code)
      if (response.data?.user) {
        setUser(response.data.user)
      } else {
        throw new Error('登录失败：未返回用户信息')
      }
    } catch (error: any) {
      // 重新抛出错误，让页面组件处理
      throw error
    }
  }

  const register = async (data: {
    username: string
    password: string
    phone?: string
    email?: string
    code?: string
  }) => {
    try {
      const response = await authService.register(data)
      if (response.data?.user) {
        setUser(response.data.user)
      } else {
        throw new Error('注册失败：未返回用户信息')
      }
    } catch (error: any) {
      // 重新抛出错误，让页面组件处理
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const updateUser = (newUser: User | null) => {
    setUser(newUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginByCode, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
