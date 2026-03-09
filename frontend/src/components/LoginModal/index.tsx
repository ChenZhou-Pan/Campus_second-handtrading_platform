import React, { useState, useEffect, useRef } from 'react'
import { Modal, Form, Input, Button, Tabs, Checkbox, Progress, App } from 'antd'
import type { FormInstance } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, CloseOutlined, SafetyOutlined } from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import type { TabsProps } from 'antd'
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

interface LoginModalProps {
  open: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, defaultTab = 'login' }) => {
  const { message } = App.useApp()
  const { login, loginByCode, register } = useAuth()
  const [activeTab, setActiveTab] = useState<string>(defaultTab)
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' })
  const [loginForm] = Form.useForm() // 密码登录表单
  const [smsLoginForm] = Form.useForm() // 短信登录表单
  const [registerForm] = Form.useForm()
  
  // 使用Form.useWatch实时监听手机号字段（短信登录）
  const smsPhone = Form.useWatch('phone', smsLoginForm)
  
  // 验证码相关状态
  const [smsLoginCountdown, setSmsLoginCountdown] = useState(0)
  const [registerCountdown, setRegisterCountdown] = useState(0)
  const [smsLoginSending, setSmsLoginSending] = useState(false)
  const [registerSending, setRegisterSending] = useState(false)
  const smsLoginTimerRef = useRef<NodeJS.Timeout | null>(null)
  const registerTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 当defaultTab或open变化时，更新activeTab
  useEffect(() => {
    if (open) {
      // 立即更新activeTab，但延迟重置表单以避免闪烁
      setActiveTab(defaultTab)
      
      // 使用requestAnimationFrame确保在下一帧执行，避免与打开动画冲突
      const rafId = requestAnimationFrame(() => {
        // 重置表单
        if (defaultTab === 'login') {
          loginForm.resetFields()
          smsLoginForm.resetFields()
        } else {
          registerForm.resetFields()
          setPasswordStrength({ score: 0, text: '', color: '' })
        }
      })
      
      return () => cancelAnimationFrame(rafId)
    }
  }, [defaultTab, open, loginForm, smsLoginForm, registerForm])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (smsLoginTimerRef.current) {
        clearInterval(smsLoginTimerRef.current)
      }
      if (registerTimerRef.current) {
        clearInterval(registerTimerRef.current)
      }
    }
  }, [])

  // 发送验证码（短信登录）
  const handleSendSmsLoginCode = async () => {
    try {
      // 优先使用useWatch监听到的值
      let phone = smsPhone
      
      // 如果useWatch没有值，尝试从表单获取
      if (!phone) {
        phone = smsLoginForm.getFieldValue('phone')
      }
      
      // 如果还是没有，尝试获取所有字段值
      if (!phone) {
        const allValues = smsLoginForm.getFieldsValue()
        phone = allValues.phone
      }
      
      // 如果还是没有，尝试从DOM直接获取（作为最后的备用方案）
      if (!phone) {
        // 查找短信登录表单中的手机号输入框
        const phoneInputs = document.querySelectorAll('form[name="smsLogin"] input')
        for (const input of Array.from(phoneInputs)) {
          const htmlInput = input as HTMLInputElement
          if (htmlInput.placeholder?.includes('手机号') || htmlInput.value?.match(/^1[3-9]\d{9}$/)) {
            phone = htmlInput.value
            // 如果从DOM获取到值，同步到表单
            if (phone) {
              smsLoginForm.setFieldsValue({ phone })
            }
            break
          }
        }
      }
      
      // 在开发环境打印调试信息
      if (import.meta.env.DEV) {
        console.log('获取验证码 - 手机号获取情况:', {
          useWatch: smsPhone,
          getFieldValue: smsLoginForm.getFieldValue('phone'),
          allValues: smsLoginForm.getFieldsValue(),
          finalPhone: phone
        })
      }
      
      // 去除空格
      const trimmedPhone = phone ? String(phone).trim() : ''
      
      if (!trimmedPhone) {
        message.error('请先输入手机号')
        // 触发表单验证以显示错误
        smsLoginForm.validateFields(['phone']).catch(() => {})
        return
      }
      
      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(trimmedPhone)) {
        message.error('请输入正确的手机号码')
        smsLoginForm.setFields([{ name: 'phone', errors: ['请输入正确的手机号码'] }])
        return
      }

      setSmsLoginSending(true)
      const response = await authService.sendVerificationCode(trimmedPhone)
      
      // 显示成功消息，如果后端返回了详细信息（测试模式），也显示出来
      let successMessage = '验证码已发送，请查看手机短信'
      if (response.data && typeof response.data === 'string') {
        // 后端在测试模式下会返回验证码信息
        if (response.data.includes('验证码为')) {
          successMessage = response.data
        }
      }
      message.success(successMessage, 5) // 显示5秒，让用户有时间看到验证码
      
      // 开始倒计时
      setSmsLoginCountdown(60)
      if (smsLoginTimerRef.current) {
        clearInterval(smsLoginTimerRef.current)
      }
      smsLoginTimerRef.current = setInterval(() => {
        setSmsLoginCountdown((prev) => {
          if (prev <= 1) {
            if (smsLoginTimerRef.current) {
              clearInterval(smsLoginTimerRef.current)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      // 更详细的错误处理
      let errorMessage = '发送验证码失败'
      
      if (error.response) {
        // 服务器返回了错误响应
        const status = error.response.status
        if (status === 400) {
          errorMessage = error.response?.data?.message || '手机号格式错误'
        } else if (status === 500) {
          errorMessage = error.response?.data?.message || '服务器错误，请稍后重试'
        } else {
          errorMessage = error.response?.data?.message || error.message || '发送验证码失败'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      message.error(errorMessage)
      
      // 在开发环境打印详细错误
      if (import.meta.env.DEV) {
        console.error('发送验证码失败:', error)
      }
    } finally {
      setSmsLoginSending(false)
    }
  }

  // 发送验证码（注册）
  const handleSendRegisterCode = async () => {
    try {
      // 先尝试验证并获取手机号字段
      let phone: string | undefined
      try {
        const values = await registerForm.validateFields(['phone'])
        phone = values.phone
      } catch (error) {
        // 验证失败，尝试直接获取值
        phone = registerForm.getFieldValue('phone')
      }
      
      // 如果还是没有值，尝试从表单的所有字段中获取
      if (!phone) {
        const allValues = registerForm.getFieldsValue()
        phone = allValues.phone
      }
      
      if (!phone || phone.trim() === '') {
        message.error('请先输入手机号')
        registerForm.setFields([{ name: 'phone', errors: ['请输入手机号'] }])
        return
      }
      
      const trimmedPhone = phone.trim()
      
      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(trimmedPhone)) {
        message.error('请输入正确的手机号码')
        registerForm.setFields([{ name: 'phone', errors: ['请输入正确的手机号码'] }])
        return
      }

      setRegisterSending(true)
      const response = await authService.sendVerificationCode(trimmedPhone)
      
      // 显示成功消息，如果后端返回了详细信息（测试模式），也显示出来
      let successMessage = '验证码已发送，请查看手机短信'
      if (response.data && typeof response.data === 'string') {
        // 后端在测试模式下会返回验证码信息
        if (response.data.includes('验证码为')) {
          successMessage = response.data
        }
      }
      message.success(successMessage, 5) // 显示5秒，让用户有时间看到验证码
      
      // 开始倒计时
      setRegisterCountdown(60)
      if (registerTimerRef.current) {
        clearInterval(registerTimerRef.current)
      }
      registerTimerRef.current = setInterval(() => {
        setRegisterCountdown((prev) => {
          if (prev <= 1) {
            if (registerTimerRef.current) {
              clearInterval(registerTimerRef.current)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      // 更详细的错误处理
      let errorMessage = '发送验证码失败'
      
      if (error.response) {
        // 服务器返回了错误响应
        const status = error.response.status
        if (status === 400) {
          errorMessage = error.response?.data?.message || '手机号格式错误'
        } else if (status === 500) {
          errorMessage = error.response?.data?.message || '服务器错误，请稍后重试'
        } else {
          errorMessage = error.response?.data?.message || error.message || '发送验证码失败'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      message.error(errorMessage)
      
      // 在开发环境打印详细错误
      if (import.meta.env.DEV) {
        console.error('发送验证码失败:', error)
      }
    } finally {
      setRegisterSending(false)
    }
  }

  const handleLogin = async (values: { username: string; password: string; remember?: boolean }) => {
    setLoginLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      loginForm.resetFields()
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '登录失败，请检查用户名和密码'
      message.error(errorMessage)
      loginForm.setFieldsValue({ password: '' })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (values: {
    password: string
    confirmPassword: string
    phone: string
    code: string
  }) => {
    setRegisterLoading(true)
    try {
      await register({
        username: '', // 传空字符串，后端会自动使用手机号后四位作为用户名
        password: values.password,
        phone: values.phone,
        code: values.code,
      })
      message.success('注册成功，欢迎加入！')
      registerForm.resetFields()
      setPasswordStrength({ score: 0, text: '', color: '' })
      setRegisterCountdown(0)
      if (registerTimerRef.current) {
        clearInterval(registerTimerRef.current)
      }
      onClose()
    } catch (error: any) {
      let errorMessage = '注册失败，请稍后重试'
      if (error.response) {
        const status = error.response.status
        if (status === 409) {
          errorMessage = error.response?.data?.message || '手机号已注册，请使用其他手机号'
        } else {
          errorMessage = error.response?.data?.message || error.message || '注册失败，请稍后重试'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      message.error(errorMessage)
      if (errorMessage.includes('手机号') || errorMessage.includes('已存在') || errorMessage.includes('已注册')) {
        registerForm.setFieldsValue({ phone: '' })
        registerForm.setFields([{ name: 'phone', errors: [errorMessage] }])
      }
    } finally {
      setRegisterLoading(false)
    }
  }

  // 短信登录处理
  const handleSmsLogin = async (values: { phone: string; code: string }) => {
    setLoginLoading(true)
    try {
      await loginByCode(values.phone, values.code)
      message.success('登录成功')
      smsLoginForm.resetFields()
      setSmsLoginCountdown(0)
      if (smsLoginTimerRef.current) {
        clearInterval(smsLoginTimerRef.current)
      }
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '登录失败，请检查验证码'
      message.error(errorMessage)
      smsLoginForm.setFieldsValue({ code: '' })
    } finally {
      setLoginLoading(false)
    }
  }

  const loginItems: TabsProps['items'] = [
    {
      key: 'sms',
      label: '短信登录',
      children: (
        <Form
          form={smsLoginForm}
          name="smsLogin"
          onFinish={handleSmsLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入正确的手机号码',
              },
            ]}
            validateTrigger="onBlur"
          >
            <div 
              className="input-container glass-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderRadius: '24px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(24, 144, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="请输入手机号"
                maxLength={11}
                allowClear
                style={{ 
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                }}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
            validateTrigger="onBlur"
          >
            <div 
              className="verification-code-container glass-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderRadius: '24px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(24, 144, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <Input
                prefix={<SafetyOutlined className="text-gray-400" />}
                style={{ 
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                }}
                placeholder="请输入验证码"
                maxLength={6}
                allowClear
              />
              <Button 
                type="text"
                onClick={handleSendSmsLoginCode}
                disabled={smsLoginCountdown > 0 || smsLoginSending}
                loading={smsLoginSending}
                style={{ 
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  paddingRight: '16px',
                  color: smsLoginCountdown > 0 ? '#999' : '#000',
                  fontWeight: 500,
                  height: 'auto',
                }}
                className="verification-code-button"
              >
                {smsLoginCountdown > 0 ? `${smsLoginCountdown}秒后重试` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{
                backgroundColor: 'rgba(227, 242, 253, 0.8)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderColor: 'rgba(187, 222, 251, 0.6)',
                borderRadius: '24px',
                height: '44px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px 0 rgba(144, 202, 249, 0.2)',
                color: '#1a1a1a',
              }}
              className="capsule-button"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.95)';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 16px 0 rgba(144, 202, 249, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.8)';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.8)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(144, 202, 249, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.6)';
                e.currentTarget.style.color = '#1a1a1a';
              }}
            >
              登录
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="text-xs text-gray-500 text-center">
              登录即表示您已阅读并同意
              <a href="#" className="text-primary mx-1" onClick={(e) => e.preventDefault()}>
                服务条款
              </a>
              和
              <a href="#" className="text-primary ml-1" onClick={(e) => e.preventDefault()}>
                隐私政策
              </a>
            </div>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'password',
      label: '密码登录',
      children: (
        <Form
          form={loginForm}
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名或手机号' },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve()
                  }
                  // 允许用户名（3-20个字符，字母数字下划线）或手机号（11位数字）
                  const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value)
                  const isPhone = /^1[3-9]\d{9}$/.test(value)
                  if (isUsername || isPhone) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('请输入正确的用户名或手机号'))
                },
              },
            ]}
            validateTrigger="onBlur"
          >
            <div 
              className="input-container glass-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderRadius: '24px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(24, 144, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="请输入用户名或手机号"
                autoComplete="username"
                allowClear
                style={{ 
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                }}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
            validateTrigger="onBlur"
          >
            <div 
              className="input-container glass-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderRadius: '24px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(24, 144, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
                autoComplete="current-password"
                allowClear
                style={{ 
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                }}
              />
            </div>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住密码</Checkbox>
              </Form.Item>
              <a className="text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                忘记密码？
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loginLoading}
              size="large"
              style={{
                backgroundColor: 'rgba(227, 242, 253, 0.8)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderColor: 'rgba(187, 222, 251, 0.6)',
                borderRadius: '24px',
                height: '44px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px 0 rgba(144, 202, 249, 0.2)',
                color: '#1a1a1a',
              }}
              className="capsule-button"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.95)';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 16px 0 rgba(144, 202, 249, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.8)';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.8)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(144, 202, 249, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.6)';
                e.currentTarget.style.color = '#1a1a1a';
              }}
            >
              登录
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="text-xs text-gray-500 text-center">
              登录即表示您已阅读并同意
              <a href="#" className="text-primary mx-1" onClick={(e) => e.preventDefault()}>
                服务条款
              </a>
              和
              <a href="#" className="text-primary ml-1" onClick={(e) => e.preventDefault()}>
                隐私政策
              </a>
            </div>
          </Form.Item>
        </Form>
      ),
    },
  ]

  const registerItems: TabsProps['items'] = [
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          form={registerForm}
          name="register"
          onFinish={handleRegister}
          autoComplete="off"
          size="large"
          scrollToFirstError
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入正确的手机号码',
              },
            ]}
            validateTrigger="onBlur"
          >
            <div 
              className="input-container glass-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderRadius: '24px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(24, 144, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="请输入手机号"
                maxLength={11}
                allowClear
                style={{ 
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                }}
              />
            </div>
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
            <div 
              className="input-container glass-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderRadius: '24px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(24, 144, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码（至少6个字符）"
                autoComplete="new-password"
                allowClear
                style={{ 
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                }}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
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
            validateTrigger="onBlur"
          >
            <div 
              className="input-container glass-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderRadius: '24px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(24, 144, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="确认密码"
                autoComplete="new-password"
                allowClear
                style={{ 
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                }}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
            validateTrigger="onBlur"
          >
            <div 
              className="verification-code-container glass-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderRadius: '24px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(24, 144, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <Input
                prefix={<SafetyOutlined className="text-gray-400" />}
                style={{ 
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                }}
                placeholder="请输入验证码"
                maxLength={6}
                allowClear
              />
              <Button 
                type="text"
                onClick={handleSendSmsLoginCode}
                disabled={smsLoginCountdown > 0 || smsLoginSending}
                loading={smsLoginSending}
                style={{ 
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  paddingRight: '16px',
                  color: smsLoginCountdown > 0 ? '#999' : '#000',
                  fontWeight: 500,
                  height: 'auto',
                }}
                className="verification-code-button"
              >
                {smsLoginCountdown > 0 ? `${smsLoginCountdown}秒后重试` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={registerLoading}
              size="large"
              style={{
                backgroundColor: 'rgba(227, 242, 253, 0.8)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderColor: 'rgba(187, 222, 251, 0.6)',
                borderRadius: '24px',
                height: '44px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px 0 rgba(144, 202, 249, 0.2)',
                color: '#1a1a1a',
              }}
              className="capsule-button"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.95)';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 16px 0 rgba(144, 202, 249, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.8)';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 242, 253, 0.8)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(144, 202, 249, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.6)';
                e.currentTarget.style.color = '#1a1a1a';
              }}
            >
              注册
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="text-xs text-gray-500 text-center">
              注册即表示您同意我们的
              <a href="#" className="text-primary mx-1" onClick={(e) => e.preventDefault()}>
                服务条款
              </a>
              和
              <a href="#" className="text-primary ml-1" onClick={(e) => e.preventDefault()}>
                隐私政策
              </a>
            </div>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={480}
      centered
      transitionName=""
      maskTransitionName=""
      styles={{
        body: { padding: 0, background: 'transparent' },
        content: { 
          borderRadius: '12px', 
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(187, 222, 251, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.2)',
        },
        mask: {
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      }}
      style={{ top: 20 }}
    >
      <div style={{ minHeight: '500px' }}>
        {/* 登录/注册表单 */}
        <div className="p-8" style={{ maxWidth: '100%' }}>
          <div className="mb-8">
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900" style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2' }}>
                {activeTab === 'login' ? '登录' : '注册'}
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, #1890ff, transparent)' }}></div>
                <span className="text-sm text-gray-500" style={{ fontSize: '13px', color: '#8c8c8c' }}>
                  {activeTab === 'login' ? '欢迎回来' : '加入我们'}
                </span>
                <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, #1890ff, transparent)' }}></div>
              </div>
            </div>
            {activeTab === 'login' ? (
              <p className="text-gray-600 text-sm leading-relaxed" style={{ fontSize: '14px', color: '#595959', lineHeight: '1.6' }}>
                登录您的账户，继续您的校园二手交易之旅
              </p>
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed" style={{ fontSize: '14px', color: '#595959', lineHeight: '1.6' }}>
                创建新账户，开启您的校园二手交易之旅
              </p>
            )}
          </div>

          {activeTab === 'login' ? (
            <Tabs
              items={loginItems}
              defaultActiveKey="sms"
              onChange={(key) => {
                // 切换登录方式时重置所有登录表单
                loginForm.resetFields()
                smsLoginForm.resetFields()
                setSmsLoginCountdown(0)
                if (smsLoginTimerRef.current) {
                  clearInterval(smsLoginTimerRef.current)
                }
              }}
            />
          ) : (
            <Form
              form={registerForm}
              name="register"
              onFinish={handleRegister}
              autoComplete="off"
              size="large"
              scrollToFirstError
            >
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: '请输入正确的手机号码',
                  },
                ]}
                validateTrigger="onBlur"
              >
                <div 
                  className="input-container"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '24px',
                    padding: '2px',
                    border: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="请输入手机号"
                    maxLength={11}
                    allowClear
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                  />
                </div>
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
                <div>
                  <div 
                    className="input-container"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '24px',
                      padding: '2px',
                      border: 'none',
                      overflow: 'hidden',
                    }}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="密码（至少6个字符）"
                      autoComplete="new-password"
                      allowClear
                      onChange={(e) => {
                        const password = e.target.value
                        setPasswordStrength(getPasswordStrength(password))
                      }}
                      style={{ 
                        border: 'none',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                      }}
                    />
                  </div>
                  {passwordStrength.score > 0 && (
                    <div className="mt-2">
                      <Progress
                        percent={(passwordStrength.score / 5) * 100}
                        showInfo={false}
                        strokeColor={passwordStrength.color}
                        size="small"
                        style={{ marginBottom: '4px' }}
                      />
                      <div className="text-xs" style={{ color: passwordStrength.color }}>
                        密码强度：{passwordStrength.text}
                      </div>
                    </div>
                  )}
                </div>
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
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
                validateTrigger="onBlur"
              >
                <div 
                  className="input-container"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '24px',
                    padding: '2px',
                    border: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="确认密码"
                    autoComplete="new-password"
                    allowClear
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                  />
                </div>
              </Form.Item>

              <Form.Item
                name="code"
                rules={[{ required: true, message: '请输入验证码' }]}
                validateTrigger="onBlur"
              >
                <div 
                  className="verification-code-container"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '24px',
                    padding: '2px',
                    border: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <Input
                    prefix={<SafetyOutlined className="text-gray-400" />}
                    style={{ 
                      flex: 1,
                      border: 'none',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                    placeholder="请输入验证码"
                    maxLength={6}
                    allowClear
                  />
                  <Button 
                    type="text"
                    onClick={handleSendRegisterCode}
                    disabled={registerCountdown > 0 || registerSending}
                    loading={registerSending}
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      paddingRight: '16px',
                      color: registerCountdown > 0 ? '#999' : '#000',
                      fontWeight: 500,
                      height: 'auto',
                    }}
                    className="verification-code-button"
                  >
                    {registerCountdown > 0 ? `${registerCountdown}秒后重试` : '获取验证码'}
                  </Button>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={registerLoading}
                  size="large"
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    borderRadius: '24px',
                    height: '44px',
                  }}
                  className="capsule-button"
                >
                  注册
                </Button>
              </Form.Item>

              <Form.Item>
                <div className="text-xs text-gray-500 text-center">
                  注册即表示您同意我们的
                  <a href="#" className="text-primary mx-1" onClick={(e) => e.preventDefault()}>
                    服务条款
                  </a>
                  和
                  <a href="#" className="text-primary ml-1" onClick={(e) => e.preventDefault()}>
                    隐私政策
                  </a>
                </div>
              </Form.Item>
            </Form>
          )}

          <div className="mt-4 text-center">
            {activeTab === 'login' ? (
              <>
                <span className="text-gray-600">还没有账号？</span>{' '}
                <a
                  className="text-primary font-medium hover:underline cursor-pointer"
                  onClick={() => {
                    setActiveTab('register')
                    setPasswordStrength({ score: 0, text: '', color: '' })
                  }}
                >
                  立即注册
                </a>
              </>
            ) : (
              <>
                <span className="text-gray-600">已有账号？</span>{' '}
                <a
                  className="text-primary font-medium hover:underline cursor-pointer"
                  onClick={() => {
                    setActiveTab('login')
                    setPasswordStrength({ score: 0, text: '', color: '' })
                  }}
                >
                  立即登录
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
