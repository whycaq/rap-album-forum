<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h2>注册</h2>
          <p>加入说唱音乐社区</p>
        </div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="0"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名 (4-20位)"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="邮箱"
              size="large"
              :prefix-icon="Message"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码 (至少8位，包含大小写字母和数字)"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleRegister"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              style="width: 100%"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        <div class="register-footer">
          <span>已有账号？</span>
          <el-button link type="primary" @click="router.push('/login')">
            立即登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { register } from '@/api/user'
import { validateEmail, validateUsername, validatePassword } from '@/utils/validate'
import type { RegisterRequest } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// 加载状态
const loading = ref(false)

// 自定义验证规则
const validateUsernameRule = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!validateUsername(value)) {
    callback(new Error('用户名为4-20位，只能包含字母、数字、下划线'))
  } else {
    callback()
  }
}

const validateEmailRule = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!validateEmail(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

const validatePasswordRule = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!validatePassword(value)) {
    callback(new Error('密码至少8位，需包含大小写字母和数字'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules: FormRules = {
  username: [{ validator: validateUsernameRule, trigger: 'blur' }],
  email: [{ validator: validateEmailRule, trigger: 'blur' }],
  password: [{ validator: validatePasswordRule, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
}

/**
 * 处理注册
 */
async function handleRegister() {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    
    const registerData: RegisterRequest = {
      username: form.username,
      email: form.email,
      password: form.password,
    }
    
    const response = await register(registerData)
    
    // 保存用户信息和token
    userStore.setUserInfo(response.user, response.token)
    
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error: any) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-container {
  width: 100%;
  max-width: 400px;
  padding: 24px;
}

.register-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;

  h2 {
    font-size: 28px;
    margin: 0 0 8px 0;
  }

  p {
    color: #666;
    margin: 0;
  }
}

.register-footer {
  text-align: center;
  margin-top: 16px;
  color: #666;

  span {
    margin-right: 8px;
  }
}
</style>

