import React, { useEffect, useState } from 'react'
import { Table, Tag, message } from 'antd'
import { adminService, Order } from '@/services/adminService'
import type { ColumnsType } from 'antd/es/table'

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await adminService.getAllOrders()
      console.log('订单列表响应:', response)
      
      // 处理响应数据
      let ordersList: Order[] = []
      if (response) {
        // 如果响应是 ApiResponse 格式
        if (response.data) {
          ordersList = Array.isArray(response.data) ? response.data : []
        } 
        // 如果响应直接是数组（拦截器已处理）
        else if (Array.isArray(response)) {
          ordersList = response
        }
      }
      
      setOrders(ordersList)
      console.log('处理后的订单列表:', ordersList)
    } catch (error: any) {
      console.error('获取订单列表失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '获取订单列表失败'
      message.error(errorMessage)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      paid: 'blue',
      shipped: 'cyan',
      delivered: 'purple',
      completed: 'green',
      cancelled: 'red',
      refunded: 'default',
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待支付',
      paid: '已支付',
      shipped: '已发货',
      delivered: '已送达',
      completed: '已完成',
      cancelled: '已取消',
      refunded: '已退款',
    }
    return statusMap[status] || status
  }

  const columns: ColumnsType<Order> = [
    {
      title: '订单金额',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => `¥${price.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: '待支付', value: 'pending' },
        { text: '已支付', value: 'paid' },
        { text: '已发货', value: 'shipped' },
        { text: '已送达', value: 'delivered' },
        { text: '已完成', value: 'completed' },
        { text: '已取消', value: 'cancelled' },
        { text: '已退款', value: 'refunded' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '买家',
      dataIndex: 'buyerPhone',
      key: 'buyerPhone',
      width: 150,
      render: (phone: string, record: Order) => {
        if (phone) {
          return phone
        }
        if (record.buyerUsername) {
          return record.buyerUsername
        }
        return '-'
      },
    },
    {
      title: '卖家',
      dataIndex: 'sellerPhone',
      key: 'sellerPhone',
      width: 150,
      render: (phone: string, record: Order) => {
        if (phone) {
          return phone
        }
        if (record.sellerUsername) {
          return record.sellerUsername
        }
        return '-'
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend' as const,
    },
  ]

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '24px', color: '#1a1a1a' }}>订单管理</h1>
      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}
