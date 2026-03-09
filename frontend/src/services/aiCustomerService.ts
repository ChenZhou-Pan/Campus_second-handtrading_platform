import { apiService } from './api'

export interface AIChatResponse {
  reply: string
}

export const aiCustomerService = {
  // 与AI客服对话
  // 设置更长的超时时间（60秒），因为AI API调用可能需要更长时间
  chat: async (message: string) => {
    return apiService.post<AIChatResponse>('/ai-customer-service/chat', { message }, {
      timeout: 60000, // 60秒超时
    })
  },
}
