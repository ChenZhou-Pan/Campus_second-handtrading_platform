import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MobileOutlined,
  SkinOutlined,
  GiftOutlined,
  HeartOutlined,
  HomeOutlined,
  CrownOutlined,
  ShoppingOutlined,
  BookOutlined,
  CarOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { categoryData, type CategoryOption } from '@/data/categories'
import './index.css'

// 为每个类别配置图标
const categoryIcons: Record<string, React.ReactNode> = {
  electronics: <MobileOutlined />,
  books: <BookOutlined />,
  clothing: <SkinOutlined />,
  daily: <HomeOutlined />,
  sports: <SkinOutlined />,
  food: <ShoppingOutlined />,
  other: <GiftOutlined />,
}

export const CategorySidebar: React.FC = () => {
  const navigate = useNavigate()
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null)

  const handleCategoryClick = (mainCategory: string, subCategory?: string) => {
    const categoryPath = subCategory ? `${mainCategory}/${subCategory}` : mainCategory
    navigate(`/products?category=${encodeURIComponent(categoryPath)}`)
  }

  const handleMainCategoryClick = (mainCategory: string) => {
    navigate(`/products?category=${encodeURIComponent(mainCategory)}`)
  }

  const handleItemMouseEnter = (e: React.MouseEvent<HTMLDivElement>, mainCategory: CategoryOption) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPopupPosition({
      top: rect.top,
      left: rect.right + 1,
    })
    setHoveredCategory(mainCategory.value)
  }

  return (
    <div className="category-sidebar">
      <div className="category-sidebar-list">
        {categoryData.map((mainCategory) => (
          <div
            key={mainCategory.value}
            className="category-sidebar-item"
            onMouseEnter={(e) => handleItemMouseEnter(e, mainCategory)}
            onMouseLeave={() => {
              setHoveredCategory(null)
              setPopupPosition(null)
            }}
            onClick={() => handleMainCategoryClick(mainCategory.value)}
          >
            <div className="category-sidebar-main">
              <span className="category-sidebar-icon">
                {categoryIcons[mainCategory.value] || <span className="category-icon-dot"></span>}
              </span>
              <span className="category-sidebar-label">{mainCategory.label}</span>
            </div>
          </div>
        ))}
        
        {/* 悬浮时显示子分类 - 使用固定定位 */}
        {hoveredCategory && popupPosition && (() => {
          const mainCategory = categoryData.find(c => c.value === hoveredCategory)
          if (!mainCategory || !mainCategory.children || mainCategory.children.length === 0) return null
          
          return (
            <div 
              className="category-sidebar-popup"
              style={{
                position: 'fixed',
                top: `${popupPosition.top}px`,
                left: `${popupPosition.left}px`,
              }}
              onMouseEnter={() => {
                // 保持显示
              }}
              onMouseLeave={() => {
                setHoveredCategory(null)
                setPopupPosition(null)
              }}
            >
              <div className="category-popup-content">
                {mainCategory.children.map((subCategory) => (
                  <div
                    key={subCategory.value}
                    className="category-popup-item"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategoryClick(mainCategory.value, subCategory.value)
                    }}
                  >
                    {subCategory.label}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
