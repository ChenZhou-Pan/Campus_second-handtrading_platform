import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tooltip } from 'antd'
import {
  PlusOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
  QuestionCircleOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { useLoginModal } from '@/hooks/useLoginModal'
import { useMessage } from '@/hooks/useMessage'
import { ChatModal } from '@/components/ChatModal'
import { AICustomerServiceModal } from '@/components/AICustomerServiceModal'
import './index.css'

export const FloatingSidebar: React.FC = () => {
  const navigate = useNavigate()
  const message = useMessage()
  const { user } = useAuth()
  const { openLoginModal } = useLoginModal()
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [chatModalVisible, setChatModalVisible] = useState(false)
  const [aiCustomerServiceModalVisible, setAiCustomerServiceModalVisible] = useState(false)
  const [messagesModalVisible, setMessagesModalVisible] = useState(false)

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      // 当滚动超过300px时显示回顶部按钮
      setShowBackToTop(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 回顶部功能
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // 发闲置（发布商品）
  const handlePublish = () => {
    if (!user) {
      message.warning('请先登录')
      openLoginModal('login')
      return
    }
    
    navigate('/publish')
  }

  // 消息 - 打开聊天弹窗
  const handleMessages = (e: React.MouseEvent<HTMLElement>) => {
    if (!user) {
      message.warning('请先登录')
      openLoginModal('login')
      return
    }
    setChatModalVisible(true)
    // 移除按钮焦点，恢复默认状态
    if (e.currentTarget) {
      e.currentTarget.blur()
    }
  }

  // 反馈
  const handleFeedback = () => {
    if (!user) {
      message.warning('请先登录')
      openLoginModal('login')
      return
    }
    navigate('/feedback')
  }

  // 客服 - 打开AI客服弹窗
  const handleCustomerService = (e: React.MouseEvent<HTMLElement>) => {
    if (!user) {
      message.warning('请先登录')
      openLoginModal('login')
      return
    }
    setAiCustomerServiceModalVisible(true)
    // 移除按钮焦点，恢复默认状态
    if (e.currentTarget) {
      e.currentTarget.blur()
    }
  }

  return (
    <div className="floating-sidebar">
      {/* 发闲置 */}
      <Tooltip title="发闲置" placement="left">
        <Button
          type="text"
          size="large"
          icon={<PlusOutlined />}
          onClick={handlePublish}
          className="floating-button publish-button"
        />
      </Tooltip>

      <div className="floating-divider" />

      {/* 消息 */}
      <Tooltip title="消息" placement="left">
        <Button
          type="text"
          size="large"
          icon={<MessageOutlined />}
          onClick={handleMessages}
          className="floating-button message-button"
          onBlur={(e) => {
            // 确保失去焦点时恢复默认样式
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        />
      </Tooltip>

      <div className="floating-divider" />

      {/* 反馈 */}
      <Tooltip title="反馈" placement="left">
        <Button
          type="text"
          size="large"
          icon={<QuestionCircleOutlined />}
          onClick={handleFeedback}
          className="floating-button feedback-button"
        />
      </Tooltip>

      <div className="floating-divider" />

      {/* 客服 */}
      <Tooltip title="客服" placement="left">
        <Button
          type="text"
          size="large"
          icon={<CustomerServiceOutlined />}
          onClick={handleCustomerService}
          className="floating-button service-button"
          onBlur={(e) => {
            // 确保失去焦点时恢复默认样式
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        />
      </Tooltip>

      {/* 回顶部 - 滚动一定距离后显示 */}
      {showBackToTop && (
        <>
          <div className="floating-divider" />
          <Tooltip title="回顶部" placement="left">
            <Button
              type="text"
              size="large"
              icon={<VerticalAlignTopOutlined />}
              onClick={handleBackToTop}
              className="floating-button back-to-top-button"
            />
          </Tooltip>
        </>
      )}

      {/* 聊天弹窗 */}
      <ChatModal
        visible={chatModalVisible}
        onClose={() => {
          setChatModalVisible(false)
          // 弹窗关闭时，移除所有按钮的焦点
          setTimeout(() => {
            const buttons = document.querySelectorAll('.floating-button')
            buttons.forEach(btn => (btn as HTMLElement).blur())
          }, 100)
        }}
      />

      {/* AI客服弹窗 */}
      <AICustomerServiceModal
        visible={aiCustomerServiceModalVisible}
        onClose={() => {
          setAiCustomerServiceModalVisible(false)
          // 弹窗关闭时，移除所有按钮的焦点
          setTimeout(() => {
            const buttons = document.querySelectorAll('.floating-button')
            buttons.forEach(btn => (btn as HTMLElement).blur())
          }, 100)
        }}
        onOpenMessages={() => {
          setMessagesModalVisible(true)
        }}
      />

      {/* 消息弹窗（用于AI客服跳转） */}
      <ChatModal
        visible={messagesModalVisible}
        onClose={() => {
          setMessagesModalVisible(false)
          // 弹窗关闭时，移除所有按钮的焦点
          setTimeout(() => {
            const buttons = document.querySelectorAll('.floating-button')
            buttons.forEach(btn => (btn as HTMLElement).blur())
          }, 100)
        }}
      />
    </div>
  )
}
