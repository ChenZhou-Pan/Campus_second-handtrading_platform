import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Input, Button, List, Avatar, Spin, Empty } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { messageService } from '@/services/messageService'
import { getAvatarUrl } from '@/utils/avatar'
import { formatMessageTime } from '@/utils/dateFormat'
import { useAuth } from '@/contexts/AuthContext'
import type { Message, Conversation } from '@/types'

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) {
      fetchConversation()
      fetchMessages()
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    try {
      const response = await messageService.getConversationById(conversationId!)
      setConversation(response.data)
      // 标记为已读
      await messageService.markAsRead(conversationId!)
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
    }
  }

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response = await messageService.getMessages(conversationId!)
      setMessages(response.data.items)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId) return

    setSending(true)
    try {
      const response = await messageService.sendMessage(conversationId, inputValue.trim())
      setMessages((prev) => [...prev, response.data])
      setInputValue('')
      fetchConversation() // 更新会话信息
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const otherUser = conversation?.participants?.find((p) => p.id !== user?.id)

  return (
    <div className="max-w-full mx-auto h-[calc(100vh-120px)] flex flex-col bg-white" style={{ borderRadius: '4px' }}>
      {conversation && (
        <div className="border-b p-3 bg-white" style={{ borderBottom: '1px solid #ebebeb' }}>
          <div className="flex items-center gap-3">
            <Avatar src={getAvatarUrl(otherUser?.avatar)} size="default">
              {(otherUser?.username || '?')[0]}
            </Avatar>
            <div>
              <div className="font-medium" style={{ fontSize: '15px', fontWeight: 500 }}>
                {otherUser?.username || '未知用户'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#f5f5f5' }}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <Empty description="暂无消息" />
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderId === user?.id
              const prevMessage = index > 0 ? messages[index - 1] : null
              
              // 判断是否应该显示时间戳：第一条消息，或时间戳字符串与上一条不同
              const shouldShowTime = (() => {
                if (!prevMessage) return true
                const currentTimeStr = formatMessageTime(message.createdAt)
                const prevTimeStr = formatMessageTime(prevMessage.createdAt)
                return currentTimeStr !== prevTimeStr
              })()
              
              return (
                <div key={message.id}>
                  {shouldShowTime && (
                    <div className="flex justify-center my-2">
                      <div className="text-xs text-gray-400" style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  )}
                  <div
                    className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start ${isOwn ? 'flex-row-reverse' : ''}`} style={{ gap: '6px', maxWidth: isOwn ? '100%' : '70%' }}>
                      <Avatar 
                        src={getAvatarUrl(isOwn ? user?.avatar : message.sender?.avatar)} 
                        size="small"
                        style={{ flexShrink: 0, width: '32px', height: '32px' }}
                      >
                        {isOwn 
                          ? (user?.username || '?')[0]
                          : (message.sender?.username || '?')[0]}
                      </Avatar>
                      <div
                        className={`px-3 py-2 ${
                          isOwn
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-800'
                        }`}
                        style={{
                          borderRadius: isOwn ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          fontSize: '14px',
                          lineHeight: '20px',
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                        }}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 bg-white" style={{ borderTop: '1px solid #ebebeb' }}>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSend}
            placeholder="输入消息..."
            disabled={sending}
            style={{ borderRadius: '20px', fontSize: '14px' }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={sending}
            style={{ borderRadius: '20px' }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}
