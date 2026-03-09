// 默认头像 - 纯白色图片 (base64编码的1x1白色PNG)
export const DEFAULT_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

/**
 * 获取用户头像，如果没有则返回默认头像
 * @param avatar 用户头像URL
 * @returns 头像URL或默认头像
 */
export const getAvatarUrl = (avatar?: string | null): string => {
  return avatar && avatar.trim() ? avatar : DEFAULT_AVATAR
}
