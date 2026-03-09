import { apiService } from './api'
import type { User, UserStats } from '@/types'

export const authService = {
  // 登录
  login: async (username: string, password: string) => {
    const response = await apiService.post<{ user: User; token: string }>('/auth/login', {
      username,
      password,
    })
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response
  },

  // 注册
  register: async (data: {
    username: string
    password: string
    phone?: string
    email?: string
    code?: string
  }) => {
    const response = await apiService.post<{ user: User; token: string }>('/auth/register', data)
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response
  },

  // 登出
  logout: () => {
    localStorage.removeItem('token')
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return apiService.get<User>('/auth/me')
  },

  // 更新用户信息
  updateProfile: async (data: Partial<User>) => {
    return apiService.put<User>('/auth/profile', data)
  },

  // 切换用户角色
  switchRole: async (role: 'buyer' | 'seller' | 'both') => {
    return apiService.put<User>('/auth/role', { role })
  },

  // 获取用户统计信息
  getUserStats: async () => {
    return apiService.get<UserStats>('/auth/stats')
  },

  // 发送验证码
  sendVerificationCode: async (phone: string) => {
    return apiService.post<string>('/auth/send-code', { phone })
  },

  // 验证码登录
  loginByCode: async (phone: string, code: string) => {
    const response = await apiService.post<{ user: User; token: string }>('/auth/login-by-code', {
      phone,
      code,
    })
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response
  },

  // 通过手机号搜索用户
  searchUserByPhone: async (phone: string) => {
    return apiService.get<User>('/auth/search', { params: { phone } })
  },

  // 上传头像
  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiService.post<{ avatar: string }>('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  // 更新手机号
  updatePhone: async (oldPhone: string, oldCode: string, newPhone: string, newCode: string) => {
    return apiService.put<User>('/auth/phone', {
      oldPhone,
      oldCode,
      newPhone,
      newCode,
    })
  },

  // 更新密码
  updatePassword: async (phone: string, code: string, newPassword: string) => {
    return apiService.put<User>('/auth/password', {
      phone,
      code,
      newPassword,
    })
  },

  // 验证验证码
  verifyCode: async (phone: string, code: string, removeAfterVerify: boolean = true) => {
    const response = await apiService.post<boolean>('/auth/verify-code', {
      phone,
      code,
      removeAfterVerify,
    })
    // 检查响应中的 code 字段，如果不是 200，抛出异常
    if ((response as any).code && (response as any).code !== 200) {
      const error: any = new Error((response as any).message || '验证失败')
      error.response = { data: response }
      throw error
    }
    return response
  },
}
