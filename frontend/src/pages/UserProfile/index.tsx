import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Avatar,
  Button,
  Space,
  Rate,
  Tabs,
  Empty,
  Spin,
  message,
  Tag,
} from 'antd'
import { UserOutlined, HeartOutlined, HeartFilled, MessageOutlined } from '@ant-design/icons'
import { ProductCard } from '@/components/ProductCard'
import { ChatModal } from '@/components/ChatModal'
import { useAuth } from '@/contexts/AuthContext'
import { useLoginModal } from '@/hooks/useLoginModal'
import { getAvatarUrl } from '@/utils/avatar'
import type { Product, User } from '@/types'

interface UserProfile {
  user: User
  products: Product[]
  creditScore: number
  ratingCount: number
  followingCount: number
  followerCount: number
  isFollowing: boolean
}

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { openLoginModal } = useLoginModal()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [chatModalVisible, setChatModalVisible] = useState(false)
  const contactButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const fetchProfile = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/users/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
        setFollowing(data.data.isFollowing)
      } else {
        message.error('获取用户信息失败')
      }
    } catch (error) {
      message.error('获取用户信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!userId) return
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/follows/${userId}`, {
        method: following ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.ok) {
        setFollowing(!following)
        message.success(following ? '取消关注成功' : '关注成功')
        fetchProfile()
      } else {
        message.error(following ? '取消关注失败' : '关注失败')
      }
    } catch (error) {
      message.error(following ? '取消关注失败' : '关注失败')
    }
  }

  const handleContact = (e: React.MouseEvent<HTMLElement>) => {
    if (!currentUser) {
      message.warning('请先登录')
      openLoginModal('login')
      return
    }

    if (!userId) return

    // 检查是否是自己的资料
    if (currentUser.id === userId) {
      message.warning('不能联系自己')
      return
    }

    // 打开聊天弹窗
    setChatModalVisible(true)
    // 移除按钮焦点，恢复默认状态
    if (e.currentTarget) {
      e.currentTarget.blur()
    }
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" style={{ background: 'transparent' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto" style={{ background: 'transparent', minHeight: '100vh', padding: '8px 0' }}>
        <div className="glass-card p-8 text-center fade-in" style={{ borderRadius: '12px', margin: '0 8px' }}>
          <div>用户不存在</div>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === userId

  return (
    <div className="max-w-4xl mx-auto" style={{ background: 'transparent', minHeight: '100vh', padding: '8px 0' }}>
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
          },
        }}
      >
        <div className="flex items-center gap-6">
          <Avatar 
            src={profile.user.avatar} 
            size={80}
            icon={<UserOutlined />}
          />
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>{profile.user.username}</h1>
              {!isOwnProfile && (
                <Space>
                  <Button
                    type={following ? 'default' : 'primary'}
                    icon={following ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined style={{ color: '#ff4d4f' }} />}
                    onClick={handleFollow}
                  >
                    {following ? '已关注' : '关注'}
                  </Button>
                  <Button
                    ref={contactButtonRef}
                    icon={<MessageOutlined />}
                    onClick={handleContact}
                    onBlur={(e) => {
                      // 确保失去焦点时恢复默认样式
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.backgroundColor = ''
                    }}
                  >
                    联系
                  </Button>
                </Space>
              )}
            </div>
            <div className="flex items-center gap-6 mb-4" style={{ color: '#666' }}>
              <div>
                <span className="font-medium" style={{ color: '#333' }}>信用等级：</span>
                {profile.ratingCount > 0 ? (
                  <>
                    <Rate disabled defaultValue={profile.creditScore} allowHalf style={{ fontSize: 16 }} />
                    <span className="ml-2" style={{ color: '#666' }}>({profile.creditScore.toFixed(1)})</span>
                    <span className="text-sm ml-2" style={{ color: '#999' }}>
                      ({profile.ratingCount} 条评价)
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#999' }}>暂无评价</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="font-medium" style={{ color: '#333' }}>关注：</span>
                <span style={{ color: '#666' }}>
                  {profile.followingCount}
                </span>
              </div>
              <div>
                <span className="font-medium" style={{ color: '#333' }}>粉丝：</span>
                <span style={{ color: '#666' }}>
                  {profile.followerCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card 
        className="glass-card fade-in"
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
          },
        }}
      >
        <Tabs
          defaultActiveKey="products"
          items={[
            {
              key: 'products',
              label: <span style={{ color: '#1a1a1a' }}>发布的商品</span>,
              children: (
                <div>
                  {profile.products.length === 0 ? (
                    <Empty description="暂无发布的商品" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profile.products.map((product) => (
                        <div key={product.id} className="relative">
                          {product.status === 'sold' && (
                            <div className="absolute top-2 right-2 z-10">
                              <Tag color="red">已售出</Tag>
                            </div>
                          )}
                          <div
                            style={{
                              opacity: product.status === 'sold' ? 0.6 : 1,
                            }}
                          >
                            <ProductCard product={product} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 聊天弹窗 */}
      <ChatModal
        visible={chatModalVisible}
        onClose={() => {
          setChatModalVisible(false)
          // 弹窗关闭时，移除联系按钮的焦点，恢复默认状态
          setTimeout(() => {
            if (contactButtonRef.current) {
              contactButtonRef.current.blur()
              contactButtonRef.current.style.background = ''
              contactButtonRef.current.style.backgroundColor = ''
            }
          }, 100)
        }}
        initialUserId={userId}
      />
    </div>
  )
}
