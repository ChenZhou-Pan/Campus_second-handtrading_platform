import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiService {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        const data = response.data
        // 检查 ApiResponse 的 code 字段，如果不是 200，抛出异常
        if (data && typeof data === 'object' && 'code' in data && data.code !== 200) {
          const error: any = new Error(data.message || '请求失败')
          error.response = { data }
          return Promise.reject(error)
        }
        return data
      },
      (error) => {
        // 处理网络错误（没有response的情况）
        if (!error.response) {
          let errorMessage = '网络连接失败，请检查网络连接或确保后端服务正在运行'
          
          // 更具体的错误信息
          if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            errorMessage = '请求超时，请稍后重试'
          } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
            errorMessage = '无法连接到服务器，请确保后端服务正在运行在 http://localhost:8080'
          } else if (error.message) {
            errorMessage = error.message
          }
          
          const networkError = new Error(errorMessage)
          ;(networkError as any).isNetworkError = true
          ;(networkError as any).code = error.code
          
          // 在开发环境中打印详细错误信息
          if (import.meta.env.DEV) {
            console.error('Network error:', {
              message: error.message,
              code: error.code,
              config: error.config,
            })
          }
          
          return Promise.reject(networkError)
        }
        
        // 处理401未授权错误
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          // 避免在注册页面重复跳转
          if (!window.location.pathname.includes('/register')) {
            sessionStorage.setItem('openLoginModal', 'login')
            window.location.href = '/'
          }
        }
        
        // 处理403禁止访问错误
        if (error.response?.status === 403) {
          const errorMessage = error.response?.data?.message || '无权限访问此资源'
          console.error('403 Forbidden:', errorMessage)
          // 错误消息由调用方通过 App.useApp() 的 message 显示
        }
        
        // 统一错误格式
        const errorMessage = error.response?.data?.message || error.message || '请求失败，请稍后重试'
        const enhancedError = new Error(errorMessage)
        ;(enhancedError as any).response = error.response
        
        // 在开发环境中，对于500错误不打印到控制台（避免重复日志）
        // 页面组件会处理错误显示
        if (import.meta.env.DEV && error.response?.status === 500) {
          // 静默处理，让页面组件处理错误显示
        }
        
        return Promise.reject(enhancedError)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config)
  }
}

export const apiService = new ApiService()
