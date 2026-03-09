// 用户相关类型
export interface User {
  id: string
  username: string
  avatar?: string
  phone?: string
  email?: string
  role: 'buyer' | 'seller' | 'both'
  createdAt: string
}

// 用户统计类型
export interface UserStats {
  // 买家统计
  buyerStats: {
    totalOrders: number
    completedOrders: number
    totalSpent: number
    favoriteCount: number
  }
  // 卖家统计
  sellerStats: {
    totalProducts: number
    publishedProducts: number
    soldProducts: number
    totalOrders: number
    completedOrders: number
    totalEarned: number
  }
}

// 商品相关类型
export enum ProductCondition {
  NEW = 'new',           // 全新
  LIKE_NEW = 'like_new', // 几乎全新
  GOOD = 'good',         // 良好
  FAIR = 'fair',         // 一般
  POOR = 'poor',         // 较差
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  condition: ProductCondition
  category: string
  images: string[]
  sellerId: string
  sellerUsername?: string // 卖家用户名
  sellerAvatar?: string // 卖家头像
  seller?: User
  status: 'draft' | 'published' | 'sold' | 'deleted'
  viewCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
  location?: string
  campus?: string
  tags?: string[]
}

// 订单相关类型
export enum OrderStatus {
  PENDING = 'pending',           // 待付款
  PAID = 'paid',                 // 已付款
  SHIPPED = 'shipped',           // 已发货
  DELIVERED = 'delivered',       // 已送达
  COMPLETED = 'completed',       // 已完成
  CANCELLED = 'cancelled',       // 已取消
  REFUNDED = 'refunded',         // 已退款
}

export interface Order {
  id: string
  productId: string
  product?: Product
  buyerId: string
  buyer?: User
  sellerId: string
  seller?: User
  price: number
  status: OrderStatus
  shippingAddress?: string
  contactPhone?: string
  note?: string
  createdAt: string
  updatedAt: string
}

// 消息相关类型
export interface Message {
  id: string
  conversationId: string
  senderId: string
  sender?: User
  receiverId: string
  receiver?: User
  content: string
  type: 'text' | 'image' | 'system'
  read: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  participantIds: string[]
  participants?: User[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

// 收藏相关类型
export interface Favorite {
  id: string
  userId: string
  productId: string
  product?: Product
  createdAt: string
}

// 智能定价相关类型
export interface PriceSuggestion {
  minPrice: number
  maxPrice: number
  recommendedPrice: number
  confidence: number
  factors: {
    condition: number
    category: number
    marketTrend: number
  }
  similarProducts: Product[]
}

export interface PriceAnalysisRequest {
  category: string
  condition: ProductCondition
  originalPrice?: number
  title: string
  description: string
}

// API响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
