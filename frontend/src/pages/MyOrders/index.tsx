import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Empty, Pagination, Popconfirm, message } from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { orderService } from '@/services/orderService'
import type { Order, OrderStatus } from '@/types'

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: '待付款', color: 'orange' },
  paid: { label: '已付款', color: 'blue' },
  shipped: { label: '已发货', color: 'cyan' },
  delivered: { label: '已送达', color: 'green' },
  completed: { label: '已完成', color: 'success' },
  cancelled: { label: '已取消', color: 'default' },
  refunded: { label: '已退款', color: 'red' },
}

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  })
  // 固定为buyer角色，不再支持切换
  const role: 'buyer' = 'buyer'

  useEffect(() => {
    fetchOrders()
  }, [pagination.page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await orderService.getOrders({ 
        role,
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
      setOrders(response.data.items)
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }))
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的订单')
      return
    }

    // 验证选中的订单是否都是已取消状态
    const selectedOrders = orders.filter(order => selectedRowKeys.includes(order.id))
    const nonCancelledOrders = selectedOrders.filter(order => order.status !== 'cancelled')
    
    if (nonCancelledOrders.length > 0) {
      message.error('只能删除已取消的订单')
      return
    }

    try {
      // 批量删除
      const deletePromises = selectedRowKeys.map(key => 
        orderService.deleteOrder(key as string)
      )
      await Promise.all(deletePromises)
      
      message.success(`成功删除 ${selectedRowKeys.length} 个订单`)
      setSelectedRowKeys([])
      fetchOrders()
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败')
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      // 只允许选择已取消的订单
      const validKeys = selectedKeys.filter(key => {
        const order = orders.find(o => o.id === key)
        return order && order.status === 'cancelled'
      })
      setSelectedRowKeys(validKeys)
      
      // 如果有无效的选择，提示用户
      if (selectedKeys.length !== validKeys.length) {
        message.warning('只能选择已取消的订单进行删除')
      }
    },
    getCheckboxProps: (record: Order) => ({
      disabled: record.status !== 'cancelled',
    }),
  }

  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (id: string) => <span className="font-mono text-sm">{id.slice(0, 8)}...</span>,
    },
    {
      title: '商品',
      key: 'product',
      align: 'center',
      render: (_: any, record: Order) => (
        <div>
          <div className="font-medium">{record.product?.title || '商品已删除'}</div>
          {record.product && (
            <div className="text-sm text-gray-500">
              {role === 'buyer' 
                ? `卖家: ${record.seller?.username || '未知用户'}` 
                : `买家: ${record.buyer?.username || '未知用户'}`}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (price: number) => <span className="font-bold text-primary">¥{price}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      onHeaderCell: () => ({
        style: { textAlign: 'center' },
      }),
      onCell: () => ({
        style: { textAlign: 'center', padding: '16px' },
      }),
      render: (status: OrderStatus) => {
        const statusInfo = statusLabels[status]
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%',
            margin: '0 auto'
          }}>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </div>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      onCell: () => ({
        style: { textAlign: 'center' },
      }),
      render: (date: string) => (
        <div style={{ textAlign: 'center', width: '100%' }}>
          {new Date(date).toLocaleString('zh-CN')}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_: any, record: Order) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', padding: '8px 0' }}>
      <div 
        className="mb-6 flex justify-between items-center glass-card fade-in" 
        style={{ 
          padding: '16px 20px',
          margin: '0 8px 8px 8px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(187, 222, 251, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: '#1a1a1a', margin: 0 }}>
          我买到的
        </h1>
        {selectedRowKeys.length > 0 && (
          <Popconfirm
            title="确定要删除选中的订单吗？"
            description={`将删除 ${selectedRowKeys.length} 个已取消的订单，删除后无法恢复`}
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div style={{ color: '#666' }}>加载中...</div>
        </div>
      ) : orders.length === 0 ? (
        <div 
          className="glass-card fade-in" 
          style={{ 
            padding: '40px',
            margin: '0 8px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
          }}
        >
          <Empty description="暂无购买记录" />
        </div>
      ) : (
        <>
          <style>{`
            .ant-table-tbody > tr > td {
              text-align: center !important;
            }
            .ant-table-thead > tr > th {
              text-align: center !important;
            }
            /* 状态列是第4列（订单号、商品、价格、状态） */
            .ant-table-thead > tr > th:nth-child(4),
            .ant-table-tbody > tr > td:nth-child(4) {
              text-align: center !important;
            }
            .ant-table-tbody > tr > td:nth-child(4) > div {
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              width: 100% !important;
              margin: 0 auto !important;
            }
            .ant-table-thead > tr > th:nth-child(4) {
              text-align: center !important;
            }
            /* 表格毛玻璃样式 */
            .ant-table {
              background: rgba(255, 255, 255, 0.75) !important;
              backdrop-filter: blur(20px) saturate(180%) !important;
              -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
              border: 1px solid rgba(187, 222, 251, 0.5) !important;
              border-radius: 12px !important;
              overflow: hidden !important;
            }
            .ant-table-thead > tr > th {
              background: rgba(227, 242, 253, 0.3) !important;
              border-bottom: 1px solid rgba(187, 222, 251, 0.4) !important;
            }
            .ant-table-tbody > tr > td {
              border-bottom: 1px solid rgba(187, 222, 251, 0.2) !important;
            }
            .ant-table-tbody > tr:hover > td {
              background: rgba(227, 242, 253, 0.2) !important;
            }
          `}</style>
          <div 
            className="glass-card fade-in" 
            style={{ 
              margin: '0 8px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(187, 222, 251, 0.5)',
              boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
              overflow: 'hidden',
            }}
          >
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={false}
              style={{ width: '100%', background: 'transparent' }}
            />
          </div>
          <div 
            className="flex justify-center mt-4 glass-card fade-in" 
            style={{ 
              padding: '16px',
              margin: '16px 8px 8px 8px',
              borderRadius: '12px',
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
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  )
}
