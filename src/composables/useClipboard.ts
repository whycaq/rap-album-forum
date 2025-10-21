/**
 * 剪贴板操作Hook
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useClipboard() {
  const copied = ref(false)

  /**
   * 复制文本到剪贴板
   */
  async function copy(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // 使用现代API
        await navigator.clipboard.writeText(text)
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        textArea.remove()
        
        if (!successful) {
          throw new Error('复制失败')
        }
      }

      copied.value = true
      ElMessage.success('复制成功')
      
      // 2秒后重置状态
      setTimeout(() => {
        copied.value = false
      }, 2000)
      
      return true
    } catch (error) {
      console.error('复制失败:', error)
      ElMessage.error('复制失败，请手动复制')
      return false
    }
  }

  /**
   * 从剪贴板读取文本
   */
  async function read(): Promise<string | null> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return await navigator.clipboard.readText()
      }
      ElMessage.warning('当前浏览器不支持读取剪贴板')
      return null
    } catch (error) {
      console.error('读取剪贴板失败:', error)
      ElMessage.error('读取剪贴板失败')
      return null
    }
  }

  return {
    copied,
    copy,
    read,
  }
}

