<template>
  <div class="album-detail-page" v-if="album">
    <!-- 专辑头部 - Spotify风格 -->
    <div class="album-header" :style="{ backgroundColor: dominantColor }">
      <!-- 返回按钮 -->
      <button class="back-home-btn" @click="router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        <span>Back</span>
      </button>
      
      <div class="header-content">
        <!-- 专辑封面 -->
        <div class="album-cover">
          <img :src="album.coverUrl" :alt="album.title" @load="extractColor" />
        </div>
        
        <!-- 专辑信息 -->
        <div class="album-info">
          <div class="album-type">专辑</div>
          <h1 class="album-title">{{ album.title }}</h1>
          <div class="album-meta">
            <span class="artist">{{ album.artist }}</span>
            <span class="separator">•</span>
            <span class="year">{{ new Date(album.releaseDate).getFullYear() }}</span>
            <span class="separator">•</span>
            <span class="song-count">{{ songs.length }} 首歌曲</span>
            <span class="separator">•</span>
            <span class="duration">{{ totalDuration }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 渐变过渡 -->
    <div class="gradient-overlay" :style="{ background: gradientStyle }"></div>

    <!-- 播放控制和操作栏 -->
    <div class="action-bar">
      <button class="play-button" @click="playAlbum">
        <el-icon v-if="!playerStore.isPlaying || playerStore.currentAlbum?.id !== album?.id" :size="28"><VideoPlay /></el-icon>
        <el-icon v-else :size="28"><VideoPause /></el-icon>
      </button>
      <button class="action-btn" title="收藏专辑">
        <el-icon :size="32"><Star /></el-icon>
      </button>
      <button class="action-btn more" title="更多选项">
        <el-icon :size="24"><MoreFilled /></el-icon>
      </button>
    </div>

    <!-- 歌曲列表 -->
    <div class="songs-section">
      <div class="songs-header">
        <div class="col-number">#</div>
        <div class="col-title">标题</div>
        <div class="col-duration">
          <el-icon><Clock /></el-icon>
        </div>
      </div>
      
      <div class="songs-list">
        <div 
          v-for="(song, index) in songs" 
          :key="song.id"
          class="song-row"
          :class="{ 
            'active': playerStore.currentSong?.id === song.id,
            'playing': playerStore.currentSong?.id === song.id && playerStore.isPlaying 
          }"
          @click="playSong(song, index)"
          @dblclick="playSong(song, index)"
        >
          <div class="col-number">
            <span class="number" v-if="playerStore.currentSong?.id !== song.id || !playerStore.isPlaying">{{ index + 1 }}</span>
            <el-icon v-else class="playing-icon"><VideoPlay /></el-icon>
          </div>
          <div class="col-title">
            <div class="song-title">{{ song.title }}</div>
            <div class="song-artist">{{ album.artist }}</div>
          </div>
          <div class="col-duration">{{ formatDuration(song.duration) }}</div>
        </div>
      </div>
    </div>

    <!-- 专辑描述 -->
    <div class="album-description" v-if="album.description">
      <h3>关于这张专辑</h3>
      <p>{{ album.description }}</p>
      <div class="release-date">
        发行日期：{{ formatDate(album.releaseDate) }}
      </div>
    </div>

    <!-- 评分评论入口 - AOTY 风格 -->
    <div class="rating-comment-entry">
      <div class="entry-container">
        <div class="entry-info">
          <h3>Rate & Review</h3>
          <p>Share your thoughts and see what other fans are saying</p>
        </div>
        <button class="rate-btn" @click="goToRatingPage">
          <span>Rate & Review</span>
          <el-icon><ArrowRight /></el-icon>
        </button>
      </div>
    </div>

  </div>

  <!-- 加载状态 -->
  <div v-else class="loading-state">
    <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
    <p>加载中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, Star, MoreFilled, Clock, Loading, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { getAlbumsFromSupabase, getSongsFromSupabase } from '@/api/album'
import type { Album, Song } from '@/types/album'
import { usePlayerStore } from '@/stores/player'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

// 数据状态
const album = ref<Album | null>(null)
const songs = ref<Song[]>([])
const dominantColor = ref('#8B3A8C') // 默认紫色

// 计算总时长
const totalDuration = computed(() => {
  const total = songs.value.reduce((sum, song) => sum + song.duration, 0)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  
  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`
  }
  return `${minutes} 分钟`
})

// 渐变样式
const gradientStyle = computed(() => {
  return `linear-gradient(180deg, ${dominantColor.value} 0%, rgba(18, 18, 18, 1) 100%)`
})


/**
 * 加载专辑数据
 */
async function loadAlbum() {
  const albumId = route.params.id as string
  
  try {
    // 从Supabase加载所有专辑，找到对应的
    const albums = await getAlbumsFromSupabase(20)
    album.value = albums.find(a => a.id === albumId) || null
    
    if (!album.value) {
      ElMessage.error('专辑不存在')
      router.push('/')
      return
    }
    
    // 加载歌曲列表
    const songsList = await getSongsFromSupabase(albumId)
    songs.value = songsList
    
    console.log('✅ 专辑加载成功:', album.value.title)
    console.log('✅ 歌曲数量:', songs.value.length)
  } catch (error) {
    console.error('❌ 加载专辑失败:', error)
    ElMessage.error('加载专辑失败')
  }
}

/**
 * 播放整张专辑（从第一首开始）
 */
function playAlbum() {
  if (songs.value.length === 0) {
    ElMessage.warning('该专辑暂无歌曲')
    return
  }
  
  if (!album.value) return
  
  // 检查是否正在播放当前专辑
  const isPlayingCurrentAlbum = playerStore.currentAlbum?.id === album.value.id
  
  if (isPlayingCurrentAlbum && playerStore.isPlaying) {
    // 如果正在播放当前专辑，则暂停
    playerStore.pause()
  } else {
    // 播放第一首歌
    playerStore.play(songs.value[0], album.value, songs.value, 0)
  }
}

/**
 * 播放指定歌曲
 */
async function playSong(song: Song, index: number) {
  if (!song.audioUrl) {
    ElMessage.warning('该歌曲暂无音频')
    return
  }
  
  if (!album.value) return
  
  await playerStore.play(song, album.value, songs.value, index)
}

/**
 * 格式化时长
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

/**
 * 提取封面主色调
 */
function extractColor(event: Event) {
  // 简单实现：使用固定的紫色系
  // 如果需要真实提取颜色，可以使用 color-thief 库
  // 随机色彩方案 - 让每张专辑都有不同的视觉风格
  const colors = [
    '#667eea', // 紫色
    '#1DB954', // 绿色
    '#E13300', // 红色
    '#FF6B35', // 橙色
    '#004E89', // 蓝色
    '#8B5CF6', // 皇家紫
    '#EC4899', // 粉红
    '#10B981', // 翡翠绿
  ]
  dominantColor.value = colors[Math.floor(Math.random() * colors.length)]
}

/**
 * 跳转到专辑评分详情页
 */
function goToRatingPage() {
  if (!album.value) return
  router.push({ 
    name: 'AlbumRating', 
    params: { id: album.value.id } 
  })
}

onMounted(() => {
  // 初始化全局播放器
  playerStore.initPlayer()
  
  loadAlbum()
})
</script>

<style lang="scss" scoped>
.album-detail-page {
  min-height: 100vh;
  background: #121212;
  color: #fff;
  padding-bottom: 100px;
}

// 返回按钮（浮动在彩色背景上）
.back-home-btn {
  position: absolute;
  top: 24px;
  left: 32px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  .el-icon {
    font-size: 18px;
  }
}

// 专辑头部
.album-header {
  padding: 80px 32px 24px;
  position: relative;
  transition: background-color 0.5s ease;
  
  .header-content {
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    align-items: flex-end;
    gap: 24px;
  }
}

.album-cover {
  width: 232px;
  height: 232px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.album-info {
  flex: 1;
  padding-bottom: 8px;
  
  .album-type {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  
  .album-title {
    font-size: 96px;
    font-weight: 900;
    line-height: 1;
    margin: 0 0 24px;
    letter-spacing: -0.04em;
  }
  
  .album-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    
    .artist {
      font-weight: 700;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .separator {
      opacity: 0.7;
    }
    
    .year, .song-count, .duration {
      opacity: 0.9;
    }
  }
}

// 渐变过渡
.gradient-overlay {
  height: 232px;
  margin-top: -100px;
  position: relative;
  z-index: 0;
}

// 操作栏
.action-bar {
  padding: 24px 32px;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(18, 18, 18, 0.9);
  position: relative;
  z-index: 1;
}

.play-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #7c8aff 0%, #8b5fc6 100%);
    transform: scale(1.06);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.6);
  }
  
  &:active {
    transform: scale(1);
  }
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.more {
    margin-left: auto;
  }
}

// 歌曲区域
.songs-section {
  padding: 0 32px;
  max-width: 1600px;
  margin: 0 auto;
}

.songs-header {
  display: grid;
  grid-template-columns: 40px 1fr 60px;
  gap: 16px;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #b3b3b3;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  
  .col-number {
    text-align: center;
  }
  
  .col-duration {
    text-align: right;
  }
}

.songs-list {
  .song-row {
    display: grid;
    grid-template-columns: 40px 1fr 60px;
    gap: 16px;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      
      .number {
        display: none;
      }
      
      .col-number::after {
        content: '▶';
        display: block;
        text-align: center;
      }
    }
    
    &.active {
      background: rgba(255, 255, 255, 0.1);
      
      .song-title {
        color: #A78BFA;
      }
    }
    
    &.playing {
      .playing-icon {
        color: #A78BFA;
      }
    }
  }
  
  .col-number {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b3b3b3;
    font-size: 16px;
    position: relative;
    
    .number {
      font-variant-numeric: tabular-nums;
    }
    
    .playing-icon {
      color: #A78BFA;
    }
  }
  
  .col-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .song-title {
      font-size: 16px;
      font-weight: 400;
      color: #fff;
      margin-bottom: 4px;
    }
    
    .song-artist {
      font-size: 14px;
      color: #b3b3b3;
    }
  }
  
  .col-duration {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #b3b3b3;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
}

// 专辑描述
.album-description {
  padding: 48px 32px;
  max-width: 1600px;
  margin: 0 auto;
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
  }
  
  p {
    color: #b3b3b3;
    line-height: 1.6;
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .release-date {
    color: #b3b3b3;
    font-size: 14px;
    font-weight: 700;
  }
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #121212;
  color: #fff;
  
  .loading-icon {
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

// 评分评论入口
.rating-comment-entry {
  padding: 48px 32px;
  max-width: 1600px;
  margin: 0 auto;
  
  .entry-container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.12);
    }
    
    .entry-info {
      flex: 1;
      
      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        margin: 0 0 8px;
      }
      
      p {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
      }
    }
  }
}

.rate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateX(4px);
  }
  
  .el-icon {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .album-header {
    padding: 60px 16px 16px;
    
    .header-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
  
  .album-cover {
    width: 192px;
    height: 192px;
  }
  
  .album-info {
    .album-title {
      font-size: 48px;
    }
    
    .album-meta {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
  
  .action-bar {
    padding: 16px;
  }
  
  .songs-section {
    padding: 0 16px;
  }
  
  .songs-header {
    .col-title {
      display: none;
    }
  }
  
  .song-row {
    grid-template-columns: 40px 1fr 60px;
    
    .song-artist {
      display: none;
    }
  }
  
  .rating-comment-entry {
    padding: 32px 16px;
    
    .entry-container {
      flex-direction: column;
      text-align: center;
      padding: 32px 24px;
    }
  }
}
</style>


