import React, { useState } from 'react'
import { Layout, Menu, Button } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  MessageOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { adminService } from '@/services/adminService'

const { Header, Sider, Content } = Layout

interface LayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据统计',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: '订单管理',
    },
    {
      key: '/feedbacks',
      icon: <MessageOutlined />,
      label: '反馈管理',
    },
  ]

  const handleLogout = () => {
    adminService.logout()
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: 'rgba(227, 242, 253, 0.5)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRight: '1px solid rgba(187, 222, 251, 0.3)',
          boxShadow: '2px 0 8px rgba(144, 202, 249, 0.1)',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#1a1a1a', 
          fontSize: collapsed ? 16 : 18, 
          fontWeight: 'bold',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(187, 222, 251, 0.2)',
          padding: collapsed ? '0 8px' : '0 16px',
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {collapsed ? '象牙' : '象牙集市管理系统'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
          }}
        />
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        <Header style={{ 
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(187, 222, 251, 0.3)',
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(144, 202, 249, 0.1)',
        }}>
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, color: '#1a1a1a' }}
          >
            {collapsed ? '☰' : '☰'}
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 77, 79, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 77, 79, 0.6)',
            }}
          >
            退出登录
          </Button>
        </Header>
        <Content style={{ 
          margin: '24px', 
          padding: 24, 
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(187, 222, 251, 0.5)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(144, 202, 249, 0.15)',
          minHeight: 280 
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
