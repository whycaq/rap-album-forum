/**
 * Supabase 客户端配置
 * 用于与 Supabase 后端进行交互
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 验证配置是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 配置缺失！')
  console.error('请确保在 .env 文件中设置了以下环境变量：')
  console.error('- VITE_SUPABASE_URL')
  console.error('- VITE_SUPABASE_ANON_KEY')
}

/**
 * Supabase 客户端实例
 * 用于所有数据库操作和认证
 */
export const supabase: SupabaseClient = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    // 自动刷新 token
    autoRefreshToken: true,
    // 持久化会话
    persistSession: true,
    // 检测会话变化
    detectSessionInUrl: true,
    // 存储键名
    storageKey: 'rap-forum-auth',
  },
  // 全局配置
  global: {
    headers: {
      'X-Client-Info': 'rap-album-forum',
    },
  },
})

/**
 * 数据库表名常量
 * 统一管理所有表名，避免硬编码
 */
export const TABLES = {
  USERS: 'users',
  ALBUMS: 'albums',
  SONGS: 'songs',
  ALBUM_RATINGS: 'album_ratings',
  ALBUM_COMMENTS: 'album_comments',
  FORUM_CATEGORIES: 'forum_categories',
  POSTS: 'posts',
  POST_REPLIES: 'post_replies',
  FAVORITES: 'favorites',
  NOTIFICATIONS: 'notifications',
} as const

/**
 * 视图名称常量
 */
export const VIEWS = {
  ALBUM_DETAILS: 'album_details',
  POST_DETAILS: 'post_details',
  ALBUM_COMMENT_DETAILS: 'album_comment_details',
} as const

/**
 * 检查 Supabase 连接状态
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from(TABLES.FORUM_CATEGORIES).select('count').limit(1)
    if (error) {
      console.error('❌ Supabase 连接失败:', error.message)
      return false
    }
    console.log('✅ Supabase 连接成功')
    return true
  } catch (error) {
    console.error('❌ Supabase 连接异常:', error)
    return false
  }
}

/**
 * 获取当前登录的用户信息
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('获取用户信息失败:', error.message)
    return null
  }

  return user
}

/**
 * 获取当前用户的完整信息（包含 public.users 表的数据）
 */
export async function getCurrentUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (error) {
    console.error('获取用户资料失败:', error.message)
    return null
  }

  return data
}

/**
 * 登出
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('登出失败:', error.message)
    throw error
  }
}

/**
 * 监听认证状态变化
 * @param callback 状态变化时的回调函数
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

// 默认导出
export default supabase

