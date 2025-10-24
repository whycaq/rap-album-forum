<template>
  <div class="profile-page">
    <!-- 顶部横幅 -->
    <div class="profile-banner">
      <div class="banner-content">
        <!-- 返回按钮 -->
        <el-button class="back-btn" @click="router.push('/')" circle>
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="profile-container">
      <div class="user-card">
        <!-- 头像 -->
        <div class="avatar-section">
          <el-avatar :size="120" :src="userInfo?.avatar" class="user-avatar">
            <span class="avatar-text">{{ userInfo?.username?.charAt(0).toUpperCase() }}</span>
          </el-avatar>
          <el-button class="edit-avatar-btn" size="small" @click="showEditDialog = true">
            <el-icon><Edit /></el-icon>
            编辑资料
          </el-button>
        </div>

        <!-- 用户信息 -->
        <div class="user-info-section">
          <h1 class="username">{{ userInfo?.username }}</h1>
          <p class="user-email">{{ userInfo?.email }}</p>
          <p class="user-bio" v-if="userInfo?.bio">{{ userInfo.bio }}</p>
          <p class="user-bio empty" v-else>这个人很懒，还没有填写个人简介~</p>
          <div class="user-badge" v-if="userInfo?.role === 'admin'">
            <el-tag type="danger" effect="dark">管理员</el-tag>
          </div>
        </div>

        <!-- 统计数据 -->
        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-number">{{ stats.favorites }}</div>
            <div class="stat-label">收藏专辑</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.comments }}</div>
            <div class="stat-label">评论</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.posts }}</div>
            <div class="stat-label">帖子</div>
          </div>
        </div>
      </div>

      <!-- 内容标签页 -->
      <div class="content-tabs">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <!-- 我的收藏 -->
          <el-tab-pane label="我的收藏" name="favorites">
            <div class="favorites-grid" v-if="favoriteAlbums.length > 0">
              <div 
                class="album-card" 
                v-for="album in favoriteAlbums" 
                :key="album.id"
                @click="router.push(`/album/${album.id}`)"
              >
                <div class="album-cover">
                  <img :src="album.coverUrl" :alt="album.title" />
                  <div class="album-overlay">
                    <el-icon class="play-icon" :size="40"><VideoPlay /></el-icon>
                  </div>
                </div>
                <div class="album-info">
                  <h3 class="album-title">{{ album.title }}</h3>
                  <p class="album-artist">{{ album.artist }}</p>
                  <div class="album-rating">
                    ⭐ {{ album.rating || '暂无评分' }}
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="还没有收藏任何专辑" :image-size="120" />
          </el-tab-pane>

          <!-- 我的评论 -->
          <el-tab-pane label="我的评论" name="comments">
            <div class="comments-list" v-if="myComments.length > 0">
              <div class="comment-item" v-for="comment in myComments" :key="comment.id">
                <div class="comment-header">
                  <span class="comment-album">评论了《{{ comment.albumTitle }}》</span>
                  <span class="comment-time">{{ comment.time }}</span>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
                <div class="comment-footer">
                  <span class="comment-likes">👍 {{ comment.likes }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="还没有发表任何评论" :image-size="120" />
          </el-tab-pane>

          <!-- 我的帖子 -->
          <el-tab-pane label="我的帖子" name="posts">
            <div class="posts-list" v-if="myPosts.length > 0">
              <div 
                class="post-item" 
                v-for="post in myPosts" 
                :key="post.id"
                @click="router.push(`/forum/${post.id}`)"
              >
                <div class="post-header">
                  <span class="post-category">{{ post.category }}</span>
                  <span class="post-time">{{ post.time }}</span>
                </div>
                <h3 class="post-title">{{ post.title }}</h3>
                <div class="post-stats">
                  <span>💬 {{ post.replies }} 回复</span>
                  <span>👍 {{ post.likes }} 点赞</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="还没有发表任何帖子" :image-size="120" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑个人资料"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
          <div class="form-tip">用户名不可修改</div>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" disabled />
          <div class="form-tip">邮箱不可修改</div>
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="4"
            placeholder="写点什么介绍一下自己吧..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="editForm.avatar" placeholder="输入头像图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProfile" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Edit, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getAlbumsFromSupabase } from '@/api/album'
import type { Album } from '@/types/album'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 当前激活的标签页
const activeTab = ref(route.query.tab as string || 'favorites')

// 编辑对话框
const showEditDialog = ref(false)
const saving = ref(false)

// 编辑表单
const editForm = reactive({
  username: '',
  email: '',
  bio: '',
  avatar: ''
})

// 统计数据
const stats = ref({
  favorites: 0,
  comments: 0,
  posts: 0
})

// 收藏的专辑（Mock数据，后续从API获取）
const favoriteAlbums = ref<Album[]>([])

// 我的评论（Mock数据）
const myComments = ref([
  {
    id: '1',
    albumTitle: 'DAMN.',
    content: 'Kendrick 的巅峰之作，每首歌都充满力量和深度！HUMBLE 太炸了！',
    likes: 45,
    time: '2天前'
  },
  {
    id: '2',
    albumTitle: '2014 Forest Hills Drive',
    content: 'J. Cole 最真实的一张专辑，Love Yourz 这首歌改变了我对生活的看法。',
    likes: 32,
    time: '5天前'
  }
])

// 我的帖子（Mock数据）
const myPosts = ref([
  {
    id: '1',
    category: '专辑讨论',
    title: '为什么 IGOR 能获得格莱美最佳说唱专辑？',
    replies: 23,
    likes: 67,
    time: '1周前'
  },
  {
    id: '2',
    category: '歌曲故事',
    title: '分享一下你最喜欢的 J. Cole 歌词',
    replies: 45,
    likes: 89,
    time: '2周前'
  }
])

/**
 * 加载收藏的专辑
 */
async function loadFavorites() {
  try {
    // TODO: 从 API 获取用户收藏的专辑ID列表
    // 这里先加载所有专辑作为演示
    const albums = await getAlbumsFromSupabase(10)
    // 模拟只显示前3张作为收藏
    favoriteAlbums.value = albums.slice(0, 3)
    stats.value.favorites = favoriteAlbums.value.length
  } catch (error) {
    console.error('加载收藏失败:', error)
  }
}

/**
 * 保存个人资料
 */
async function saveProfile() {
  saving.value = true
  
  try {
    // TODO: 调用API更新用户资料
    userStore.updateUserInfo({
      bio: editForm.bio,
      avatar: editForm.avatar
    })
    
    ElMessage.success('资料更新成功')
    showEditDialog.value = false
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

/**
 * 初始化编辑表单
 */
function initEditForm() {
  if (userInfo.value) {
    editForm.username = userInfo.value.username
    editForm.email = userInfo.value.email
    editForm.bio = userInfo.value.bio || ''
    editForm.avatar = userInfo.value.avatar || ''
  }
}

onMounted(() => {
  initEditForm()
  loadFavorites()
  
  // 更新统计数据
  stats.value.comments = myComments.value.length
  stats.value.posts = myPosts.value.length
  
  // 如果URL中有tab参数，切换到对应的标签页
  if (route.query.tab) {
    activeTab.value = route.query.tab as string
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  padding-top: 60px;
  padding-bottom: 80px;
}

// 顶部横幅
.profile-banner {
  height: 200px;
  background: linear-gradient(135deg, #FF9933 0%, #E68A2E 100%);
  position: relative;
  
  .banner-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 32px;
  }
  
  .back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

// 主容器
.profile-container {
  max-width: 1200px;
  margin: -100px auto 0;
  padding: 0 32px;
  position: relative;
  z-index: 1;
}

// 用户卡片
.user-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 153, 51, 0.2);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.avatar-section {
  text-align: center;
  
  .user-avatar {
    background: linear-gradient(135deg, #FF9933 0%, #E68A2E 100%);
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 16px;
    box-shadow: 0 4px 20px rgba(255, 153, 51, 0.6);
  }
  
  .avatar-text {
    color: #fff;
  }
  
  .edit-avatar-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 153, 51, 0.3);
    color: #fff;
    
    &:hover {
      background: rgba(255, 153, 51, 0.3);
      border-color: rgba(255, 153, 51, 0.5);
    }
  }
}

.user-info-section {
  flex: 1;
  
  .username {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px;
  }
  
  .user-email {
    font-size: 14px;
    color: #FF9933;
    margin: 0 0 16px;
  }
  
  .user-bio {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    margin: 0 0 16px;
    
    &.empty {
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
    }
  }
  
  .user-badge {
    margin-top: 12px;
  }
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 32px;
  
  .stat-item {
    text-align: center;
    
    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  .stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
  }
}

// 内容标签页
.content-tabs {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 153, 51, 0.2);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

:deep(.profile-tabs) {
  .el-tabs__header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 24px;
  }
  
  .el-tabs__nav-wrap::after {
    display: none;
  }
  
  .el-tabs__item {
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    font-weight: 500;
    
    &:hover {
      color: #FF9933;
    }
    
    &.is-active {
      color: #FF9933;
    }
  }
  
  .el-tabs__active-bar {
    background: linear-gradient(90deg, #FF9933 0%, #FFB366 100%);
    height: 3px;
  }
}

// 收藏专辑网格
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.album-card {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
}

.album-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .album-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    .play-icon {
      color: #fff;
    }
  }
  
  &:hover .album-overlay {
    opacity: 1;
  }
}

.album-info {
  .album-title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .album-artist {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 8px;
  }
  
  .album-rating {
    font-size: 13px;
    color: #FF9933;
  }
}

// 评论列表
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 153, 51, 0.3);
  }
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .comment-album {
      font-size: 14px;
      color: #FF9933;
      font-weight: 500;
    }
    
    .comment-time {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .comment-content {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin-bottom: 12px;
  }
  
  .comment-footer {
    .comment-likes {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

// 帖子列表
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 153, 51, 0.3);
    transform: translateY(-2px);
  }
  
  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .post-category {
      font-size: 12px;
      color: #FF9933;
      background: rgba(255, 153, 51, 0.2);
      padding: 4px 12px;
      border-radius: 12px;
    }
    
    .post-time {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .post-title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 12px;
  }
  
  .post-stats {
    display: flex;
    gap: 20px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }
}

// Empty 组件样式
:deep(.el-empty) {
  padding: 60px 0;
  
  .el-empty__description {
    color: rgba(255, 255, 255, 0.5);
  }
}

// 对话框样式
:deep(.el-dialog) {
  background: rgba(30, 20, 50, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  .el-dialog__header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .el-dialog__title {
      color: #fff;
      font-weight: 600;
    }
  }
  
  .el-dialog__body {
    color: #fff;
  }
  
  .el-form-item__label {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .form-tip {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 4px;
  }
}

:deep(.el-input) {
  .el-input__wrapper {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: none;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 153, 51, 0.5);
    }
    
    &.is-focus {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 153, 51, 0.8);
    }
  }
  
  .el-input__inner, .el-textarea__inner {
    color: #fff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 153, 51, 0.5);
    }
    
    &:focus {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 153, 51, 0.8);
    }
  }
  
  .el-input__count {
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
  }
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #FF9933 0%, #E68A2E 100%);
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #FFB366 0%, #FF9933 100%);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .profile-container {
    padding: 0 16px;
  }
  
  .user-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 24px;
  }
  
  .stats-section {
    flex-direction: column;
    gap: 16px;
    
    .stat-divider {
      width: 100%;
      height: 1px;
    }
  }
  
  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

