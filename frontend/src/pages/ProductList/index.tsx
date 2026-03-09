import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Spin, Empty, Pagination, Result } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilter, type FilterValues } from '@/components/ProductFilter'
import { productService } from '@/services/productService'
import { useMessage } from '@/hooks/useMessage'
import type { Product } from '@/types'

export const ProductListPage: React.FC = () => {
  const message = useMessage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
  })

  const [keyword, setKeyword] = useState<string>(searchParams.get('keyword') || '')
  const [filters, setFilters] = useState<FilterValues>({
    category: searchParams.get('category') || undefined,
    location: searchParams.get('location') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
  })

  useEffect(() => {
    // 从URL参数更新filters和keyword
    const keywordParam = searchParams.get('keyword') || ''
    setKeyword(keywordParam)
    setFilters({
      category: searchParams.get('category') || undefined,
      location: searchParams.get('location') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.category, filters.location, filters.minPrice, filters.maxPrice, keyword])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      }
      
      // 只传递非空的筛选参数
      if (keyword.trim()) {
        params.keyword = keyword.trim()
      }
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
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }))
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

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
    
    // 更新URL参数，保留keyword
    const newParams = new URLSearchParams()
    if (keyword.trim()) {
      newParams.set('keyword', keyword.trim())
    }
    if (newFilters.category) {
      newParams.set('category', newFilters.category)
    }
    if (newFilters.location) {
      newParams.set('location', newFilters.location)
    }
    if (newFilters.minPrice != null) {
      newParams.set('minPrice', newFilters.minPrice.toString())
    }
    if (newFilters.maxPrice != null) {
      newParams.set('maxPrice', newFilters.maxPrice.toString())
    }
    setSearchParams(newParams)
  }, [setSearchParams, keyword])

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', padding: '8px 0' }} className="fade-in">
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
        <div className="glass-card p-8 fade-in" style={{ borderRadius: '12px', margin: '8px' }}>
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
        <div className="glass-card p-8 text-center fade-in" style={{ borderRadius: '12px', margin: '8px' }}>
          <Empty description={keyword ? `未找到与"${keyword}"相关的商品` : '暂无商品'} />
        </div>
      ) : (
        <>
          <div 
            className="grid product-grid fade-in"
            style={{
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '8px',
              padding: '0',
              margin: '0',
              width: '100%',
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
            }}
          >
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  )
}
