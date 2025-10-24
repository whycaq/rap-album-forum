<template>
  <!-- 登录后显示功能丰富的首页 -->
  <LoggedInHome v-if="userStore.isLoggedIn" />
  
  <!-- 未登录显示简洁的轮播首页 -->
  <div v-else class="minimal-home">
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
      <div class="carousel-track" :class="{ 'no-transition': !isTransitioning }" :style="{ transform: `translateX(${slideOffset}px)` }">
        <!-- 渲染所有专辑 -->
        <div 
          v-for="(album, index) in displayAlbums"
          :key="`album-${album.id}-${index}`"
          class="album-card"
          :class="{ 'active': index === activeAlbumIndex }"
          @click="handleAlbumClickByIndex(index)"
        >
          <div class="album-cover">
            <img :src="album.coverUrl" :alt="album.title" />
            <!-- 播放状态指示器 -->
            <div 
              class="play-indicator" 
              v-if="isAlbumPlaying(album)"
            >
              <el-icon :size="40" class="playing-icon">
                <VideoPause v-if="playerStore.isPlaying" />
                <VideoPlay v-else />
              </el-icon>
            </div>
          </div>
          <div class="album-info" v-if="index === activeAlbumIndex">
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

    <!-- 向下滚动指示器 -->
    <div class="scroll-indicator" @click="scrollToIntro">
      <div class="indicator-text">向下了解更多</div>
      <div class="indicator-arrow">
        <el-icon :size="24"><ArrowDown /></el-icon>
      </div>
    </div>

    <!-- 播放控制栏 -->
    <footer class="player-bar" v-if="playerStore.hasCurrentSong">
      <div class="player-content">
        <div class="current-track">
          <img :src="playerStore.currentAlbum?.coverUrl" class="current-cover" />
          <div class="track-info">
            <div class="track-title">{{ playerStore.currentSong?.title }}</div>
            <div class="track-artist">{{ playerStore.currentAlbum?.artist }}</div>
          </div>
        </div>
        
        <div class="player-controls">
          <button class="control-btn prev-next" @click="prevSong">
            <el-icon :size="20"><DArrowLeft /></el-icon>
          </button>
          <button class="control-btn play-pause" @click="togglePlay">
            <el-icon v-if="playerStore.isPlaying" :size="24"><VideoPause /></el-icon>
            <el-icon v-else :size="24"><VideoPlay /></el-icon>
          </button>
          <button class="control-btn prev-next" @click="nextSong">
            <el-icon :size="20"><DArrowRight /></el-icon>
          </button>
        </div>

        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress" :style="{ width: playerStore.progress + '%' }"></div>
          </div>
          <div class="time-display">
            {{ playerStore.formattedCurrentTime }} / {{ playerStore.formattedDuration }}
          </div>
        </div>
      </div>
    </footer>
  </div>
  
  <!-- 第二屏：论坛介绍 - 只在未登录时显示 -->
  <div class="intro-section" v-if="!userStore.isLoggedIn">
    <div class="intro-content">
      <h1 class="intro-title">发现说唱的力量</h1>
      <p class="intro-subtitle">一个专注于说唱音乐文化的专业论坛</p>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎵</div>
          <h3 class="feature-title">海量专辑</h3>
          <p class="feature-desc">收录国内外经典说唱专辑，提供高质量试听体验</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <h3 class="feature-title">深度交流</h3>
          <p class="feature-desc">与全球说唱爱好者分享见解，讨论音乐背后的故事</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">⭐</div>
          <h3 class="feature-title">专业评分</h3>
          <p class="feature-desc">为喜欢的专辑评分，发现更多优质作品</p>
        </div>
      </div>
      
      <div class="cta-buttons">
        <el-button type="primary" size="large" @click="router.push('/register')">
          立即注册
        </el-button>
        <el-button size="large" @click="router.push('/login')">
          已有账号？登录
        </el-button>
      </div>
      
      <div class="stats-banner">
        <div class="stat-item">
          <div class="stat-number">{{ albums.length }}+</div>
          <div class="stat-label">专辑收录</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">5+</div>
          <div class="stat-label">顶级艺人</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">99+</div>
          <div class="stat-label">精选歌曲</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, DArrowLeft, DArrowRight, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Album, Song } from '@/types/album'
import { getAlbumsFromSupabase, getSongsFromSupabase } from '@/api/album'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import LoggedInHome from './LoggedInHome.vue'

const router = useRouter()
const playerStore = usePlayerStore()
const userStore = useUserStore()

// 状态
const albums = ref<Album[]>([]) // 原始专辑列表
const displayAlbums = ref<Album[]>([]) // 用于显示的专辑列表（包含重复以实现无限滚动）
const currentIndex = ref(0) // 当前选中的专辑在原始列表中的索引
const activeAlbumIndex = ref(0) // 当前选中的专辑在显示列表中的索引
const showPlayIcon = ref(false) // 是否显示播放图标（hover状态）
const animationKey = ref(0) // 用于触发过渡动画
const slideOffset = ref(0) // 滑动偏移量
const isTransitioning = ref(true) // 是否启用过渡动画

// 计算属性：当前显示的专辑
const currentAlbum = computed(() => {
  if (albums.value.length === 0) {
    return {
      id: '0',
      title: '加载中...',
      artist: '请稍候',
      coverUrl: 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=Loading',
      releaseDate: '2024-01-01',
      genre: 'Hip-Hop',
      rating: 0,
      ratingCount: 0,
      songCount: 0
    }
  }
  return albums.value[currentIndex.value]
})

// 计算属性：当前专辑是否正在播放
const isCurrentAlbumPlaying = computed(() => {
  return playerStore.currentAlbum?.id === currentAlbum.value.id && playerStore.hasCurrentSong
})

/**
 * 根据偏移量获取专辑（支持循环）
 * offset: -1 表示上一张，0 表示当前，1 表示下一张
 */
function getAlbumByOffset(offset: number): Album {
  if (albums.value.length === 0) {
    return currentAlbum.value
  }
  
  // 计算目标索引，支持循环
  let targetIndex = currentIndex.value + offset
  
  // 处理边界情况，实现循环
  if (targetIndex < 0) {
    targetIndex = albums.value.length - 1
  } else if (targetIndex >= albums.value.length) {
    targetIndex = 0
  }
  
  return albums.value[targetIndex]
}

/**
 * 获取播放提示文字
 */
function getPlayHintText(): string {
  if (!isCurrentAlbumPlaying.value) {
    return '点击播放 →'
  }
  return playerStore.isPlaying ? '点击暂停' : '点击继续'
}

/**
 * 加载专辑列表
 */
async function loadAlbums() {
  try {
    console.log('🎵 正在从 Supabase 加载专辑数据...')
    
    // 从 Supabase 获取真实的专辑数据（获取前10张）
    const supabaseAlbums = await getAlbumsFromSupabase(10)
    
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
    
    // 创建显示列表：重复3次以实现无限滚动
    displayAlbums.value = [...albums.value, ...albums.value, ...albums.value]
    
    // 初始选中第二组的第一张（索引为albums.length）
    currentIndex.value = 0
    activeAlbumIndex.value = albums.value.length
    
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
    
    displayAlbums.value = [...albums.value, ...albums.value, ...albums.value]
    currentIndex.value = 0
    activeAlbumIndex.value = albums.value.length
  }
}

/**
 * 判断某个专辑是否正在播放
 */
function isAlbumPlaying(album: Album): boolean {
  return playerStore.currentAlbum?.id === album.id && playerStore.hasCurrentSong
}

/**
 * 处理专辑点击事件（通过索引）
 */
async function handleAlbumClickByIndex(index: number) {
  const album = displayAlbums.value[index]
  console.log('🖱️ 点击专辑:', album.title, 'index:', index)
  
  // 如果点击的是当前选中的专辑
  if (index === activeAlbumIndex.value) {
    // 如果正在播放，则切换播放/暂停
    if (isAlbumPlaying(album)) {
      playerStore.toggle()
    } else {
      // 否则加载并播放
      await playAlbum(album)
    }
  } else {
    // 切换到该专辑
    const wasPlaying = playerStore.isPlaying
    
    activeAlbumIndex.value = index
    // 更新currentIndex（对应原始专辑列表）
    currentIndex.value = index % albums.value.length
    
    updateSlideOffset()
    checkAndResetPosition()
    
    // 如果之前在播放，自动播放新专辑
    if (wasPlaying && playerStore.hasCurrentSong) {
      setTimeout(async () => {
        await playAlbum(album)
      }, 500)
    }
  }
}

/**
 * 播放专辑
 */
async function playAlbum(album: Album) {
  try {
    console.log(`🎵 加载专辑 "${album.title}" 的歌曲...`)
    const songs = await getSongsFromSupabase(album.id)
    
    if (songs && songs.length > 0) {
      console.log(`✅ 加载了 ${songs.length} 首歌曲`)
      console.log('第一首歌:', songs[0].title, '音频URL:', songs[0].audioUrl)
      
      // 使用全局播放器播放音频
      if (songs[0].audioUrl) {
        await playerStore.play(songs[0], album, songs, 0)
      } else {
        ElMessage.warning(`专辑 "${album.title}" 暂无可播放的音频`)
      }
    } else {
      console.warn('⚠️ 专辑没有歌曲')
      ElMessage.warning(`专辑 "${album.title}" 暂无歌曲`)
    }
  } catch (error) {
    console.error('❌ 加载歌曲失败:', error)
    ElMessage.error('加载歌曲失败')
  }
}

/**
 * 切换播放状态
 */
function togglePlay() {
  playerStore.toggle()
}

/**
 * 播放下一首
 */
function nextSong() {
  playerStore.playNext()
}

/**
 * 播放上一首
 */
function prevSong() {
  playerStore.playPrev()
}

/**
 * 更新滑动偏移量
 * 关键：让当前选中的专辑（activeAlbumIndex）始终停留在屏幕固定位置
 */
function updateSlideOffset() {
  const cardWidth = 280
  const gap = 24
  const cardTotalWidth = cardWidth + gap // 304px
  
  // 选中专辑应该停留的固定位置（从屏幕左边算起）
  const selectedPosition = 404 // 100px留白 + 280px第一张 + 24px间距
  
  // 计算当前选中专辑在轨道上的原始位置
  // displayAlbums中索引为activeAlbumIndex的专辑，其原始位置是
  const albumOriginalPosition = 100 + activeAlbumIndex.value * cardTotalWidth
  
  // 轨道需要的偏移量 = 目标位置 - 原始位置
  slideOffset.value = selectedPosition - albumOriginalPosition
  
  console.log('更新偏移量:', {
    activeAlbumIndex: activeAlbumIndex.value,
    currentIndex: currentIndex.value,
    albumOriginalPosition,
    selectedPosition,
    finalOffset: slideOffset.value
  })
}

/**
 * 检查并重置位置（实现无限循环）
 */
function checkAndResetPosition() {
  const albumCount = albums.value.length
  if (albumCount === 0) return
  
  setTimeout(() => {
    // 如果接近第一组边界，瞬移到第二组
    if (activeAlbumIndex.value < albumCount) {
      console.log('🔄 边界重置：向右瞬移', { from: activeAlbumIndex.value, to: activeAlbumIndex.value + albumCount })
      
      // 禁用过渡动画
      isTransitioning.value = false
      
      // 更新索引和偏移量
      activeAlbumIndex.value += albumCount
      slideOffset.value = 404 - (100 + activeAlbumIndex.value * 304)
      
      // 下一帧重新启用过渡
      setTimeout(() => {
        isTransitioning.value = true
      }, 50)
    }
    // 如果接近第三组边界，瞬移到第二组
    else if (activeAlbumIndex.value >= albumCount * 2) {
      console.log('🔄 边界重置：向左瞬移', { from: activeAlbumIndex.value, to: activeAlbumIndex.value - albumCount })
      
      // 禁用过渡动画
      isTransitioning.value = false
      
      // 更新索引和偏移量
      activeAlbumIndex.value -= albumCount
      slideOffset.value = 404 - (100 + activeAlbumIndex.value * 304)
      
      // 下一帧重新启用过渡
      setTimeout(() => {
        isTransitioning.value = true
      }, 50)
    }
  }, 500) // 等待动画完成
}

/**
 * 切换到上一个专辑（向左）
 */
async function prevAlbum() {
  console.log('⬅️ 切换到上一张专辑')
  
  // 记录切换前是否在播放
  const wasPlaying = playerStore.isPlaying
  
  // 直接向左移动activeAlbumIndex，不限制边界
  // 因为有3组重复数据，可以自由移动
  activeAlbumIndex.value--
  
  // 更新currentIndex（循环）
  currentIndex.value--
  if (currentIndex.value < 0) {
    currentIndex.value = albums.value.length - 1
  }
  
  updateSlideOffset()
  checkAndResetPosition()
  
  console.log('当前索引:', {
    activeAlbumIndex: activeAlbumIndex.value,
    currentIndex: currentIndex.value,
    album: displayAlbums.value[activeAlbumIndex.value]?.title
  })
  
  // 如果之前在播放，自动播放新专辑
  if (wasPlaying && playerStore.hasCurrentSong) {
    setTimeout(async () => {
      await playAlbum(displayAlbums.value[activeAlbumIndex.value])
    }, 500)
  }
}

/**
 * 切换到下一个专辑（向右）
 */
async function nextAlbum() {
  console.log('➡️ 切换到下一张专辑')
  
  // 记录切换前是否在播放
  const wasPlaying = playerStore.isPlaying
  
  // 直接向右移动activeAlbumIndex，不限制边界
  // 因为有3组重复数据，可以自由移动
  activeAlbumIndex.value++
  
  // 更新currentIndex（循环）
  currentIndex.value++
  if (currentIndex.value >= albums.value.length) {
    currentIndex.value = 0
  }
  
  updateSlideOffset()
  checkAndResetPosition()
  
  console.log('当前索引:', {
    activeAlbumIndex: activeAlbumIndex.value,
    currentIndex: currentIndex.value,
    album: displayAlbums.value[activeAlbumIndex.value]?.title
  })
  
  // 如果之前在播放，自动播放新专辑
  if (wasPlaying && playerStore.hasCurrentSong) {
    setTimeout(async () => {
      await playAlbum(displayAlbums.value[activeAlbumIndex.value])
    }, 500)
  }
}

/**
 * 跳转到指定偏移量的专辑
 */
async function goToAlbum(offset: number) {
  console.log(`🎯 跳转到偏移 ${offset} 的专辑`)
  
  // 记录切换前是否在播放
  const wasPlaying = playerStore.isPlaying
  
  if (offset > 0) {
    // 向右跳转
    currentIndex.value += offset
    if (currentIndex.value >= albums.value.length) {
      currentIndex.value = currentIndex.value % albums.value.length
    }
  } else if (offset < 0) {
    // 向左跳转
    currentIndex.value += offset
    if (currentIndex.value < 0) {
      currentIndex.value = albums.value.length + (currentIndex.value % albums.value.length)
    }
  }
  
  animationKey.value++
  updateSlideOffset()
  
  // 如果之前在播放，自动播放新专辑
  if (wasPlaying && playerStore.hasCurrentSong) {
    setTimeout(async () => {
      await playAlbum(currentAlbum.value)
    }, 500)
  }
}

/**
 * 滚动到介绍区域
 */
function scrollToIntro() {
  const introSection = document.querySelector('.intro-section')
  if (introSection) {
    introSection.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(async () => {
  // 初始化全局播放器
  playerStore.initPlayer()
  
  // 加载专辑数据
  await loadAlbums()
  
  // 初始化滑动偏移量
  updateSlideOffset()
  
  // 不自动播放，等待用户点击
  console.log('✅ 首页加载完成，等待用户交互')
})
</script>

<style lang="scss" scoped>
.minimal-home {
  min-height: 100vh;
  background: #000000;
  color: #fff;
  overflow: hidden;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
    color: #fff;
  }
  
  &.el-button--primary {
    background: #fff;
    border: none;
    color: #000;
    
    &:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: translateY(-1px);
    }
  }
}

.carousel-container {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  overflow-x: hidden;
  overflow-y: hidden;
}

.carousel-track {
  display: flex;
  gap: 24px;
  padding: 0 100px;
  transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
  
  // 禁用过渡动画（用于无缝循环的瞬间跳转）
  &.no-transition {
    transition: none !important;
  }
}

.album-card {
  width: 280px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.5;
  
  &:hover {
    opacity: 0.7;
    transform: translateY(-4px);
  }
  
  // 选中的专辑：稍微突出
  &.active {
    opacity: 1;
    
    &:hover {
      transform: translateY(-6px);
    }
    
    .album-cover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
  }
}

.album-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 播放状态指示器
.play-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  
  .playing-icon {
    color: #000;
  }
}

.album-card:hover .play-indicator {
  opacity: 1;
}

.album-info {
  margin-top: 16px;
  
  .album-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .album-artist {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  transform: translateY(-50%);
}

.nav-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  font-size: 36px;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: all;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.98);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  z-index: 999;
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
    color: rgba(255, 255, 255, 0.6);
  }
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.prev-next {
    width: 36px;
    height: 36px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.4);
      color: #fff;
    }
  }
  
  &.play-pause {
    width: 48px;
    height: 48px;
    background: #fff;
    border: none;
    color: #000;
    
    &:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: scale(1.05);
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
  background: #fff;
  transition: width 0.1s ease;
  border-radius: 3px;
}

.time-display {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

// 滚动指示器
.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  cursor: pointer;
  z-index: 10;
  animation: bounce 2s infinite;
  
  .indicator-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  }
  
  .indicator-arrow {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:hover {
    .indicator-text,
    .indicator-arrow {
      color: #fff;
    }
  }
}

// 当播放栏显示时，调整滚动指示器的位置
.minimal-home:has(.player-bar) .scroll-indicator {
  bottom: 120px;
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

// 第二屏：介绍区域
.intro-section {
  min-height: 100vh;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  position: relative;
}

.intro-content {
  max-width: 1200px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.intro-title {
  font-size: 64px;
  font-weight: 900;
  color: #fff;
  margin: 0 0 16px;
}

.intro-subtitle {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 64px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 64px;
}

.feature-card {
  padding: 32px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
  }
  
  .feature-icon {
    font-size: 56px;
    margin-bottom: 20px;
  }
  
  .feature-title {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 12px;
  }
  
  .feature-desc {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin: 0;
  }
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 80px;
}

:deep(.cta-buttons .el-button) {
  min-width: 160px;
  font-weight: 600;
}

:deep(.cta-buttons .el-button--primary) {
  background: #fff;
  border: none;
  color: #000;
}

:deep(.cta-buttons .el-button--primary:hover) {
  background: rgba(255, 255, 255, 0.9);
}

:deep(.cta-buttons .el-button--large:not(.el-button--primary)) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

:deep(.cta-buttons .el-button--large:not(.el-button--primary):hover) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.5);
}

.stats-banner {
  display: flex;
  justify-content: center;
  gap: 80px;
  
  .stat-item {
    text-align: center;
    
    .stat-number {
      font-size: 48px;
      font-weight: 900;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

@media (max-width: 768px) {
  .carousel-track {
    gap: 16px;
    padding: 0 20px;
  }
  
  .album-card {
    width: 200px;
  }
  
  .nav-btn {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }
  
  .player-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .progress-container {
    max-width: none;
    order: -1;
  }
  
  // 介绍区域响应式
  .intro-title {
    font-size: 40px;
  }
  
  .intro-subtitle {
    font-size: 18px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .cta-buttons {
    flex-direction: column;
    
    :deep(.el-button) {
      width: 100%;
    }
  }
  
  .stats-banner {
    flex-direction: column;
    gap: 32px;
  }
}
</style>

