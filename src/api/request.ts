import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { ApiResponse } from '@/types/common'

// 请求缓存
const requestCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

// 请求取消token存储
const pendingRequests = new Map<string, CancelTokenSource>()

// 请求性能监控
interface RequestMetrics {
  url: string
  method: string
  duration: number
  status: number
  timestamp: number
}
const requestMetrics: RequestMetrics[] = []

/**
 * 创建axios实例
 * 统一的HTTP客户端，支持请求拦截、响应拦截、错误处理
 */
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

/**
 * 生成请求唯一标识
 */
function generateRequestKey(config: AxiosRequestConfig): string {
  const { url, method, params, data } = config
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
}

/**
 * 从缓存中获取数据
 */
function getCache(key: string): any | null {
  const cached = requestCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  requestCache.delete(key)
  return null
}

/**
 * 设置缓存
 */
function setCache(key: string, data: any): void {
  requestCache.set(key, { data, timestamp: Date.now() })
}

/**
 * 添加请求到待处理列表
 */
function addPendingRequest(config: AxiosRequestConfig): void {
  const requestKey = generateRequestKey(config)
  
  // 如果已有相同请求在进行中，取消之前的请求
  if (pendingRequests.has(requestKey)) {
    const source = pendingRequests.get(requestKey)
    source?.cancel('重复请求已取消')
  }
  
  // 创建新的取消token
  const source = axios.CancelToken.source()
  config.cancelToken = source.token
  pendingRequests.set(requestKey, source)
}

/**
 * 从待处理列表移除请求
 */
function removePendingRequest(config: AxiosRequestConfig): void {
  const requestKey = generateRequestKey(config)
  pendingRequests.delete(requestKey)
}

/**
 * 记录请求性能指标
 */
function recordMetrics(metric: RequestMetrics): void {
  requestMetrics.push(metric)
  // 只保留最近100条记录
  if (requestMetrics.length > 100) {
    requestMetrics.shift()
  }
  
  // 在开发环境输出性能数据
  if (import.meta.env.DEV && metric.duration > 1000) {
    console.warn(`慢请求警告: ${metric.method} ${metric.url} 耗时 ${metric.duration}ms`)
  }
}

/**
 * 请求拦截器
 * 功能：自动添加token、公共参数、请求去重、性能监控
 */
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    
    // 添加认证token
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    // 添加时间戳，用于性能监控
    config.metadata = { startTime: Date.now() }
    
    // 检查缓存（仅对GET请求）
    if (config.method?.toLowerCase() === 'get') {
      const requestKey = generateRequestKey(config)
      const cachedData = getCache(requestKey)
      if (cachedData) {
        console.log('使用缓存数据:', config.url)
        // 返回缓存的数据
        return Promise.reject({
          config,
          response: { data: cachedData },
          isCache: true,
        })
      }
    }
    
    // 添加请求到待处理列表（用于取消重复请求）
    addPendingRequest(config)
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 功能：统一处理响应、错误码处理、性能监控、缓存管理
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const config = response.config
    
    // 从待处理列表移除请求
    removePendingRequest(config)
    
    // 记录性能指标
    const duration = Date.now() - (config.metadata?.startTime || 0)
    recordMetrics({
      url: config.url || '',
      method: config.method?.toUpperCase() || 'GET',
      duration,
      status: response.status,
      timestamp: Date.now(),
    })
    
    const res = response.data

    // 如果返回的状态码不是200，则认为是错误
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 401: token过期或未登录
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
        window.location.href = '/login'
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    // 对GET请求结果进行缓存
    if (config.method?.toLowerCase() === 'get') {
      const requestKey = generateRequestKey(config)
      setCache(requestKey, res.data)
    }

    return res.data
  },
  async (error) => {
    // 处理缓存数据
    if (error.isCache) {
      return Promise.resolve(error.response.data)
    }
    
    // 取消的请求不显示错误提示
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error.message)
      return Promise.reject(error)
    }
    
    const config = error.config
    
    // 从待处理列表移除请求
    if (config) {
      removePendingRequest(config)
    }
    
    console.error('响应错误:', error)
    
    // 请求重试机制（最多重试2次）
    if (config && (!config.retryCount || config.retryCount < 2)) {
      config.retryCount = config.retryCount || 0
      config.retryCount++
      
      // 网络错误或超时才重试
      if (error.message.includes('timeout') || error.message.includes('Network Error')) {
        console.log(`请求重试 ${config.retryCount}/2:`, config.url)
        // 延迟1秒后重试
        await new Promise(resolve => setTimeout(resolve, 1000))
        return service(config)
      }
    }
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请登录')
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请检查网络连接')
    } else if (error.message.includes('Network Error')) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求失败')
    }

    return Promise.reject(error)
  }
)

/**
 * 通用请求方法封装
 * 支持：GET、POST、PUT、DELETE、文件上传
 */
export const request = {
  /**
   * GET请求（自动缓存）
   */
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, { params, ...config })
  },

  /**
   * POST请求
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  /**
   * PUT请求
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  /**
   * DELETE请求
   */
  delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, { params, ...config })
  },

  /**
   * 文件上传
   */
  upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  },
}

/**
 * 清除所有缓存
 */
export function clearCache(): void {
  requestCache.clear()
}

/**
 * 取消所有待处理的请求
 */
export function cancelAllRequests(): void {
  pendingRequests.forEach((source) => {
    source.cancel('组件卸载，取消所有请求')
  })
  pendingRequests.clear()
}

/**
 * 获取请求性能指标
 */
export function getRequestMetrics(): RequestMetrics[] {
  return [...requestMetrics]
}

/**
 * 获取平均请求时长
 */
export function getAverageRequestDuration(): number {
  if (requestMetrics.length === 0) return 0
  const total = requestMetrics.reduce((sum, metric) => sum + metric.duration, 0)
  return Math.round(total / requestMetrics.length)
}

/**
 * 获取请求成功率
 */
export function getRequestSuccessRate(): number {
  if (requestMetrics.length === 0) return 100
  const successCount = requestMetrics.filter(m => m.status >= 200 && m.status < 300).length
  return Math.round((successCount / requestMetrics.length) * 100)
}

export default service

