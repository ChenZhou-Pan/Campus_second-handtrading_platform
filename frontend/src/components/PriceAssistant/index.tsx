import React, { useState } from 'react'
import { Button, Alert } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { productService } from '@/services/productService'
import type { PriceSuggestion, PriceAnalysisRequest } from '@/types'
import './index.css'

interface PriceAssistantProps {
  onPriceSelected?: (price: number) => void
  initialValues?: Partial<PriceAnalysisRequest>
}

export const PriceAssistant: React.FC<PriceAssistantProps> = ({
  onPriceSelected,
  initialValues,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSuggestion, setLastSuggestion] = useState<PriceSuggestion | null>(null)

  // 检查是否有足够的初始值（来自表单）
  const hasInitialValues = initialValues && (
    initialValues.category || 
    initialValues.condition || 
    initialValues.title
  )

  // 处理category：如果是数组，转换为字符串格式
  const getCategoryValue = (category: string | string[] | undefined): string | undefined => {
    if (!category) return undefined
    if (Array.isArray(category)) {
      if (category.length >= 2) {
        return `${category[0]}/${category[1]}`
      } else if (category.length === 1) {
        return category[0]
      }
    }
    return category as string
  }

  // 一键获取定价并自动填入
  const handleAutoPrice = async () => {
    if (!hasInitialValues) {
      setError('请先填写商品类别、成色和标题')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const categoryValue = getCategoryValue(initialValues.category)
      
      const request: PriceAnalysisRequest = {
        category: categoryValue,
        condition: initialValues.condition as any,
        originalPrice: initialValues.originalPrice,
        title: initialValues.title,
        description: initialValues.description,
      }

      const response = await productService.getPriceSuggestion(request)
      const suggestion = response.data
      setLastSuggestion(suggestion)
      
      // 自动填入推荐价格
      onPriceSelected?.(suggestion.recommendedPrice)
    } catch (err: any) {
      setError(err.message || '获取定价失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="price-assistant-simple">
      <Button
        type="primary"
        icon={<ThunderboltOutlined />}
        onClick={handleAutoPrice}
        loading={loading}
        block
        size="large"
        style={{ height: '48px', fontSize: '16px' }}
      >
        {loading ? '正在分析定价...' : '一键智能定价'}
      </Button>
      
      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          className="mt-3" 
          closable
          onClose={() => setError(null)}
        />
      )}

      {lastSuggestion && !error && (
        <div className="mt-3 p-3" style={{ backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #91d5ff' }}>
          <div className="text-sm mb-2" style={{ color: '#1a1a1a', fontWeight: 500 }}>
            ✓ 已自动填入推荐价格：¥{lastSuggestion.recommendedPrice.toFixed(2)}
          </div>
          <div className="text-xs mt-2" style={{ color: '#666', lineHeight: '1.6' }}>
            <div><strong>定价算法说明：</strong></div>
            <div>• <strong>AI定价引擎：</strong>DeepSeek AI智能分析</div>
            <div style={{ marginLeft: '8px' }}>  基于商品信息、市场行情和平台数据综合分析</div>
            <div>• <strong>分析因素：</strong></div>
            <div style={{ marginLeft: '8px' }}>  - 商品标题、描述、类别</div>
            <div style={{ marginLeft: '8px' }}>  - 商品成色（全新/近新/良好/一般/较差）</div>
            {initialValues?.originalPrice && (
              <div style={{ marginLeft: '8px' }}>  - 商品原价：¥{initialValues.originalPrice}</div>
            )}
            <div style={{ marginLeft: '8px' }}>  - 平台内相似商品价格参考</div>
            <div>• <strong>AI优势：</strong>综合考虑市场趋势、商品特性、供需关系等多维度因素</div>
            <div>• <strong>置信度：</strong>{Math.round(lastSuggestion.confidence * 100)}%</div>
            <div style={{ marginLeft: '8px', fontSize: '11px', color: '#999' }}>
              （基于{lastSuggestion.similarProducts.length}个相似商品 + AI智能分析）
            </div>
            <div className="mt-1" style={{ color: '#999' }}>
              建议价格区间：¥{lastSuggestion.minPrice.toFixed(2)} - ¥{lastSuggestion.maxPrice.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
