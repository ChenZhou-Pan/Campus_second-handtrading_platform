import React, { useState, useEffect } from 'react'
import { Row, Col, Empty, Pagination, Spin } from 'antd'
import { ProductCard } from '@/components/ProductCard'
import { productService } from '@/services/productService'
import type { Product, PaginatedResponse } from '@/types'

export const FavoritesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
  })

  useEffect(() => {
    fetchFavorites()
  }, [pagination.page])

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const response = await productService.getFavorites({
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
      setProducts(response.data.items)
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }))
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', padding: '8px 0' }}>
      <h1 
        className="text-xl font-bold mb-4 glass-card fade-in" 
        style={{ 
          fontSize: '18px', 
          fontWeight: 600, 
          padding: '12px 16px',
          margin: '0 8px 8px 8px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(187, 222, 251, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
          color: '#1a1a1a',
        }}
      >
        我的收藏
      </h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : products.length === 0 ? (
        <div 
          className="glass-card p-8 text-center fade-in" 
          style={{ 
            borderRadius: '12px', 
            margin: '0 8px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
          }}
        >
          <Empty description="还没有收藏商品" />
        </div>
      ) : (
        <>
          <div 
            className="grid product-grid"
            style={{
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              padding: '0 4px',
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div 
            className="mt-6 flex justify-center glass-card p-4 fade-in" 
            style={{ 
              borderRadius: '12px', 
              marginTop: '16px',
              margin: '16px 8px 8px 8px',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(187, 222, 251, 0.5)',
              boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
            }}
          >
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            />
          </div>
        </>
      )}
    </div>
  )
}
