<template>
  <div class="logged-in-home">
    <!-- AOTY 风格顶部导航 -->
    <header class="header">
      <div class="header-container">
        <!-- Logo -->
        <h1 class="logo" @click="router.push('/')">AOTY</h1>
        
        <!-- 导航链接 -->
        <nav class="nav-links">
          <a class="nav-link active" @click="router.push('/')">Best Albums</a>
          <a class="nav-link" @click="router.push('/albums')">Discover</a>
          <a class="nav-link">New Releases</a>
          <a class="nav-link">Lists</a>
          <a class="nav-link">Genres</a>
          <a class="nav-link">News</a>
          <a class="nav-link" @click="router.push('/forum')">Community</a>
        </nav>
        
        <!-- 搜索和用户 -->
        <div class="header-actions">
          <div class="search-wrapper">
            <el-input
              v-model="searchQuery"
              placeholder="search albums, artists, genres etc..."
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #suffix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <!-- 用户头像和下拉菜单 -->
          <div class="user-menu-wrapper">
            <el-avatar :size="36" :src="userAvatar" class="user-avatar">
              <span>{{ username.charAt(0).toUpperCase() }}</span>
            </el-avatar>
            
            <!-- 下拉菜单 -->
            <div class="dropdown-menu">
              <div class="dropdown-header">
                <div class="user-name">{{ username }}</div>
                <div class="user-email">{{ userEmail }}</div>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="router.push('/user/profile')">
                <el-icon><User /></el-icon>
                <span>个人中心</span>
              </div>
              <div class="dropdown-item" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <div class="main-container">
      <!-- 热门专辑区域 -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Trending Albums</h2>
          <button class="view-all-btn" @click="router.push('/albums')">View All →</button>
        </div>
        
        <div class="albums-grid">
          <div 
            v-for="album in hotAlbums" 
            :key="album.id"
            class="album-item"
            @click="goToAlbum(album.id)"
          >
            <div class="album-cover-wrapper">
              <img :src="album.coverUrl" :alt="album.title" class="album-cover" />
              <div class="album-overlay">
                <el-icon class="play-icon"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="album-info">
              <h3 class="album-name">{{ album.title }}</h3>
              <p class="album-artist">{{ album.artist }}</p>
              <div class="album-meta">
                <span class="rating">
                  <el-icon><Star /></el-icon>
                  {{ album.rating.toFixed(1) }}
                </span>
                <span class="year">{{ album.releaseDate.split('-')[0] }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 最新发布 -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">New Releases</h2>
          <button class="view-all-btn" @click="router.push('/albums')">View All →</button>
        </div>
        
        <div class="releases-list">
          <div 
            v-for="(album, index) in newAlbums" 
            :key="album.id"
            class="release-item"
            @click="goToAlbum(album.id)"
          >
            <span class="release-rank">{{ index + 1 }}</span>
            <img :src="album.coverUrl" :alt="album.title" class="release-cover" />
            <div class="release-info">
              <h4 class="release-name">{{ album.title }}</h4>
              <p class="release-artist">{{ album.artist }}</p>
            </div>
            <div class="release-meta">
              <span class="release-rating">
                <el-icon><Star /></el-icon>
                {{ album.rating.toFixed(1) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 随机推荐歌曲 -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Random Pick</h2>
          <button class="view-all-btn" @click="getRandomSong">
            <el-icon><Refresh /></el-icon>
            换一首
          </button>
        </div>
        
        <div v-if="randomSong" class="random-song-card">
          <div class="song-cover-wrapper">
            <img 
              :src="randomSong.album?.coverUrl || '/default-album.jpg'" 
              :alt="randomSong.title" 
              class="song-cover" 
            />
            <div class="song-overlay" @click="playSong(randomSong)">
              <el-icon class="play-icon-large"><VideoPlay /></el-icon>
            </div>
          </div>
          
          <div class="song-details">
            <div class="song-header">
              <h3 class="song-title">{{ randomSong.title }}</h3>
              <div class="song-badges">
                <span class="song-badge">
                  <el-icon><Clock /></el-icon>
                  {{ formatDuration(randomSong.duration) }}
                </span>
                <span v-if="randomSong.album" class="song-badge">
                  {{ randomSong.album.releaseDate.split('-')[0] }}
                </span>
              </div>
            </div>
            
            <div class="song-meta">
              <div class="meta-item" @click="goToAlbum(randomSong.albumId)">
                <span class="meta-label">专辑</span>
                <span class="meta-value">{{ randomSong.album?.title || '未知专辑' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">艺人</span>
                <span class="meta-value">{{ randomSong.album?.artist || '未知艺人' }}</span>
              </div>
              <div v-if="randomSong.album" class="meta-item">
                <span class="meta-label">评分</span>
                <span class="meta-value rating-value">
                  <el-icon><Star /></el-icon>
                  {{ randomSong.album.rating.toFixed(1) }}
                </span>
              </div>
            </div>
            
            <div class="song-actions">
              <el-button type="primary" size="large" @click="playSong(randomSong)">
                <el-icon><VideoPlay /></el-icon>
                播放歌曲
              </el-button>
              <el-button size="large" @click="goToAlbum(randomSong.albumId)">
                查看专辑
              </el-button>
              <el-button size="large" circle @click="getRandomSong">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        
        <div v-else class="random-song-empty">
          <el-icon class="empty-icon"><Headset /></el-icon>
          <p>暂无歌曲数据</p>
          <el-button @click="loadAlbums">刷新</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, VideoPlay, Star, User, SwitchButton, Refresh, Clock, Headset } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAlbumStore } from '@/stores/album'
import { usePlayerStore } from '@/stores/player'
import { getAlbumsFromSupabase } from '@/api/album'
import { supabase } from '@/utils/supabase'
import type { Album } from '@/types/album'

const router = useRouter()
const userStore = useUserStore()
const albumStore = useAlbumStore()
const playerStore = usePlayerStore()

// 数据
const searchQuery = ref('')
const allAlbums = ref<Album[]>([])
const allSongs = ref<any[]>([])
const randomSong = ref<any>(null)

// 用户信息
const username = computed(() => userStore.userInfo?.username || 'User')
const userAvatar = computed(() => userStore.userInfo?.avatar || '')
const userEmail = computed(() => userStore.userInfo?.email || '')

// 热门专辑（取评分最高的6个）
const hotAlbums = computed(() => {
  return [...allAlbums.value]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6)
})

// 最新专辑（取最新的8个）
const newAlbums = computed(() => {
  return [...allAlbums.value]
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 8)
})

/**
 * 加载专辑数据
 */
async function loadAlbums() {
  try {
    const albums = await getAlbumsFromSupabase(50)
    allAlbums.value = albums
    // 加载完专辑后，加载所有歌曲
    await loadAllSongs()
  } catch (error) {
    console.error('加载专辑失败:', error)
    ElMessage.error('加载专辑失败')
  }
}

/**
 * 加载所有歌曲
 */
async function loadAllSongs() {
  try {
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    
    if (error) throw error
    
    // 将歌曲与专辑关联
    allSongs.value = songs?.map(song => ({
      ...song,
      album: allAlbums.value.find(album => album.id === song.albumId)
    })) || []
    
    // 初始化时获取一首随机歌曲
    if (allSongs.value.length > 0) {
      getRandomSong()
    }
  } catch (error) {
    console.error('加载歌曲失败:', error)
  }
}

/**
 * 获取随机歌曲
 */
function getRandomSong() {
  if (allSongs.value.length === 0) {
    ElMessage.warning('暂无可用歌曲')
    return
  }
  
  const randomIndex = Math.floor(Math.random() * allSongs.value.length)
  randomSong.value = allSongs.value[randomIndex]
}

/**
 * 播放歌曲
 */
function playSong(song: any) {
  if (!song.audioUrl) {
    ElMessage.warning('该歌曲暂无音频文件')
    return
  }
  
  // 使用 player store 播放歌曲
  playerStore.playSong({
    id: song.id,
    title: song.title,
    artist: song.album?.artist || '未知艺人',
    albumTitle: song.album?.title || '未知专辑',
    albumCover: song.album?.coverUrl || '',
    audioUrl: song.audioUrl,
    duration: song.duration || 0
  })
  
  ElMessage.success(`正在播放: ${song.title}`)
}

/**
 * 格式化时长（秒 -> mm:ss）
 */
function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * 跳转到专辑详情
 */
function goToAlbum(albumId: string) {
  router.push({ name: 'AlbumDetail', params: { id: albumId } })
}

/**
 * 处理搜索
 */
function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'AlbumList',
      query: { search: searchQuery.value }
    })
  }
}

/**
 * 退出登录
 */
function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')  // 返回首页（未登录状态）
}

onMounted(() => {
  loadAlbums()
})
</script>

<style lang="scss" scoped>
.logged-in-home {
  min-height: 100vh;
  background: #000;
  color: #fff;
}

// AOTY 风格导航栏
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #2c3034;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 32px;
  height: 56px;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin: 0;
  cursor: pointer;
  color: #fff;
  transition: opacity 0.2s;
  flex-shrink: 0;
  
  &:hover {
    opacity: 0.8;
  }
}

// 导航链接
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-link {
  padding: 8px 16px;
  font-size: 14px;
  color: #a0a0a0;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  border-radius: 4px;
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }
  
  &.active {
    color: #fff;
    font-weight: 500;
  }
}

// 右侧操作区
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.search-wrapper {
  width: 320px;
}

.search-input {
  :deep(.el-input__wrapper) {
    background: #424549;
    border: 1px solid transparent;
    border-radius: 20px;
    box-shadow: none;
    padding: 0 16px;
    height: 38px;
    transition: all 0.2s;
    
    &:hover {
      background: #4a4e52;
    }
    
    &.is-focus {
      background: #4a4e52;
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
  
  :deep(.el-input__inner) {
    color: #fff;
    font-size: 13px;
    
    &::placeholder {
      color: #8a8a8a;
    }
  }
  
  :deep(.el-input__suffix) {
    display: flex;
    align-items: center;
  }
}

.search-icon {
  color: #8a8a8a;
  font-size: 16px;
}

// 用户菜单容器
.user-menu-wrapper {
  position: relative;
  
  &:hover {
    .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.2s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

// 下拉菜单
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: #2c3034;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.2s ease;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  
  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
  }
  
  .user-email {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
  
  .el-icon {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    
    .el-icon {
      color: #fff;
    }
  }
  
  &:last-child {
    color: rgba(239, 68, 68, 0.9);
    
    .el-icon {
      color: rgba(239, 68, 68, 0.9);
    }
    
    &:hover {
      background: rgba(239, 68, 68, 0.1);
      color: rgb(239, 68, 68);
      
      .el-icon {
        color: rgb(239, 68, 68);
      }
    }
  }
}

// 主要内容区域
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 32px 120px;
}

// 区块样式
.section {
  margin-bottom: 64px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.view-all-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #fff;
  }
}

// 专辑网格
.albums-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
}

.album-item {
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    
    .album-overlay {
      opacity: 1;
    }
  }
}

.album-cover-wrapper {
  position: relative;
  aspect-ratio: 1;
  margin-bottom: 12px;
  overflow: hidden;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.album-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.play-icon {
  font-size: 48px;
  color: #fff;
}

.album-info {
  .album-name {
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 4px;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .album-artist {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .album-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    
    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .el-icon {
        font-size: 12px;
      }
    }
  }
}

// 最新发布列表
.releases-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.release-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.release-rank {
  width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
}

.release-cover {
  width: 48px;
  height: 48px;
  border-radius: 2px;
  object-fit: cover;
}

.release-info {
  flex: 1;
  min-width: 0;
  
  .release-name {
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 4px;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .release-artist {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.release-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.release-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  
  .el-icon {
    font-size: 13px;
  }
}

// 随机推荐歌曲卡片
.random-song-card {
  display: flex;
  gap: 32px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }
}

.song-cover-wrapper {
  position: relative;
  width: 280px;
  height: 280px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  
  &:hover {
    .song-overlay {
      opacity: 1;
    }
  }
}

.song-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.play-icon-large {
  font-size: 64px;
  color: #fff;
}

.song-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.song-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.song-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #fff;
  line-height: 1.2;
}

.song-badges {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.song-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  
  .el-icon {
    font-size: 14px;
  }
}

.song-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.meta-label {
  min-width: 60px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.meta-value {
  font-size: 15px;
  color: #fff;
  font-weight: 500;
  
  &.rating-value {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #ffd700;
    
    .el-icon {
      font-size: 16px;
    }
  }
}

.song-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
  
  .el-button {
    flex: 1;
    
    &.is-circle {
      flex: 0 0 auto;
      width: 48px;
      height: 48px;
    }
  }
}

// 空状态
.random-song-empty {
  padding: 80px 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  
  .empty-icon {
    font-size: 64px;
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 16px;
  }
  
  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 24px;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .albums-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .albums-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .random-song-card {
    flex-direction: column;
    gap: 24px;
  }
  
  .song-cover-wrapper {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }
}

@media (max-width: 900px) {
  .header-container {
    gap: 16px;
  }
  
  .nav-links {
    display: none;
  }
  
  .search-wrapper {
    width: 200px;
  }
}

@media (max-width: 600px) {
  .header-container {
    padding: 0 16px;
    height: 52px;
  }
  
  .logo {
    font-size: 18px;
  }
  
  .search-wrapper {
    flex: 1;
    width: auto;
  }
  
  .main-container {
    padding: 32px 16px 100px;
  }
  
  .albums-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .section {
    margin-bottom: 48px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .random-song-card {
    padding: 20px;
  }
  
  .song-title {
    font-size: 22px;
  }
  
  .song-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
      
      &.is-circle {
        width: 48px;
        align-self: center;
      }
    }
  }
}
</style>
