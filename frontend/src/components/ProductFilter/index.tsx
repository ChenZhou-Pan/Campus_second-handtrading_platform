import React, { useState, useEffect, useRef } from 'react'
import { Cascader, InputNumber, Button, Space, Card } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { categoryData, type CategoryOption } from '@/data/categories'
import { schoolData, type SchoolOption } from '@/data/schools'
import './index.css'

export interface FilterValues {
  category?: string
  location?: string // 省市学校，格式：省 / 市 / 学校
  minPrice?: number
  maxPrice?: number
}

interface ProductFilterProps {
  onFilterChange: (filters: FilterValues) => void
  initialFilters?: FilterValues
}

// 根据 value 路径查找对应的 label 路径（用于学校）
const getLabelsFromValues = (values: string[], options: SchoolOption[]): string[] => {
  const labels: string[] = []
  let currentOptions = options
  
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    const option = currentOptions.find(opt => opt.value === value)
    
    if (option) {
      labels.push(option.label)
      if (option.children && i < values.length - 1) {
        currentOptions = option.children
      }
    } else {
      labels.push(value)
    }
  }
  
  return labels
}

// 根据 location 字符串（"省 / 市 / 学校"）转换为 value 数组
const getValuesFromLocation = (location: string, options: SchoolOption[]): string[] | undefined => {
  if (!location) return undefined
  
  const parts = location.split(' / ')
  if (parts.length === 0) return undefined
  
  const findValue = (label: string, opts: SchoolOption[]): string | null => {
    for (const opt of opts) {
      if (opt.label === label) {
        return opt.value
      }
      if (opt.children) {
        const found = findValue(label, opt.children)
        if (found) return found
      }
    }
    return null
  }
  
  const values: string[] = []
  let currentOptions = options
  
  for (const part of parts) {
    const value = findValue(part.trim(), currentOptions)
    if (value) {
      values.push(value)
      const option = currentOptions.find(opt => opt.value === value)
      if (option?.children) {
        currentOptions = option.children
      }
    } else {
      return undefined
    }
  }
  
  return values.length > 0 ? values : undefined
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  onFilterChange,
  initialFilters = {},
}) => {
  // 商品类别：Cascader 返回数组，需要转换为字符串
  const [categoryValue, setCategoryValue] = useState<string[] | undefined>(
    initialFilters.category 
      ? initialFilters.category.includes('/') 
        ? initialFilters.category.split('/')
        : [initialFilters.category]
      : undefined
  )
  
  // 学校位置：Cascader 返回数组，需要转换为 "省 / 市 / 学校" 格式
  const [locationValue, setLocationValue] = useState<string[] | undefined>(
    initialFilters.location
      ? getValuesFromLocation(initialFilters.location, schoolData)
      : undefined
  )
  
  const [minPrice, setMinPrice] = useState<number | undefined>(initialFilters.minPrice)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialFilters.maxPrice)

  // 同步 initialFilters 的变化
  useEffect(() => {
    setCategoryValue(
      initialFilters.category 
        ? initialFilters.category.includes('/') 
          ? initialFilters.category.split('/')
          : [initialFilters.category]
        : undefined
    )
    setLocationValue(
      initialFilters.location
        ? getValuesFromLocation(initialFilters.location, schoolData)
        : undefined
    )
    setMinPrice(initialFilters.minPrice)
    setMaxPrice(initialFilters.maxPrice)
  }, [initialFilters.category, initialFilters.location, initialFilters.minPrice, initialFilters.maxPrice])

  // 当筛选条件改变时，通知父组件
  const prevFiltersRef = useRef<FilterValues>({})
  
  useEffect(() => {
    // 转换类别：数组转字符串
    let category: string | undefined = undefined
    if (categoryValue && categoryValue.length > 0) {
      if (categoryValue.length >= 2) {
        category = `${categoryValue[0]}/${categoryValue[1]}`
      } else {
        category = categoryValue[0]
      }
    }
    
    // 转换位置：数组转 "省 / 市 / 学校" 格式
    let location: string | undefined = undefined
    if (locationValue && locationValue.length > 0) {
      const labels = getLabelsFromValues(locationValue, schoolData)
      location = labels.join(' / ')
    }
    
    const currentFilters = {
      category,
      location,
      minPrice,
      maxPrice,
    }
    
    // 只有当筛选条件真正改变时才调用 onFilterChange
    const hasChanged = 
      prevFiltersRef.current.category !== currentFilters.category ||
      prevFiltersRef.current.location !== currentFilters.location ||
      prevFiltersRef.current.minPrice !== currentFilters.minPrice ||
      prevFiltersRef.current.maxPrice !== currentFilters.maxPrice
    
    if (hasChanged) {
      prevFiltersRef.current = currentFilters
      onFilterChange(currentFilters)
    }
  }, [categoryValue, locationValue, minPrice, maxPrice, onFilterChange])

  const handleReset = () => {
    setCategoryValue(undefined)
    setLocationValue(undefined)
    setMinPrice(undefined)
    setMaxPrice(undefined)
  }

  return (
    <Card 
      className="product-filter-card fade-in" 
      size="small"
      style={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      <Space size="middle" wrap>
        {/* 商品类别 */}
        <div className="filter-item">
          <span className="filter-label">商品类别：</span>
          <Cascader
            options={categoryData}
            value={categoryValue}
            onChange={(value) => setCategoryValue(value as string[] | undefined)}
            placeholder="选择分类"
            allowClear
            showSearch={{
              filter: (inputValue, path) => {
                return path.some(
                  (option) =>
                    (option.label as string)
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) > -1
                )
              },
            }}
            displayRender={(labels) => {
              if (labels && labels.length > 0) {
                return labels.join(' / ')
              }
              return '请选择分类'
            }}
            style={{ width: 200 }}
          />
        </div>

        {/* 学校 */}
        <div className="filter-item">
          <span className="filter-label">学校：</span>
          <Cascader
            options={schoolData}
            value={locationValue}
            onChange={(value) => setLocationValue(value as string[] | undefined)}
            placeholder="请选择省份/城市/学校"
            allowClear
            showSearch={{
              filter: (inputValue, path) => {
                return path.some(
                  (option) =>
                    (option.label as string)
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) > -1
                )
              },
            }}
            displayRender={(labels) => {
              if (labels && labels.length > 0) {
                return labels.join(' / ')
              }
              return '请选择位置'
            }}
            style={{ width: 250 }}
          />
        </div>

        {/* 价格范围 */}
        <div className="filter-item">
          <span className="filter-label">价格：</span>
          <Space>
            <InputNumber
              placeholder="最低价"
              value={minPrice}
              onChange={(value) => setMinPrice(value || undefined)}
              min={0}
              precision={0}
              style={{ width: 100 }}
            />
            <span style={{ color: '#999' }}>~</span>
            <InputNumber
              placeholder="最高价"
              value={maxPrice}
              onChange={(value) => setMaxPrice(value || undefined)}
              min={minPrice || 0}
              precision={0}
              style={{ width: 100 }}
            />
          </Space>
        </div>

        {/* 重置按钮 */}
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          重置
        </Button>
      </Space>
    </Card>
  )
}
