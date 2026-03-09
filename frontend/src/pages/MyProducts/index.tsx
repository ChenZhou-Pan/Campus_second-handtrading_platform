import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Button, Tag, Empty, Pagination, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import { productService } from '@/services/productService'
import { useMessage } from '@/hooks/useMessage'
import type { Product } from '@/types'

export const MyProductsPage: React.FC = () => {
  const navigate = useNavigate()
  const message = useMessage()
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || undefined // 获取URL参数中的status
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
  })

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, statusFilter])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await productService.getMyProducts({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: statusFilter, // 传递status参数给后端
      })
      // 过滤掉已删除的商品（status为deleted）
      const filteredProducts = response.data.items.filter((p: Product) => p.status !== 'deleted')
      setProducts(filteredProducts)
      // 使用后端返回的总数
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }))
    } catch (error) {
      message.error('获取商品列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async (id: string) => {
    try {
      await productService.updateProduct(id, { status: 'draft' })
      message.success('下架成功')
      fetchProducts()
    } catch (error: any) {
      message.error(error.message || '下架失败')
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await productService.updateProduct(id, { status: 'published' })
      message.success('上架成功')
      fetchProducts()
    } catch (error: any) {
      message.error(error.message || '上架失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await productService.deleteProduct(id)
      message.success('删除成功')
      // 从列表中移除该商品
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }))
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: '已下架', color: 'orange' },
      published: { label: '已发布', color: 'green' },
      sold: { label: '已售出', color: 'blue' },
      deleted: { label: '已删除', color: 'red' },
    }
    const statusInfo = statusMap[status] || { label: status, color: 'default' }
    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', padding: '8px 0' }}>
      <div 
        className="mb-4 px-2 glass-card fade-in" 
        style={{ 
          padding: '12px 16px', 
          margin: '0 8px 8px 8px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(187, 222, 251, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
        }}
      >
        <h1 className="text-xl font-bold" style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
          {statusFilter === 'sold' ? '我卖出的' : '我发布的'}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div style={{ color: '#666' }}>加载中...</div>
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
          <Empty
            description={statusFilter === 'sold' ? '暂无卖出记录' : '还没有发布商品'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {statusFilter !== 'sold' && (
              <Button type="primary" onClick={() => navigate('/publish')}>
                立即发布
              </Button>
            )}
          </Empty>
        </div>
      ) : (
        <>
          <div 
            className="grid product-grid"
            style={{
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '4px',
              padding: '0 4px',
            }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="glass-card fade-in" 
                style={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  marginBottom: '4px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(187, 222, 251, 0.5)',
                  boxShadow: '0 4px 16px 0 rgba(144, 202, 249, 0.15)',
                }}
              >
                <Card
                  hoverable={false}
                  style={{ 
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                  }}
                  styles={{ 
                    body: { 
                      padding: '4px 3px',
                      background: 'transparent',
                    },
                    actions: {
                      background: 'transparent',
                      borderTop: '1px solid rgba(187, 222, 251, 0.3)',
                    },
                  }}
                  cover={
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
                      <img
                        src={product.images[0] || '/placeholder.png'}
                        alt={product.title}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          width: 'auto',
                          height: 'auto',
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        {getStatusTag(product.status)}
                      </div>
                    </div>
                  }
                  actions={
                    product.status === 'sold' ? [
                      // 已售出的商品只显示查看详情
                      <Button
                        key="view"
                        type="link"
                        onClick={() => navigate(`/products/${product.id}`)}
                        size="small"
                      >
                        查看详情
                      </Button>,
                    ] : product.status === 'published' ? [
                      <Button
                        key="edit"
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        size="small"
                      >
                        编辑
                      </Button>,
                      <Button
                        key="unpublish"
                        type="link"
                        icon={<DownOutlined />}
                        onClick={() => handleUnpublish(product.id)}
                        size="small"
                        style={{ color: '#ff9800' }}
                      >
                        下架
                      </Button>,
                    ] : product.status === 'draft' ? [
                      <Button
                        key="publish"
                        type="link"
                        icon={<UpOutlined />}
                        onClick={() => handlePublish(product.id)}
                        size="small"
                      >
                        上架
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="确定要删除这个商品吗？删除后无法恢复"
                        onConfirm={() => handleDelete(product.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small">
                          删除
                        </Button>
                      </Popconfirm>,
                    ] : [
                      <Button
                        key="edit"
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        size="small"
                      >
                        编辑
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="确定要删除这个商品吗？删除后无法恢复"
                        onConfirm={() => handleDelete(product.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small">
                          删除
                        </Button>
                      </Popconfirm>,
                    ]
                  }
                >
                  <Card.Meta
                    title={
                      <div className="line-clamp-2 text-sm font-medium" style={{ fontSize: '11px', lineHeight: '14px', minHeight: '28px', color: '#333', fontWeight: 400, marginBottom: '2px' }}>
                        {product.title}
                      </div>
                    }
                    description={
                      <div>
                        <div className="text-base font-bold text-primary mb-0.5" style={{ fontSize: '13px', fontWeight: 600, color: '#1890ff' }}>
                          ¥{product.price}
                        </div>
                        <div className="text-xs text-gray-500" style={{ fontSize: '9px', color: '#999' }}>
                          浏览 {product.viewCount || 0} | 收藏 {product.favoriteCount || 0}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </div>
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
