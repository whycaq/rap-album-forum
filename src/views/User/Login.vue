<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>登录</h2>
          <p>欢迎回来！</p>
        </div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="0"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名或邮箱"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              style="width: 100%"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="login-footer">
          <span>还没有账号？</span>
          <el-button link type="primary" @click="router.push('/register')">
            立即注册
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/user'
import type { LoginRequest } from '@/types/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<LoginRequest>({
  username: '',
  password: '',
})

// 加载状态
const loading = ref(false)

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
  ],
}

/**
 * 处理登录
 */
async function handleLogin() {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    const response = await login(form)
    
    // 保存用户信息和token
    userStore.setUserInfo(response.user, response.token)
    
    ElMessage.success('登录成功')
    
    // 跳转到重定向页面或首页
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 24px;
}

.login-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-header {
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

.login-footer {
  text-align: center;
  margin-top: 16px;
  color: #666;

  span {
    margin-right: 8px;
  }
}
</style>

