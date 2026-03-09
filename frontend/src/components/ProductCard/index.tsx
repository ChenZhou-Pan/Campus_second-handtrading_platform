import React from 'react'
import { Card, Image, Tag, Space, Avatar } from 'antd'
import { EyeOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { Product, ProductCondition } from '@/types'
import { convertLocationToChinese } from '@/utils/location'
import { getCategoryLabel } from '@/data/categories'
import { getAvatarUrl } from '@/utils/avatar'
import './index.css'

interface ProductCardProps {
  product: Product
}

const conditionLabels: Record<ProductCondition, { label: string; color: string }> = {
  new: { label: '全新', color: 'green' },
  like_new: { label: '几乎全新', color: 'blue' },
  good: { label: '良好', color: 'cyan' },
  fair: { label: '一般', color: 'orange' },
  poor: { label: '较差', color: 'red' },
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate()
  const condition = conditionLabels[product.condition]
  const isSold = product.status === 'sold'

  return (
    <div
      className={`product-card glass-card ${isSold ? 'cursor-not-allowed' : 'cursor-pointer'} scale-in`}
      onClick={() => {
        if (!isSold) {
          navigate(`/products/${product.id}`)
        }
      }}
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '8px',
      }}
    >
      {/* 商品图片 - 正方形，图片完整显示并居中 */}
      <div 
        className="relative overflow-hidden" 
        style={{ 
          backgroundColor: 'transparent',
          width: '65%',
          aspectRatio: '1 / 1',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
          alt={product.title}
          preview={false}
          fallback="/placeholder.png"
          style={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            width: 'auto',
            height: 'auto',
            border: 'none',
            outline: 'none',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.png'
          }}
        />
      </div>

      {/* 商品信息 - 进一步缩小 */}
      <div style={{ padding: '4px 3px' }}>
        {/* 标题 - 更小字体 */}
        <div 
          className="line-clamp-2 text-gray-800 mb-0.5"
          style={{
            fontSize: '15px',
            lineHeight: '18px',
            minHeight: '36px',
            color: '#666',
            fontWeight: 400,
          }}
        >
          {product.title}
        </div>

        {/* 商品类别和成色 - 一行显示 */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '3px',
            flexWrap: 'wrap',
          }}
        >
          {/* 成色标签 */}
          {condition && (
            <Tag 
              color={condition.color} 
              style={{ 
                margin: 0,
                padding: '3px 10px',
                fontSize: '13px',
                lineHeight: '18px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              {condition.label}
            </Tag>
          )}
          {/* 商品类别 */}
          {product.category && (
            <span 
              style={{
                fontSize: '13px',
                color: '#888',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
                lineHeight: '24px',
                fontWeight: 400,
              }}
            >
              {getCategoryLabel(product.category)}
            </span>
          )}
        </div>

        {/* 价格 - 更小字体 */}
        <div className="flex items-center justify-between mb-0.5">
          <span 
            className="font-bold text-primary"
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: '#666',
            }}
          >
            ¥{product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span 
              style={{
                fontSize: '13px',
                color: '#aaa',
                textDecoration: 'line-through',
                marginLeft: '4px',
              }}
            >
              ¥{product.originalPrice}
            </span>
          )}
        </div>

        {/* 卖家信息 */}
        {(product.sellerUsername || product.sellerAvatar) && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '3px',
              paddingTop: '2px',
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <Avatar
              size={20}
              src={getAvatarUrl(product.sellerAvatar)}
              style={{ flexShrink: 0 }}
            />
            <span 
              style={{
                fontSize: '13px',
                color: '#888',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}
            >
              {product.sellerUsername || '未知用户'}
            </span>
          </div>
        )}

        {/* 位置信息和统计 - 底部小字 */}
        <div 
          className="text-xs text-gray-light"
          style={{
            fontSize: '13px',
            color: '#aaa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '3px',
          }}
        >
          {product.location && (
            <span 
              className="truncate flex-1"
              style={{
                maxWidth: '45%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {convertLocationToChinese(product.location)}
            </span>
          )}
          <div className="flex items-center gap-1 flex-shrink-0" style={{ marginLeft: '4px' }}>
            {/* 收藏数 - 始终显示 */}
            <span className="flex items-center gap-0.5" style={{ fontSize: '13px' }}>
              <HeartOutlined style={{ fontSize: '13px', color: '#ff4d4f' }} />
              <span>{product.favoriteCount || 0}</span>
            </span>
            {/* 浏览数 - 始终显示 */}
            <span className="flex items-center gap-0.5" style={{ fontSize: '13px' }}>
              <EyeOutlined style={{ fontSize: '13px' }} />
              <span>{product.viewCount || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
