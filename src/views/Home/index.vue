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
          @click="selectAlbum(album, index)"
        >
          <div class="album-cover">
            <img :src="album.coverUrl" :alt="album.title" />
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
            <div class="track-title">{{ currentSong?.title || currentAlbum.title }}</div>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Album, Song } from '@/types/album'
import { getAlbumsFromSupabase, getSongsFromSupabase } from '@/api/album'

const router = useRouter()

// 状态
const albums = ref<Album[]>([])
const currentIndex = ref(2) // 默认显示中间的专辑
const translateX = ref(0)
const currentAlbum = ref<Album | null>(null)
const currentSong = ref<Song | null>(null)
const albumSongs = ref<Song[]>([]) // 当前专辑的歌曲列表
const currentSongIndex = ref(0) // 当前播放的歌曲索引
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)

// 音频播放器
const audioPlayer = ref<HTMLAudioElement | null>(null)

// 计算属性
const centerIndex = computed(() => currentIndex.value)
const leftIndex = computed(() => (currentIndex.value - 1 + albums.value.length) % albums.value.length)
const rightIndex = computed(() => (currentIndex.value + 1) % albums.value.length)

/**
 * 加载专辑列表
 */
async function loadAlbums() {
  try {
    console.log('🎵 正在从 Supabase 加载专辑数据...')
    
    // 从 Supabase 获取真实的专辑数据
    const supabaseAlbums = await getAlbumsFromSupabase(6)
    
    if (supabaseAlbums && supabaseAlbums.length > 0) {
      albums.value = supabaseAlbums
      console.log(`✅ 成功加载 ${supabaseAlbums.length} 张专辑`)
      ElMessage.success(`成功加载 ${supabaseAlbums.length} 张专辑`)
    } else {
      console.warn('⚠️ Supabase 中没有专辑数据，使用模拟数据')
      ElMessage.warning('数据库中暂无专辑，请先上传专辑数据')
      // 使用模拟数据
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
        }
      ]
    }
  } catch (error) {
    console.error('❌ 加载专辑失败:', error)
    ElMessage.error('加载专辑失败，请检查网络连接')
    
    // 如果出错，使用模拟数据
    albums.value = [
      {
        id: '1',
        title: '请先上传专辑',
        artist: '暂无数据',
        coverUrl: 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=No+Data',
        releaseDate: '2024-01-01',
        genre: 'Hip-Hop',
        rating: 0,
        ratingCount: 0,
        songCount: 0
      }
    ]
  }
}

/**
 * 选择专辑
 */
async function selectAlbum(album: Album, index?: number) {
  // 如果点击的不是中间的专辑，先切换到该专辑
  if (index !== undefined && index !== centerIndex.value) {
    currentIndex.value = index
    updateTransform()
  }
  
  currentAlbum.value = album
  
  // 从 Supabase 加载专辑的歌曲列表
  try {
    console.log(`🎵 加载专辑 "${album.title}" 的歌曲...`)
    const songs = await getSongsFromSupabase(album.id)
    
    if (songs && songs.length > 0) {
      albumSongs.value = songs
      currentSongIndex.value = 0
      currentSong.value = songs[0]
      
      console.log(`✅ 加载了 ${songs.length} 首歌曲`)
      console.log('第一首歌:', songs[0].title, '音频URL:', songs[0].audioUrl)
      
      // 如果有音频URL，播放音频
      if (songs[0].audioUrl) {
        await playSong(songs[0])
        ElMessage.success(`正在播放: ${songs[0].title}`)
      } else {
        ElMessage.warning(`专辑 "${album.title}" 暂无可播放的音频`)
        isPlaying.value = false
      }
    } else {
      console.warn('⚠️ 专辑没有歌曲')
      ElMessage.warning(`专辑 "${album.title}" 暂无歌曲`)
      albumSongs.value = []
      currentSong.value = {
        id: `${album.id}-1`,
        albumId: album.id,
        title: album.title,
        trackNumber: 1,
        duration: 0,
      }
      isPlaying.value = false
    }
  } catch (error) {
    console.error('❌ 加载歌曲失败:', error)
    ElMessage.error('加载歌曲失败')
    isPlaying.value = false
  }
}

/**
 * 播放歌曲
 */
async function playSong(song: Song) {
  if (!song.audioUrl) {
    ElMessage.warning('该歌曲暂无音频')
    return
  }
  
  // 创建或更新音频播放器
  if (!audioPlayer.value) {
    audioPlayer.value = new Audio()
    
    // 监听音频事件
    audioPlayer.value.addEventListener('loadedmetadata', () => {
      duration.value = audioPlayer.value?.duration || 0
    })
    
    audioPlayer.value.addEventListener('timeupdate', () => {
      currentTime.value = audioPlayer.value?.currentTime || 0
      progress.value = duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
    })
    
    audioPlayer.value.addEventListener('ended', () => {
      nextSong()
    })
    
    audioPlayer.value.addEventListener('error', (e) => {
      console.error('音频播放错误:', e)
      ElMessage.error('音频播放失败')
      isPlaying.value = false
    })
  }
  
  // 设置音频源并播放
  audioPlayer.value.src = song.audioUrl
  audioPlayer.value.load()
  
  try {
    await audioPlayer.value.play()
    isPlaying.value = true
    console.log('🎵 开始播放:', song.title)
  } catch (error) {
    console.error('播放失败:', error)
    ElMessage.error('播放失败，请检查音频链接')
    isPlaying.value = false
  }
}

/**
 * 切换播放状态
 */
function togglePlay() {
  if (!audioPlayer.value) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    audioPlayer.value.play()
    isPlaying.value = true
  }
}

/**
 * 播放下一首
 */
function nextSong() {
  if (albumSongs.value.length === 0) {
    ElMessage.info('没有更多歌曲')
    return
  }
  
  currentSongIndex.value = (currentSongIndex.value + 1) % albumSongs.value.length
  currentSong.value = albumSongs.value[currentSongIndex.value]
  
  if (currentSong.value.audioUrl) {
    playSong(currentSong.value)
    ElMessage.success(`正在播放: ${currentSong.value.title}`)
  } else {
    ElMessage.warning('该歌曲暂无音频')
    isPlaying.value = false
  }
}

/**
 * 播放上一首
 */
function prevSong() {
  if (albumSongs.value.length === 0) {
    ElMessage.info('没有更多歌曲')
    return
  }
  
  currentSongIndex.value = (currentSongIndex.value - 1 + albumSongs.value.length) % albumSongs.value.length
  currentSong.value = albumSongs.value[currentSongIndex.value]
  
  if (currentSong.value.audioUrl) {
    playSong(currentSong.value)
    ElMessage.success(`正在播放: ${currentSong.value.title}`)
  } else {
    ElMessage.warning('该歌曲暂无音频')
    isPlaying.value = false
  }
}

/**
 * 切换到上一个专辑
 */
function prevAlbum() {
  currentIndex.value = (currentIndex.value - 1 + albums.value.length) % albums.value.length
  updateTransform()
  // 自动播放新选中的专辑
  if (albums.value[currentIndex.value]) {
    selectAlbum(albums.value[currentIndex.value])
  }
}

/**
 * 切换到下一个专辑
 */
function nextAlbum() {
  currentIndex.value = (currentIndex.value + 1) % albums.value.length
  updateTransform()
  // 自动播放新选中的专辑
  if (albums.value[currentIndex.value]) {
    selectAlbum(albums.value[currentIndex.value])
  }
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

onMounted(async () => {
  await loadAlbums()
  
  // 根据专辑数量调整初始索引
  if (albums.value.length > 0) {
    currentIndex.value = Math.min(1, albums.value.length - 1)
    
    // 自动播放中间的专辑
    setTimeout(() => {
      if (albums.value.length > 0) {
        selectAlbum(albums.value[centerIndex.value])
        isPlaying.value = true // 确保自动开始播放
      }
    }, 300)
  }
  
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
  gap: 16px;
}

.auth-buttons .el-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
  
  &.el-button--primary {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    }
  }
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
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.left, &.right {
    opacity: 0.4;
    transform: scale(0.85);
    
    &:hover {
      opacity: 0.6;
      transform: scale(0.9);
    }
  }
  
  &.center {
    opacity: 1;
    transform: scale(1.05);
    
    .album-cover {
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }
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
  border: 1px solid rgba(255, 255, 255, 0.2);
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
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
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
  gap: 12px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &.play-pause {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border: none;
    font-size: 20px;
    padding: 14px;
    
    &:hover {
      background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
      box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
      transform: scale(1.1);
    }
  }
}

.progress-container {
  flex: 1;
  max-width: 300px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
  backdrop-filter: blur(10px);
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  transition: width 0.1s ease;
  border-radius: 3px;
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

