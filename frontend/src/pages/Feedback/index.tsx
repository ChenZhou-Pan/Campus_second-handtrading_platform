import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Radio, Rate, Space, Typography, Divider } from 'antd'
import {
  CheckCircleOutlined,
  MessageOutlined,
  BugOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import { apiService } from '@/services/api'
import { useMessage } from '@/hooks/useMessage'
import './index.css'

const { TextArea } = Input
const { Title, Text } = Typography

interface FeedbackForm {
  type: string
  content: string
  contact?: string
  rating?: number
}

export const FeedbackPage: React.FC = () => {
  const navigate = useNavigate()
  const message = useMessage()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (values: FeedbackForm) => {
    console.log('提交反馈，表单数据:', values)
    setLoading(true)
    try {
      const payload = {
        type: values.type,
        content: values.content.trim(),
        contact: values.contact?.trim() || '',
        rating: values.rating ?? 0,
      }
      console.log('发送到后端的payload:', payload)
      
      // 验证必填字段
      if (!payload.type || !payload.content) {
        message.error('请填写完整的反馈信息')
        setLoading(false)
        return
      }
      
      if (payload.content.length < 10) {
        message.error('反馈内容至少需要10个字符')
        setLoading(false)
        return
      }
      
      const response = await apiService.post('/feedback', payload)
      console.log('后端响应:', response)
      
      if (response && response.code === 200) {
        message.success('反馈提交成功，感谢您的宝贵意见！')
        setSubmitted(true)
        form.resetFields()
      } else {
        message.error(response?.message || '提交失败，请稍后重试')
      }
    } catch (error: any) {
      console.error('提交反馈失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '提交失败，请稍后重试'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnother = () => {
    setSubmitted(false)
    form.resetFields()
  }

  if (submitted) {
    return (
      <div className="feedback-page">
        <div className="feedback-container">
          <Card className="feedback-card">
            <div className="success-content">
              <CheckCircleOutlined className="success-icon" />
              <Title level={3}>反馈提交成功</Title>
              <Text type="secondary" className="success-text">
                感谢您的反馈，我们会认真对待每一条建议
              </Text>
              <Space className="success-actions" size="middle">
                <Button type="primary" onClick={handleSubmitAnother}>
                  继续反馈
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <Card className="feedback-card">
          <div className="feedback-header">
            <Title level={3} className="feedback-title">
              意见反馈
            </Title>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              type: 'suggestion',
              rating: 0,
            }}
          >
            <Form.Item
              name="type"
              label={
                <span className="form-label">
                  <MessageOutlined className="label-icon" />
                  反馈类型
                </span>
              }
              rules={[{ required: true, message: '请选择反馈类型' }]}
            >
              <Radio.Group className="feedback-type-group">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Radio.Button value="suggestion" className="type-option">
                    <BulbOutlined className="type-icon" />
                    <span>功能建议</span>
                  </Radio.Button>
                  <Radio.Button value="bug" className="type-option">
                    <BugOutlined className="type-icon" />
                    <span>问题反馈</span>
                  </Radio.Button>
                  <Radio.Button value="question" className="type-option">
                    <QuestionCircleOutlined className="type-icon" />
                    <span>使用疑问</span>
                  </Radio.Button>
                  <Radio.Button value="praise" className="type-option">
                    <HeartOutlined className="type-icon" />
                    <span>表扬鼓励</span>
                  </Radio.Button>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="content"
              label={
                <span className="form-label">
                  <MessageOutlined className="label-icon" />
                  反馈内容
                </span>
              }
              rules={[
                { required: true, message: '请输入反馈内容' },
                { min: 10, message: '反馈内容至少10个字符' },
                { max: 500, message: '反馈内容最多500个字符' },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="请详细描述您的反馈内容，我们会认真对待每一条建议..."
                maxLength={500}
                showCount
                className="feedback-textarea"
              />
            </Form.Item>

            <Form.Item
              name="rating"
              label={
                <span className="form-label">
                  <HeartOutlined className="label-icon" />
                  满意度评分
                </span>
              }
            >
              <Rate allowHalf className="feedback-rate" />
            </Form.Item>

            <Form.Item
              name="contact"
              label={
                <span className="form-label">
                  <MessageOutlined className="label-icon" />
                  联系方式（选填）
                </span>
              }
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || value.trim() === '') {
                      return Promise.resolve() // 空值允许（选填）
                    }
                    const phoneRegex = /^1[3-9]\d{9}$/
                    const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
                    if (phoneRegex.test(value) || emailRegex.test(value)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('请输入正确的手机号或邮箱'))
                  },
                },
              ]}
            >
              <Input
                placeholder="手机号或邮箱（方便我们联系您）"
                className="feedback-input"
              />
            </Form.Item>

            <Form.Item>
              <div className="submit-button-wrapper">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="submit-button-capsule"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                >
                  提交反馈
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}
