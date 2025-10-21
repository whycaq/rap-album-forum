import { request } from './request'
import type { LoginRequest, LoginResponse, RegisterRequest, UpdateUserRequest, User } from '@/types/user'

/**
 * 用户相关API
 */

/**
 * 用户登录
 */
export function login(data: LoginRequest) {
  return request.post<LoginResponse>('/user/login', data)
}

/**
 * 用户注册
 */
export function register(data: RegisterRequest) {
  return request.post<LoginResponse>('/user/register', data)
}

/**
 * 获取用户信息
 */
export function getUserInfo(userId: string) {
  return request.get<User>(`/user/${userId}`)
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: UpdateUserRequest) {
  return request.put<User>('/user/profile', data)
}

/**
 * 修改密码
 */
export function changePassword(oldPassword: string, newPassword: string) {
  return request.put('/user/password', { oldPassword, newPassword })
}

/**
 * 退出登录
 */
export function logout() {
  return request.post('/user/logout')
}

