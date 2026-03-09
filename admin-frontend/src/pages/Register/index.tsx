import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { adminService } from '@/services/adminService'
import './index.css'

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [countdown])

  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone')
      if (!phone) {
        message.error('请先输入手机号')
        return
      }
      
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        message.error('手机号格式不正确')
        return
      }

      setCodeLoading(true)
      await adminService.sendVerificationCode(phone)
      message.success('验证码已发送，请查看控制台（测试模式）')
      setCountdown(60)
    } catch (error: any) {
      message.error(error.message || '发送验证码失败')
    } finally {
      setCodeLoading(false)
    }
  }

  const onFinish = async (values: {
    username: string
    password: string
    confirmPassword: string
    phone: string
    code: string
    email?: string
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const response = await adminService.register(
        values.username,
        values.password,
        values.phone,
        values.code,
        values.email
      )
      
      if (response.data?.token) {
        message.success('注册成功')
        // 如果是管理员账户，跳转到后台；否则提示需要管理员权限
        if (response.data?.user?.role === 'admin') {
          navigate('/dashboard')
        } else {
          message.warning('注册成功，但需要管理员权限才能访问后台')
          navigate('/login')
        }
      }
    } catch (error: any) {
      message.error(error.message || '注册失败，请检查输入信息')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <h1 className="register-title">象牙集市管理系统</h1>
        <Card className="register-card" title="注册">
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#4a4a4a' }} />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#4a4a4a' }} />}
                placeholder="手机号"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Input
                prefix={<SafetyOutlined style={{ color: '#4a4a4a' }} />}
                placeholder="验证码"
                maxLength={6}
                suffix={
                  <Button
                    type="link"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || codeLoading}
                    style={{ padding: 0, height: 'auto' }}
                  >
                    {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                  </Button>
                }
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#4a4a4a' }} />}
                placeholder="邮箱（可选）"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#4a4a4a' }} />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#4a4a4a' }} />}
                placeholder="确认密码"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block
                style={{
                  height: '44px',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                注册
              </Button>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
              <Link to="/login" style={{ color: '#1890ff' }}>
                已有账号？去登录
              </Link>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}
