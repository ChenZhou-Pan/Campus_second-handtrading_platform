import { useState, useEffect, useRef } from 'react'
import { Modal, Input, Button, Avatar, Spin, message } from 'antd'
import { SendOutlined, RobotOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { aiCustomerService } from '@/services/aiCustomerService'
import { useAuth } from '@/contexts/AuthContext'
import { getAvatarUrl } from '@/utils/avatar'
import { formatMessageTime } from '@/utils/dateFormat'
import { ElephantIcon } from '@/components/ElephantIcon'

interface AICustomerServiceModalProps {
  visible: boolean
  onClose: () => void
  onOpenMessages?: () => void // 新增：打开消息中心的回调
}

interface AICustomerServiceModalProps {
  visible: boolean
  onClose: () => void
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const AICustomerServiceModal: React.FC<AICustomerServiceModalProps> = ({
  visible,
  onClose,
  onOpenMessages,
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 解析消息中的链接并渲染
  const renderMessageContent = (content: string) => {
    // 匹配链接格式：[文本](type:/path)
    const linkRegex = /\[([^\]]+)\]\((product|search|action):([^)]+)\)/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      // 添加链接前的文本
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }

      const linkText = match[1]
      const linkType = match[2]
      const linkPath = match[3]

      // 创建可点击的链接
      const handleLinkClick = () => {
        if (linkType === 'product') {
          // 商品链接：/products/{id}
          navigate(linkPath)
          onClose() // 关闭AI客服弹窗
        } else if (linkType === 'search') {
          // 搜索链接：/products?keyword=xxx
          navigate(linkPath)
          onClose()
        } else if (linkType === 'action') {
          // 功能链接：/path
          if (linkPath === '/messages' && onOpenMessages) {
            // 如果是消息中心，打开消息弹窗
            onOpenMessages()
            onClose()
          } else if (linkPath === '/price-assistant' || linkPath.includes('price-assistant')) {
            // 如果是智能定价助手，跳转到发布商品页面
            navigate('/publish')
            onClose()
          } else {
            navigate(linkPath)
            onClose()
          }
        }
      }

      parts.push(
        <span
          key={match.index}
          onClick={handleLinkClick}
          style={{
            color: '#4a5568',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1a1a1a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#4a5568'
          }}
        >
          {linkText}
        </span>
      )

      lastIndex = linkRegex.lastIndex
    }

    // 添加剩余的文本
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return parts.length > 0 ? parts : content
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setSending(true)

    try {
      const response = await aiCustomerService.chat(inputValue.trim())
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.reply || '抱歉，我暂时无法回答您的问题，请稍后再试。',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('AI客服回复失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      message.error('发送失败，请稍后再试')
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    // 保留消息历史，不清空
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <RobotOutlined style={{ color: '#1890ff' }} />
          <span>小象AI客服</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      className="ai-customer-service-modal"
      transitionName=""
      maskTransitionName=""
      styles={{ 
        body: { padding: 0, height: '600px', display: 'flex', flexDirection: 'column', background: 'transparent' },
        content: {
          background: 'rgba(255, 255, 255, 0.35) !important',
          backdropFilter: 'blur(25px) saturate(180%) !important',
          WebkitBackdropFilter: 'blur(25px) saturate(180%) !important',
          border: '1px solid rgba(187, 222, 251, 0.5) !important',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.2) !important',
          borderRadius: '12px',
        },
        header: {
          background: 'transparent !important',
          borderBottom: '1px solid rgba(187, 222, 251, 0.3) !important',
          padding: '16px 20px !important',
        },
        mask: {
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <div className="flex flex-col h-full">
        {/* 消息列表 */}
        <div 
          className="flex-1 overflow-y-auto p-4" 
          style={{ 
            backgroundColor: 'rgba(245, 249, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '12px',
            margin: '8px',
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: '#4a4a4a' }}>
              <RobotOutlined style={{ fontSize: '48px', color: '#4a4a4a' }} />
              <p className="mt-4 text-sm" style={{ color: '#666' }}>来和小象说点什么～</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user'
                const prevMessage = index > 0 ? messages[index - 1] : null
                
                // 判断是否应该显示时间戳：第一条消息，或时间戳字符串与上一条不同
                const shouldShowTime = (() => {
                  if (!prevMessage) return true
                  const currentTimeStr = formatMessageTime(msg.timestamp)
                  const prevTimeStr = formatMessageTime(prevMessage.timestamp)
                  return currentTimeStr !== prevTimeStr
                })()
                
                return (
                  <div key={msg.id}>
                    {shouldShowTime && (
                      <div className="flex justify-center my-2">
                        <div 
                          className="text-xs text-gray-400" 
                          style={{ 
                            fontSize: '11px', 
                            padding: '4px 8px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.4)',
                            backdropFilter: 'blur(10px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                            border: '1px solid rgba(187, 222, 251, 0.2)',
                            boxShadow: '0 1px 4px rgba(144, 202, 249, 0.08)',
                            borderRadius: '4px',
                            color: '#4a4a4a',
                          }}
                        >
                          {formatMessageTime(msg.timestamp)}
                        </div>
                      </div>
                    )}
                    <div
                      className={`flex mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start ${isUser ? 'flex-row-reverse' : ''}`} style={{ gap: '6px', maxWidth: isUser ? '100%' : '80%' }}>
                        {!isUser && (
                          <Avatar
                            icon={<RobotOutlined />}
                            style={{ backgroundColor: 'rgba(227, 242, 253, 0.8)', backdropFilter: 'blur(10px)', flexShrink: 0, width: '32px', height: '32px' }}
                            size="small"
                          />
                        )}
                        {isUser && (
                          <Avatar 
                            src={user?.avatar?.trim() ? getAvatarUrl(user.avatar) : undefined} 
                            size="small"
                            style={!user?.avatar?.trim() ? { backgroundColor: 'rgba(227, 242, 253, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '32px', height: '32px' } : { flexShrink: 0, width: '32px', height: '32px' }}
                            icon={!user?.avatar?.trim() ? <ElephantIcon size={16} /> : undefined}
                          >
                            {user?.avatar?.trim() ? (user.username?.[0]?.toUpperCase() || '?') : undefined}
                          </Avatar>
                        )}
                        <div
                          className={`px-3 py-2`}
                          style={{
                            borderRadius: '12px',
                            fontSize: '14px',
                            lineHeight: '20px',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            maxWidth: '100%',
                            background: isUser 
                              ? 'rgba(227, 242, 253, 0.6)' // 用户消息：淡蓝白色毛玻璃
                              : 'rgba(255, 255, 255, 0.35)', // AI消息：白色半透明毛玻璃
                            backdropFilter: 'blur(10px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                            border: '1px solid rgba(187, 222, 251, 0.3)',
                            boxShadow: '0 2px 8px rgba(144, 202, 249, 0.1)',
                            color: isUser ? '#1a1a1a' : '#333',
                          }}
                        >
                          {isUser ? msg.content : renderMessageContent(msg.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {sending && (
                <div className="flex justify-start mb-2">
                  <div className="flex items-start gap-2">
                    <Avatar
                      icon={<RobotOutlined />}
                      style={{ backgroundColor: '#1890ff', flexShrink: 0, width: '32px', height: '32px' }}
                      size="small"
                    />
                    <div 
                      className="px-3 py-2 rounded-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(10px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                        border: '1px solid rgba(187, 222, 251, 0.3)',
                        boxShadow: '0 2px 8px rgba(144, 202, 249, 0.1)',
                      }}
                    >
                      <Spin size="small" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 输入框 */}
        <div 
          className="border-t p-3" 
          style={{ 
            borderTop: '1px solid rgba(187, 222, 251, 0.4)',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '12px',
            margin: '8px',
          }}
        >
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              placeholder="输入您的问题..."
              disabled={sending}
              style={{ 
                borderRadius: '20px', 
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(187, 222, 251, 0.4)',
                boxShadow: '0 2px 8px rgba(144, 202, 249, 0.1)',
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sending}
              style={{ 
                borderRadius: '20px',
                background: 'rgba(227, 242, 253, 0.8)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(187, 222, 251, 0.6)',
                boxShadow: '0 2px 8px rgba(144, 202, 249, 0.15)',
                color: '#1a1a1a',
              }}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
