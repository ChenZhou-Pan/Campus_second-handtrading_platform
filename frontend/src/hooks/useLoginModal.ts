import { useNavigate } from 'react-router-dom'

/**
 * 用于打开登录模态框的 hook
 * 通过设置 localStorage 标记，Layout 组件会检测并打开登录模态框
 */
export const useLoginModal = () => {
  const navigate = useNavigate()

  const openLoginModal = (tab: 'login' | 'register' = 'login') => {
    // 设置标记，Layout 组件会检测并打开登录模态框
    sessionStorage.setItem('openLoginModal', tab)
    navigate('/')
  }

  return { openLoginModal }
}
