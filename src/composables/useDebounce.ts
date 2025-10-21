/**
 * 防抖和节流hooks
 */

import { ref, customRef, Ref } from 'vue'

/**
 * 防抖Hook
 * 用于搜索框等场景
 */
export function useDebounce<T>(value: T, delay: number = 300): Ref<T> {
  return customRef((track, trigger) => {
    let timer: ReturnType<typeof setTimeout>
    return {
      get() {
        track()
        return value
      },
      set(newValue: T) {
        clearTimeout(timer)
        timer = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      },
    }
  })
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 搜索Hook（带防抖）
 */
export function useSearch(
  searchFn: (keyword: string) => Promise<any>,
  delay: number = 500
) {
  const keyword = ref('')
  const results = ref<any[]>([])
  const loading = ref(false)

  const debouncedSearch = debounce(async (value: string) => {
    if (!value.trim()) {
      results.value = []
      return
    }

    loading.value = true
    try {
      const data = await searchFn(value)
      results.value = data
    } catch (error) {
      console.error('搜索失败:', error)
      results.value = []
    } finally {
      loading.value = false
    }
  }, delay)

  function search(value: string) {
    keyword.value = value
    debouncedSearch(value)
  }

  function clear() {
    keyword.value = ''
    results.value = []
  }

  return {
    keyword,
    results,
    loading,
    search,
    clear,
  }
}

