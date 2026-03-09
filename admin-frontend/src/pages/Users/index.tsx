import React, { useEffect, useState } from 'react'
import { Table, Button, Popconfirm, message, Tag, Modal, Form, Input, Select } from 'antd'
import { adminService, User } from '@/services/adminService'
import type { ColumnsType } from 'antd/es/table'

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await adminService.getAllUsers()
      setUsers(response.data)
    } catch (error) {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteUser(id)
      message.success('删除成功')
      fetchUsers()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    // 将非admin角色统一映射为both（用户）
    const roleValue = user.role === 'admin' ? 'admin' : 'both'
    form.setFieldsValue({
      ...user,
      role: roleValue,
    })
    setEditModalVisible(true)
  }

  const handleUpdate = async (values: any) => {
    if (!editingUser) return
    try {
      await adminService.updateUser(editingUser.id, values)
      message.success('更新成功')
      setEditModalVisible(false)
      fetchUsers()
    } catch (error: any) {
      message.error(error.message || '更新失败')
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'red' : 'blue'
  }

  const getRoleDisplayName = (role: string) => {
    return role === 'admin' ? '管理员' : '用户'
  }

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{getRoleDisplayName(role)}</Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.role !== 'admin' && (
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ]

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '24px', color: '#1a1a1a' }}>用户管理</h1>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item name="username" label="用户名">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select>
              <Select.Option value="both">用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
