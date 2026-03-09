/**
 * 格式化消息时间显示
 * - 如果是今天：只显示时间（如 11:42）
 * - 如果不是今天但是今年：显示月日 + 时间（如 1月18日 11:42）
 * - 如果不是今年：显示年月日 + 时间（如 2025年1月18日 11:42）
 */
export function formatMessageTime(date: Date | string): string {
  const messageDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  // 获取年月日
  const messageYear = messageDate.getFullYear()
  const messageMonth = messageDate.getMonth() + 1
  const messageDay = messageDate.getDate()
  
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth() + 1
  const nowDay = now.getDate()
  
  // 获取时间字符串
  const timeString = messageDate.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  
  // 判断是否是今天
  const isToday = 
    messageYear === nowYear && 
    messageMonth === nowMonth && 
    messageDay === nowDay
  
  // 判断是否是今年
  const isThisYear = messageYear === nowYear
  
  if (isToday) {
    // 今天：只显示时间
    return timeString
  } else if (isThisYear) {
    // 今年但不是今天：显示月日 + 时间
    return `${messageMonth}月${messageDay}日 ${timeString}`
  } else {
    // 不是今年：显示年月日 + 时间
    return `${messageYear}年${messageMonth}月${messageDay}日 ${timeString}`
  }
}
