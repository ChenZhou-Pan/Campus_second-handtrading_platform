import { apiService, ApiResponse } from './api'

export interface User {
  id: string
  username: string
  avatar?: string
  phone?: string
  email?: string
  role: 'buyer' | 'seller' | 'both' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  condition: string
  category: string
  images: string[]
  sellerId: string
  status: string
  viewCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  productId: string
  buyerId: string
  sellerId: string
  price: number
  status: string
  shippingAddress?: string
  contactPhone?: string
  note?: string
  buyerPhone?: string
  buyerUsername?: string
  sellerPhone?: string
  sellerUsername?: string
  createdAt: string
  updatedAt: string
}

export interface Feedback {
  id: string
  userId?: string
  type: string
  content: string
  contact?: string
  rating?: number
  userPhone?: string
  userUsername?: string
  createdAt: string
  updatedAt: string
}

export interface Statistics {
  totalUsers: number
  adminUsers: number
  buyerUsers: number
  sellerUsers: number
  bothUsers: number
  totalProducts: number
  publishedProducts: number
  soldProducts: number
  draftProducts: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
}

export const adminService = {
  // 登录（使用普通登录接口，但需要admin角色）
  login: async (username: string, password: string) => {
    const response = await apiService.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      username,
      password,
    })
    if (response.data?.token && response.data?.user?.role === 'admin') {
      localStorage.setItem('admin_token', response.data.token)
      return response
    } else {
      localStorage.removeItem('admin_token')
      throw new Error('非管理员账户')
    }
  },

  // 发送验证码
  sendVerificationCode: async (phone: string) => {
    return apiService.post<ApiResponse<string>>('/auth/send-code', { phone })
  },

  // 注册
  register: async (username: string, password: string, phone: string, code: string, email?: string) => {
    const response = await apiService.post<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      username,
      password,
      phone,
      code,
      email,
    })
    // 注册成功后，如果是管理员角色，保存token
    if (response.data?.token && response.data?.user?.role === 'admin') {
      localStorage.setItem('admin_token', response.data.token)
    }
    return response
  },

  // 登出
  logout: () => {
    localStorage.removeItem('admin_token')
  },

  // 获取统计数据
  getStatistics: async () => {
    return apiService.get<ApiResponse<Statistics>>('/admin/statistics')
  },

  // 用户管理
  getAllUsers: async () => {
    return apiService.get<ApiResponse<User[]>>('/admin/users')
  },

  getUserById: async (id: string) => {
    return apiService.get<ApiResponse<User>>(`/admin/users/${id}`)
  },

  updateUser: async (id: string, user: Partial<User>) => {
    return apiService.put<ApiResponse<User>>(`/admin/users/${id}`, user)
  },

  deleteUser: async (id: string) => {
    return apiService.delete<ApiResponse<string>>(`/admin/users/${id}`)
  },

  // 商品管理
  getAllProducts: async () => {
    return apiService.get<ApiResponse<Product[]>>('/admin/products')
  },

  getProductById: async (id: string) => {
    return apiService.get<ApiResponse<Product>>(`/admin/products/${id}`)
  },

  updateProductStatus: async (id: string, status: string) => {
    return apiService.put<ApiResponse<Product>>(`/admin/products/${id}/status`, { status })
  },

  deleteProduct: async (id: string) => {
    return apiService.delete<ApiResponse<string>>(`/admin/products/${id}`)
  },

  // 订单管理
  getAllOrders: async () => {
    return apiService.get<ApiResponse<Order[]>>('/admin/orders')
  },

  getOrderById: async (id: string) => {
    return apiService.get<ApiResponse<Order>>(`/admin/orders/${id}`)
  },

  // 反馈管理
  getAllFeedbacks: async () => {
    return apiService.get<ApiResponse<Feedback[]>>('/admin/feedbacks')
  },

  deleteFeedback: async (id: string) => {
    return apiService.delete<ApiResponse<string>>(`/admin/feedbacks/${id}`)
  },
}
