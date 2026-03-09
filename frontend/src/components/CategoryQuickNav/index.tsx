import React from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryData } from '@/data/categories'
import './index.css'

/**
 * 快速类别导航 - 显示热门类别，类似闲鱼的顶部类别导航
 */
export const CategoryQuickNav: React.FC = () => {
  const navigate = useNavigate()

  // 选择一些热门类别作为快速导航
  const quickCategories = [
    { main: 'electronics', sub: 'phone', label: '手机' },
    { main: 'clothing', sub: 'top', label: '上装' },
    { main: 'clothing', sub: 'shoes', label: '鞋子' },
    { main: 'books', sub: 'textbook', label: '教材' },
    { main: 'daily', sub: 'cosmetics', label: '化妆品' },
    { main: 'sports', sub: 'fitness', label: '健身' },
    { main: 'food', sub: 'snacks', label: '零食' },
    { main: 'food', sub: 'drinks', label: '饮料' },
    { main: 'electronics', sub: 'laptop', label: '笔记本' },
    { main: 'daily', sub: 'cleaning', label: '清洁用品' },
  ]

  const handleClick = (main: string, sub: string) => {
    navigate(`/products?category=${encodeURIComponent(`${main}/${sub}`)}`)
  }

  return (
    <div className="category-quick-nav">
      {quickCategories.map((item, index) => (
        <div
          key={index}
          className="category-quick-nav-item"
          onClick={() => handleClick(item.main, item.sub)}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}
