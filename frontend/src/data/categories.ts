// 商品分类数据（主分类 + 子分类）
export interface CategoryOption {
  value: string
  label: string
  children?: CategoryOption[]
}

export const categoryData: CategoryOption[] = [
  {
    value: 'electronics',
    label: '电子产品',
    children: [
      { value: 'phone', label: '手机' },
      { value: 'tablet', label: '平板电脑' },
      { value: 'laptop', label: '笔记本电脑' },
      { value: 'desktop', label: '台式电脑' },
      { value: 'headphone', label: '耳机/音响' },
      { value: 'camera', label: '相机/摄像机' },
      { value: 'watch', label: '智能手表/手环' },
      { value: 'charger', label: '充电器/数据线' },
      { value: 'storage', label: '存储设备' },
      { value: 'accessories', label: '电子配件' },
      { value: 'other_electronics', label: '其他电子产品' },
    ],
  },
  {
    value: 'books',
    label: '图书教材',
    children: [
      { value: 'textbook', label: '教材/课本' },
      { value: 'reference', label: '参考书' },
      { value: 'novel', label: '小说/文学' },
      { value: 'comic', label: '漫画/绘本' },
      { value: 'magazine', label: '杂志/期刊' },
      { value: 'exam', label: '考试用书' },
      { value: 'language', label: '语言学习' },
      { value: 'professional', label: '专业书籍' },
      { value: 'other_books', label: '其他图书' },
    ],
  },
  {
    value: 'clothing',
    label: '服装配饰',
    children: [
      { value: 'top', label: '上装' },
      { value: 'bottom', label: '下装' },
      { value: 'dress', label: '连衣裙' },
      { value: 'outerwear', label: '外套/大衣' },
      { value: 'shoes', label: '鞋子' },
      { value: 'bag', label: '包包' },
      { value: 'accessories', label: '配饰' },
      { value: 'hat', label: '帽子' },
      { value: 'jewelry', label: '首饰' },
      { value: 'other_clothing', label: '其他服装' },
    ],
  },
  {
    value: 'daily',
    label: '日用百货',
    children: [
      { value: 'cosmetics', label: '化妆品' },
      { value: 'skincare', label: '护肤品' },
      { value: 'personal_care', label: '个人护理' },
      { value: 'kitchen', label: '厨房用品' },
      { value: 'bedding', label: '床上用品' },
      { value: 'storage_box', label: '收纳用品' },
      { value: 'decoration', label: '装饰品' },
      { value: 'stationery', label: '文具用品' },
      { value: 'cleaning', label: '清洁用品' },
      { value: 'other_daily', label: '其他日用品' },
    ],
  },
  {
    value: 'sports',
    label: '运动用品',
    children: [
      { value: 'fitness', label: '健身器材' },
      { value: 'ball', label: '球类用品' },
      { value: 'outdoor', label: '户外装备' },
      { value: 'swimming', label: '游泳用品' },
      { value: 'yoga', label: '瑜伽用品' },
      { value: 'running', label: '跑步装备' },
      { value: 'cycling', label: '骑行装备' },
      { value: 'sports_shoes', label: '运动鞋' },
      { value: 'sports_clothing', label: '运动服装' },
      { value: 'other_sports', label: '其他运动用品' },
    ],
  },
  {
    value: 'food',
    label: '食品饮料',
    children: [
      { value: 'snacks', label: '零食' },
      { value: 'drinks', label: '饮料酒水' },
      { value: 'instant_food', label: '方便食品' },
      { value: 'tea_coffee', label: '茶/咖啡' },
      { value: 'health_food', label: '保健食品' },
      { value: 'other_food', label: '其他食品' },
    ],
  },
  {
    value: 'other',
    label: '其他',
    children: [
      { value: 'furniture', label: '家具' },
      { value: 'appliance', label: '家电' },
      { value: 'toy', label: '玩具/模型' },
      { value: 'musical', label: '乐器' },
      { value: 'art', label: '艺术品/收藏品' },
      { value: 'ticket', label: '票券/卡券' },
      { value: 'service', label: '服务/技能' },
      { value: 'other_other', label: '其他' },
    ],
  },
]

// 根据完整路径（主分类/子分类）获取显示文本
export const getCategoryLabel = (categoryPath: string): string => {
  if (!categoryPath) return ''
  
  // 如果包含斜杠，说明是主分类/子分类格式
  if (categoryPath.includes('/')) {
    const [mainCategory, subCategory] = categoryPath.split('/')
    const main = categoryData.find(c => c.value === mainCategory)
    if (main) {
      const sub = main.children?.find(c => c.value === subCategory)
      if (sub) {
        return `${main.label} / ${sub.label}`
      }
      return main.label
    }
  }
  
  // 兼容旧数据（只有主分类）
  const category = categoryData.find(c => c.value === categoryPath)
  return category ? category.label : categoryPath
}
