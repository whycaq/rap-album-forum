/**
 * 请求hooks
 * 封装常见的请求逻辑，简化组件中的使用
 */

import { ref, onUnmounted } from 'vue'
import { cancelAllRequests } from '@/api/request'

interface UseRequestOptions {
  /** 是否在组件卸载时自动取消请求 */
  autoCancelOnUnmount?: boolean
  /** 请求成功回调 */
  onSuccess?: (data: any) => void
  /** 请求失败回调 */
  onError?: (error: any) => void
}

/**
 * 通用请求Hook
 * 自动管理loading状态和错误处理
 */
export function useRequest<T = any>(
  requestFn: (...args: any[]) => Promise<T>,
  options: UseRequestOptions = {}
) {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)

  const { autoCancelOnUnmount = true, onSuccess, onError } = options

  /**
   * 执行请求
   */
  async function execute(...args: any[]): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await requestFn(...args)
      data.value = result
      onSuccess?.(result)
      return result
    } catch (err: any) {
      error.value = err
      onError?.(err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    loading.value = false
    error.value = null
    data.value = null
  }

  // 组件卸载时自动取消请求
  if (autoCancelOnUnmount) {
    onUnmounted(() => {
      cancelAllRequests()
    })
  }

  return {
    loading,
    error,
    data,
    execute,
    reset,
  }
}

/**
 * 分页请求Hook
 * 封装分页逻辑
 */
export function usePagination<T = any>(
  requestFn: (page: number, pageSize: number) => Promise<{ list: T[]; total: number }>
) {
  const page = ref(1)
  const pageSize = ref(20)
  const total = ref(0)
  const list = ref<T[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 加载数据
   */
  async function load() {
    loading.value = true
    error.value = null

    try {
      const result = await requestFn(page.value, pageSize.value)
      list.value = result.list
      total.value = result.total
    } catch (err: any) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换页码
   */
  function changePage(newPage: number) {
    page.value = newPage
    load()
  }

  /**
   * 切换每页数量
   */
  function changePageSize(newPageSize: number) {
    pageSize.value = newPageSize
    page.value = 1
    load()
  }

  /**
   * 刷新当前页
   */
  function refresh() {
    load()
  }

  /**
   * 重置并加载第一页
   */
  function reset() {
    page.value = 1
    load()
  }

  return {
    page,
    pageSize,
    total,
    list,
    loading,
    error,
    load,
    changePage,
    changePageSize,
    refresh,
    reset,
  }
}

