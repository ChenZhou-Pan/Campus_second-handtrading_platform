import React from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryData } from '@/data/categories'
import './index.css'

export const CategoryNav: React.FC = () => {
  const navigate = useNavigate()

  const handleCategoryClick = (mainCategory: string, subCategory?: string) => {
    const categoryPath = subCategory ? `${mainCategory}/${subCategory}` : mainCategory
    navigate(`/products?category=${encodeURIComponent(categoryPath)}`)
  }

  return (
    <div className="category-nav">
      <div className="category-nav-main">
        {categoryData.map((mainCategory) => (
          <div key={mainCategory.value} className="category-nav-item">
            <div
              className="category-nav-main-item"
              onClick={() => handleCategoryClick(mainCategory.value)}
            >
              {mainCategory.label}
            </div>
            {mainCategory.children && mainCategory.children.length > 0 && (
              <div className="category-nav-sub">
                {mainCategory.children.map((subCategory) => (
                  <div
                    key={subCategory.value}
                    className="category-nav-sub-item"
                    onClick={() => handleCategoryClick(mainCategory.value, subCategory.value)}
                  >
                    {subCategory.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
