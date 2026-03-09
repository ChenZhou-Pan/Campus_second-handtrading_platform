import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, List, Avatar, Badge, Empty, Spin, Input, Button, message, Checkbox } from 'antd'
import '../../components/Layout/index.css'
import { SendOutlined, UserAddOutlined, SettingOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { messageService } from '@/services/messageService'
import { authService } from '@/services/authService'
import { getAvatarUrl } from '@/utils/avatar'
import { formatMessageTime } from '@/utils/dateFormat'
import { useAuth } from '@/contexts/AuthContext'
import type { Message, Conversation, User } from '@/types'

interface ChatModalProps {
  visible: boolean
  onClose: () => void
  initialConversationId?: string
  initialUserId?: string
  productId?: string
}

export const ChatModal: React.FC<ChatModalProps> = ({
  visible,
  onClose,
  initialConversationId,
  initialUserId,
  productId,
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 搜索用户相关状态
  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchedUser, setSearchedUser] = useState<User | null>(null)
  
  // 多选删除相关状态
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedConversationIds, setSelectedConversationIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const fetchConversations = useCallback(async () => {
    setConversationsLoading(true)
    try {
      const response = await messageService.getConversations({ page: 1, pageSize: 100 })
      const items = response.data?.items || []
      setConversations(items)
      return items
    } catch (error) {
      console.error('获取会话列表失败:', error)
      setConversations([])
      return []
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (silent = false) => {
    if (!selectedConversation) return
    if (!silent) {
      setLoading(true)
    }
    try {
      const response = await messageService.getMessages(selectedConversation.id, { page: 1, pageSize: 100 })
      const newMessages = response.data.items || []
      
      setMessages((prevMessages) => {
        // 检查是否有新消息（通过比较消息数量或最后一条消息的ID）
        const hasNewMessages = newMessages.length !== prevMessages.length || 
          (newMessages.length > 0 && prevMessages.length > 0 && 
           newMessages[newMessages.length - 1].id !== prevMessages[prevMessages.length - 1].id)
        
        // 如果有新消息，自动滚动到底部
        if (hasNewMessages) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
        
        return newMessages
      })
      
      // 标记为已读
      await messageService.markAsRead(selectedConversation.id)
    } catch (error) {
      console.error('获取消息失败:', error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [selectedConversation?.id])

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await messageService.getConversationById(conversationId)
      setSelectedConversation(response.data)
      await messageService.markAsRead(conversationId)
    } catch (error) {
      console.error('加载会话失败:', error)
    }
  }

  const handleStartConversation = async (userId: string) => {
    try {
      const response = await messageService.getOrCreateConversation(userId, productId)
      if (response.data) {
        setSelectedConversation(response.data)
        // 刷新会话列表以显示新创建的会话
        await fetchConversations()
      }
    } catch (error) {
      console.error('创建会话失败:', error)
    }
  }

  useEffect(() => {
    if (visible) {
      const init = async () => {
        const items = await fetchConversations()
        // 会话列表加载完成后，处理初始会话或用户
        if (initialConversationId) {
          await loadConversation(initialConversationId)
        } else if (initialUserId) {
          // 检查是否已有会话
          const existingConv = items.find(c => 
            c.participants?.some(p => p.id === initialUserId)
          )
          if (existingConv) {
            setSelectedConversation(existingConv)
          } else {
            await handleStartConversation(initialUserId)
          }
        }
      }
      init()
    } else {
      // 关闭时重置所有状态
      setSelectedConversation(null)
      setMessages([])
      setInputValue('')
      setIsSelectMode(false)
      setSelectedConversationIds(new Set())
    }
  }, [visible, initialConversationId, initialUserId, fetchConversations])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages()
    }
  }, [selectedConversation?.id, fetchMessages])

  // 轮询新消息（每3秒检查一次）
  useEffect(() => {
    if (!visible || !selectedConversation) return

    const pollInterval = setInterval(() => {
      fetchMessages(true) // 静默轮询，不显示loading
    }, 3000) // 每3秒轮询一次

    return () => {
      clearInterval(pollInterval)
    }
  }, [visible, selectedConversation?.id, fetchMessages])

  // 轮询会话列表更新（每5秒检查一次）
  useEffect(() => {
    if (!visible) return

    const pollInterval = setInterval(() => {
      fetchConversations()
    }, 5000) // 每5秒轮询一次

    return () => {
      clearInterval(pollInterval)
    }
  }, [visible, fetchConversations])

  useEffect(() => {
    // 当消息更新时，滚动到底部
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [messages])

  // 计算连续发送的消息数量（从对方最后一条消息之后）
  const getConsecutiveMessageCount = (): number => {
    if (!messages.length || !user) return 0
    
    // 找到对方最后一条消息的索引
    let lastOtherMessageIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId !== user.id) {
        lastOtherMessageIndex = i
        break
      }
    }
    
    // 如果对方从未发送过消息，统计所有当前用户发送的消息
    if (lastOtherMessageIndex === -1) {
      return messages.filter(m => m.senderId === user.id).length
    }
    
    // 统计从对方最后一条消息之后，当前用户发送的消息数量
    let count = 0
    for (let i = lastOtherMessageIndex + 1; i < messages.length; i++) {
      if (messages[i].senderId === user.id) {
        count++
      }
    }
    
    return count
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedConversation) return

    // 检查是否已经发送了3条消息
    const consecutiveCount = getConsecutiveMessageCount()
    if (consecutiveCount >= 3) {
      message.warning('对方未回复之前，最多只能发三条消息，请等待对方回复后再发送')
      return
    }

    setSending(true)
    try {
      const response = await messageService.sendMessage(selectedConversation.id, inputValue.trim())
      // 立即添加新消息到列表
      setMessages((prev) => [...prev, response.data])
      setInputValue('')
      // 刷新会话列表以更新最后一条消息
      fetchConversations()
      // 刷新消息列表以确保同步
      setTimeout(() => fetchMessages(true), 500)
    } catch (error: any) {
      console.error('发送消息失败:', error)
      // 显示错误提示
      const errorMessage = error?.response?.data?.message || error?.message || '发送消息失败'
      message.error(errorMessage)
    } finally {
      setSending(false)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  // 搜索用户
  const handleSearchUser = async () => {
    if (!searchPhone.trim()) {
      message.warning('请输入手机号')
      return
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(searchPhone.trim())) {
      message.warning('手机号格式不正确')
      return
    }
    
    setSearching(true)
    try {
      const response = await authService.searchUserByPhone(searchPhone.trim())
      if (response.data) {
        setSearchedUser(response.data)
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '搜索失败'
      message.error(errorMessage)
      setSearchedUser(null)
    } finally {
      setSearching(false)
    }
  }

  // 开始与搜索到的用户聊天
  const handleStartChatWithSearchedUser = async () => {
    if (!searchedUser) return
    
    try {
      const response = await messageService.getOrCreateConversation(searchedUser.id)
      if (response.data) {
        setSelectedConversation(response.data)
        setSearchModalVisible(false)
        setSearchPhone('')
        setSearchedUser(null)
        await fetchConversations()
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '创建会话失败'
      message.error(errorMessage)
    }
  }

  // 批量删除会话
  const handleBatchDelete = async () => {
    if (selectedConversationIds.size === 0) {
      message.warning('请选择要删除的会话')
      return
    }
    
    setDeleting(true)
    try {
      const deletePromises = Array.from(selectedConversationIds).map(id =>
        messageService.deleteConversation(id).catch(err => {
          console.error(`删除会话 ${id} 失败:`, err)
          return null
        })
      )
      
      await Promise.all(deletePromises)
      
      message.success(`成功删除 ${selectedConversationIds.size} 个会话`)
      setSelectedConversationIds(new Set())
      setIsSelectMode(false)
      
      // 如果当前选中的会话被删除，清空选中状态
      if (selectedConversation && selectedConversationIds.has(selectedConversation.id)) {
        setSelectedConversation(null)
        setMessages([])
      }
      
      // 刷新会话列表
      await fetchConversations()
    } catch (error) {
      message.error('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const otherUser = selectedConversation?.participants?.find((p) => p.id !== user?.id)

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="chat-modal"
      style={{ top: 20 }}
      styles={{ 
        body: { padding: 0, height: '600px', background: 'transparent' },
        content: {
          // 整体容器也使用更透明的毛玻璃，而不是接近纯白
          background: 'rgba(255, 255, 255, 0.35) !important',
          backdropFilter: 'blur(25px) saturate(180%) !important',
          WebkitBackdropFilter: 'blur(25px) saturate(180%) !important',
          border: '1px solid rgba(187, 222, 251, 0.5) !important',
          boxShadow: '0 8px 32px 0 rgba(144, 202, 249, 0.2) !important',
          borderRadius: '12px',
        },
        mask: {
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      }}
      zIndex={2000}
      maskClosable={false}
      destroyOnHidden={false}
      transitionName=""
      maskTransitionName=""
    >
      <div 
        className="flex h-full" 
        style={{ 
          height: '600px',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* 左侧：会话列表 */}
        <div 
          className="w-80 border-r flex flex-col" 
          style={{ 
            borderRight: '1px solid rgba(187, 222, 251, 0.4)',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 1,
            borderRadius: '12px 0 0 12px',
            marginLeft: '8px',
            marginTop: '8px',
            marginBottom: '8px',
            overflow: 'hidden',
          }}
        >
          <div 
            className="p-4 border-b flex items-center justify-between" 
            style={{ 
              borderBottom: '1px solid rgba(187, 222, 251, 0.4)',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRadius: '12px 0 0 0',
              minHeight: '56px',
              boxSizing: 'border-box',
            }}
          >
            <h3 className="text-lg font-semibold m-0">消息</h3>
            <div className="flex gap-2">
              <Button 
                type="text" 
                icon={<UserAddOutlined />} 
                size="small" 
                onClick={() => setSearchModalVisible(true)}
                title="搜索用户"
              />
              <Button 
                type="text" 
                icon={isSelectMode ? <DeleteOutlined /> : <SettingOutlined />} 
                size="small" 
                onClick={() => {
                  setIsSelectMode(!isSelectMode)
                  if (isSelectMode) {
                    setSelectedConversationIds(new Set())
                  }
                }}
                title={isSelectMode ? "取消选择" : "选择删除"}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto" style={{ padding: '0 8px 16px 8px' }}>
            {conversationsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spin />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <Empty 
                  description="暂无会话"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <>
                {isSelectMode && selectedConversationIds.size > 0 && (
                  <div 
                    className="p-3 flex items-center justify-between" 
                    style={{
                      margin: '8px',
                      borderRadius: '12px',
                      background: 'rgba(255, 247, 230, 0.3)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(187, 222, 251, 0.5)',
                      boxShadow: '0 2px 8px 0 rgba(144, 202, 249, 0.15)',
                    }}
                  >
                    <span className="text-sm">已选择 {selectedConversationIds.size} 个会话</span>
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={deleting}
                      onClick={handleBatchDelete}
                    >
                      删除
                    </Button>
                  </div>
                )}
                <List
                dataSource={conversations}
                renderItem={(conversation) => {
                  const other = conversation.participants?.find((p) => p.id !== user?.id)
                  const isSelected = selectedConversation?.id === conversation.id
                  const isChecked = selectedConversationIds.has(conversation.id)
                  return (
                    <List.Item
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isSelectMode) {
                          // 多选模式：切换选中状态
                          const newSelected = new Set(selectedConversationIds)
                          if (isChecked) {
                            newSelected.delete(conversation.id)
                          } else {
                            newSelected.add(conversation.id)
                          }
                          setSelectedConversationIds(newSelected)
                        } else {
                          // 普通模式：选择会话
                          handleSelectConversation(conversation)
                        }
                      }}
                      style={{
                        padding: '12px 16px',
                        margin: '4px 4px',
                        borderRadius: '12px',
                        backgroundColor: isChecked 
                          ? 'rgba(255, 247, 230, 0.3)' 
                          : (isSelected 
                            ? 'rgba(227, 242, 253, 0.3)' 
                            : 'rgba(255, 255, 255, 0.3)'),
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(187, 222, 251, 0.5)',
                        boxShadow: '0 2px 8px 0 rgba(144, 202, 249, 0.15)',
                        borderBottom: 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 10,
                        userSelect: 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked && !isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
                          e.currentTarget.style.backdropFilter = 'blur(25px) saturate(180%)'
                          e.currentTarget.style.webkitBackdropFilter = 'blur(25px) saturate(180%)'
                          e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(144, 202, 249, 0.2)'
                          e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.7)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked && !isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                          e.currentTarget.style.backdropFilter = 'blur(20px) saturate(180%)'
                          e.currentTarget.style.webkitBackdropFilter = 'blur(20px) saturate(180%)'
                          e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(144, 202, 249, 0.15)'
                          e.currentTarget.style.borderColor = 'rgba(187, 222, 251, 0.5)'
                        }
                      }}
                    >
                      {isSelectMode && (
                        <Checkbox
                          checked={isChecked}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const newSelected = new Set(selectedConversationIds)
                            if (e.target.checked) {
                              newSelected.add(conversation.id)
                            } else {
                              newSelected.delete(conversation.id)
                            }
                            setSelectedConversationIds(newSelected)
                          }}
                          style={{ marginRight: '12px' }}
                        />
                      )}
                      <List.Item.Meta
                        avatar={
                          <Badge count={conversation.unreadCount || 0} offset={[-5, 5]} size="small">
                            <Avatar 
                              src={getAvatarUrl(other?.avatar)} 
                              size="default"
                              style={{ cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (other?.id) {
                                  navigate(`/users/${other.id}/profile`)
                                }
                              }}
                            >
                              {(other?.username || '?')[0]}
                            </Avatar>
                          </Badge>
                        }
                        title={
                          <div className="flex justify-between items-center">
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>
                              {other?.username || '未知用户'}
                            </span>
                            <span 
                              className="text-gray-400"
                              style={{ fontSize: '11px' }}
                            >
                              {conversation.lastMessage
                                ? formatMessageTime(conversation.lastMessage.createdAt)
                                : formatMessageTime(conversation.updatedAt)}
                            </span>
                          </div>
                        }
                        description={
                          <div 
                            className="truncate"
                            style={{
                              fontSize: '12px',
                              color: '#999',
                              marginTop: '4px',
                            }}
                          >
                            {conversation.lastMessage?.content || '暂无消息'}
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
              </>
            )}
          </div>
        </div>

        {/* 右侧：聊天内容 */}
        <div 
          className="flex-1 flex flex-col"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 1,
            borderRadius: '0 12px 12px 0',
            marginRight: '8px',
            marginTop: '8px',
            marginBottom: '8px',
            overflow: 'hidden',
          }}
        >
          {selectedConversation ? (
            <>
              {/* 聊天头部 */}
              <div 
                className="border-b flex items-center gap-3" 
                style={{ 
                  borderBottom: '1px solid rgba(187, 222, 251, 0.4)',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(15px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(15px) saturate(180%)',
                  borderRadius: '0 12px 0 0',
                  padding: '14px 16px',
                  minHeight: '56px',
                  boxSizing: 'border-box',
                }}
              >
                <Avatar 
                  src={getAvatarUrl(otherUser?.avatar)} 
                  size="default"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (otherUser?.id) {
                      navigate(`/users/${otherUser.id}/profile`)
                    }
                  }}
                >
                  {(otherUser?.username || '?')[0]}
                </Avatar>
                <div>
                  <div className="font-medium" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {otherUser?.username || '未知用户'}
                  </div>
                </div>
              </div>

              {/* 消息列表 */}
              <div 
                className="flex-1 overflow-y-auto p-4" 
                style={{ 
                  backgroundColor: 'rgba(245, 249, 255, 0.2)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                }}
              >
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Spin size="large" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Empty 
                      description="尚未选择任何联系人"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <div className="text-gray-500 text-sm mt-2">快点左侧列表聊起来吧~</div>
                  </div>
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
                              <div 
                                className="text-xs text-gray-400" 
                                style={{ 
                                  fontSize: '11px', 
                                  padding: '4px 8px', 
                                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                  backdropFilter: 'blur(10px) saturate(180%)',
                                  WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                                  border: '1px solid rgba(187, 222, 251, 0.3)',
                                  borderRadius: '8px',
                                  boxShadow: '0 1px 4px 0 rgba(144, 202, 249, 0.1)',
                                }}
                              >
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
                                style={{ cursor: isOwn ? 'default' : 'pointer', flexShrink: 0, width: '32px', height: '32px' }}
                                onClick={() => {
                                  if (!isOwn && message.sender?.id) {
                                    navigate(`/users/${message.sender.id}/profile`)
                                  }
                                }}
                              >
                                {isOwn 
                                  ? (user?.username || '?')[0]
                                  : (message.sender?.username || '?')[0]}
                              </Avatar>
                              <div
                                className={`px-3 py-2 text-gray-800`}
                                style={{
                                  borderRadius: isOwn ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                  fontSize: '14px',
                                  lineHeight: '20px',
                                  wordBreak: 'break-word',
                                  maxWidth: '100%',
                                  background: isOwn 
                                    ? 'rgba(227, 242, 253, 0.8)' 
                                    : 'rgba(255, 255, 255, 0.5)',
                                  backdropFilter: 'blur(15px) saturate(180%)',
                                  WebkitBackdropFilter: 'blur(15px) saturate(180%)',
                                  color: isOwn ? '#1a1a1a' : '#333',
                                  border: '1px solid rgba(187, 222, 251, 0.4)',
                                  boxShadow: '0 2px 8px 0 rgba(144, 202, 249, 0.1)',
                                }}
                              >
                                {message.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {/* 显示连续发送消息提示 */}
                    {(() => {
                      const consecutiveCount = getConsecutiveMessageCount()
                      if (consecutiveCount >= 3 && user) {
                        return (
                          <div className="flex justify-center mb-4">
                            <div
                              className="px-4 py-2 rounded-lg"
                              style={{ 
                                fontSize: '13px', 
                                color: '#856404',
                                backgroundColor: 'rgba(255, 247, 230, 0.5)',
                                backdropFilter: 'blur(15px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(15px) saturate(180%)',
                                border: '1px solid rgba(187, 222, 251, 0.4)',
                                boxShadow: '0 2px 8px 0 rgba(144, 202, 249, 0.1)',
                              }}
                            >
                              ⚠️ 您已连续发送{consecutiveCount}条消息，请等待对方回复后再发送
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
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
                  borderRadius: '0 0 12px 0',
                }}
              >
                {(() => {
                  const consecutiveCount = getConsecutiveMessageCount()
                  const isDisabled = consecutiveCount >= 3
                  return (
                    <>
                      {isDisabled && (
                        <div className="mb-2 text-xs text-yellow-600" style={{ fontSize: '12px' }}>
                          ⚠️ 对方未回复之前，最多只能发三条消息
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onPressEnter={handleSend}
                          placeholder={isDisabled ? "请等待对方回复后再发送..." : "输入消息..."}
                          disabled={sending || isDisabled}
                          style={{ 
                            borderRadius: '20px', 
                            fontSize: '14px',
                            background: 'rgba(255, 255, 255, 0.5)',
                            backdropFilter: 'blur(15px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(15px) saturate(180%)',
                            border: '1px solid rgba(187, 222, 251, 0.5)',
                            boxShadow: '0 2px 8px 0 rgba(144, 202, 249, 0.1)',
                          }}
                        />
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleSend}
                          loading={sending}
                          disabled={isDisabled}
                          style={{ borderRadius: '20px' }}
                        >
                          发送
                        </Button>
                      </div>
                    </>
                  )
                })()}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Empty 
                description="尚未选择任何联系人"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <div className="text-gray-500 text-sm mt-2">快点左侧列表聊起来吧~</div>
            </div>
          )}
        </div>
      </div>

      {/* 搜索用户弹窗 */}
      <Modal
        title="搜索用户"
        open={searchModalVisible}
        onCancel={() => {
          setSearchModalVisible(false)
          setSearchPhone('')
          setSearchedUser(null)
        }}
        footer={null}
        width={400}
      >
        <div className="space-y-4">
          <div 
            className="goofish-search-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '20px',
              border: '1px solid #1890ff',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              height: '36px',
              padding: '2px',
              gap: '3px',
            }}
          >
            <Input
              placeholder="请输入手机号"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onPressEnter={handleSearchUser}
              maxLength={11}
              size="middle"
              style={{
                flex: 1,
                border: 'none',
                boxShadow: 'none',
                paddingLeft: '12px',
                height: '100%',
                backgroundColor: 'transparent',
                fontSize: '14px',
              }}
              className="goofish-search-input-field-desktop"
            />
            <div
              onClick={handleSearchUser}
              className="goofish-search-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                height: '32px',
                minWidth: '60px',
                padding: '0 12px',
                borderRadius: '18px',
                backgroundColor: 'rgba(227, 242, 253, 0.8)',
                cursor: searching ? 'not-allowed' : 'pointer',
                opacity: searching ? 0.6 : 1,
                userSelect: 'none',
              }}
            >
              {searching ? (
                <Spin size="small" style={{ color: '#fff' }} />
              ) : (
                <>
                  <SearchOutlined style={{ fontSize: '14px', color: '#fff' }} />
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>搜索</span>
                </>
              )}
            </div>
          </div>
          
          {searchedUser && (
            <div className="mt-4 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar src={getAvatarUrl(searchedUser.avatar)} size="large">
                  {searchedUser.username?.[0] || '?'}
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{searchedUser.username}</div>
                  <div className="text-sm text-gray-500">手机号: {searchedUser.phone}</div>
                </div>
                <Button
                  type="primary"
                  onClick={handleStartChatWithSearchedUser}
                >
                  开始聊天
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Modal>
  )
}
