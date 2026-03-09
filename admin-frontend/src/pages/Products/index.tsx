import React, { useEffect, useState } from 'react'
import { Table, Button, Popconfirm, message, Tag, Modal, Select } from 'antd'
import { adminService, Product } from '@/services/adminService'
import type { ColumnsType } from 'antd/es/table'

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await adminService.getAllProducts()
      console.log('商品列表响应:', response)
      
      // 处理响应数据
      let productsList: Product[] = []
      if (response) {
        // 如果响应是 ApiResponse 格式
        if (response.data) {
          productsList = Array.isArray(response.data) ? response.data : []
        } 
        // 如果响应直接是数组（拦截器已处理）
        else if (Array.isArray(response)) {
          productsList = response
        }
      }
      
      // 处理 images 字段（从 JSON 字符串转换为数组）
      productsList = productsList.map((product: any) => {
        if (product.images && typeof product.images === 'string') {
          try {
            product.images = JSON.parse(product.images)
          } catch (e) {
            console.warn('解析 images JSON 失败:', e)
            product.images = []
          }
        }
        return product
      })
      
      setProducts(productsList)
      console.log('处理后的商品列表:', productsList)
    } catch (error: any) {
      console.error('获取商品列表失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '获取商品列表失败'
      message.error(errorMessage)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteProduct(id)
      message.success('删除成功')
      fetchProducts()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const handleStatusChange = (product: Product) => {
    setEditingProduct(product)
    setNewStatus(product.status)
    setStatusModalVisible(true)
  }

  const handleUpdateStatus = async () => {
    if (!editingProduct) return
    try {
      await adminService.updateProductStatus(editingProduct.id, newStatus)
      message.success('更新成功')
      setStatusModalVisible(false)
      fetchProducts()
    } catch (error: any) {
      message.error(error.message || '更新失败')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      published: 'green',
      sold: 'blue',
      deleted: 'red',
    }
    return colors[status] || 'default'
  }

  const columns: ColumnsType<Product> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
    },
    {
      title: '收藏数',
      dataIndex: 'favoriteCount',
      key: 'favoriteCount',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleStatusChange(record)}>
            修改状态
          </Button>
          <Popconfirm
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '24px', color: '#1a1a1a' }}>商品管理</h1>
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="修改商品状态"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={handleUpdateStatus}
      >
        <Select
          value={newStatus}
          onChange={setNewStatus}
          style={{ width: '100%' }}
        >
          <Select.Option value="draft">草稿</Select.Option>
          <Select.Option value="published">已发布</Select.Option>
          <Select.Option value="sold">已售出</Select.Option>
          <Select.Option value="deleted">已删除</Select.Option>
        </Select>
      </Modal>
    </div>
  )
}
