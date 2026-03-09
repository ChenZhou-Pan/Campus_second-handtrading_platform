import React, { useEffect, useState, useCallback } from 'react'
import { Spin, Empty, Result, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilter, type FilterValues } from '@/components/ProductFilter'
import { productService } from '@/services/productService'
import { useMessage } from '@/hooks/useMessage'
import type { Product } from '@/types'

export const HomePage: React.FC = () => {
  const message = useMessage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterValues>({})

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {
        page: 1,
        pageSize: 12,
      }
      
      // 只传递非空的筛选参数
      if (filters.category) {
        params.category = filters.category
      }
      if (filters.location) {
        params.location = filters.location
      }
      if (filters.minPrice != null) {
        params.minPrice = filters.minPrice
      }
      if (filters.maxPrice != null) {
        params.maxPrice = filters.maxPrice
      }
      
      const response = await productService.getProducts(params)
      setProducts(response.data.items)
    } catch (error: any) {
      // 只在开发环境打印详细错误
      if (import.meta.env.DEV) {
        console.error('Failed to fetch products:', error)
      }
      
      const status = error.response?.status
      let errorMessage = '获取商品列表失败'
      
      if (status === 500) {
        errorMessage = '服务器暂时无法响应，请稍后重试'
        // 500错误不显示message提示，只显示在页面上，避免重复提示
      } else if (status === 404) {
        errorMessage = '请求的资源不存在'
      } else if (status === 403) {
        errorMessage = '没有权限访问'
      } else if (status === 401) {
        errorMessage = '请先登录'
      } else {
        errorMessage = error.response?.data?.message || error.message || '获取商品列表失败'
        // 其他错误显示message提示
        message.error(errorMessage)
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.location, filters.minPrice, filters.maxPrice])

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-8">
        <Result
          status="error"
          title="加载失败"
          subTitle={error}
          extra={[
            <Button type="primary" key="retry" icon={<ReloadOutlined />} onClick={fetchProducts}>
              重试
            </Button>,
          ]}
        />
      </div>
    )
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', padding: '8px 0', width: '100%' }}>
      {/* 筛选框 */}
      <div style={{ padding: '0', marginBottom: '8px' }} className="fade-in">
        <ProductFilter
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="glass-card p-8 fade-in" style={{ borderRadius: '12px' }}>
          <Result
            status="error"
            title="加载失败"
            subTitle={error}
            extra={[
              <Button type="primary" key="retry" icon={<ReloadOutlined />} onClick={fetchProducts}>
                重试
              </Button>,
            ]}
          />
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card p-8 text-center" style={{ borderRadius: '12px' }}>
          <Empty description="暂无商品" />
        </div>
      ) : (
        <div 
          className="grid product-grid fade-in"
          style={{
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '8px',
            padding: '0',
            width: '100%',
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
