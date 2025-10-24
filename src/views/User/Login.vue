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
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  position: relative;
  overflow: hidden;
  
  // 添加装饰性背景元素
  &::before {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(115, 186, 155, 0.15) 0%, transparent 70%);
    top: -250px;
    right: -250px;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(115, 186, 155, 0.1) 0%, transparent 70%);
    bottom: -200px;
    left: -200px;
    border-radius: 50%;
  }
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 24px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(115, 186, 155, 0.2);
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  h2 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #fff;
    background: linear-gradient(135deg, #73BA9B 0%, #8BC4A8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-size: 16px;
  }
}

// 表单样式
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input) {
  .el-input__wrapper {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: none;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(115, 186, 155, 0.5);
    }
    
    &.is-focus {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(115, 186, 155, 0.8);
      box-shadow: 0 0 0 4px rgba(115, 186, 155, 0.15);
    }
  }
  
  .el-input__inner {
    color: #fff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  .el-input__prefix {
    color: rgba(255, 255, 255, 0.5);
  }
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #73BA9B 0%, #5A9B7F 100%);
  border: none;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #8BC4A8 0%, #73BA9B 100%);
    box-shadow: 0 4px 16px rgba(115, 186, 155, 0.6);
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;

  span {
    margin-right: 8px;
  }
  
  :deep(.el-button) {
    color: #73BA9B;
    font-weight: 600;
    
    &:hover {
      color: #8BC4A8;
    }
  }
}
</style>

