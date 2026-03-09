import { App } from 'antd'

/**
 * 使用Ant Design的message API
 * 通过App.useApp()获取message实例，支持动态主题
 */
export const useMessage = () => {
  const { message } = App.useApp()
  return message
}
