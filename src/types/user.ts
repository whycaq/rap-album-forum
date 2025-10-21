/**
 * 用户相关类型定义
 */

/**
 * 用户角色
 */
export type UserRole = 'user' | 'admin'

/**
 * 用户信息
 */
export interface User {
  /** 用户ID */
  id: string
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 头像URL */
  avatar?: string
  /** 个人简介 */
  bio?: string
  /** 注册时间 */
  createdAt: string
  /** 用户角色 */
  role: UserRole
}

/**
 * 登录请求
 */
export interface LoginRequest {
  /** 用户名或邮箱 */
  username: string
  /** 密码 */
  password: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 用户信息 */
  user: User
  /** 认证token */
  token: string
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 密码 */
  password: string
}

/**
 * 更新用户信息请求
 */
export interface UpdateUserRequest {
  /** 用户名 */
  username?: string
  /** 头像URL */
  avatar?: string
  /** 个人简介 */
  bio?: string
}

