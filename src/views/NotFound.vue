<template>
  <div class="not-found-page">
    <div class="content">
      <h1>404</h1>
      <p class="message">抱歉，您访问的页面不存在</p>
      <el-button type="primary" size="large" @click="goHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.content {
  text-align: center;

  h1 {
    font-size: 120px;
    margin: 0;
    color: #1890ff;
    font-weight: bold;
  }

  .message {
    font-size: 24px;
    color: #666;
    margin: 24px 0 40px;
  }
}
</style>

