import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'

/**
 * 用户状态管理
 * 管理用户登录状态、用户信息等
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<User | null>(null)
  const token = ref<string>('')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  const userId = computed(() => userInfo.value?.id || '')

  /**
   * 设置用户信息和token
   * @param user 用户信息
   * @param authToken 认证token
   */
  function setUserInfo(user: User, authToken: string) {
    userInfo.value = user
    token.value = authToken
    // 保存到本地存储
    localStorage.setItem('userInfo', JSON.stringify(user))
    localStorage.setItem('token', authToken)
  }

  /**
   * 登出
   * 清除用户信息和token
   */
  async function logout() {
    // 先从 Supabase 登出
    try {
      const { supabase } = await import('@/utils/supabase')
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Supabase登出失败:', error)
    }
    
    // 清除本地状态
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }

  /**
   * 检查登录状态
   * 从本地存储恢复用户信息
   */
  async function checkLoginStatus() {
    // 先尝试从 Supabase 获取当前会话
    try {
      const { supabase, TABLES } = await import('@/utils/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // 如果有 Supabase 会话，获取用户信息
        const { data: userProfile } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .eq('auth_id', session.user.id)
          .single()
          
        if (userProfile) {
          userInfo.value = userProfile
          token.value = session.access_token
          localStorage.setItem('userInfo', JSON.stringify(userProfile))
          localStorage.setItem('token', session.access_token)
          return
        }
      }
    } catch (error) {
      console.error('检查Supabase会话失败:', error)
    }
    
    // 如果没有 Supabase 会话，检查 localStorage
    const storedUserInfo = localStorage.getItem('userInfo')
    const storedToken = localStorage.getItem('token')
    
    if (storedUserInfo && storedToken) {
      try {
        userInfo.value = JSON.parse(storedUserInfo)
        token.value = storedToken
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }

  /**
   * 更新用户信息
   * @param updates 要更新的字段
   */
  function updateUserInfo(updates: Partial<User>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...updates }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isAdmin,
    userId,
    setUserInfo,
    logout,
    checkLoginStatus,
    updateUserInfo,
  }
})

