import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'
import { useUserStore } from '@/stores/user'

const app = createApp(App)
const pinia = createPinia()

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)

// 在应用挂载前检查登录状态
const userStore = useUserStore()
userStore.checkLoginStatus().then(() => {
  app.use(router)
  app.use(ElementPlus)
  app.mount('#app')
})

