import { apiService } from './api'
import type { Product, PaginatedResponse, PriceSuggestion, PriceAnalysisRequest } from '@/types'

export const productService = {
  // 获取商品列表
  getProducts: async (params: {
    page?: number
    pageSize?: number
    category?: string
    keyword?: string
    condition?: string
    minPrice?: number
    maxPrice?: number
    location?: string
    sortBy?: string
  }) => {
    return apiService.get<PaginatedResponse<Product>>('/products', { params })
  },

  // 获取商品详情
  getProductById: async (id: string) => {
    return apiService.get<Product>(`/products/${id}`)
  },

  // 创建商品
  createProduct: async (product: Partial<Product>) => {
    return apiService.post<Product>('/products', product)
  },

  // 更新商品
  updateProduct: async (id: string, product: Partial<Product>) => {
    return apiService.put<Product>(`/products/${id}`, product)
  },

  // 删除商品
  deleteProduct: async (id: string) => {
    return apiService.delete(`/products/${id}`)
  },

  // 获取我的商品
  getMyProducts: async (params: { page?: number; pageSize?: number; status?: string }) => {
    return apiService.get<PaginatedResponse<Product>>('/products/my', { params })
  },

  // 收藏商品
  favoriteProduct: async (productId: string) => {
    return apiService.post(`/products/${productId}/favorite`)
  },

  // 取消收藏
  unfavoriteProduct: async (productId: string) => {
    return apiService.delete(`/products/${productId}/favorite`)
  },

  // 获取收藏列表
  getFavorites: async (params: { page?: number; pageSize?: number }) => {
    return apiService.get<PaginatedResponse<Product>>('/products/favorites', { params })
  },

  // 检查是否已收藏
  checkFavorite: async (productId: string) => {
    return apiService.get<boolean>(`/products/${productId}/favorite/check`)
  },

  // 智能定价建议
  getPriceSuggestion: async (request: PriceAnalysisRequest) => {
    return apiService.post<PriceSuggestion>('/products/price-suggestion', request)
  },

  // 上传商品图片
  uploadProductImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiService.post<{ url: string }>('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
