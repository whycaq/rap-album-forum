/**
 * 通用类型定义
 */

/**
 * API响应通用格式
 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
}

/**
 * 分页数据
 */
export interface PageData<T> {
  /** 数据列表 */
  list: T[]
  /** 总数 */
  total: number
  /** 当前页 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPages: number
}

/**
 * 分页参数
 */
export interface PageParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  pageSize: number
}

