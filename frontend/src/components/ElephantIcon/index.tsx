import React from 'react'

interface ElephantIconProps {
  style?: React.CSSProperties
  className?: string
  size?: number
}

export const ElephantIcon: React.FC<ElephantIconProps> = ({ style, className, size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
    >
      {/* 小象身体 - 蓝色 */}
      <path
        d="M12 4C9.5 4 7.5 6 7.5 8.5C7.5 9.5 8 10.5 8.5 11.5L7.5 13.5C7 14.5 7 15.5 7.5 16.5L8 18C8.5 19 9.5 19.5 10.5 19.5H13.5C14.5 19.5 15.5 19 16 18L16.5 16.5C17 15.5 17 14.5 16.5 13.5L15.5 11.5C16 10.5 16.5 9.5 16.5 8.5C16.5 6 14.5 4 12 4Z"
        fill="#1890ff"
      />
      {/* 小象耳朵 - 左侧，蓝色 */}
      <ellipse cx="8.5" cy="8.5" rx="2.5" ry="3" fill="#1890ff" />
      {/* 小象耳朵内部 - 左侧，白色 */}
      <ellipse cx="8.5" cy="8.5" rx="1.5" ry="2" fill="white" />
      {/* 小象耳朵 - 右侧，蓝色 */}
      <ellipse cx="15.5" cy="8.5" rx="2.5" ry="3" fill="#1890ff" />
      {/* 小象耳朵内部 - 右侧，白色 */}
      <ellipse cx="15.5" cy="8.5" rx="1.5" ry="2" fill="white" />
      {/* 小象眼睛 - 左侧，白色 */}
      <circle cx="9.5" cy="9" r="1.5" fill="white" />
      <circle cx="9.5" cy="9" r="0.8" fill="#1890ff" />
      {/* 小象眼睛 - 右侧，白色 */}
      <circle cx="14.5" cy="9" r="1.5" fill="white" />
      <circle cx="14.5" cy="9" r="0.8" fill="#1890ff" />
      {/* 小象鼻子/长鼻 - 蓝色 */}
      <path
        d="M12 11.5C11 11.5 10.2 12 9.8 12.8L9.2 14.5C9 15 9.2 15.5 9.7 15.5H14.3C14.8 15.5 15 15 14.8 14.5L14.2 12.8C13.8 12 13 11.5 12 11.5Z"
        fill="#1890ff"
      />
      {/* 鼻子上的白色高光 */}
      <ellipse cx="11" cy="12.5" rx="0.8" ry="0.5" fill="white" opacity="0.6" />
      {/* 鼻子末端 - 蓝色，带白色高光 */}
      <ellipse cx="9" cy="14.5" rx="1.2" ry="1" fill="#1890ff" />
      <ellipse cx="9.2" cy="14.3" rx="0.6" ry="0.5" fill="white" opacity="0.7" />
    </svg>
  )
}
