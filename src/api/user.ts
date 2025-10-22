import { request } from './request'
import { supabase, TABLES } from '@/utils/supabase'
import type { LoginRequest, LoginResponse, RegisterRequest, UpdateUserRequest, User } from '@/types/user'

/**
 * 用户相关API
 */

/**
 * 用户登录（使用Supabase Auth）
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    // 检查输入是否为邮箱格式
    const isEmail = data.username.includes('@')
    let email = data.username

    // 如果不是邮箱格式，先从数据库查找用户名对应的邮箱
    if (!isEmail) {
      const { data: userData, error: userError } = await supabase
        .from(TABLES.USERS)
        .select('email')
        .eq('username', data.username)
        .single()

      if (userError || !userData) {
        throw new Error('用户名或密码错误')
      }
      email = userData.email
    }

    // 使用 Supabase Auth 登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: data.password,
    })

    if (authError) {
      console.error('登录失败:', authError)
      throw new Error('用户名或密码错误')
    }

    if (!authData.user || !authData.session) {
      throw new Error('登录失败，请重试')
    }

    // 获取用户详细信息
    const { data: userProfile, error: profileError } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('auth_id', authData.user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('获取用户信息失败:', profileError)
      throw new Error('获取用户信息失败')
    }

    return {
      user: userProfile as User,
      token: authData.session.access_token,
    }
  } catch (error: any) {
    console.error('登录异常:', error)
    throw error
  }
}

/**
 * 用户注册（使用Supabase Auth）
 */
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  try {
    console.log('🔐 开始注册流程...')
    
    // 1. 检查用户名是否已存在
    const { data: existingUserByUsername, error: usernameCheckError } = await supabase
      .from(TABLES.USERS)
      .select('id, username')
      .eq('username', data.username)
      .maybeSingle() // 使用 maybeSingle 而不是 single，避免 "multiple rows" 错误

    if (existingUserByUsername) {
      console.warn('⚠️ 用户名已存在:', data.username)
      throw new Error('用户名已被使用，请换一个')
    }
    
    // 2. 检查邮箱是否已存在（在 Auth 表中）
    const { data: existingUserByEmail } = await supabase
      .from(TABLES.USERS)
      .select('id, email')
      .eq('email', data.email)
      .maybeSingle()

    if (existingUserByEmail) {
      console.warn('⚠️ 邮箱已存在:', data.email)
      throw new Error('该邮箱已被注册，请使用其他邮箱或直接登录')
    }

    // 2. 使用 Supabase Auth 注册
    console.log('📧 正在通过 Supabase Auth 注册...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username: data.username,
        },
      },
    })

    if (authError) {
      console.error('❌ Supabase Auth 注册失败:', authError)
      if (authError.message.includes('already registered')) {
        throw new Error('该邮箱已被注册')
      }
      if (authError.message.includes('User already registered')) {
        throw new Error('该邮箱已被注册')
      }
      throw new Error(authError.message || '注册失败')
    }

    if (!authData.user) {
      console.error('❌ 未返回用户数据')
      throw new Error('注册失败，未返回用户信息')
    }

    console.log('✅ Supabase Auth 注册成功，用户ID:', authData.user.id)
    console.log('📧 Session状态:', authData.session ? '已创建' : '待验证邮箱')

    // 3. 在 public.users 表中创建用户记录
    console.log('👤 正在创建用户资料...')
    
    // 先检查是否已经存在该 auth_id 的用户（可能之前创建失败了）
    const { data: existingProfile } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('auth_id', authData.user.id)
      .maybeSingle()
    
    let userProfile
    
    if (existingProfile) {
      // 如果已经存在，直接使用
      console.log('✅ 用户资料已存在，直接使用')
      userProfile = existingProfile
    } else {
      // 创建新的用户资料
      const { data: newProfile, error: profileError } = await supabase
        .from(TABLES.USERS)
        .insert({
          auth_id: authData.user.id,
          username: data.username,
          email: data.email,
          role: 'user',
        })
        .select()
        .single()

      if (profileError) {
        console.error('❌ 创建用户资料失败:', profileError)
        console.error('错误详情:', JSON.stringify(profileError, null, 2))
        
        // 如果是重复键错误，提供更友好的提示
        if (profileError.message.includes('duplicate key') || profileError.code === '23505') {
          if (profileError.message.includes('username')) {
            throw new Error('用户名已被使用，请换一个用户名')
          }
          if (profileError.message.includes('email')) {
            throw new Error('该邮箱已被注册')
          }
          throw new Error('该用户信息已存在，请尝试登录或使用其他信息')
        }
        
        throw new Error('创建用户资料失败：' + (profileError.message || '请重试'))
      }
      
      userProfile = newProfile
    }

    console.log('✅ 用户资料创建成功')

    // 4. 处理邮箱验证情况
    if (!authData.session) {
      // Supabase 开启了邮箱验证，需要用户验证邮箱后才能登录
      console.log('⚠️ 需要邮箱验证，尝试直接登录...')
      
      // 尝试直接登录（如果邮箱验证被禁用，这会成功）
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError || !signInData.session) {
        // 无法立即登录，说明需要邮箱验证
        throw new Error('EMAIL_VERIFICATION_REQUIRED')
      }

      // 登录成功，返回数据
      return {
        user: userProfile as User,
        token: signInData.session.access_token,
      }
    }

    // 5. 正常返回（有session的情况）
    return {
      user: userProfile as User,
      token: authData.session.access_token,
    }
  } catch (error: any) {
    console.error('❌ 注册异常:', error)
    throw error
  }
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

