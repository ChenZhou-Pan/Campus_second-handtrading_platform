import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  App,
  Tabs,
  Row,
  Col,
  Modal,
  Space,
  Descriptions,
  Progress,
  Empty,
} from 'antd'
import { Image as AntdImage } from 'antd'
import {
  UserOutlined,
  CameraOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import { getAvatarUrl } from '@/utils/avatar'
import { useMessage } from '@/hooks/useMessage'
import { useLoginModal } from '@/hooks/useLoginModal'
import type { TabsProps } from 'antd'
import type { User } from '@/types'
import './index.css'

// 密码强度检查
const getPasswordStrength = (password: string): { score: number; text: string; color: string } => {
  if (!password) return { score: 0, text: '', color: '' }
  
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  const strengthMap = [
    { text: '很弱', color: '#ff4d4f' },
    { text: '弱', color: '#ff7875' },
    { text: '一般', color: '#ffa940' },
    { text: '中等', color: '#52c41a' },
    { text: '强', color: '#389e0d' },
    { text: '很强', color: '#237804' },
  ]

  return {
    score: Math.min(score, 5),
    text: strengthMap[Math.min(score, 5)]?.text || '',
    color: strengthMap[Math.min(score, 5)]?.color || '',
  }
}

// 格式化手机号（中间四位用****替换）
const formatPhoneNumber = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

// 修改手机号表单组件
const UpdatePhoneForm: React.FC<{ user: User; onSuccess: (updatedUser?: User) => void }> = ({ user: initialUser, onSuccess }) => {
  const { user, updateUser: updateGlobalUser, logout } = useAuth()
  const message = useMessage()
  const navigate = useNavigate()
  const { openLoginModal } = useLoginModal()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'verifyOld' | 'verifyNew'>('verifyOld')
  const [oldCodeCountdown, setOldCodeCountdown] = useState(0)
  const [newCodeCountdown, setNewCodeCountdown] = useState(0)
  const [oldPhoneVerified, setOldPhoneVerified] = useState(false)
  // 保存已验证的原手机号和验证码
  const [verifiedOldPhone, setVerifiedOldPhone] = useState<string>('')
  const [verifiedOldCode, setVerifiedOldCode] = useState<string>('')
  
  // 监听新手机号字段的变化
  const newPhone = Form.useWatch('newPhone', form)
  // 监听原手机号字段的变化
  const oldPhone = Form.useWatch('oldPhone', form)

  const sendOldCode = async () => {
    try {
      const oldPhone = form.getFieldValue('oldPhone')
      const currentUser = user || initialUser
      if (!oldPhone) {
        message.error('请输入原手机号')
        return
      }
      if (oldPhone !== currentUser.phone) {
        message.error('原手机号不正确')
        return
      }
      await authService.sendVerificationCode(oldPhone)
      message.success('验证码已发送')
      setOldCodeCountdown(60)
      const timer = setInterval(() => {
        setOldCodeCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      message.error(error?.response?.data?.message || '发送验证码失败')
    }
  }

  const verifyOldPhone = async () => {
    try {
      const oldPhone = form.getFieldValue('oldPhone')
      const oldCode = form.getFieldValue('oldCode')
      const currentUser = user || initialUser
      
      if (!oldPhone) {
        message.error('请输入原手机号')
        return
      }
      if (oldPhone !== currentUser.phone) {
        message.error('原手机号不正确')
        return
      }
      if (!oldCode) {
        message.error('请输入验证码')
        return
      }

      // 验证原手机号验证码（不删除验证码，因为最终提交时还需要验证）
      await authService.verifyCode(oldPhone, oldCode, false)
      // 保存已验证的原手机号和验证码
      setVerifiedOldPhone(oldPhone)
      setVerifiedOldCode(oldCode)
      setOldPhoneVerified(true)
      setStep('verifyNew')
      message.success('原手机号验证成功')
    } catch (error: any) {
      message.error(error?.response?.data?.message || '验证码错误或已过期')
    }
  }

  const sendNewCode = async () => {
    try {
      const newPhone = form.getFieldValue('newPhone')
      const currentUser = user || initialUser
      
      if (!newPhone || !newPhone.match(/^1[3-9]\d{9}$/)) {
        message.error('请输入正确的新手机号')
        return
      }
      
      // 检查新手机号不能与原手机号相同
      if (newPhone === currentUser.phone) {
        message.error('新手机号不能与原手机号相同')
        return
      }
      
      await authService.sendVerificationCode(newPhone)
      message.success('验证码已发送')
      setNewCodeCountdown(60)
      const timer = setInterval(() => {
        setNewCodeCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      message.error(error?.response?.data?.message || '发送验证码失败')
    }
  }

  const handleSubmit = async (values: any) => {
    // 验证新手机号不能与原手机号相同
    const currentUser = user || initialUser
    if (values.newPhone === currentUser.phone) {
      message.error('新手机号不能与原手机号相同')
      return
    }
    
    // 使用保存的已验证的原手机号和验证码
    const oldPhone = verifiedOldPhone || values.oldPhone
    const oldCode = verifiedOldCode || values.oldCode
    
    if (!oldPhone || !oldCode) {
      message.error('原手机号验证信息丢失，请重新验证')
      setStep('verifyOld')
      setOldPhoneVerified(false)
      return
    }
    
    setLoading(true)
    try {
      const response = await authService.updatePhone(oldPhone, oldCode, values.newPhone, values.newCode)
      
      message.success('手机号更新成功')
      form.resetFields()
      setStep('verifyOld')
      setOldPhoneVerified(false)
      // 清空保存的验证信息
      setVerifiedOldPhone('')
      setVerifiedOldCode('')
      
      // 使用后端返回的更新后的用户数据
      // response 已经是 ApiResponse<User>，response.data 是 User 对象
      const updatedUser = response?.data
      if (updatedUser && updatedUser.phone) {
        // 立即更新全局用户状态
        updateGlobalUser(updatedUser)
        // 调用 onSuccess 回调，让父组件也更新状态
        onSuccess(updatedUser)
      } else {
        // 如果响应中没有用户数据，重新获取
        onSuccess()
      }
      
      // 修改手机号成功后，退出登录并跳转到主页，打开登录弹窗
      setTimeout(() => {
        logout()
        navigate('/')
        openLoginModal('login')
        message.info('手机号已修改，请重新登录')
      }, 500)
    } catch (error: any) {
      console.error('更新手机号失败:', error)
      message.error(error?.response?.data?.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'verifyOld') {
    return (
      <Form form={form} layout="vertical" style={{ width: '100%' }}>
        <Form.Item
          name="oldPhone"
          label="原手机号"
          rules={[{ required: true, message: '请输入原手机号' }]}
          style={{ marginBottom: 20 }}
        >
          <Input placeholder="请输入原手机号" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="oldCode"
          label="验证码"
          rules={[{ required: true, message: '请输入验证码' }]}
          style={{ marginBottom: 20 }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input placeholder="请输入验证码" style={{ flex: 1 }} />
            <Button 
              onClick={sendOldCode} 
              disabled={oldCodeCountdown > 0 || (() => {
                const currentUser = user || initialUser
                return !oldPhone || oldPhone !== currentUser.phone
              })()}
              style={{ width: '120px', flexShrink: 0 }}
            >
              {oldCodeCountdown > 0 ? `${oldCodeCountdown}秒` : '发送验证码'}
            </Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" onClick={verifyOldPhone} block>
            确定
          </Button>
        </Form.Item>
      </Form>
    )
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="newPhone"
        label="新手机号"
        rules={[
          { required: true, message: '请输入新手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              const currentUser = user || initialUser
              if (!value || value !== currentUser.phone) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('新手机号不能与原手机号相同'))
            },
          }),
        ]}
      >
        <Input placeholder="请输入新手机号" />
      </Form.Item>
      <Form.Item
        name="newCode"
        label="验证码"
        rules={[{ required: true, message: '请输入验证码' }]}
      >
        <Space.Compact style={{ width: '100%' }}>
          <Input placeholder="请输入验证码" style={{ flex: 1 }} />
          <Button 
            onClick={sendNewCode} 
            disabled={newCodeCountdown > 0 || (() => {
              const currentUser = user || initialUser
              return newPhone === currentUser.phone
            })()}
            style={{ width: '120px' }}
          >
            {newCodeCountdown > 0 ? `${newCodeCountdown}秒` : '发送验证码'}
          </Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          确认修改
        </Button>
      </Form.Item>
    </Form>
  )
}

// 修改密码表单组件
const UpdatePasswordForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { user, logout } = useAuth()
  const message = useMessage()
  const navigate = useNavigate()
  const { openLoginModal } = useLoginModal()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' })
  
  // 监听新密码字段变化
  const newPassword = Form.useWatch('newPassword', form)
  
  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(getPasswordStrength(newPassword))
    } else {
      setPasswordStrength({ score: 0, text: '', color: '' })
    }
  }, [newPassword])

  const sendCode = async () => {
    try {
      const phone = user.phone
      if (!phone) {
        message.error('请先绑定手机号')
        return
      }
      await authService.sendVerificationCode(phone)
      message.success('验证码已发送')
      setCodeCountdown(60)
      const timer = setInterval(() => {
        setCodeCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      message.error(error?.response?.data?.message || '发送验证码失败')
    }
  }

  const handleSubmit = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    setLoading(true)
    try {
      await authService.updatePassword(user.phone!, values.code, values.newPassword)
      message.success('密码更新成功')
      form.resetFields()
      if (onSuccess) {
        onSuccess()
      }
      
      // 修改密码成功后，退出登录并跳转到主页，打开登录弹窗
      setTimeout(() => {
        logout()
        navigate('/')
        openLoginModal('login')
        message.info('密码已修改，请重新登录')
      }, 500)
    } catch (error: any) {
      message.error(error?.response?.data?.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user.phone) {
    return <div style={{ color: '#999' }}>请先绑定手机号</div>
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ width: '100%' }}>
      <Form.Item
        name="code"
        label={`获取${formatPhoneNumber(user.phone!)}验证码`}
        rules={[{ required: true, message: '请输入验证码' }]}
        style={{ marginBottom: 20 }}
      >
        <Space.Compact style={{ width: '100%' }}>
          <Input placeholder="请输入验证码" style={{ flex: 1 }} />
          <Button 
            onClick={sendCode} 
            disabled={codeCountdown > 0}
            style={{ width: '120px', flexShrink: 0 }}
          >
            {codeCountdown > 0 ? `${codeCountdown}秒` : '发送验证码'}
          </Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        name="newPassword"
        label="新密码"
        rules={[
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码长度至少6位' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              // 注意：由于原密码是加密存储的，前端无法直接比较
              // 这里只做基本验证，实际验证需要在后端通过尝试登录来验证
              if (!value) {
                return Promise.resolve()
              }
              return Promise.resolve()
            },
          }),
        ]}
        style={{ marginBottom: passwordStrength.score > 0 ? 8 : 20 }}
      >
        <div>
          <Input.Password 
            placeholder="请输入新密码" 
            style={{ width: '100%' }}
            onChange={(e) => {
              setPasswordStrength(getPasswordStrength(e.target.value))
            }}
          />
          {passwordStrength.score > 0 && (
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={(passwordStrength.score / 5) * 100}
                showInfo={false}
                strokeColor={passwordStrength.color}
                size="small"
                style={{ marginBottom: 4 }}
              />
              <div style={{ fontSize: '12px', color: passwordStrength.color }}>
                密码强度：{passwordStrength.text}
              </div>
            </div>
          )}
        </div>
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="确认新密码"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: '请确认新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('两次输入的密码不一致'))
            },
          }),
        ]}
        style={{ marginBottom: 20 }}
      >
        <Input.Password placeholder="请再次输入新密码" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          确认修改
        </Button>
      </Form.Item>
    </Form>
  )
}

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const message = useMessage()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('menu')
  const [avatarPreviewVisible, setAvatarPreviewVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [profileModalVisible, setProfileModalVisible] = useState(false)
  const [securityModalVisible, setSecurityModalVisible] = useState(false)
  const [phoneModalVisible, setPhoneModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [securityStep, setSecurityStep] = useState<'select' | 'phone' | 'password'>('select')
  const [editForm] = Form.useForm()
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    transactions: true,
    settings: false,
  })
  const [followingCount, setFollowingCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [followModalVisible, setFollowModalVisible] = useState(false)
  const [followModalType, setFollowModalType] = useState<'following' | 'followers'>('following')
  const [followList, setFollowList] = useState<any[]>([])
  const [followListLoading, setFollowListLoading] = useState(false)

  // 根据当前路由判断哪个菜单项应该高亮
  const getActiveMenuKey = () => {
    const pathname = location.pathname
    const search = location.search
    
    if (pathname === '/my-products') {
      if (search.includes('status=sold')) {
        return 'sold'
      }
      return 'published'
    }
    if (pathname === '/my-orders') {
      return 'orders'
    }
    if (pathname === '/favorites') {
      return 'favorites'
    }
    return null
  }

  const activeMenuKey = getActiveMenuKey()

  useEffect(() => {
    if (user && editModalVisible) {
      editForm.setFieldsValue({
        username: user.username,
        email: user.email,
      })
    }
  }, [user, editModalVisible, editForm])

  useEffect(() => {
    if (user?.id) {
      fetchFollowStats()
    }
  }, [user?.id])

  const fetchFollowStats = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/users/${user.id}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFollowingCount(data.data.followingCount || 0)
        setFollowerCount(data.data.followerCount || 0)
      }
    } catch (error) {
      console.error('获取关注统计失败:', error)
    }
  }

  const fetchFollowList = async (type: 'following' | 'followers') => {
    setFollowListLoading(true)
    try {
      const endpoint = type === 'following' ? '/follows/following' : '/follows/followers'
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}${endpoint}?page=1&pageSize=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const follows = data.data || []
        
        // 获取用户详细信息
        const userIds = type === 'following' 
          ? follows.map((f: any) => f.followingId)
          : follows.map((f: any) => f.followerId)
        
        const userPromises = userIds.map(async (userId: string) => {
          try {
            const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/users/${userId}/profile`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            })
            if (userResponse.ok) {
              const userData = await userResponse.json()
              return userData.data.user
            }
          } catch (error) {
            console.error('获取用户信息失败:', error)
          }
          return null
        })
        
        const users = await Promise.all(userPromises)
        setFollowList(users.filter(u => u !== null))
      }
    } catch (error) {
      message.error('获取列表失败')
    } finally {
      setFollowListLoading(false)
    }
  }

  const handleOpenFollowModal = (type: 'following' | 'followers') => {
    setFollowModalType(type)
    setFollowModalVisible(true)
    setFollowList([])
    fetchFollowList(type)
  }

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }))
  }

  // 计算来到象牙市集的天数
  const getDaysSinceRegistration = () => {
    if (!user?.createdAt) return 0
    const registrationDate = new Date(user.createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - registrationDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleEditSubmit = async (values: any) => {
    setLoading(true)
    try {
      const response = await authService.updateProfile({
        username: values.username,
        email: values.email,
      })
      updateUser(response.data)
      message.success('更新成功')
      setEditModalVisible(false)
      editForm.resetFields()
    } catch (error: any) {
      message.error(error.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEditModalOpen = () => {
    setEditModalVisible(true)
    editForm.setFieldsValue({
      phone: user?.phone,
      username: user?.username,
      email: user?.email,
    })
  }


  const handleAvatarChange = async (info: any) => {
    // 只在文件被选择时处理（beforeUpload返回false后，status为'removed'表示文件被移除，不需要处理）
    if (info.file && info.file.status !== 'removed') {
      const file = info.file.originFileObj || info.file
      
      // 确保是File对象
      if (!(file instanceof File)) {
        return
      }
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        message.error('只能上传图片文件')
        return
      }
      
      // 验证文件大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        message.error('图片大小不能超过5MB')
        return
      }
      
      setLoading(true)
      try {
        // 上传头像
        const response = await authService.uploadAvatar(file)
        const avatarUrl = response.data?.avatar
        
        if (avatarUrl) {
          // 重新获取用户信息以确保数据同步
          const userResponse = await authService.getCurrentUser()
          if (userResponse.data) {
            updateUser(userResponse.data)
            message.success('头像上传成功')
          } else {
            // 如果获取失败，至少更新本地状态
            const updatedUser = { ...user, avatar: avatarUrl } as User
            updateUser(updatedUser)
            message.success('头像上传成功')
          }
        } else {
          message.error('头像上传失败：未返回头像URL')
        }
      } catch (error: any) {
        message.error(error.message || '头像上传失败')
      } finally {
        setLoading(false)
      }
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div>加载中...</div>
      </div>
    )
  }

  // 格式化注册时间（精确到天）
  const formatRegistrationDate = () => {
    if (!user?.createdAt) return '未知'
    const date = new Date(user.createdAt)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'menu',
      label: '',
      children: (
        <div style={{ marginTop: '12px' }}>
          <Card 
            className="glass-card"
            style={{ 
              borderRadius: '12px',
              padding: 0,
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(187, 222, 251, 0.5)',
              boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
            }}
          >
            {/* 我的交易 */}
            <div>
              <div
                onClick={() => toggleMenu('transactions')}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(187, 222, 251, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafa'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShoppingCartOutlined style={{ fontSize: '18px', color: '#333' }} />
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#333' }}>我的交易</span>
                </div>
                {expandedMenus.transactions ? (
                  <UpOutlined style={{ fontSize: '12px', color: '#999' }} />
                ) : (
                  <DownOutlined style={{ fontSize: '12px', color: '#999' }} />
                )}
              </div>
              {expandedMenus.transactions && (
                <div>
                  <div
                    onClick={() => navigate('/my-products')}
                    style={{
                      padding: '12px 20px 12px 50px',
                      cursor: 'pointer',
                      backgroundColor: activeMenuKey === 'published' ? 'rgba(227, 242, 253, 0.6)' : 'transparent',
                      fontSize: '14px',
                      color: '#333'
                    }}
                    onMouseEnter={(e) => {
                      if (activeMenuKey !== 'published') {
                        e.currentTarget.style.backgroundColor = '#fafafa'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeMenuKey !== 'published') {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      } else {
                        e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.6)'
                      }
                    }}
                  >
                    我发布的
                  </div>
                  <div
                    onClick={() => navigate('/my-sold-orders')}
                    style={{
                      padding: '12px 20px 12px 50px',
                      cursor: 'pointer',
                      backgroundColor: activeMenuKey === 'sold' ? 'rgba(227, 242, 253, 0.6)' : 'transparent',
                      fontSize: '14px',
                      color: '#333'
                    }}
                    onMouseEnter={(e) => {
                      if (activeMenuKey !== 'sold') {
                        e.currentTarget.style.backgroundColor = '#fafafa'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeMenuKey !== 'sold') {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      } else {
                        e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.6)'
                      }
                    }}
                  >
                    我卖出的
                  </div>
                  <div
                    onClick={() => navigate('/my-orders')}
                    style={{
                      padding: '12px 20px 12px 50px',
                      cursor: 'pointer',
                      backgroundColor: activeMenuKey === 'orders' ? 'rgba(227, 242, 253, 0.6)' : 'transparent',
                      fontSize: '14px',
                      color: '#333'
                    }}
                    onMouseEnter={(e) => {
                      if (activeMenuKey !== 'orders') {
                        e.currentTarget.style.backgroundColor = '#fafafa'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeMenuKey !== 'orders') {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      } else {
                        e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.6)'
                      }
                    }}
                  >
                    我买到的
                  </div>
                </div>
              )}
            </div>

            {/* 我的收藏 */}
            <div
              onClick={() => navigate('/favorites')}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderTop: expandedMenus.transactions ? '1px solid #f0f0f0' : 'none',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: activeMenuKey === 'favorites' ? 'rgba(227, 242, 253, 0.6)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeMenuKey !== 'favorites') {
                  e.currentTarget.style.backgroundColor = '#fafafa'
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenuKey !== 'favorites') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                } else {
                  e.currentTarget.style.backgroundColor = '#f5f5f5'
                }
              }}
            >
              <StarOutlined style={{ fontSize: '18px', color: '#333' }} />
              <span style={{ fontSize: '15px', fontWeight: 500, color: '#333' }}>我的收藏</span>
            </div>

            {/* 账户设置 */}
            <div>
              <div
                onClick={() => toggleMenu('settings')}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafa'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <SettingOutlined style={{ fontSize: '18px', color: '#333' }} />
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#333' }}>账户设置</span>
                </div>
                {expandedMenus.settings ? (
                  <UpOutlined style={{ fontSize: '12px', color: '#999' }} />
                ) : (
                  <DownOutlined style={{ fontSize: '12px', color: '#999' }} />
                )}
              </div>
              {expandedMenus.settings && (
                <div>
                  <div
                    onClick={() => setProfileModalVisible(true)}
                    style={{
                      padding: '12px 20px 12px 50px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#333',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    个人资料
                  </div>
                  <div
                    onClick={() => {
                      setSecurityModalVisible(true)
                      setSecurityStep('select')
                    }}
                    style={{
                      padding: '12px 20px 12px 50px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#333',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    账号安全
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>
      ),
    },
  ]

  return (
    <div className="profile-page" style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* 顶部背景区域 */}
      <div className="profile-header glass-card" style={{ 
        background: 'rgba(227, 242, 253, 0.6)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(187, 222, 251, 0.4)',
        boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.15)',
        padding: '40px 16px 20px',
        marginBottom: '12px',
        borderRadius: '12px',
        margin: '0 16px 12px 16px',
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Avatar
              size={80}
              src={getAvatarUrl(user.avatar)}
              style={{ 
                cursor: 'pointer',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
                flexShrink: 0
              }}
              onClick={() => setAvatarPreviewVisible(true)}
            />
            <div className="flex-1" style={{ color: '#1a1a1a' }}>
              <div style={{ fontSize: '22px', fontWeight: 600, marginBottom: '10px', lineHeight: '1.4' }}>
                {user.username}
              </div>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4', marginBottom: '12px' }}>
                来到象牙市集 {getDaysSinceRegistration()} 天
              </div>
              <div className="flex items-center gap-6" style={{ fontSize: '14px' }}>
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleOpenFollowModal('following')}
                  style={{ color: '#1a1a1a' }}
                >
                  <span style={{ fontWeight: 600 }}>关注</span>
                  <span style={{ marginLeft: '4px' }}>{followingCount}</span>
                </div>
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleOpenFollowModal('followers')}
                  style={{ color: '#1a1a1a' }}
                >
                  <span style={{ fontWeight: 600 }}>粉丝</span>
                  <span style={{ marginLeft: '4px' }}>{followerCount}</span>
                </div>
              </div>
            </div>
            <Button 
              icon={<UserOutlined />} 
              size="small" 
              onClick={handleEditModalOpen}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(187, 222, 251, 0.5)',
                color: '#1a1a1a',
                borderRadius: '6px',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.9)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'
              }}
            >
              编辑资料
            </Button>
            <AntdImage
              width={0}
              height={0}
              style={{ display: 'none' }}
              src={getAvatarUrl(user.avatar)}
              preview={{
                visible: avatarPreviewVisible,
                onVisibleChange: (visible) => setAvatarPreviewVisible(visible),
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems} 
          style={{ backgroundColor: 'transparent' }}
          hideAdd
        />
        <div style={{ display: 'none' }}>
          {/* 隐藏标签页，只显示内容 */}
        </div>
      </div>

      {/* 个人资料模态框 */}
      <Modal
        title="个人资料"
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
        width={600}
        maskClosable={true}
        destroyOnHidden={true}
        zIndex={2100}
        transitionName=""
        maskTransitionName=""
        styles={{
          content: {
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.2)',
            borderRadius: '12px',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(187, 222, 251, 0.3)',
            padding: '16px 20px',
          },
          body: {
            background: 'transparent',
            padding: '20px',
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 头像 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Avatar
              size={80}
              src={getAvatarUrl(user.avatar)}
              style={{ 
                cursor: 'pointer',
                border: '2px solid #d9d9d9',
                flexShrink: 0
              }}
              onClick={() => setAvatarPreviewVisible(true)}
            />
          </div>

          {/* 用户名 */}
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>用户名</div>
            <div style={{ fontSize: '16px', color: '#333', fontWeight: 500 }}>{user.username}</div>
          </div>

          {/* 注册时间 */}
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>注册时间</div>
            <div style={{ fontSize: '16px', color: '#333' }}>{formatRegistrationDate()}</div>
          </div>

          {/* 注册天数 */}
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>注册天数</div>
            <div style={{ fontSize: '16px', color: '#333' }}>来到象牙市集 {getDaysSinceRegistration()} 天</div>
          </div>

          {/* 手机号 */}
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>手机号</div>
            <div style={{ fontSize: '16px', color: '#333' }}>{user.phone || '未绑定'}</div>
          </div>

          {/* 邮箱 */}
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>邮箱</div>
            <div style={{ fontSize: '16px', color: '#333' }}>{user.email || '未绑定'}</div>
          </div>
        </div>
      </Modal>

      {/* 账号安全模态框 */}
      <Modal
        title="账号安全"
        open={securityModalVisible}
        onCancel={() => {
          setSecurityModalVisible(false)
          setSecurityStep('select')
        }}
        footer={null}
        width={320}
        maskClosable={true}
        destroyOnHidden={true}
        zIndex={2100}
        transitionName=""
        maskTransitionName=""
        styles={{
          content: {
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.2)',
            borderRadius: '12px',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(187, 222, 251, 0.3)',
            padding: '16px 20px',
          },
          body: {
            background: 'transparent',
            padding: '12px 20px',
          },
        }}
      >
        {securityStep === 'select' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0', alignItems: 'center' }}>
            <Button
              onClick={() => {
                setSecurityModalVisible(false)
                setTimeout(() => {
                  setPhoneModalVisible(true)
                }, 100)
              }}
              style={{ 
                height: '40px',
                fontSize: '14px',
                borderRadius: '20px',
                padding: '0 32px',
                minWidth: '160px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderColor: 'rgba(187, 222, 251, 0.6)',
                color: '#1a1a1a',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'
              }}
            >
              修改手机号
            </Button>
            <Button
              onClick={() => {
                setSecurityModalVisible(false)
                setTimeout(() => {
                  setPasswordModalVisible(true)
                }, 100)
              }}
              style={{ 
                height: '40px',
                fontSize: '14px',
                borderRadius: '20px',
                padding: '0 32px',
                minWidth: '160px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderColor: 'rgba(187, 222, 251, 0.6)',
                color: '#1a1a1a',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'
              }}
            >
              修改密码
            </Button>
          </div>
        ) : null}
      </Modal>

      {/* 修改手机号模态框 */}
      <Modal
        title="修改手机号"
        maskClosable={true}
        destroyOnHidden={true}
        zIndex={2100}
        transitionName=""
        maskTransitionName=""
        styles={{
          content: {
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.2)',
            borderRadius: '12px',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(187, 222, 251, 0.3)',
            padding: '16px 20px',
          },
          body: {
            background: 'transparent',
            padding: '12px 20px',
          },
        }}
        open={phoneModalVisible}
        onCancel={() => setPhoneModalVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ padding: '0' }}>
          <UpdatePhoneForm user={user} onSuccess={async (updatedUser) => {
            try {
              // 无论是否有 updatedUser，都重新获取一次用户信息以确保数据同步
              const userResponse = await authService.getCurrentUser()
              if (userResponse && userResponse.data) {
                updateUser(userResponse.data)
              }
              setPhoneModalVisible(false)
            } catch (error) {
              console.error('更新用户信息失败:', error)
              message.error('更新用户信息失败，请刷新页面')
            }
          }} />
        </div>
      </Modal>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        width={400}
        maskClosable={true}
        destroyOnHidden={true}
        zIndex={2100}
        transitionName=""
        maskTransitionName=""
        styles={{
          content: {
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.2)',
            borderRadius: '12px',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(187, 222, 251, 0.3)',
            padding: '16px 20px',
          },
          body: {
            background: 'transparent',
            padding: '12px 20px',
          },
        }}
      >
        <div style={{ padding: '0' }}>
          <UpdatePasswordForm onSuccess={() => {
            setPasswordModalVisible(false)
          }} />
        </div>
      </Modal>

      {/* 编辑资料模态框 */}
      <Modal
        title="编辑资料"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          editForm.resetFields()
        }}
        footer={null}
        width={500}
        maskClosable={true}
        destroyOnHidden={true}
        zIndex={2100}
        transitionName=""
        maskTransitionName=""
        styles={{
          content: {
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.2)',
            borderRadius: '12px',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(187, 222, 251, 0.3)',
            padding: '16px 20px',
          },
          body: {
            background: 'transparent',
            padding: '20px',
          },
        }}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          {/* 头像上传 */}
          <Form.Item label="头像">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar
                size={80}
                src={getAvatarUrl(user?.avatar)}
                style={{ 
                  cursor: 'pointer',
                  border: '2px solid #d9d9d9',
                  flexShrink: 0
                }}
                onClick={() => setAvatarPreviewVisible(true)}
              />
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarChange}
                accept="image/*"
              >
                <Button icon={<CameraOutlined />} loading={loading}>
                  更换头像
                </Button>
              </Upload>
            </div>
            <AntdImage
              width={0}
              height={0}
              style={{ display: 'none' }}
              src={getAvatarUrl(user?.avatar)}
              preview={{
                visible: avatarPreviewVisible,
                onVisibleChange: (visible) => setAvatarPreviewVisible(visible),
              }}
            />
          </Form.Item>

          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' },
              { max: 20, message: '用户名最多20个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input 
              placeholder="手机号" 
              disabled
              style={{ backgroundColor: 'rgba(227, 242, 253, 0.3)', cursor: 'not-allowed' }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入正确的邮箱地址' },
            ]}
          >
            <Input type="email" placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              style={{ 
                height: '44px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 关注/粉丝列表弹窗 */}
      <Modal
        title={followModalType === 'following' ? '关注' : '粉丝'}
        open={followModalVisible}
        onCancel={() => {
          setFollowModalVisible(false)
        }}
        footer={null}
        width={400}
        className="follow-modal-glass"
        maskClosable={true}
        destroyOnHidden={true}
        zIndex={2100}
        transitionName=""
        maskTransitionName=""
        styles={{
          content: {
            // 使用更透明的毛玻璃，而不是接近纯白
            background: 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(25px) saturate(180%)',
            WebkitBackdropFilter: 'blur(25px) saturate(180%)',
            border: '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: '0 12px 40px 0 rgba(144, 202, 249, 0.25)',
            borderRadius: '12px',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(187, 222, 251, 0.3)',
            padding: '16px 20px',
          },
          body: {
            background: 'transparent',
            padding: '8px',
          },
        }}
      >
        {followListLoading ? (
          <div className="flex justify-center items-center py-8">
            <div style={{ color: '#666' }}>加载中...</div>
          </div>
        ) : followList.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#999' }}>
            {followModalType === 'following' ? '暂无关注' : '暂无粉丝'}
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto" style={{ borderRadius: '8px' }}>
            {followList.map((followUser) => (
              <div
                key={followUser.id}
                className="flex items-center gap-3 p-3 rounded cursor-pointer transition-colors"
                style={{
                  marginBottom: '4px',
                  borderRadius: '8px',
                }}
                onClick={() => {
                  setFollowModalVisible(false)
                  navigate(`/users/${followUser.id}/profile`)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Avatar 
                  src={followUser.avatar ? getAvatarUrl(followUser.avatar) : undefined}
                  size="large"
                >
                  {followUser.username?.charAt(0) || 'U'}
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium" style={{ fontSize: '15px', color: '#1a1a1a' }}>
                    {followUser.username || '未知用户'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
