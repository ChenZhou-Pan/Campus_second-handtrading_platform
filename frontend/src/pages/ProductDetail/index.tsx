import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Spin,
  Image,
  Tag,
  Button,
  Space,
  Descriptions,
  Card,
  Avatar,
  message,
} from 'antd'
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  ShoppingCartOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { productService } from '@/services/productService'
import { orderService } from '@/services/orderService'
import { messageService } from '@/services/messageService'
import { useAuth } from '@/contexts/AuthContext'
import { useLoginModal } from '@/hooks/useLoginModal'
import { ChatModal } from '@/components/ChatModal'
import type { Product } from '@/types'
import { getAvatarUrl } from '@/utils/avatar'
import { convertLocationToChinese, getLocationWithSchool } from '@/utils/location'
import { getCategoryLabel } from '@/data/categories'

const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: '全新', color: 'green' },
  like_new: { label: '几乎全新', color: 'blue' },
  good: { label: '良好', color: 'cyan' },
  fair: { label: '一般', color: 'orange' },
  poor: { label: '较差', color: 'red' },
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openLoginModal } = useLoginModal()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [chatModalVisible, setChatModalVisible] = useState(false)
  const [chatUserId, setChatUserId] = useState<string | undefined>()
  const contactButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (id) {
      fetchProduct()
      setCurrentImageIndex(0) // 重置图片索引
    }
  }, [id])

  useEffect(() => {
    // 当用户登录状态或商品ID变化时，检查收藏状态
    if (id && user && product) {
      checkFavoriteStatus()
    } else if (!user) {
      setFavorited(false)
    }
  }, [id, user, product?.id])

  const checkFavoriteStatus = async () => {
    if (!id || !user) return
    try {
      const favoriteResponse = await productService.checkFavorite(id)
      setFavorited(favoriteResponse.data)
    } catch (error) {
      // 如果检查失败，默认为未收藏
      setFavorited(false)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await productService.getProductById(id!)
      setProduct(response.data)
    } catch (error) {
      message.error('获取商品信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      message.warning('请先登录')
      openLoginModal('login')
      return
    }

    if (!product) return

    // 检查是否是自己的商品
    if (user.id === product.sellerId) {
      message.warning('不能收藏自己的商品')
      return
    }

    if (!product) return

    // 检查是否是自己的商品
    if (product.sellerId === user.id) {
      message.warning('不能收藏自己发布的商品')
      return
    }

    try {
      if (favorited) {
        await productService.unfavoriteProduct(id!)
        setFavorited(false)
        message.success('已取消收藏')
        // 更新商品收藏数
        if (product) {
          setProduct({ ...product, favoriteCount: Math.max(0, (product.favoriteCount || 0) - 1) })
        }
      } else {
        await productService.favoriteProduct(id!)
        setFavorited(true)
        message.success('已收藏')
        // 更新商品收藏数
        if (product) {
          setProduct({ ...product, favoriteCount: (product.favoriteCount || 0) + 1 })
        }
      }
    } catch (error: any) {
      // 显示后端返回的错误消息
      const errorMessage = error?.response?.data?.message || error?.message || '操作失败'
      message.error(errorMessage)
    }
  }

  const handleContact = async (e: React.MouseEvent<HTMLElement>) => {
    if (!user) {
      message.warning('请先登录')
      openLoginModal('login')
      return
    }

    if (!product) return

    // 检查是否是自己的商品
    if (user.id === product.sellerId) {
      message.warning('不能联系自己')
      return
    }

    // 打开聊天弹窗，传入卖家ID和商品ID
    setChatUserId(product.sellerId)
    setChatModalVisible(true)
    // 移除按钮焦点，恢复默认状态
    if (e.currentTarget) {
      e.currentTarget.blur()
    }
  }

  const handleBuy = async () => {
    if (!user) {
      message.warning('请先登录')
      openLoginModal('login')
      return
    }

    if (!product) return

    // 检查是否是自己的商品
    if (user.id === product.sellerId) {
      message.warning('不能购买自己的商品')
      return
    }

    if (!product) return

    if (product.sellerId === user.id) {
      message.warning('不能购买自己的商品')
      return
    }

    setOrdering(true)
    try {
      const response = await orderService.createOrder({
        productId: product.id,
      })
      message.success('订单创建成功')
      navigate(`/orders/${response.data.id}`)
    } catch (error: any) {
      message.error(error.message || '创建订单失败')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  if (!product) {
    return <div>商品不存在</div>
  }

  const condition = conditionLabels[product.condition] || {
    label: product.condition,
    color: 'default',
  }

  return (
    <div className="max-w-full mx-auto" style={{ background: 'transparent', minHeight: '100vh', padding: '8px 0' }}>
      {/* 商品图片和信息 - 共用一个毛玻璃卡片 */}
      <div 
        className="glass-card fade-in"
        style={{ 
          margin: '0 8px 16px 8px',
          padding: '20px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(187, 222, 251, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* 商品图片 - 闲鱼风格 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '400px' }}>
            <div style={{ width: '100%', maxWidth: '100%', position: 'relative', margin: '0 auto' }}>
              <Image.PreviewGroup>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <Image
                    src={product.images[currentImageIndex] || '/placeholder.png'}
                    alt={product.title}
                    style={{ 
                      borderRadius: '8px', 
                      backgroundColor: 'transparent', 
                      width: '100%', 
                      maxWidth: '100%',
                      height: 'auto', 
                      maxHeight: '500px',
                      objectFit: 'contain',
                      display: 'block', 
                      margin: '0 auto' 
                    }}
                  />
                {product.images.length > 1 && (
                  <>
                    {/* 左箭头按钮 */}
                    <Button
                      type="text"
                      icon={<LeftOutlined style={{ fontSize: '24px', color: '#333' }} />}
                      onClick={() => {
                        setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
                      }}
                      className="image-nav-button"
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        padding: 0,
                        transition: 'transform 0.2s ease-in-out',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.2)'
                      }}
                    />
                    {/* 右箭头按钮 */}
                    <Button
                      type="text"
                      icon={<RightOutlined style={{ fontSize: '24px', color: '#333' }} />}
                      onClick={() => {
                        setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
                      }}
                      className="image-nav-button"
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        padding: 0,
                        transition: 'transform 0.2s ease-in-out',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.2)'
                      }}
                    />
                    {/* 图片指示器 */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-32px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                        border: '1px solid rgba(187, 222, 251, 0.5)',
                        color: '#1a1a1a',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 2px 8px rgba(144, 202, 249, 0.2)',
                      }}
                    >
                      {currentImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </div>
              </Image.PreviewGroup>
            </div>
          </div>

          {/* 商品信息 - 闲鱼风格 */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '400px' }}>
          <h1 className="text-xl font-bold mb-3" style={{ fontSize: '18px', fontWeight: 600, lineHeight: '24px', color: '#1a1a1a' }}>
            {product.title}
          </h1>
          
          {/* 卖家信息 - 显示在商品标题下方 */}
          {product.sellerId && (
            <div 
              className="mb-4 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/users/${product.sellerId}/profile`)}
            >
              <Avatar 
                src={product.sellerAvatar ? getAvatarUrl(product.sellerAvatar) : undefined} 
                size="small"
                style={{ cursor: 'pointer' }}
              >
                {(product.sellerUsername || 'U').charAt(0)}
              </Avatar>
              <span 
                className="text-blue-500 hover:underline"
                style={{ fontSize: '14px' }}
              >
                {product.sellerUsername || '未知用户'}
              </span>
            </div>
          )}
          
          <div className="mb-4">
            <span className="text-2xl font-bold text-primary mr-2" style={{ fontSize: '24px', fontWeight: 600 }}>
              ¥{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through" style={{ fontSize: '14px' }}>
                ¥{product.originalPrice}
              </span>
            )}
          </div>
          <div className="mb-6">
            <Tag color={condition.color} className="mb-2" style={{ fontSize: '12px' }}>
              {condition.label}
            </Tag>
            <div className="text-gray-600 text-xs" style={{ fontSize: '12px', marginTop: '8px' }}>
              <Space>
                <span>浏览 {product.viewCount}</span>
                <span>收藏 {product.favoriteCount}</span>
              </Space>
            </div>
          </div>

          <Space direction="vertical" size="middle" className="w-full">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              block
              onClick={handleBuy}
              loading={ordering}
              disabled={product.status !== 'published' || user?.id === product?.sellerId}
              style={{ height: '44px', fontSize: '16px', fontWeight: 600, borderRadius: '4px' }}
            >
              {user?.id === product?.sellerId ? '不能购买自己的商品' : product.status === 'published' ? '立即购买' : '商品已下架'}
            </Button>
            <div className="flex gap-2">
              <Button
                icon={favorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined style={{ color: '#ff4d4f' }} />}
                onClick={handleFavorite}
                block
                disabled={user?.id === product?.sellerId}
                style={{ height: '40px', borderRadius: '4px' }}
              >
                {favorited ? '已收藏' : '收藏'}
              </Button>
              <Button
                ref={contactButtonRef}
                icon={<MessageOutlined />}
                onClick={handleContact}
                block
                disabled={user?.id === product?.sellerId}
                style={{ height: '40px', borderRadius: '4px' }}
                onBlur={(e) => {
                  // 确保失去焦点时恢复默认样式
                  e.currentTarget.style.background = ''
                  e.currentTarget.style.backgroundColor = ''
                }}
              >
                联系卖家
              </Button>
            </div>
          </Space>
          </div>
        </div>
      </div>

      {/* 商品详情 - 闲鱼风格 */}
      <Card 
        title={<span style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>商品详情</span>} 
        className="mb-6 mx-4 md:mx-6 glass-card fade-in"
        style={{ 
          borderRadius: '12px', 
          border: '1px solid rgba(187, 222, 251, 0.5)',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
        }}
        styles={{
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(187, 222, 251, 0.3)',
            padding: '16px 20px',
          },
          body: {
            background: 'transparent',
            padding: '20px',
          },
        }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={<span style={{ fontSize: '14px' }}>商品描述</span>}>
            <span style={{ fontSize: '14px', lineHeight: '22px' }}>
              {product.description || '暂无描述'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ fontSize: '14px' }}>商品类别</span>}>
            <span style={{ fontSize: '14px' }}>{getCategoryLabel(product.category)}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ fontSize: '14px' }}>商品成色</span>}>
            <Tag color={condition.color} style={{ fontSize: '12px' }}>{condition.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ fontSize: '14px' }}>所在学校</span>}>
            <span style={{ fontSize: '14px' }}>
              {(() => {
                const locationWithSchool = getLocationWithSchool(product.location)
                // 验证 campus 是否是有效的校区名称（不应该是纯数字或空字符串）
                const isValidCampus = product.campus && 
                  product.campus.trim() !== '' && 
                  !/^\d+$/.test(product.campus.trim()) // 不是纯数字
                
                if (locationWithSchool && isValidCampus) {
                  return `${locationWithSchool} - ${product.campus.trim()}`
                } else if (locationWithSchool) {
                  return locationWithSchool
                } else if (isValidCampus) {
                  return product.campus.trim()
                }
                return locationWithSchool || '未设置'
              })()}
            </span>
          </Descriptions.Item>
          {product.tags && product.tags.length > 0 && (
            <Descriptions.Item label={<span style={{ fontSize: '14px' }}>标签</span>}>
              <Space>
                {product.tags.map((tag) => (
                  <Tag key={tag} style={{ fontSize: '12px' }}>{tag}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          )}
          <Descriptions.Item label={<span style={{ fontSize: '14px' }}>发布时间</span>}>
            <span style={{ fontSize: '14px' }}>
              {new Date(product.createdAt).toLocaleString('zh-CN')}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 聊天弹窗 */}
      <ChatModal
        visible={chatModalVisible}
        onClose={() => {
          setChatModalVisible(false)
          setChatUserId(undefined)
          // 弹窗关闭时，移除联系卖家按钮的焦点，恢复默认状态
          setTimeout(() => {
            if (contactButtonRef.current) {
              contactButtonRef.current.blur()
              contactButtonRef.current.style.background = ''
              contactButtonRef.current.style.backgroundColor = ''
            }
          }, 100)
        }}
        initialUserId={chatUserId}
        productId={product?.id}
      />
    </div>
  )
}
