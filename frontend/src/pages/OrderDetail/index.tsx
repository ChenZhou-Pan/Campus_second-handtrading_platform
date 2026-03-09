import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Image,
  message,
  Spin,
  Popconfirm,
  Rate,
  Avatar,
} from 'antd'
import { orderService } from '@/services/orderService'
import { useAuth } from '@/contexts/AuthContext'
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

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hasRated, setHasRated] = useState(false)

  useEffect(() => {
    if (id) {
      fetchOrder()
      checkRated()
    }
  }, [id])
  
  const checkRated = async () => {
    if (!id) return
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/ratings/orders/${id}/check`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setHasRated(data.data)
      }
    } catch (error) {
      console.error('检查评分状态失败:', error)
    }
  }
  
  const handleRating = async () => {
    if (!id) return
    if (rating === 0) {
      message.error('请选择评分')
      return
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/ratings/orders/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rating }),
      })
      
      if (response.ok) {
        message.success('评分成功')
        setShowRatingModal(false)
        setRating(0)
        setHasRated(true)
        fetchOrder()
      } else {
        const error = await response.json()
        message.error(error.message || '评分失败')
      }
    } catch (error) {
      message.error('评分失败')
    }
  }

  const fetchOrder = async () => {
    try {
      const response = await orderService.getOrderById(id!)
      setOrder(response.data)
    } catch (error) {
      message.error('获取订单信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!id) return
    try {
      await orderService.updateOrderStatus(id, status)
      message.success('操作成功')
      fetchOrder()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handlePayment = async () => {
    if (!id) return
    try {
      console.log('🚀 开始创建支付请求...')
      
      // 获取支付HTML
      const paymentHtml = await orderService.createAlipayPayment(id)
      console.log('✅ 收到支付HTML，长度:', paymentHtml.length)
      
      // 创建临时容器来解析HTML
      const tempDiv = document.createElement('div')
      tempDiv.style.display = 'none'
      tempDiv.innerHTML = paymentHtml.trim()
      document.body.appendChild(tempDiv)
      
      // 查找表单
      const form = tempDiv.querySelector('form')
      if (!form) {
        document.body.removeChild(tempDiv)
        message.error('支付表单格式错误')
        return
      }
      
      // 检查表单
      const hiddenInputs = form.querySelectorAll('input[type="hidden"]')
      console.log('📋 表单信息:')
      console.log('  - 隐藏字段数量:', hiddenInputs.length)
      if (hiddenInputs.length > 0) {
        const bizContent = Array.from(hiddenInputs).find((input: any) => input.name === 'biz_content')
        if (bizContent) {
          try {
            const bizData = JSON.parse(bizContent.value)
            console.log('  - 订单号:', bizData.out_trade_no)
            console.log('  - 订单金额:', bizData.total_amount)
            console.log('  - 订单标题:', bizData.subject)
          } catch (e) {
            console.log('  - biz_content:', bizContent.value?.substring(0, 100))
          }
        }
      }
      
      // 创建新窗口（使用about:blank确保是空白页面）
      const paymentWindow = window.open('about:blank', '_blank', 'width=800,height=600')
      
      if (paymentWindow) {
        // 在新窗口中写入完整的HTML文档
        // 支付宝返回的HTML包含自动提交脚本，会自动POST表单到支付宝
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>正在跳转到支付宝支付...</title>
</head>
<body>
${paymentHtml.trim()}
</body>
</html>`
        
        // 写入新窗口
        try {
          paymentWindow.document.open()
          paymentWindow.document.write(fullHtml)
          paymentWindow.document.close()
          console.log('✅ HTML已成功写入支付窗口')
        } catch (writeError) {
          console.error('❌ 写入HTML失败:', writeError)
          message.error('无法打开支付页面，请重试')
          paymentWindow.close()
          document.body.removeChild(tempDiv)
          return
        }
        
        console.log('⏳ 等待表单自动提交到支付宝...')
        
        // 清理临时容器
        document.body.removeChild(tempDiv)
        
        // 检查跳转状态
        setTimeout(() => {
          try {
            const currentUrl = paymentWindow.location.href
            console.log('📍 支付窗口URL:', currentUrl)
            
            if (currentUrl.includes('alipay') || currentUrl.includes('alipaydev')) {
              console.log('✅ 已成功跳转到支付宝支付页面')
              message.success('已跳转到支付宝，请完成支付')
            } else if (currentUrl === 'about:blank' || currentUrl.includes('about:')) {
              console.log('⏳ 表单可能还未提交，继续等待...')
              
              // 检查表单是否存在，如果存在但未提交，手动触发
              setTimeout(() => {
                try {
                  if (paymentWindow.document?.forms?.length > 0) {
                    const windowForm = paymentWindow.document.forms[0]
                    const formAction = windowForm.action
                    console.log('📤 检测到表单，action:', formAction)
                    
                    if (formAction.includes('alipay')) {
                      console.log('✅ 表单action指向支付宝，等待自动提交...')
                    } else {
                      console.log('⚠️  表单action异常:', formAction)
                    }
                  }
                } catch (e) {
                  console.log('⚠️  无法检查表单（可能已跳转）:', e.message)
                }
              }, 200)
            } else {
              console.log('⚠️  未知的URL:', currentUrl)
            }
          } catch (e) {
            // 跨域限制是正常的，说明已经跳转到支付宝了
            console.log('✅ 无法访问支付窗口URL（已跳转到支付宝，这是正常的）')
          }
        }, 300)
        
        // 监听支付窗口关闭，刷新订单状态
        const checkInterval = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkInterval)
            console.log('🔄 支付窗口已关闭，刷新订单状态')
            message.info('支付窗口已关闭，请手动刷新订单状态查看支付结果')
            // 延迟一下再刷新
            setTimeout(() => {
              fetchOrder()
            }, 500)
          }
        }, 1000)
      } else {
        // 如果无法打开新窗口，在当前窗口提交
        console.log('⚠️  无法打开新窗口，在当前窗口提交支付表单')
        form.setAttribute('target', '_self')
        document.body.appendChild(form)
        form.submit()
        
        // 清理临时容器
        document.body.removeChild(tempDiv)
      }
    } catch (error: any) {
      console.error('❌ 支付错误:', error)
      message.error(error.message || '创建支付失败')
    }
  }

  const handleCancel = async () => {
    if (!id) return
    try {
      await orderService.cancelOrder(id)
      message.success('订单已取消')
      fetchOrder()
    } catch (error) {
      message.error('取消失败')
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await orderService.deleteOrder(id)
      message.success('订单已删除')
      navigate('/orders')
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败')
    }
  }

  const handleRefund = async () => {
    if (!id) return
    try {
      await orderService.refundOrder(id)
      message.success('退款申请成功')
      fetchOrder()
    } catch (error: any) {
      message.error(error.response?.data?.message || '退款失败')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" style={{ background: 'transparent' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!order) {
    return (
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
          textAlign: 'center',
          color: '#1a1a1a',
        }}
      >
        订单不存在
      </div>
    )
  }

  const isBuyer = order.buyerId === user?.id
  const statusInfo = statusLabels[order.status]

  return (
    <div className="max-w-4xl mx-auto" style={{ background: 'transparent', minHeight: '100vh', padding: '8px 0' }}>
      <h1 
        className="text-2xl font-bold mb-6 glass-card fade-in" 
        style={{ 
          padding: '16px 20px',
          margin: '0 8px 16px 8px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(187, 222, 251, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
          color: '#1a1a1a',
        }}
      >
        订单详情
      </h1>

      <Card 
        className="mb-6 glass-card fade-in"
        style={{ 
          margin: '0 8px 16px 8px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(187, 222, 251, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
        }}
        styles={{
          body: {
            background: 'transparent',
            padding: '20px',
          },
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <Tag color={statusInfo.color} className="text-base px-3 py-1">
            {statusInfo.label}
          </Tag>
          <div className="text-sm text-gray-500">
            订单号: {order.id}
          </div>
        </div>

        {order.product && (
          <div 
            className="flex gap-4 mb-6 p-4 rounded"
            style={{
              background: 'rgba(227, 242, 253, 0.3)',
              backdropFilter: 'blur(10px) saturate(180%)',
              WebkitBackdropFilter: 'blur(10px) saturate(180%)',
              border: '1px solid rgba(187, 222, 251, 0.4)',
              borderRadius: '12px',
            }}
          >
            <Image
              src={order.product.images[0] || '/placeholder.png'}
              alt={order.product.title}
              width={120}
              height={120}
              className="object-cover rounded"
              style={{ borderRadius: '8px' }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2" style={{ color: '#1a1a1a' }}>{order.product.title}</h3>
              <div className="text-xl font-bold text-primary" style={{ color: '#1a1a1a' }}>¥{order.price}</div>
            </div>
          </div>
        )}

        <Descriptions column={1} bordered>
          <Descriptions.Item label={isBuyer ? '卖家' : '买家'}>
            <div className="flex items-center gap-2">
              <Avatar 
                src={isBuyer ? order.seller?.avatar : order.buyer?.avatar} 
                size="small"
                onClick={() => navigate(`/users/${isBuyer ? order.sellerId : order.buyerId}/profile`)}
                style={{ cursor: 'pointer' }}
              >
                {(isBuyer ? order.seller?.username : order.buyer?.username)?.charAt(0) || 'U'}
              </Avatar>
              <span 
                className="text-blue-500 cursor-pointer hover:underline"
                onClick={() => navigate(`/users/${isBuyer ? order.sellerId : order.buyerId}/profile`)}
              >
                {isBuyer 
                  ? (order.seller?.username || '未知用户')
                  : (order.buyer?.username || '未知用户')}
              </span>
            </div>
          </Descriptions.Item>
          {order.shippingAddress && (
            <Descriptions.Item label="收货地址">
              {order.shippingAddress}
            </Descriptions.Item>
          )}
          {order.contactPhone && (
            <Descriptions.Item label="联系电话">
              {order.contactPhone}
            </Descriptions.Item>
          )}
          {order.note && (
            <Descriptions.Item label="备注">
              {order.note}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="创建时间">
            {new Date(order.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(order.updatedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card 
        className="glass-card fade-in"
        style={{ 
          margin: '0 8px 16px 8px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(187, 222, 251, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
        }}
        styles={{
          body: {
            background: 'transparent',
            padding: '20px',
          },
        }}
      >
        <div className="text-lg font-medium mb-4" style={{ color: '#1a1a1a' }}>订单操作</div>
        <Space>
          {isBuyer && order.status === 'pending' && (
            <>
              <Button type="primary" onClick={handlePayment}>
                确认付款
              </Button>
              <Button onClick={handleCancel}>取消订单</Button>
              <Button 
                type="default" 
                onClick={() => handleStatusUpdate('paid')}
                style={{ marginLeft: 8 }}
              >
                我已支付完成
              </Button>
            </>
          )}
          {isBuyer && order.status === 'paid' && (
            <>
              <Button type="primary" onClick={() => handleStatusUpdate('completed')}>
                确认收货
              </Button>
              <Popconfirm
                title="确定要申请退款吗？"
                description="退款后订单将无法恢复，商品将重新上架"
                onConfirm={handleRefund}
                okText="确定"
                cancelText="取消"
              >
                <Button type="default" danger>
                  退款
                </Button>
              </Popconfirm>
            </>
          )}
          {isBuyer && order.status === 'delivered' && (
            <Button type="primary" onClick={() => handleStatusUpdate('completed')}>
              确认收货
            </Button>
          )}
          {(order.status === 'completed' && !hasRated) && (
            <Button 
              type="default" 
              onClick={() => setShowRatingModal(true)}
            >
              评价
            </Button>
          )}
          {!isBuyer && order.status === 'paid' && (
            <>
              <Button type="primary" onClick={() => handleStatusUpdate('shipped')}>
                确认发货
              </Button>
              <Popconfirm
                title="确定不卖了吗？"
                description="退款后订单将无法恢复，钱将退回买家账户，商品将重新上架"
                onConfirm={handleRefund}
                okText="确定"
                cancelText="取消"
              >
                <Button type="default" danger style={{ marginLeft: 8 }}>
                  不卖了
                </Button>
              </Popconfirm>
            </>
          )}
          {!isBuyer && order.status === 'shipped' && (
            <Button type="primary" onClick={() => handleStatusUpdate('delivered')}>
              确认送达
            </Button>
          )}
          {order.status === 'cancelled' && (
            <Popconfirm
              title="确定要删除此订单吗？"
              description="删除后无法恢复"
              onConfirm={handleDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button type="default" danger>
                删除订单
              </Button>
            </Popconfirm>
          )}
        </Space>
        {isBuyer && order.status === 'pending' && (
          <div className="mt-4 text-sm text-gray-500">
            💡 提示：在支付宝完成支付后，请点击"我已支付完成"按钮更新订单状态
          </div>
        )}
      </Card>
      
      {/* 评分弹窗 */}
      {showRatingModal && (
        <Card 
          className="mt-4 glass-card fade-in"
          style={{ 
            margin: '0 8px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
          }}
          styles={{
            body: {
              background: 'transparent',
              padding: '20px',
            },
          }}
        >
          <div className="text-lg font-medium mb-4" style={{ color: '#1a1a1a' }}>评价</div>
          <div className="mb-4">
            <Rate value={rating} onChange={setRating} />
          </div>
          <Space>
            <Button type="primary" onClick={handleRating}>
              提交评价
            </Button>
            <Button onClick={() => {
              setShowRatingModal(false)
              setRating(0)
            }}>
              取消
            </Button>
          </Space>
        </Card>
      )}
    </div>
  )
}
