<template>
  <div class="netease-demo">
    <div class="demo-container">
      <!-- 顶部标题 -->
      <div class="demo-header">
        <h1>🎵 网易云音乐API集成测试</h1>
        <p class="subtitle">测试专辑搜索、封面展示和音乐播放功能</p>
        
        <!-- API状态 -->
        <div class="api-status" :class="{ online: apiStatus, offline: !apiStatus }">
          <span class="status-dot"></span>
          <span>{{ apiStatus ? 'API服务在线' : 'API服务离线' }}</span>
        </div>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索专辑或艺人..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button 
              type="primary" 
              @click="handleSearch"
              :loading="searching"
            >
              搜索
            </el-button>
          </template>
        </el-input>

        <!-- 快速搜索标签 -->
        <div class="quick-tags">
          <el-tag 
            v-for="tag in quickTags" 
            :key="tag"
            @click="quickSearch(tag)"
            style="cursor: pointer; margin-right: 8px;"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 专辑列表 -->
      <div class="albums-section" v-if="albums.length > 0">
        <h2>搜索结果 ({{ albums.length }} 张专辑)</h2>
        
        <div class="albums-grid">
          <div 
            class="album-card" 
            v-for="album in albums" 
            :key="album.id"
            @click="loadAlbumDetail(album)"
          >
            <div class="album-cover">
              <img :src="album.coverUrl" :alt="album.title" />
              <div class="play-overlay">
                <el-icon :size="40"><CaretRight /></el-icon>
              </div>
            </div>
            <div class="album-info">
              <h3 class="album-title">{{ album.title }}</h3>
              <p class="album-artist">{{ album.artist }}</p>
              <p class="album-meta">{{ album.songCount }} 首歌曲</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 专辑详情 -->
      <div class="detail-section" v-if="selectedAlbum">
        <h2>专辑详情</h2>
        
        <div class="detail-card">
          <div class="detail-cover">
            <img :src="selectedAlbum.coverUrl" :alt="selectedAlbum.title" />
          </div>
          
          <div class="detail-content">
            <h2>{{ selectedAlbum.title }}</h2>
            <p class="artist">{{ selectedAlbum.artist }}</p>
            <p class="release-date">发行日期: {{ selectedAlbum.releaseDate }}</p>
            
            <el-button 
              type="primary" 
              size="large"
              @click="playFirstSong"
              :loading="loadingSongs"
            >
              <el-icon><CaretRight /></el-icon>
              播放专辑
            </el-button>
          </div>
        </div>

        <!-- 歌曲列表 -->
        <div class="songs-list" v-if="songs.length > 0">
          <h3>歌曲列表</h3>
          
          <div class="song-item" 
            v-for="song in songs" 
            :key="song.id"
            @click="playSong(song)"
            :class="{ playing: currentSong?.id === song.id }"
          >
            <div class="song-number">{{ song.trackNumber }}</div>
            <div class="song-info">
              <div class="song-name">{{ song.title }}</div>
              <div class="song-duration">{{ formatDuration(song.duration) }}</div>
            </div>
            <div class="song-status">
              <el-icon v-if="currentSong?.id === song.id && isPlaying">
                <VideoPlay />
              </el-icon>
              <el-icon v-else-if="currentSong?.id === song.id">
                <VideoPause />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 音乐播放器 -->
      <div class="player-bar" v-if="currentSong">
        <div class="player-content">
          <div class="player-info">
            <img 
              :src="selectedAlbum?.coverUrl" 
              alt="封面" 
              class="player-cover"
            />
            <div class="player-text">
              <div class="player-song">{{ currentSong.title }}</div>
              <div class="player-artist">{{ selectedAlbum?.artist }}</div>
            </div>
          </div>

          <div class="player-controls">
            <el-button circle @click="playPrevious">
              <el-icon><CaretLeft /></el-icon>
            </el-button>
            
            <el-button 
              circle 
              type="primary" 
              size="large"
              @click="togglePlay"
              :loading="isLoading"
            >
              <el-icon v-if="isPlaying"><VideoPause /></el-icon>
              <el-icon v-else><VideoPlay /></el-icon>
            </el-button>
            
            <el-button circle @click="playNext">
              <el-icon><CaretRight /></el-icon>
            </el-button>
          </div>

          <div class="player-progress">
            <span class="time">{{ formattedCurrentTime }}</span>
            <el-slider 
              v-model="sliderValue" 
              @change="handleSeek"
              :show-tooltip="false"
            />
            <span class="time">{{ formattedDuration }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="!searching && albums.length === 0 && !selectedAlbum"
        description="搜索专辑或艺人来开始体验"
      />

      <!-- 加载状态 -->
      <div v-if="searching" class="loading-state">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <p>搜索中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Search, CaretRight, CaretLeft, VideoPlay, VideoPause, Loading 
} from '@element-plus/icons-vue'
import { NeteaseService } from '@/services/netease.service'
import { useAudioPlayer } from '@/composables'
import type { Album, Song } from '@/types/album'

// 状态
const searchKeyword = ref('')
const searching = ref(false)
const albums = ref<Album[]>([])
const selectedAlbum = ref<Album | null>(null)
const songs = ref<Song[]>([])
const loadingSongs = ref(false)
const apiStatus = ref(false)

// 快速搜索标签
const quickTags = ['说唱', 'Hip Hop', 'Eminem', 'Kendrick Lamar', '中国新说唱']

// 音频播放器
const {
  currentSong,
  isPlaying,
  currentTime,
  duration,
  isLoading,
  formattedCurrentTime,
  formattedDuration,
  playSong: playAudio,
  togglePlay,
  seek
} = useAudioPlayer()

// 进度条值（用于双向绑定）
const sliderValue = computed({
  get: () => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  },
  set: (val) => {
    const time = (val / 100) * duration.value
    seek(time)
  }
})

/**
 * 检查API状态
 */
async function checkApiStatus() {
  apiStatus.value = await NeteaseService.checkApiStatus()
  if (!apiStatus.value) {
    ElMessage.warning({
      message: '网易云API服务未启动，请先启动API服务',
      duration: 5000
    })
  }
}

/**
 * 搜索专辑
 */
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  if (!apiStatus.value) {
    ElMessage.error('API服务未启动')
    return
  }

  searching.value = true
  try {
    albums.value = await NeteaseService.searchAlbums(searchKeyword.value, 20)
    
    if (albums.value.length === 0) {
      ElMessage.info('未找到相关专辑')
    } else {
      ElMessage.success(`找到 ${albums.value.length} 张专辑`)
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请检查API服务')
  } finally {
    searching.value = false
  }
}

/**
 * 快速搜索
 */
function quickSearch(keyword: string) {
  searchKeyword.value = keyword
  handleSearch()
}

/**
 * 加载专辑详情
 */
async function loadAlbumDetail(album: Album) {
  selectedAlbum.value = album
  loadingSongs.value = true
  songs.value = []

  try {
    const result = await NeteaseService.getAlbumDetail(album.id)
    
    if (result) {
      songs.value = result.songs
      ElMessage.success('加载成功')
    } else {
      ElMessage.error('加载专辑详情失败')
    }
  } catch (error) {
    console.error('加载专辑详情失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loadingSongs.value = false
  }
}

/**
 * 播放第一首歌
 */
function playFirstSong() {
  if (songs.value.length > 0) {
    playSong(songs.value[0])
  }
}

/**
 * 播放歌曲
 */
async function playSong(song: Song) {
  try {
    await playAudio(song)
    ElMessage.success(`正在播放: ${song.title}`)
  } catch (error) {
    console.error('播放失败:', error)
    ElMessage.error('播放失败')
  }
}

/**
 * 播放上一首
 */
function playPrevious() {
  if (!currentSong.value || songs.value.length === 0) return
  
  const currentIndex = songs.value.findIndex(s => s.id === currentSong.value?.id)
  if (currentIndex > 0) {
    playSong(songs.value[currentIndex - 1])
  }
}

/**
 * 播放下一首
 */
function playNext() {
  if (!currentSong.value || songs.value.length === 0) return
  
  const currentIndex = songs.value.findIndex(s => s.id === currentSong.value?.id)
  if (currentIndex < songs.value.length - 1) {
    playSong(songs.value[currentIndex + 1])
  }
}

/**
 * 进度条跳转
 */
function handleSeek(value: number) {
  const time = (value / 100) * duration.value
  seek(time)
}

/**
 * 格式化时长
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  checkApiStatus()
})
</script>

<style lang="scss" scoped>
.netease-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a3658 100%);
  padding: 80px 0 120px;
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.demo-header {
  text-align: center;
  margin-bottom: 48px;
  
  h1 {
    font-size: 36px;
    color: #fff;
    margin-bottom: 12px;
  }
  
  .subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 24px;
  }
  
  .api-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    
    &.online {
      background: rgba(82, 196, 26, 0.2);
      color: #52c41a;
      
      .status-dot {
        background: #52c41a;
      }
    }
    
    &.offline {
      background: rgba(245, 34, 45, 0.2);
      color: #f5222d;
      
      .status-dot {
        background: #f5222d;
      }
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.search-section {
  margin-bottom: 48px;
  
  .quick-tags {
    margin-top: 16px;
    text-align: center;
  }
}

.albums-section {
  margin-bottom: 48px;
  
  h2 {
    font-size: 24px;
    color: #fff;
    margin-bottom: 24px;
  }
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.album-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    
    .play-overlay {
      opacity: 1;
    }
  }
}

.album-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 12px;
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
  
  .play-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: #fff;
  }
}

.album-info {
  .album-title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .album-artist {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;
  }
  
  .album-meta {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
}

.detail-section {
  margin-bottom: 48px;
  
  h2 {
    font-size: 24px;
    color: #fff;
    margin-bottom: 24px;
  }
}

.detail-card {
  display: flex;
  gap: 32px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-bottom: 32px;
}

.detail-cover {
  flex-shrink: 0;
  width: 240px;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.detail-content {
  flex: 1;
  
  h2 {
    font-size: 32px;
    color: #fff;
    margin-bottom: 12px;
  }
  
  .artist {
    font-size: 18px;
    color: #40a9ff;
    margin-bottom: 8px;
  }
  
  .release-date {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 24px;
  }
}

.songs-list {
  h3 {
    font-size: 18px;
    color: #fff;
    margin-bottom: 16px;
  }
}

.song-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  
  &.playing {
    background: rgba(24, 144, 255, 0.2);
  }
  
  .song-number {
    width: 32px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }
  
  .song-info {
    flex: 1;
    
    .song-name {
      font-size: 15px;
      color: #fff;
      margin-bottom: 4px;
    }
    
    .song-duration {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .song-status {
    color: #40a9ff;
  }
}

.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 25, 41, 0.98);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  z-index: 1000;
}

.player-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 24px;
  align-items: center;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .player-cover {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
  }
  
  .player-text {
    .player-song {
      font-size: 14px;
      font-weight: 500;
      color: #fff;
      margin-bottom: 4px;
    }
    
    .player-artist {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

.player-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    min-width: 40px;
  }
  
  :deep(.el-slider) {
    flex: 1;
  }
}

.loading-state {
  text-align: center;
  padding: 80px 0;
  color: rgba(255, 255, 255, 0.6);
  
  p {
    margin-top: 16px;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .detail-card {
    flex-direction: column;
  }
  
  .detail-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }
  
  .player-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>

