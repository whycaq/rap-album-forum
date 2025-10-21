/**
 * 对话框管理Hook
 * 统一管理对话框的打开/关闭状态
 */

import { ref, Ref } from 'vue'

export interface DialogOptions {
  /** 默认是否打开 */
  defaultVisible?: boolean
  /** 关闭前的回调 */
  beforeClose?: () => boolean | Promise<boolean>
}

export function useDialog(options: DialogOptions = {}) {
  const visible = ref(options.defaultVisible || false)
  const loading = ref(false)

  /**
   * 打开对话框
   */
  function open() {
    visible.value = true
  }

  /**
   * 关闭对话框
   */
  async function close() {
    if (options.beforeClose) {
      const canClose = await options.beforeClose()
      if (!canClose) return
    }
    visible.value = false
  }

  /**
   * 切换对话框状态
   */
  function toggle() {
    visible.value = !visible.value
  }

  return {
    visible,
    loading,
    open,
    close,
    toggle,
  }
}

/**
 * 确认对话框Hook
 */
export function useConfirmDialog() {
  const visible = ref(false)
  const title = ref('')
  const content = ref('')
  const confirmCallback = ref<(() => void) | null>(null)

  function show(options: {
    title?: string
    content: string
    onConfirm: () => void
  }) {
    title.value = options.title || '提示'
    content.value = options.content
    confirmCallback.value = options.onConfirm
    visible.value = true
  }

  function confirm() {
    confirmCallback.value?.()
    visible.value = false
  }

  function cancel() {
    visible.value = false
  }

  return {
    visible,
    title,
    content,
    show,
    confirm,
    cancel,
  }
}

