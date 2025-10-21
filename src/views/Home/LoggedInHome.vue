<template>
  <div class="logged-in-home">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo">
          <span class="logo-icon">🎵</span>
          <span class="logo-text">RAP FORUM</span>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索专辑、艺人..."
            :prefix-icon="Search"
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- 用户信息 -->
        <div class="user-menu">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" :src="userAvatar">
                <span>{{ username.charAt(0).toUpperCase() }}</span>
              </el-avatar>
              <span class="username">{{ username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人主页</el-dropdown-item>
                <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 精选专辑区 -->
      <section class="featured-section">
        <h2 class="section-title">精选专辑</h2>
        
        <div class="album-showcase">
          <button class="nav-arrow left" @click="prevAlbum">‹</button>
          
          <div class="albums-container">
            <div 
              class="album-item" 
              v-for="(album, index) in visibleAlbums" 
              :key="album.id"
              :class="{ 
                'active': index === 1,
                'side': index !== 1
              }"
              @click="goToAlbum(album.id)"
            >
              <div class="album-cover">
                <img :src="album.coverUrl" :alt="album.title" />
                <div class="album-hover">
                  <span class="play-icon">▶</span>
                </div>
              </div>
              <div class="album-details" v-if="index === 1">
                <h3 class="album-title">{{ album.title }}</h3>
                <p class="album-artist">{{ album.artist }}</p>
                <div class="album-meta">
                  <span class="rating">⭐ {{ album.rating }}</span>
                  <span class="songs">{{ album.songCount }} 首歌曲</span>
                </div>
              </div>
            </div>
          </div>
          
          <button class="nav-arrow right" @click="nextAlbum">›</button>
        </div>
      </section>

      <!-- 快速入口 -->
      <section class="quick-access">
        <div class="access-grid">
          <div class="access-card" @click="router.push('/albums')">
            <div class="card-icon">📀</div>
            <div class="card-title">浏览专辑</div>
          </div>
          
          <div class="access-card" @click="router.push('/forum')">
            <div class="card-icon">💬</div>
            <div class="card-title">论坛讨论</div>
          </div>
          
          <div class="access-card" @click="router.push('/profile')">
            <div class="card-icon">👤</div>
            <div class="card-title">我的主页</div>
          </div>
        </div>
      </section>

      <!-- 热门话题 -->
      <section class="trending-section">
        <h2 class="section-title">热门话题</h2>
        
        <div class="topics-grid">
          <div 
            class="topic-card" 
            v-for="topic in trendingTopics" 
            :key="topic.id"
            @click="goToPost(topic.id)"
          >
            <div class="topic-header">
              <span class="topic-category">{{ topic.category }}</span>
              <span class="topic-time">{{ topic.time }}</span>
            </div>
            <h3 class="topic-title">{{ topic.title }}</h3>
            <div class="topic-footer">
              <span class="topic-stat">💬 {{ topic.replies }}</span>
              <span class="topic-stat">👍 {{ topic.likes }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Album } from '@/types/album'

const router = useRouter()

// 状态
const searchQuery = ref('')
const username = ref('用户名')
const userAvatar = ref('')
const currentIndex = ref(0)

// Mock数据
const albums = ref<Album[]>([
  {
    id: '1',
    title: 'The Marshall Mathers LP',
    artist: 'Eminem',
    coverUrl: 'https://picsum.photos/seed/album1/400/400',
    releaseDate: '2000-05-23',
    genre: 'Hip-Hop',
    rating: 4.8,
    ratingCount: 1500,
    songCount: 18
  },
  {
    id: '2',
    title: 'To Pimp a Butterfly',
    artist: 'Kendrick Lamar',
    coverUrl: 'https://picsum.photos/seed/album2/400/400',
    releaseDate: '2015-03-15',
    genre: 'Hip-Hop',
    rating: 4.9,
    ratingCount: 2000,
    songCount: 16
  },
  {
    id: '3',
    title: 'Illmatic',
    artist: 'Nas',
    coverUrl: 'https://picsum.photos/seed/album3/400/400',
    releaseDate: '1994-04-19',
    genre: 'Hip-Hop',
    rating: 4.9,
    ratingCount: 1200,
    songCount: 10
  },
  {
    id: '4',
    title: 'Good Kid, M.A.A.D City',
    artist: 'Kendrick Lamar',
    coverUrl: 'https://picsum.photos/seed/album4/400/400',
    releaseDate: '2012-10-22',
    genre: 'Hip-Hop',
    rating: 4.8,
    ratingCount: 1600,
    songCount: 12
  },
  {
    id: '5',
    title: 'The Blueprint',
    artist: 'Jay-Z',
    coverUrl: 'https://picsum.photos/seed/album5/400/400',
    releaseDate: '2001-09-11',
    genre: 'Hip-Hop',
    rating: 4.6,
    ratingCount: 900,
    songCount: 15
  }
])

const trendingTopics = ref([
  {
    id: '1',
    category: '专辑讨论',
    title: '如何评价Kendrick Lamar的新专辑？',
    replies: 128,
    likes: 256,
    time: '2小时前'
  },
  {
    id: '2',
    category: '歌曲故事',
    title: 'Lose Yourself背后的创作故事',
    replies: 89,
    likes: 178,
    time: '5小时前'
  },
  {
    id: '3',
    category: '说唱文化',
    title: '中文说唱的发展与未来展望',
    replies: 203,
    likes: 445,
    time: '1天前'
  }
])

// 计算属性：当前可见的专辑（左中右三张）
const visibleAlbums = computed(() => {
  const total = albums.value.length
  const prev = (currentIndex.value - 1 + total) % total
  const curr = currentIndex.value
  const next = (currentIndex.value + 1) % total
  return [albums.value[prev], albums.value[curr], albums.value[next]]
})

// 方法
function handleSearch() {
  if (searchQuery.value.trim()) {
    ElMessage.info(`搜索: ${searchQuery.value}`)
    // TODO: 实现搜索功能
  }
}

function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'favorites':
      router.push('/profile?tab=favorites')
      break
    case 'logout':
      ElMessage.success('已退出登录')
      router.push('/login')
      break
  }
}

function prevAlbum() {
  currentIndex.value = (currentIndex.value - 1 + albums.value.length) % albums.value.length
}

function nextAlbum() {
  currentIndex.value = (currentIndex.value + 1) % albums.value.length
}

function goToAlbum(id: string) {
  router.push(`/albums/${id}`)
}

function goToPost(id: string) {
  router.push(`/forum/post/${id}`)
}

onMounted(() => {
  // TODO: 从API获取用户信息
  // TODO: 从API获取精选专辑
  // TODO: 从API获取热门话题
})
</script>

<style lang="scss" scoped>
.logged-in-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a3658 100%);
  padding-top: 80px;
}

/* 顶部导航栏 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 25, 41, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 48px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  
  .logo-icon {
    font-size: 28px;
  }
  
  .logo-text {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 2px;
    background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.search-box {
  flex: 1;
  max-width: 500px;
  
  :deep(.search-input) {
    .el-input__wrapper {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      
      &:hover, &.is-focus {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(64, 169, 255, 0.5);
      }
    }
    
    .el-input__inner {
      color: #fff;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

.user-menu {
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .username {
      font-size: 14px;
      font-weight: 500;
      color: #fff;
    }
  }
}

/* 主内容区 */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 32px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 32px;
  text-align: center;
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
    margin: 12px auto 0;
    border-radius: 2px;
  }
}

/* 精选专辑区 */
.featured-section {
  margin-bottom: 80px;
}

.album-showcase {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 40px 0;
}

.albums-container {
  display: flex;
  align-items: center;
  gap: 40px;
}

.album-item {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.side {
    opacity: 0.4;
    transform: scale(0.85);
    filter: blur(1px);
  }
  
  &.active {
    opacity: 1;
    transform: scale(1);
  }
  
  &:hover {
    transform: scale(0.95);
    
    &.active {
      transform: scale(1.02);
    }
  }
}

.album-cover {
  position: relative;
  width: 320px;
  height: 320px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .album-hover {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    .play-icon {
      font-size: 56px;
      color: #fff;
    }
  }
  
  &:hover .album-hover {
    opacity: 1;
  }
}

.album-details {
  text-align: center;
  margin-top: 24px;
  
  .album-title {
    font-size: 22px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
  }
  
  .album-artist {
    font-size: 16px;
    color: #a8c7fa;
    margin-bottom: 12px;
  }
  
  .album-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }
}

.nav-arrow {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
}

/* 快速入口 */
.quick-access {
  margin-bottom: 80px;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.access-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(64, 169, 255, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(24, 144, 255, 0.2);
  }
  
  .card-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .card-title {
    font-size: 18px;
    font-weight: 500;
    color: #fff;
  }
}

/* 热门话题 */
.trending-section {
  margin-bottom: 80px;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.topic-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(64, 169, 255, 0.3);
    transform: translateY(-2px);
  }
  
  .topic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .topic-category {
      font-size: 12px;
      color: #40a9ff;
      background: rgba(64, 169, 255, 0.15);
      padding: 4px 12px;
      border-radius: 12px;
    }
    
    .topic-time {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .topic-title {
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    margin-bottom: 16px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  
  .topic-footer {
    display: flex;
    gap: 20px;
    
    .topic-stat {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .topics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 16px;
    padding: 0 16px;
  }
  
  .search-box {
    order: 3;
    width: 100%;
    max-width: none;
  }
  
  .album-showcase {
    gap: 20px;
  }
  
  .albums-container {
    gap: 20px;
  }
  
  .album-cover {
    width: 260px;
    height: 260px;
  }
  
  .nav-arrow {
    width: 44px;
    height: 44px;
    font-size: 24px;
  }
  
  .access-grid {
    grid-template-columns: 1fr;
  }
  
  .topics-grid {
    grid-template-columns: 1fr;
  }
}
</style>

