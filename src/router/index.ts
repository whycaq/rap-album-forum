import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 路由配置
 * 采用懒加载方式引入页面组件，优化首屏加载速度
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/home-new',
    name: 'LoggedInHome',
    component: () => import('@/views/Home/LoggedInHome.vue')
  },
  {
    path: '/albums',
    name: 'AlbumList',
    component: () => import('@/views/Album/AlbumList.vue'),
    meta: { title: '专辑列表' },
  },
  {
    path: '/album/:id',
    name: 'AlbumDetail',
    component: () => import('@/views/Album/AlbumDetail.vue'),
    meta: { title: '专辑详情' },
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('@/views/Forum/index.vue'),
    meta: { title: '论坛' },
  },
  {
    path: '/forum/:id',
    name: 'PostDetail',
    component: () => import('@/views/Forum/PostDetail.vue'),
    meta: { title: '帖子详情' },
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/User/Profile.vue'),
    meta: { title: '个人主页', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/User/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/User/Register.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin/index.vue'),
    meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/Admin/Users.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'albums',
        name: 'AdminAlbums',
        component: () => import('@/views/Admin/Albums.vue'),
        meta: { title: '专辑管理' },
      },
      {
        path: 'posts',
        name: 'AdminPosts',
        component: () => import('@/views/Admin/Posts.vue'),
        meta: { title: '帖子管理' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

/**
 * 全局前置路由守卫
 * 处理页面标题设置和权限验证
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || ''} - 说唱音乐专辑论坛`

  const userStore = useUserStore()

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router

