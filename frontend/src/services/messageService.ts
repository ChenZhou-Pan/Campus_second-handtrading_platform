import { apiService } from './api'
import type { Message, Conversation, PaginatedResponse } from '@/types'

export const messageService = {
  // 获取会话列表
  getConversations: async (params?: { page?: number; pageSize?: number }) => {
    return apiService.get<PaginatedResponse<Conversation>>('/messages/conversations', { params })
  },

  // 获取会话详情
  getConversationById: async (id: string) => {
    return apiService.get<Conversation>(`/messages/conversations/${id}`)
  },

  // 获取或创建会话
  getOrCreateConversation: async (userId: string, productId?: string) => {
    return apiService.post<Conversation>('/messages/conversations', { userId, productId })
  },

  // 获取消息列表
  getMessages: async (conversationId: string, params?: { page?: number; pageSize?: number }) => {
    return apiService.get<PaginatedResponse<Message>>(`/messages/conversations/${conversationId}/messages`, { params })
  },

  // 发送消息
  sendMessage: async (conversationId: string, content: string, type: 'text' | 'image' = 'text') => {
    return apiService.post<Message>(`/messages/conversations/${conversationId}/messages`, {
      content,
      type,
    })
  },

  // 标记消息为已读
  markAsRead: async (conversationId: string) => {
    return apiService.put(`/messages/conversations/${conversationId}/read`)
  },

  // 删除会话
  deleteConversation: async (conversationId: string) => {
    return apiService.delete(`/messages/conversations/${conversationId}`)
  },
}
