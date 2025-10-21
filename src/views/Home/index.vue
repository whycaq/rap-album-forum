<template>
  <div class="minimal-home">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="auth-buttons">
          <el-button type="primary" @click="router.push('/login')">登录</el-button>
          <el-button @click="router.push('/register')">注册</el-button>
        </div>
      </div>
    </header>

    <!-- 专辑轮播区域 -->
    <main class="carousel-container">
      <div class="carousel-track" :style="{ transform: `translateX(${translateX}px)` }">
        <div 
          class="album-card" 
          v-for="(album, index) in albums" 
          :key="album.id"
          :class="{ 
            'left': index === leftIndex,
            'center': index === centerIndex,
            'right': index === rightIndex
          }"
          @click="selectAlbum(album)"
        >
          <div class="album-cover">
            <img :src="album.coverUrl" :alt="album.title" />
            <div class="album-overlay" v-if="index === centerIndex">
              <span class="play-icon">▶</span>
            </div>
          </div>
          <div class="album-info" v-if="index === centerIndex">
            <h3 class="album-title">{{ album.title }}</h3>
            <p class="album-artist">{{ album.artist }}</p>
          </div>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="carousel-nav">
        <button class="nav-btn prev" @click="prevAlbum">‹</button>
        <button class="nav-btn next" @click="nextAlbum">›</button>
      </div>
    </main>

    <!-- 播放控制栏 -->
    <footer class="player-bar" v-if="currentAlbum">
      <div class="player-content">
        <div class="current-track">
          <img :src="currentAlbum.coverUrl" class="current-cover" />
          <div class="track-info">
            <div class="track-title">{{ currentSong?.title || '选择专辑开始播放' }}</div>
            <div class="track-artist">{{ currentAlbum.artist }}</div>
          </div>
        </div>
        
        <div class="player-controls">
          <button class="control-btn" @click="prevSong">⏮</button>
          <button class="control-btn play-pause" @click="togglePlay">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button class="control-btn" @click="nextSong">⏭</button>
        </div>

        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="time-display">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Album, Song } from '@/types/album'

const router = useRouter()

// 状态
const albums = ref<Album[]>([])
const currentIndex = ref(2) // 默认显示中间的专辑
const translateX = ref(0)
const currentAlbum = ref<Album | null>(null)
const currentSong = ref<Song | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)

// 计算属性
const centerIndex = computed(() => currentIndex.value)
const leftIndex = computed(() => (currentIndex.value - 1 + albums.value.length) % albums.value.length)
const rightIndex = computed(() => (currentIndex.value + 1) % albums.value.length)

/**
 * 加载专辑列表
 */
function loadAlbums() {
  albums.value = [
    {
      id: '1',
      title: 'The Marshall Mathers LP',
      artist: 'Eminem',
      coverUrl: 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=Eminem',
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
      coverUrl: 'https://via.placeholder.com/300x300/2a2a2a/ffffff?text=Kendrick',
      releaseDate: '2015-03-15',
      genre: 'Hip-Hop',
      rating: 4.9,
      ratingCount: 2000,
      songCount: 16
    },
    {
      id: '3',
      title: 'My Beautiful Dark Twisted Fantasy',
      artist: 'Kanye West',
      coverUrl: 'https://via.placeholder.com/300x300/3a3a3a/ffffff?text=Kanye',
      releaseDate: '2010-11-22',
      genre: 'Hip-Hop',
      rating: 4.7,
      ratingCount: 1800,
      songCount: 13
    },
    {
      id: '4',
      title: 'Illmatic',
      artist: 'Nas',
      coverUrl: 'https://via.placeholder.com/300x300/4a4a4a/ffffff?text=Nas',
      releaseDate: '1994-04-19',
      genre: 'Hip-Hop',
      rating: 4.9,
      ratingCount: 1200,
      songCount: 10
    },
    {
      id: '5',
      title: 'The Blueprint',
      artist: 'Jay-Z',
      coverUrl: 'https://via.placeholder.com/300x300/5a5a5a/ffffff?text=Jay-Z',
      releaseDate: '2001-09-11',
      genre: 'Hip-Hop',
      rating: 4.6,
      ratingCount: 900,
      songCount: 15
    },
    {
      id: '6',
      title: 'Good Kid, M.A.A.D City',
      artist: 'Kendrick Lamar',
      coverUrl: 'https://via.placeholder.com/300x300/6a6a6a/ffffff?text=Kendrick2',
      releaseDate: '2012-10-22',
      genre: 'Hip-Hop',
      rating: 4.8,
      ratingCount: 1600,
      songCount: 12
    }
  ]
}

/**
 * 选择专辑
 */
function selectAlbum(album: Album) {
  currentAlbum.value = album
  // 模拟加载歌曲
  const mockSongs = {
    '1': { id: '1-1', title: 'The Real Slim Shady', duration: 284 },
    '2': { id: '2-1', title: 'King Kunta', duration: 235 },
    '3': { id: '3-1', title: 'Power', duration: 292 },
    '4': { id: '4-1', title: 'N.Y. State of Mind', duration: 294 },
    '5': { id: '5-1', title: 'Izzo (H.O.V.A.)', duration: 244 },
    '6': { id: '6-1', title: 'Bitch, Don\'t Kill My Vibe', duration: 342 }
  }
  
  currentSong.value = mockSongs[album.id as keyof typeof mockSongs] || null
  isPlaying.value = true
  ElMessage.success(`开始播放: ${album.title}`)
}

/**
 * 切换播放状态
 */
function togglePlay() {
  isPlaying.value = !isPlaying.value
}

/**
 * 播放下一首
 */
function nextSong() {
  ElMessage.info('下一首')
}

/**
 * 播放上一首
 */
function prevSong() {
  ElMessage.info('上一首')
}

/**
 * 切换到上一个专辑
 */
function prevAlbum() {
  currentIndex.value = (currentIndex.value - 1 + albums.value.length) % albums.value.length
  updateTransform()
}

/**
 * 切换到下一个专辑
 */
function nextAlbum() {
  currentIndex.value = (currentIndex.value + 1) % albums.value.length
  updateTransform()
}

/**
 * 更新轮播位置
 */
function updateTransform() {
  const cardWidth = 300 // 专辑卡片宽度
  const gap = 50 // 间距
  translateX.value = -currentIndex.value * (cardWidth + gap) + (window.innerWidth - cardWidth) / 2
}

/**
 * 格式化时间显示
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  loadAlbums()
  // 初始化选择中间的专辑
  setTimeout(() => {
    if (albums.value.length > 0) {
      selectAlbum(albums.value[centerIndex.value])
    }
  }, 100)
  
  // 监听窗口大小变化
  window.addEventListener('resize', updateTransform)
  updateTransform()
})
</script>

<style lang="scss" scoped>
.minimal-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a3658 100%);
  color: #fff;
  overflow: hidden;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 25, 41, 0.9);
  backdrop-filter: blur(10px);
  padding: 16px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.carousel-container {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  gap: 50px;
  transition: transform 0.5s ease;
  padding: 0 100px;
}

.album-card {
  width: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.left, &.right {
    opacity: 0.3;
    transform: scale(0.8);
  }
  
  &.center {
    opacity: 1;
    transform: scale(1);
  }
}

.album-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.album-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  
  .play-icon {
    font-size: 48px;
    color: #fff;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }
}

.album-info {
  text-align: center;
  margin-top: 20px;
  
  .album-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px;
    color: #fff;
  }
  
  .album-artist {
    font-size: 16px;
    color: #a8c7fa;
    margin: 0;
  }
}

.carousel-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
  pointer-events: none;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 32px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: all;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
}

.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 25, 41, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
}

.player-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.current-track {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.current-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.track-info {
  .track-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #fff;
  }
  
  .track-artist {
    font-size: 12px;
    color: #a8c7fa;
  }
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.play-pause {
    background: #1890ff;
    font-size: 24px;
    
    &:hover {
      background: #40a9ff;
    }
  }
}

.progress-container {
  flex: 1;
  max-width: 300px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress {
  height: 100%;
  background: #1890ff;
  transition: width 0.1s ease;
}

.time-display {
  font-size: 12px;
  color: #a8c7fa;
  text-align: center;
}

@media (max-width: 768px) {
  .carousel-track {
    gap: 30px;
    padding: 0 20px;
  }
  
  .album-card {
    width: 250px;
  }
  
  .nav-btn {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .player-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .progress-container {
    max-width: none;
    order: -1;
  }
}
</style>

