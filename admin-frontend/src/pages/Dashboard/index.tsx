import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Spin } from 'antd'
import { UserOutlined, ShoppingOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons'
import { adminService, Statistics } from '@/services/adminService'

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Statistics | null>(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await adminService.getStatistics()
      setStats(response.data)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '24px', color: '#1a1a1a' }}>数据统计</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic
              title="总用户数"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1a1a1a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic
              title="总商品数"
              value={stats?.totalProducts || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1a1a1a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic
              title="总订单数"
              value={stats?.totalOrders || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1a1a1a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic
              title="总收入"
              value={stats?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#1a1a1a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic 
              title="已发布商品" 
              value={stats?.publishedProducts || 0}
              valueStyle={{ color: '#1a1a1a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic 
              title="已售出商品" 
              value={stats?.soldProducts || 0}
              valueStyle={{ color: '#1a1a1a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic 
              title="待处理订单" 
              value={stats?.pendingOrders || 0}
              valueStyle={{ color: '#1a1a1a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic 
              title="已完成订单" 
              value={stats?.completedOrders || 0}
              valueStyle={{ color: '#1a1a1a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
