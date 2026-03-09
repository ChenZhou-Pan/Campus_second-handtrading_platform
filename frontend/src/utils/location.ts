import { schoolData, SchoolOption } from '@/data/schools'

/**
 * 将拼音格式的 location 转换为中文显示
 * 例如: "guangdong / shenzhen / sust" -> "广东省 / 深圳市 / 深圳大学"
 */
export const convertLocationToChinese = (location: string | undefined): string => {
  if (!location) return ''
  
  // 如果已经是中文（包含中文字符），直接返回
  if (/[\u4e00-\u9fa5]/.test(location)) {
    return location
  }
  
  // 分割 location 字符串
  const parts = location.split(' / ').map(part => part.trim()).filter(Boolean)
  if (parts.length === 0) return location
  
  const labels: string[] = []
  
  // 三级结构：省份 -> 城市 -> 学校
  if (parts.length >= 1) {
    // 查找省份
    const province = schoolData.find(p => p.value === parts[0])
    if (province) {
      labels.push(province.label)
      
      // 查找城市
      if (parts.length >= 2 && province.children) {
        const city = province.children.find(c => c.value === parts[1])
        if (city) {
          labels.push(city.label)
          
          // 查找学校
          if (parts.length >= 3 && city.children) {
            const school = city.children.find(s => s.value === parts[2])
            if (school) {
              labels.push(school.label)
            } else {
              // 学校找不到，使用原值
              labels.push(parts[2])
            }
          }
        } else {
          // 城市找不到，尝试直接在城市列表中搜索（处理跨省份的情况）
          let found = false
          for (const p of schoolData) {
            if (p.children) {
              const c = p.children.find(c => c.value === parts[1])
              if (c) {
                labels.push(c.label)
                found = true
                // 继续查找学校
                if (parts.length >= 3 && c.children) {
                  const s = c.children.find(s => s.value === parts[2])
                  if (s) {
                    labels.push(s.label)
                  } else {
                    labels.push(parts[2])
                  }
                }
                break
              }
            }
          }
          if (!found) {
            labels.push(parts[1])
            if (parts.length >= 3) {
              labels.push(parts[2])
            }
          }
        }
      }
    } else {
      // 省份找不到，尝试在所有数据中搜索
      let found = false
      for (const p of schoolData) {
        if (p.value === parts[0]) {
          labels.push(p.label)
          found = true
          break
        }
        if (p.children) {
          for (const c of p.children) {
            if (c.value === parts[0]) {
              labels.push(c.label)
              found = true
              // 继续查找学校
              if (parts.length >= 2 && c.children) {
                const s = c.children.find(s => s.value === parts[1])
                if (s) {
                  labels.push(s.label)
                } else {
                  labels.push(parts[1])
                }
              }
              break
            }
            if (c.children) {
              const s = c.children.find(s => s.value === parts[0])
              if (s) {
                labels.push(s.label)
                found = true
                break
              }
            }
          }
        }
        if (found) break
      }
      
      // 如果还是找不到，使用原值
      if (!found) {
        return location
      }
    }
  }
  
        return labels.length > 0 ? labels.join(' / ') : location
      }

/**
 * 从 location 字符串中提取学校名称（最后一部分）
 * 例如: "广东省 / 深圳市 / 深圳大学" -> "深圳大学"
 */
export const getSchoolFromLocation = (location: string | undefined): string => {
  if (!location) return ''
  
  // 如果已经是中文格式，分割并取最后一部分
  if (location.includes(' / ')) {
    const parts = location.split(' / ').map(part => part.trim()).filter(Boolean)
    if (parts.length >= 3) {
      return parts[2] // 学校是第三部分
    } else if (parts.length === 2) {
      return parts[1] // 如果只有两部分，返回第二部分
    }
  }
  
  // 如果是拼音格式，先转换为中文再提取
  const chineseLocation = convertLocationToChinese(location)
  if (chineseLocation.includes(' / ')) {
    const parts = chineseLocation.split(' / ').map(part => part.trim()).filter(Boolean)
    if (parts.length >= 3) {
      return parts[2]
    } else if (parts.length === 2) {
      return parts[1]
    }
  }
  
  return ''
}

/**
 * 从 location 字符串中提取省市和学校信息
 * 例如: "广东省 / 深圳市 / 深圳大学" -> "广东省 / 深圳市 / 深圳大学"
 * 返回格式: "省市 / 学校" 或 "省市学校"
 */
export const getLocationWithSchool = (location: string | undefined): string => {
  if (!location) return ''
  
  // 先转换为中文格式
  const chineseLocation = convertLocationToChinese(location)
  
  // 如果已经是中文格式，直接返回
  if (chineseLocation.includes(' / ')) {
    return chineseLocation
  }
  
  return chineseLocation
}
