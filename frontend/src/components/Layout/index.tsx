import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Dropdown, Input, Avatar } from 'antd'
import type { MenuProps } from 'antd'
import {
  HomeOutlined,
  PlusOutlined,
  MessageOutlined,
  UserOutlined,
  SearchOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CloseOutlined,
  LoginOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { getAvatarUrl } from '@/utils/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/LoginModal'
import { FloatingSidebar } from '@/components/FloatingSidebar'
import { ChatModal } from '@/components/ChatModal'
import { getSearchHistory, addSearchHistory, removeSearchHistory, clearSearchHistory, type SearchHistoryItem } from '@/utils/searchHistory'
import './index.css'

const { Header, Content, Footer } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

// 热门搜索词列表
const HOT_SEARCH_KEYWORDS = [
  '手机',
  '笔记本电脑',
  '教材',
  '耳机',
  '运动鞋',
  '化妆品',
  '电动车',
  '自行车',
  '平板电脑',
  '相机',
  '书籍',
  '衣服',
  '包包',
  '护肤品',
  '健身器材',
  '零食',
  '文具',
  '床上用品',
  '充电器',
  '智能手表',
]

// 获取随机热门搜索词
const getRandomHotKeyword = (): string => {
  const randomIndex = Math.floor(Math.random() * HOT_SEARCH_KEYWORDS.length)
  return HOT_SEARCH_KEYWORDS[randomIndex]
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [showLoginBanner, setShowLoginBanner] = useState(true)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [loginModalTab, setLoginModalTab] = useState<'login' | 'register'>('login')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [placeholderKeyword, setPlaceholderKeyword] = useState<string>(getRandomHotKeyword())
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false)
  const [chatModalVisible, setChatModalVisible] = useState(false)
  const searchInputRef = useRef<any>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // 从URL中读取keyword参数并同步到搜索框
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const keyword = searchParams.get('keyword') || ''
    setSearchKeyword(keyword)
    
    // 如果有关键词，保存到搜索历史
    if (keyword.trim()) {
      addSearchHistory(keyword.trim())
      setSearchHistory(getSearchHistory())
    }
  }, [location.search])

  // 加载搜索历史
  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  // 点击外部关闭历史记录下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowHistoryDropdown(false)
      }
    }

    if (showHistoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showHistoryDropdown])

  // 执行搜索
  const handleSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword) {
      addSearchHistory(trimmedKeyword)
      setSearchHistory(getSearchHistory())
      navigate(`/products?keyword=${encodeURIComponent(trimmedKeyword)}`)
    } else {
      navigate('/products')
    }
    setShowHistoryDropdown(false)
    searchInputRef.current?.blur()
  }

  // 删除单条历史记录
  const handleRemoveHistory = (keyword: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeSearchHistory(keyword)
    setSearchHistory(getSearchHistory())
  }

  // 清空所有历史记录
  const handleClearHistory = () => {
    clearSearchHistory()
    setSearchHistory([])
  }

  // 每3秒切换一次热门搜索词占位符
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderKeyword(getRandomHotKeyword())
    }, 3000) // 3秒更新一次

    return () => clearInterval(interval)
  }, [])

  // 当路由是/register时，自动打开模态框
  // 检测是否需要打开登录模态框（通过 sessionStorage 标记）
  React.useEffect(() => {
    // 如果用户已登录，在注册页面时跳转到主页
    if (user && location.pathname === '/register') {
      navigate('/', { replace: true })
      setLoginModalOpen(false)
      return
    }
    
    // 如果用户未登录，在注册页面时打开模态框
    if (location.pathname === '/register' && !user) {
      setLoginModalTab('register')
      setLoginModalOpen(true)
      navigate(location.pathname, { replace: true })
    }

    // 检测 sessionStorage 中的登录模态框标记
    const openLoginModalFlag = sessionStorage.getItem('openLoginModal')
    if (openLoginModalFlag && !user && location.pathname === '/') {
      const tab = openLoginModalFlag as 'login' | 'register'
      setLoginModalTab(tab)
      setLoginModalOpen(true)
      sessionStorage.removeItem('openLoginModal')
    }
  }, [location.pathname, user, navigate])

  const userMenuItems: MenuProps['items'] = user
    ? [
        { key: '/my-products', label: '我发布的', className: 'user-menu-item-capsule' },
        { key: '/my-orders', label: '我买到的', className: 'user-menu-item-capsule' },
        { key: '/my-sold-orders', label: '我卖出的', className: 'user-menu-item-capsule' },
        { key: '/favorites', label: '我的收藏', className: 'user-menu-item-capsule' },
        { type: 'divider' },
        { key: 'logout', label: '退出登录', className: 'user-menu-item-capsule' },
      ]
    : []

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout()
      // 关闭登录模态框
      setLoginModalOpen(false)
      // 退出登录后跳转到主页，使用replace避免返回登录页
      navigate('/', { replace: true })
    } else {
      navigate(key)
    }
  }

  const handleOrdersClick = () => {
    if (user) {
      navigate('/my-orders')
    } else {
      setLoginModalTab('login')
      setLoginModalOpen(true)
    }
  }

  // 移动端底部导航
  const bottomNavItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/products', icon: <AppstoreOutlined />, label: '分类' },
    ...(user ? [{ key: '/publish', icon: <PlusOutlined />, label: '发布' }] : []),
    { key: '/messages', icon: <MessageOutlined />, label: '消息' },
    { key: user ? '/profile' : '/profile-or-login', icon: <UserOutlined />, label: '我的' },
  ]

  return (
    <AntLayout className="min-h-screen" style={{ background: 'transparent' }}>
      {/* 顶部导航栏 - macOS毛玻璃风格 */}
      <Header 
        className="sticky top-0 z-50 px-0 glass-effect-dark" 
        style={{ 
          height: '64px',
          backgroundColor: 'rgba(227, 242, 253, 0.6)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(187, 222, 251, 0.4)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
        }}
      >
        <div className="flex items-center h-full w-full px-4 md:px-6">
            {/* Logo */}
            <div
              className="logo-text cursor-pointer"
              onClick={() => navigate('/')}
              style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                marginRight: '16px',
                flexShrink: 0,
                color: '#666',
              }}
            >
              象牙市集
            </div>

            {/* 搜索框 */}
            <div className="flex-1 max-w-2xl" ref={searchContainerRef} style={{ position: 'relative' }}>
              <div 
                className="goofish-search-bar glass-effect"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  height: '44px',
                  padding: '3px',
                  gap: '4px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
                  e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(0, 0, 0, 0.1)';
                }}
              >
                <Input
                  ref={searchInputRef}
                  placeholder={placeholderKeyword}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onPressEnter={(e) => {
                    const value = (e.target as HTMLInputElement).value
                    handleSearch(value)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (searchHistory.length > 0) {
                      setShowHistoryDropdown(true)
                    }
                  }}
                  onFocus={(e) => {
                    e.stopPropagation()
                    if (searchHistory.length > 0) {
                      setShowHistoryDropdown(true)
                    }
                  }}
                  size="large"
                  style={{
                    flex: 1,
                    border: 'none',
                    boxShadow: 'none',
                    paddingLeft: '18px',
                    height: '100%',
                    backgroundColor: 'transparent',
                  }}
                  className="goofish-search-input-field-desktop"
                />
                <div
                  onClick={() => {
                    handleSearch(searchKeyword)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '0 12px',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(227, 242, 253, 0.8)',
                    backdropFilter: 'blur(10px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                    height: '32px',
                    borderRadius: '16px',
                    flexShrink: 0,
                    marginRight: '3px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px 0 rgba(144, 202, 249, 0.2)',
                    border: '1px solid rgba(187, 222, 251, 0.5)',
                    color: '#1a1a1a',
                  }}
                  className="goofish-search-button"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.95)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(144, 202, 249, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.8)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(144, 202, 249, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.5)';
                  }}
                >
                  <SearchOutlined style={{ fontSize: '16px', color: '#1a1a1a' }} />
                  <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}>搜索</span>
                </div>
              </div>

              {/* 搜索历史下拉菜单 */}
              {showHistoryDropdown && searchHistory.length > 0 && (
                <div
                  className="search-history-dropdown glass-card"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    borderRadius: '12px',
                    padding: '8px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      marginBottom: '4px',
                      borderBottom: '1px solid rgba(187, 222, 251, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
                      <ClockCircleOutlined style={{ marginRight: '6px' }} />
                      搜索历史
                    </span>
                    <span
                      onClick={handleClearHistory}
                      style={{
                        fontSize: '12px',
                        color: '#999',
                        cursor: 'pointer',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#666';
                        e.currentTarget.style.backgroundColor = 'rgba(187, 222, 251, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#999';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      清空
                    </span>
                  </div>
                  {searchHistory.map((item) => (
                    <div
                      key={item.keyword}
                      onClick={() => handleSearch(item.keyword)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'all 0.2s',
                        marginBottom: '2px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '14px',
                            color: '#1a1a1a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.keyword}
                        </span>
                      </div>
                      <DeleteOutlined
                        onClick={(e) => handleRemoveHistory(item.keyword, e)}
                        style={{
                          fontSize: '14px',
                          color: '#999',
                          padding: '4px',
                          borderRadius: '4px',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#666';
                          e.currentTarget.style.backgroundColor = 'rgba(187, 222, 251, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#999';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center gap-4 ml-auto">
              {user ? (
                <Dropdown
                  menu={{
                    items: userMenuItems,
                    onClick: handleMenuClick,
                  }}
                  placement="bottomLeft"
                  trigger={['hover']}
                >
                  <div 
                    className="cursor-pointer flex items-center gap-2" 
                    style={{ color: '#fff' }}
                    onClick={() => navigate('/profile')}
                  >
                    <Avatar 
                      src={getAvatarUrl(user.avatar)} 
                      size={32}
                      style={{ 
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#fff' }}>{user.username}</span>
                  </div>
                </Dropdown>
              ) : (
                <div
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => {
                    setLoginModalTab('login')
                    setLoginModalOpen(true)
                  }}
                  style={{ color: '#fff' }}
                >
                  <UserOutlined style={{ fontSize: '18px', color: '#fff' }} />
                  <span style={{ fontSize: '14px', marginLeft: '4px', color: '#fff' }}>登录</span>
                </div>
              )}
              <div
                className="cursor-pointer flex items-center gap-1"
                onClick={handleOrdersClick}
                style={{ color: '#fff' }}
              >
                <FileTextOutlined style={{ fontSize: '18px', color: '#fff' }} />
                <span style={{ fontSize: '14px', marginLeft: '4px', color: '#fff' }}>订单</span>
              </div>
            </div>
        </div>
      </Header>

      <Content 
        className="pb-16 md:pb-6 fade-in" 
        style={{ 
          paddingBottom: !user && showLoginBanner ? '80px' : '60px',
          minHeight: 'calc(100vh - 64px)',
          background: 'transparent',
        }}
      >
        <div className="w-full px-2 md:px-4 py-2 md:py-4">
          {children}
        </div>
      </Content>

      {/* 移动端底部导航栏 - macOS毛玻璃风格 */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 glass-effect z-50" 
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(187, 222, 251, 0.4)',
          boxShadow: '0 -8px 32px 0 rgba(144, 202, 249, 0.15)',
        }}
      >
        <div className="flex justify-around items-center" style={{ height: '50px' }}>
          {bottomNavItems.map((item) => {
            const isActive = (item.key === '/profile-or-login' && location.pathname === '/profile') ||
              (location.pathname === item.key) || 
              (item.key === '/products' && location.pathname.startsWith('/products'))
            return (
              <div
                key={item.key}
                className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-text'
                }`}
                style={{ 
                  fontSize: isActive ? '20px' : '20px',
                  color: isActive ? '#1a1a1a' : '#4a4a4a'
                }}
                onClick={() => {
                  if (item.key === '/publish') {
                    if (!user) {
                      setLoginModalTab('login')
                      setLoginModalOpen(true)
                      return
                    }
                    navigate(item.key)
                    return
                  }
                  if (item.key === '/messages') {
                    if (!user) {
                      setLoginModalTab('login')
                      setLoginModalOpen(true)
                      return
                    }
                    setChatModalVisible(true)
                    return
                  }
                  if (item.key === '/profile-or-login' && !user) {
                    setLoginModalTab('login')
                    setLoginModalOpen(true)
                    return
                  }
                  if (item.key === '/profile-or-login') {
                    navigate('/profile')
                    return
                  }
                  navigate(item.key)
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '2px' }}>{item.icon}</div>
                <div style={{ fontSize: '11px', lineHeight: '1' }}>{item.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 桌面端页脚 */}
      <Footer 
        className="hidden md:block text-center glass-effect text-gray-text text-sm py-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(187, 222, 251, 0.4)',
        }}
      >
        象牙市集 ©2026
      </Footer>

      {/* 未登录时底部登录提示横幅 */}
      {!user && showLoginBanner && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center px-4 md:px-8 py-3 glass-effect-dark"
          style={{
            backgroundColor: 'rgba(227, 242, 253, 0.7)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderTop: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 -8px 32px 0 rgba(144, 202, 249, 0.2)',
          }}
        >
          <div className="flex items-center gap-4 md:gap-6">
            {/* 图标 */}
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(227, 242, 253, 0.8)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(187, 222, 251, 0.5)',
                boxShadow: '0 2px 8px 0 rgba(144, 202, 249, 0.2)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LoginOutlined 
                style={{ 
                  fontSize: '20px', 
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }} 
              />
            </div>
            {/* 提示文字 */}
            <span style={{ color: '#fff', fontSize: '14px' }}>
              登录后可以更懂你,推荐你喜欢的商品!
            </span>
            {/* 立即登录按钮 */}
            <button
              onClick={() => {
                setLoginModalTab('login')
                setLoginModalOpen(true)
              }}
              style={{
                backgroundColor: 'rgba(227, 242, 253, 0.8)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                color: '#1a1a1a',
                border: '1px solid rgba(187, 222, 251, 0.5)',
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px 0 rgba(144, 202, 249, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.95)'
                e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.7)'
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(144, 202, 249, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.8)'
                e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.5)'
                e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(144, 202, 249, 0.2)'
              }}
            >
              立即登录
            </button>
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowLoginBanner(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloseOutlined style={{ fontSize: '16px' }} />
            </button>
          </div>
        </div>
      )}

      {/* 右侧悬浮栏 - 在注册页面不显示 */}
      {location.pathname !== '/register' && (
        <FloatingSidebar />
      )}

      {/* 登录/注册模态框 */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false)
          // 如果当前在/register页面，关闭模态框后跳转到首页
          if (location.pathname === '/register') {
            navigate('/', { replace: true })
          }
        }}
        defaultTab={loginModalTab}
      />

      {/* 消息弹窗 */}
      <ChatModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
      />
    </AntLayout>
  )
}
