import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Button,
  Space,
  Divider,
  Typography,
  Cascader,
  App,
  Spin,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { PriceAssistant } from '@/components/PriceAssistant'
import { productService } from '@/services/productService'
import { useAuth } from '@/contexts/AuthContext'
import { schoolData, SchoolOption } from '@/data/schools'
import { categoryData } from '@/data/categories'
import { convertLocationToChinese } from '@/utils/location'
import '../PublishProduct/index.css'

const { TextArea } = Input
const { Option } = Select
const { Text } = Typography

// 根据 value 路径查找对应的 label 路径
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

// 将中文 location 转换为 value 数组（用于 Cascader）
const convertLocationToValues = (location: string | undefined, options: SchoolOption[]): string[] => {
  if (!location) return []
  
  const parts = location.split(' / ').map(part => part.trim()).filter(Boolean)
  if (parts.length === 0) return []
  
  const values: string[] = []
  let currentOptions = options
  
  // 查找省份
  const province = currentOptions.find(p => p.label === parts[0])
  if (province) {
    values.push(province.value)
    currentOptions = province.children || []
    
    // 查找城市
    if (parts.length >= 2 && currentOptions.length > 0) {
      const city = currentOptions.find(c => c.label === parts[1])
      if (city) {
        values.push(city.value)
        currentOptions = city.children || []
        
        // 查找学校
        if (parts.length >= 3 && currentOptions.length > 0) {
          const school = currentOptions.find(s => s.label === parts[2])
          if (school) {
            values.push(school.value)
          }
        }
      }
    }
  }
  
  return values
}

export const EditProductPage: React.FC = () => {
  const { message } = App.useApp()
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [showPriceAssistant, setShowPriceAssistant] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  
  // 监听表单字段变化，检查必填项
  const title = Form.useWatch('title', form)
  const description = Form.useWatch('description', form)
  const category = Form.useWatch('category', form)
  const condition = Form.useWatch('condition', form)
  const price = Form.useWatch('price', form)
  const originalPrice = Form.useWatch('originalPrice', form)
  const location = Form.useWatch('location', form)
  
  // 检查所有必填项是否已填写
  const isFormValid = () => {
    return !!(
      fileList.length > 0 &&
      title &&
      description &&
      category &&
      condition &&
      price &&
      originalPrice &&
      location
    )
  }
  
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  
  useEffect(() => {
    setIsButtonDisabled(!isFormValid())
  }, [title, description, category, condition, price, originalPrice, location, fileList])

  // 清理预览 URL，避免内存泄漏
  useEffect(() => {
    return () => {
      fileList.forEach((file) => {
        // 只清理通过 URL.createObjectURL 创建的 URL
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
        if (file.thumbUrl && file.thumbUrl.startsWith('blob:')) {
          URL.revokeObjectURL(file.thumbUrl)
        }
      })
    }
  }, [fileList])

  // 加载商品数据
  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoadingProduct(true)
      const response = await productService.getProductById(id!)
      const product = response.data
      
      // 转换图片为 UploadFile 格式
      const images = product.images || []
      const uploadFiles: UploadFile[] = images.map((url: string, index: number) => ({
        uid: `-${index}`,
        name: `image-${index}.jpg`,
        status: 'done',
        url: url,
        thumbUrl: url,
      }))
      setFileList(uploadFiles)
      
      // 转换 location 为 Cascader 需要的 value 数组
      const locationValues = convertLocationToValues(product.location, schoolData)
      
      // 转换 category（如果是 "主分类/子分类" 格式，转换为数组）
      let categoryValue = product.category
      if (product.category && product.category.includes('/')) {
        const [main, sub] = product.category.split('/')
        categoryValue = [main.trim(), sub.trim()]
      }
      
      // 设置表单值
      form.setFieldsValue({
        title: product.title,
        description: product.description,
        category: categoryValue,
        condition: product.condition,
        price: product.price,
        originalPrice: product.originalPrice,
        location: locationValues.length > 0 ? locationValues : undefined,
        campus: product.campus,
      })
    } catch (error: any) {
      message.error(error.message || '加载商品信息失败')
      navigate('/my-products')
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // 先上传所有图片到服务器
      const uploadedImages: string[] = []
      
      for (const file of fileList) {
        // 如果已经有服务器URL（已上传过的），直接使用
        if (file.response?.url && !file.response.url.startsWith('blob:')) {
          uploadedImages.push(file.response.url)
        } else if (file.url && !file.url.startsWith('blob:') && !file.url.startsWith('data:')) {
          // 如果URL不是blob或data URL，说明已经是服务器URL
          uploadedImages.push(file.url)
        } else if (file.thumbUrl && !file.thumbUrl.startsWith('blob:') && !file.thumbUrl.startsWith('data:')) {
          uploadedImages.push(file.thumbUrl)
        } else if (file.originFileObj instanceof File) {
          // 如果是File对象，需要上传到服务器
          try {
            const uploadResponse = await productService.uploadProductImage(file.originFileObj)
            uploadedImages.push(uploadResponse.data.url)
          } catch (error: any) {
            message.error(`图片上传失败: ${error.message || '未知错误'}`)
            setLoading(false)
            return
          }
        }
      }

      if (uploadedImages.length === 0) {
        message.error('请至少上传一张商品图片')
        setLoading(false)
        return
      }

      // 将 location 的 value（拼音）转换为 label（中文）
      let locationLabels = values.location
      if (Array.isArray(values.location)) {
        locationLabels = getLabelsFromValues(values.location, schoolData)
      }

      // 处理 category：如果是数组（Cascader 返回的），转换为 "主分类/子分类" 格式
      let categoryValue = values.category
      if (Array.isArray(values.category) && values.category.length >= 2) {
        categoryValue = `${values.category[0]}/${values.category[1]}`
      } else if (Array.isArray(values.category) && values.category.length === 1) {
        categoryValue = values.category[0]
      }

      const productData = {
        ...values,
        category: categoryValue,
        location: locationLabels,
        images: uploadedImages,
      }
      
      await productService.updateProduct(id!, productData)
      message.success('商品更新成功')
      navigate('/my-products')
    } catch (error: any) {
      message.error(error.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePriceSelected = (price: number) => {
    form.setFieldsValue({ price })
    setShowPriceAssistant(false)
  }

  const handleImageChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    // 找出被删除的文件，释放其预览 URL
    const currentFileIds = new Set(newFileList.map(f => f.uid))
    fileList.forEach((file) => {
      if (!currentFileIds.has(file.uid)) {
        // 文件被删除了，释放预览 URL
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
        if (file.thumbUrl && file.thumbUrl.startsWith('blob:')) {
          URL.revokeObjectURL(file.thumbUrl)
        }
      }
    })
    
    // 为新添加的文件创建预览 URL
    const updatedFileList = newFileList.map((file) => {
      // 如果文件已经有 URL（已上传或已有预览），直接返回
      if (file.url || file.thumbUrl || file.response?.url) {
        return file
      }
      
      // 如果是新文件且是 File 对象，创建预览 URL
      if (file.originFileObj instanceof File) {
        const previewUrl = URL.createObjectURL(file.originFileObj)
        return {
          ...file,
          url: previewUrl,
          thumbUrl: previewUrl,
        }
      }
      
      return file
    })
    
    setFileList(updatedFileList)
    form.setFieldsValue({ images: updatedFileList })
    form.validateFields(['images']).catch(() => {})
  }

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件')
      return Upload.LIST_IGNORE
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('图片大小不能超过5MB')
      return Upload.LIST_IGNORE
    }
    return false
  }

  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="publish-page">
      <div className="publish-container">
        <div className="publish-header">
          <Typography.Title level={3} className="publish-title">
            编辑商品
          </Typography.Title>
          <Text type="secondary" className="publish-subtitle">
            修改你的商品信息
          </Text>
        </div>

        <div className="publish-content">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              condition: 'good',
            }}
          >
            {/* 图片上传区域 */}
            <div className="publish-section">
              <div className="section-header">
                <Text strong className="section-title">
                  商品图片
                </Text>
                <Text type="secondary" className="section-hint">
                  最多9张，第一张为主图
                </Text>
              </div>
              <Form.Item
                name="images"
                rules={[
                  {
                    validator: (_, value) => {
                      const currentFileList = fileList.length > 0 ? fileList : (value || [])
                      if (!currentFileList || currentFileList.length === 0) {
                        return Promise.reject(new Error('请上传至少一张商品图片'))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
                className="image-upload-item"
                required
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleImageChange}
                  beforeUpload={beforeUpload}
                  maxCount={9}
                  className="publish-upload"
                >
                  {fileList.length < 9 && (
                    <div className="upload-button">
                      <PlusOutlined />
                      <div className="upload-text">添加图片</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </div>

            <Divider className="section-divider" />

            {/* 基本信息 */}
            <div className="publish-section">
              <div className="section-header">
                <Text strong className="section-title">
                  基本信息
                </Text>
              </div>

              <Form.Item
                name="title"
                label="商品标题"
                rules={[
                  { required: true, message: '请输入商品标题' },
                  { max: 50, message: '标题最多50个字符' },
                ]}
                className="form-item-custom"
              >
                <Input
                  placeholder="一句话描述你的商品"
                  maxLength={50}
                  showCount
                  className="publish-input"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="商品描述"
                rules={[
                  { required: true, message: '请输入商品描述' },
                  { min: 10, message: '描述至少10个字符' },
                  { max: 500, message: '描述最多500个字符' },
                ]}
                className="form-item-custom"
              >
                <TextArea
                  rows={6}
                  placeholder="详细描述商品信息，如新旧程度、使用情况、瑕疵等..."
                  maxLength={500}
                  showCount
                  className="publish-textarea"
                />
              </Form.Item>
            </div>

            <Divider className="section-divider" />

            {/* 商品属性 */}
            <div className="publish-section">
              <div className="section-header">
                <Text strong className="section-title">
                  商品属性
                </Text>
              </div>

              <div className="form-row">
                <Form.Item
                  name="category"
                  label="商品类别"
                  rules={[{ required: true, message: '请选择商品类别' }]}
                  className="form-item-custom form-item-half"
                >
                  <Cascader
                    options={categoryData}
                    placeholder="选择分类"
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
                    className="publish-select"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="condition"
                  label="商品成色"
                  rules={[{ required: true, message: '请选择商品成色' }]}
                  className="form-item-custom form-item-half"
                >
                  <Select placeholder="选择成色" className="publish-select">
                    <Option value="new">全新</Option>
                    <Option value="like_new">几乎全新</Option>
                    <Option value="good">良好</Option>
                    <Option value="fair">一般</Option>
                    <Option value="poor">较差</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            <Divider className="section-divider" />

            {/* 价格信息 */}
            <div className="publish-section">
              <div className="section-header">
                <Text strong className="section-title">
                  价格信息
                </Text>
                <Button
                  type="link"
                  onClick={() => setShowPriceAssistant(!showPriceAssistant)}
                  className="price-assistant-link"
                >
                  {showPriceAssistant ? '隐藏' : '使用'}智能定价助手
                </Button>
              </div>

              {showPriceAssistant && (
                <div className="price-assistant-wrapper">
                  <PriceAssistant
                    onPriceSelected={handlePriceSelected}
                    initialValues={form.getFieldsValue()}
                  />
                </div>
              )}

              <div className="form-row">
                <Form.Item
                  name="price"
                  label="售价"
                  rules={[
                    { required: true, message: '请输入售价' },
                    { type: 'number', min: 0.01, message: '价格必须大于0' },
                  ]}
                  className="form-item-custom form-item-half"
                >
                  <InputNumber
                    prefix="¥"
                    placeholder="输入售价"
                    style={{ width: '100%' }}
                    precision={2}
                    className="publish-input-number"
                  />
                </Form.Item>

                <Form.Item
                  name="originalPrice"
                  label="原价"
                  rules={[
                    { required: true, message: '请输入原价' },
                    { type: 'number', min: 0.01, message: '价格必须大于0' },
                  ]}
                  className="form-item-custom form-item-half"
                >
                  <InputNumber
                    prefix="¥"
                    placeholder="输入原价"
                    style={{ width: '100%' }}
                    precision={2}
                    className="publish-input-number"
                  />
                </Form.Item>
              </div>
            </div>

            <Divider className="section-divider" />

            {/* 所在学校 */}
            <div className="publish-section">
              <div className="section-header">
                <Text strong className="section-title">
                  所在学校
                </Text>
              </div>

              <Form.Item
                name="location"
                label="所在学校"
                rules={[{ required: true, message: '请选择所在学校' }]}
                className="form-item-custom"
              >
                <Cascader
                  options={schoolData}
                  placeholder="请选择省份/城市/学校"
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
                  displayRender={(labels, selectedOptions) => {
                    if (selectedOptions && selectedOptions.length > 0) {
                      return labels.join(' / ')
                    }
                    return '请选择位置'
                  }}
                  className="school-cascader"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="campus"
                label="备注校区"
                className="form-item-custom"
              >
                <Input
                  placeholder="如：主校区、东校区、西校区等（选填）"
                  maxLength={50}
                  showCount
                  className="publish-input"
                />
              </Form.Item>
            </div>

            {/* 更新按钮 */}
            <div className="publish-footer">
              <div className="publish-button-wrapper">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  disabled={isButtonDisabled}
                  className={`publish-button-capsule ${isButtonDisabled ? 'publish-button-disabled' : ''}`}
                >
                  更新商品
                </Button>
              </div>
              <Text type="secondary" className="publish-tip">
                更新即表示同意平台服务协议
              </Text>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
