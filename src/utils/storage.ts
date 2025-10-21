/**
 * 本地存储工具函数
 * 封装localStorage和sessionStorage操作
 */

/**
 * 设置localStorage
 */
export function setLocal(key: string, value: any): void {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error('保存到localStorage失败:', error)
  }
}

/**
 * 获取localStorage
 */
export function getLocal<T = any>(key: string): T | null {
  try {
    const serializedValue = localStorage.getItem(key)
    if (serializedValue === null) return null
    return JSON.parse(serializedValue) as T
  } catch (error) {
    console.error('从localStorage读取失败:', error)
    return null
  }
}

/**
 * 移除localStorage
 */
export function removeLocal(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('从localStorage删除失败:', error)
  }
}

/**
 * 清空localStorage
 */
export function clearLocal(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('清空localStorage失败:', error)
  }
}

/**
 * 设置sessionStorage
 */
export function setSession(key: string, value: any): void {
  try {
    const serializedValue = JSON.stringify(value)
    sessionStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error('保存到sessionStorage失败:', error)
  }
}

/**
 * 获取sessionStorage
 */
export function getSession<T = any>(key: string): T | null {
  try {
    const serializedValue = sessionStorage.getItem(key)
    if (serializedValue === null) return null
    return JSON.parse(serializedValue) as T
  } catch (error) {
    console.error('从sessionStorage读取失败:', error)
    return null
  }
}

/**
 * 移除sessionStorage
 */
export function removeSession(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('从sessionStorage删除失败:', error)
  }
}

/**
 * 清空sessionStorage
 */
export function clearSession(): void {
  try {
    sessionStorage.clear()
  } catch (error) {
    console.error('清空sessionStorage失败:', error)
  }
}

