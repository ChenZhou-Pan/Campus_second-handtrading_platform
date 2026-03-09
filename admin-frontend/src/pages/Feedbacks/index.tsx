import React, { useEffect, useState } from 'react'
import { Table, Button, Popconfirm, message, Tag, Rate } from 'antd'
import { adminService, Feedback } from '@/services/adminService'
import type { ColumnsType } from 'antd/es/table'

export const FeedbacksPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const response = await adminService.getAllFeedbacks()
      console.log('反馈列表响应:', response)
      
      // 处理响应数据
      let feedbacksList: Feedback[] = []
      if (response) {
        // 如果响应是 ApiResponse 格式
        if (response.data) {
          feedbacksList = Array.isArray(response.data) ? response.data : []
        } 
        // 如果响应直接是数组（拦截器已处理）
        else if (Array.isArray(response)) {
          feedbacksList = response
        }
      }
      
      setFeedbacks(feedbacksList)
      console.log('处理后的反馈列表:', feedbacksList)
    } catch (error: any) {
      console.error('获取反馈列表失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '获取反馈列表失败'
      message.error(errorMessage)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteFeedback(id)
      message.success('删除成功')
      fetchFeedbacks()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      suggestion: 'blue',
      bug: 'red',
      question: 'orange',
      praise: 'green',
    }
    return colors[type] || 'default'
  }

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      suggestion: '建议',
      bug: 'Bug',
      question: '问题',
      praise: '表扬',
    }
    return typeMap[type] || type
  }

  const columns: ColumnsType<Feedback> = [
    {
      title: '反馈类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{getTypeText(type)}</Tag>
      ),
      filters: [
        { text: '建议', value: 'suggestion' },
        { text: 'Bug', value: 'bug' },
        { text: '问题', value: 'question' },
        { text: '表扬', value: 'praise' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '反馈内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <div style={{ maxWidth: 400 }}>{content}</div>
      ),
    },
    {
      title: '用户',
      key: 'user',
      width: 150,
      render: (_, record: Feedback) => {
        if (record.userPhone) {
          return record.userPhone
        }
        if (record.userUsername) {
          return record.userUsername
        }
        if (record.contact) {
          return record.contact
        }
        return '匿名用户'
      },
    },
    {
      title: '满意度',
      dataIndex: 'rating',
      key: 'rating',
      width: 180,
      render: (rating: number) => {
        if (rating) {
          return (
            <div style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
              <Rate disabled defaultValue={rating} style={{ fontSize: 16 }} />
            </div>
          )
        }
        return '-'
      },
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这条反馈吗？"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" danger>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '24px', color: '#1a1a1a' }}>反馈管理</h1>
      <Table
        columns={columns}
        dataSource={feedbacks}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}
