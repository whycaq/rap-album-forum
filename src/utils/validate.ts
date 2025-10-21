/**
 * 表单验证工具函数
 */

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

/**
 * 验证手机号格式（中国大陆）
 */
export function validatePhone(phone: string): boolean {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证密码强度
 * 至少8位，包含大小写字母和数字
 */
export function validatePassword(password: string): boolean {
  const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return reg.test(password)
}

/**
 * 验证用户名
 * 4-20位，只能包含字母、数字、下划线
 */
export function validateUsername(username: string): boolean {
  const reg = /^[a-zA-Z0-9_]{4,20}$/
  return reg.test(username)
}

/**
 * 验证URL格式
 */
export function validateUrl(url: string): boolean {
  const reg = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  return reg.test(url)
}

/**
 * 验证评分（1-5）
 */
export function validateRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating)
}

/**
 * 检查字符串是否为空
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0
}

/**
 * 检查字符串长度是否在指定范围内
 */
export function checkLength(str: string, min: number, max: number): boolean {
  const length = str.trim().length
  return length >= min && length <= max
}

