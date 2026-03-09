// 搜索历史管理工具

const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY_COUNT = 10 // 最多保存10条历史记录

export interface SearchHistoryItem {
  keyword: string
  timestamp: number
}

/**
 * 获取搜索历史
 */
export const getSearchHistory = (): SearchHistoryItem[] => {
  try {
    const historyStr = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (!historyStr) return []
    
    const history = JSON.parse(historyStr) as SearchHistoryItem[]
    // 按时间倒序排列，最新的在前面
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to get search history:', error)
    return []
  }
}

/**
 * 添加搜索历史
 */
export const addSearchHistory = (keyword: string): void => {
  if (!keyword || !keyword.trim()) return
  
  const trimmedKeyword = keyword.trim()
  
  try {
    const history = getSearchHistory()
    
    // 移除重复的关键词（如果存在）
    const filteredHistory = history.filter(item => item.keyword !== trimmedKeyword)
    
    // 添加新的搜索记录到最前面
    const newHistory: SearchHistoryItem[] = [
      { keyword: trimmedKeyword, timestamp: Date.now() },
      ...filteredHistory
    ].slice(0, MAX_HISTORY_COUNT) // 只保留最新的10条
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  } catch (error) {
    console.error('Failed to add search history:', error)
  }
}

/**
 * 删除单条搜索历史
 */
export const removeSearchHistory = (keyword: string): void => {
  try {
    const history = getSearchHistory()
    const filteredHistory = history.filter(item => item.keyword !== keyword)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory))
  } catch (error) {
    console.error('Failed to remove search history:', error)
  }
}

/**
 * 清空所有搜索历史
 */
export const clearSearchHistory = (): void => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch (error) {
    console.error('Failed to clear search history:', error)
  }
}
