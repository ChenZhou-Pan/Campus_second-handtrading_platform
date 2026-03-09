import { apiService } from './api'
import type { Order, PaginatedResponse } from '@/types'

export const orderService = {
  // 创建订单
  createOrder: async (order: {
    productId: string
    shippingAddress?: string
    contactPhone?: string
    note?: string
  }) => {
    return apiService.post<Order>('/orders', order)
  },

  // 获取订单列表
  getOrders: async (params: {
    page?: number
    pageSize?: number
    status?: string
    role?: 'buyer' | 'seller'
  }) => {
    return apiService.get<PaginatedResponse<Order>>('/orders', { params })
  },

  // 获取订单详情
  getOrderById: async (id: string) => {
    return apiService.get<Order>(`/orders/${id}`)
  },

  // 更新订单状态
  updateOrderStatus: async (id: string, status: string) => {
    return apiService.put<Order>(`/orders/${id}/status`, { status })
  },

  // 取消订单
  cancelOrder: async (id: string) => {
    return apiService.put<Order>(`/orders/${id}/cancel`)
  },

  // 删除订单
  deleteOrder: async (id: string) => {
    return apiService.delete<string>(`/orders/${id}`)
  },

  // 申请退款
  refundOrder: async (id: string) => {
    return apiService.post<Order>(`/orders/${id}/refund`)
  },

  // 创建支付宝支付
  createAlipayPayment: async (orderId: string): Promise<string> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/payments/alipay/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ orderId }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || '创建支付失败')
    }
    
    return await response.text()
  },
}
