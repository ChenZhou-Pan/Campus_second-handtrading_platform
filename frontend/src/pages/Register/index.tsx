import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, Divider, Progress } from 'antd'
import type { Rule } from 'rc-field-form/lib/interface'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { useMessage } from '@/hooks/useMessage'

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

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const message = useMessage()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    setPasswordStrength(getPasswordStrength(password))
  }

  const handleSubmit = async (values: {
    username: string
    password: string
    confirmPassword: string
    phone?: string
    email?: string
  }) => {
    setLoading(true)
    try {
      await register({
        username: values.username,
        password: values.password,
        phone: values.phone,
        email: values.email,
      })
      message.success('注册成功，欢迎加入！')
      navigate('/')
    } catch (error: any) {
      // 更详细的错误处理
      let errorMessage = '注册失败，请稍后重试'
      
      if (error.response) {
        // 服务器返回了错误响应
        const status = error.response.status
        if (status === 500) {
          errorMessage = error.response?.data?.message || '服务器暂时无法响应，请稍后重试'
          // 在开发环境打印详细错误信息
          if (import.meta.env.DEV) {
            console.error('注册API错误 (500):', {
              status: error.response.status,
              data: error.response.data,
              request: {
                username: values.username,
                hasPassword: !!values.password,
                phone: values.phone,
                email: values.email,
              },
            })
          }
        } else if (status === 400) {
          errorMessage = error.response?.data?.message || '请求参数错误，请检查输入'
        } else if (status === 409) {
          errorMessage = error.response?.data?.message || '用户名已存在，请使用其他用户名'
        } else {
          errorMessage = error.response?.data?.message || error.message || '注册失败，请稍后重试'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      message.error(errorMessage)
      
      // 如果是用户名已存在，清空用户名字段
      if (errorMessage.includes('用户名') || errorMessage.includes('已存在') || errorMessage.includes('已注册')) {
        form.setFieldsValue({ username: '' })
        form.setFields([{ name: 'username', errors: [errorMessage] }])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-bg px-4 py-8">
      <Card className="w-full max-w-md shadow-sm border-0">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold mb-1 text-gray-800">注册</div>
          <p className="text-gray-text text-sm">加入象牙市集</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线',
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名（3-20个字符）"
              autoComplete="username"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
              { max: 20, message: '密码最多20个字符' },
            ]}
            validateTrigger="onBlur"
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码（至少6个字符）"
              autoComplete="new-password"
              onChange={handlePasswordChange}
              allowClear
            />
          </Form.Item>

          {passwordStrength.score > 0 && (
            <div className="mb-4 -mt-4">
              <Progress
                percent={(passwordStrength.score / 5) * 100}
                showInfo={false}
                strokeColor={passwordStrength.color}
                size="small"
              />
              <div className="text-xs mt-1" style={{ color: passwordStrength.color }}>
                密码强度：{passwordStrength.text}
              </div>
            </div>
          )}

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }: { getFieldValue: (name: string) => any }) => ({
                validator(_: Rule, value: string) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
            validateTrigger="onBlur"
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="确认密码"
              autoComplete="new-password"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入正确的手机号码',
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="手机号（可选，11位数字）"
              maxLength={11}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              {
                type: 'email',
                message: '请输入正确的邮箱地址',
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              type="email"
              placeholder="邮箱（可选）"
              autoComplete="email"
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              注册
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="text-xs text-gray-500 text-center">
              注册即表示您同意我们的
              <Link to="/terms" className="text-primary mx-1">服务条款</Link>
              和
              <Link to="/privacy" className="text-primary ml-1">隐私政策</Link>
            </div>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <div className="text-center">
          <span className="text-gray-600">已有账号？</span>{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            立即登录
          </Link>
        </div>
      </Card>
    </div>
  )
}
