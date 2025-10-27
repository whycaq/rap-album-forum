<template>
  <div class="forum-page">
    <!-- AOTY 风格顶部导航 -->
    <header class="forum-header">
      <div class="header-container">
        <button class="back-btn" @click="router.push('/')">
          <el-icon><ArrowLeft /></el-icon>
          <span>Back</span>
        </button>
        <h1 class="page-title">User Lists & Reviews</h1>
      </div>
    </header>

    <!-- 内容区域 -->
    <div class="forum-content">
      <!-- 快速评分入口 -->
      <section class="quick-rate-section" v-if="userStore.isLoggedIn">
        <div class="quick-rate-card">
          <div class="quick-rate-left">
            <el-icon class="rate-icon" :size="32"><EditPen /></el-icon>
            <div class="quick-rate-info">
              <h3>Rate an Album</h3>
              <p>Share your opinion and help others discover great music</p>
            </div>
          </div>
          <el-select 
            v-model="selectedAlbumId" 
            placeholder="Choose an album..."
            filterable
            size="large"
            @change="goToAlbumRating"
            class="album-select"
          >
            <el-option
              v-for="album in availableAlbums"
              :key="album.id"
              :label="`${album.title} - ${album.artist}`"
              :value="album.id"
            >
              <div class="album-option">
                <img :src="album.coverUrl" class="option-cover" />
                <div class="option-info">
                  <div class="option-title">{{ album.title }}</div>
                  <div class="option-artist">{{ album.artist }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </div>
      </section>

      <!-- 用户评论区域 -->
      <section class="reviews-section">
        <div class="section-header">
          <h2 class="section-title">Popular User Reviews</h2>
          <button class="view-more-btn">VIEW MORE</button>
        </div>
        
        <div class="reviews-list">
          <div v-for="review in userReviews.slice(0, 3)" :key="review.id" class="review-card">
            <div class="review-left">
              <img :src="review.album.cover" :alt="review.album.title" class="review-album-cover" />
              <div class="review-album-info">
                <div class="album-title">{{ review.album.title }}</div>
                <div class="album-artist">{{ review.album.artist }}</div>
              </div>
            </div>

            <div class="review-main">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="reviewer-avatar">{{ review.user.charAt(0).toUpperCase() }}</div>
                  <div class="reviewer-name">{{ review.user }}</div>
                  <!-- 圆环评分显示 -->
                  <div class="review-score-circle">
                    <svg class="mini-circle-svg" viewBox="0 0 40 40">
                      <circle 
                        class="mini-circle-bg" 
                        cx="20" 
                        cy="20" 
                        r="18"
                      />
                      <circle 
                        class="mini-circle-progress" 
                        cx="20" 
                        cy="20" 
                        r="18"
                        :style="{ 
                          stroke: getScoreColor(review.score),
                          strokeDashoffset: getMiniCircleOffset(review.score)
                        }"
                      />
                    </svg>
                    <div class="mini-score-value" :style="{ color: getScoreColor(review.score) }">
                      {{ review.score }}
                    </div>
                  </div>
                </div>
                <span class="review-time">{{ review.time }}</span>
              </div>

              <div class="review-content">{{ review.content }}</div>

              <div class="review-footer">
                <button class="review-action">
                  <el-icon><Star /></el-icon>
                  {{ review.likes }}
                </button>
                <button class="review-action">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ review.comments }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户列表区域 -->
      <section class="lists-section">
        <div class="section-header">
          <h2 class="section-title">Popular User Lists</h2>
          <button class="view-more-btn">VIEW MORE</button>
        </div>
        
        <div class="lists-container">
          <div v-for="list in userLists" :key="list.id" class="list-card">
            <div class="list-header">
              <h3 class="list-title">{{ list.title }}</h3>
              <div class="list-author">
                <div class="author-avatar">{{ list.author.charAt(0).toUpperCase() }}</div>
                <span class="author-name">{{ list.author }}</span>
              </div>
            </div>
            
            <p class="list-description">{{ list.description }}</p>
            
            <!-- 专辑封面小图横向排列 -->
            <div class="list-albums-row">
              <img 
                v-for="(album, idx) in list.albums.slice(0, 5)" 
                :key="idx"
                :src="album.cover"
                :alt="album.title"
                class="album-thumb"
                :title="album.title"
              />
              <div v-if="list.albumCount > 5" class="more-albums">
                +{{ list.albumCount - 5 }}
              </div>
            </div>
            
            <div class="list-meta">
              <span>Updated {{ list.updated }}</span>
              <span>·</span>
              <span>{{ list.albumCount }} albums</span>
              <span>·</span>
              <span>
                <el-icon><Star /></el-icon>
                {{ list.likes }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Star, ChatDotRound, EditPen } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getAlbumsFromSupabase } from '@/api/album'
import type { Album } from '@/types/album'

const router = useRouter()
const userStore = useUserStore()

// 评分相关状态
const selectedAlbumId = ref('')
const availableAlbums = ref<Album[]>([])

// 模拟用户列表数据
const userLists = ref([
  {
    id: '1',
    title: '333+ essential albums for the girls and the gays',
    author: 'GO',
    description: 'This is like the 1001 Albums to Listen to Before You Die, but for the girls and the gays. If you get it, you get it, if you don\'t, you don\'t. Women and LGBTQ+ people keep the pop music industry...',
    albums: [
      { title: 'Born This Way', cover: 'https://picsum.photos/200/200?random=1' },
      { title: 'Fiona Apple', cover: 'https://picsum.photos/200/200?random=2' },
      { title: 'Rihanna', cover: 'https://picsum.photos/200/200?random=3' },
      { title: 'Album 4', cover: 'https://picsum.photos/200/200?random=4' }
    ],
    albumCount: 338,
    updated: '2d ago',
    likes: 145
  },
  {
    id: '2',
    title: 'T-Shirt Albums',
    author: 'last_o',
    description: 'Album covers you\'ve probably seen plastered on way too many tees.',
    albums: [
      { title: 'Iron Maiden', cover: 'https://picsum.photos/200/200?random=5' },
      { title: 'Soundgarden', cover: 'https://picsum.photos/200/200?random=6' },
      { title: 'David Bowie', cover: 'https://picsum.photos/200/200?random=7' },
      { title: 'Metallica', cover: 'https://picsum.photos/200/200?random=8' }
    ],
    albumCount: 28,
    updated: '3h ago',
    likes: 14
  },
  {
    id: '3',
    title: 'Hip-Hop Classics',
    author: 'RapHead',
    description: 'Essential hip-hop albums that defined the culture and pushed boundaries.',
    albums: [
      { title: 'Album 1', cover: 'https://picsum.photos/200/200?random=9' },
      { title: 'Album 2', cover: 'https://picsum.photos/200/200?random=10' },
      { title: 'Album 3', cover: 'https://picsum.photos/200/200?random=11' },
      { title: 'Album 4', cover: 'https://picsum.photos/200/200?random=12' }
    ],
    albumCount: 156,
    updated: '1w ago',
    likes: 289
  }
])

// 模拟用户评论数据
const userReviews = ref([
  {
    id: '1',
    user: 'Listikay',
    album: {
      title: 'SCARING THE HOES: DIRECTOR\'S CUT',
      artist: 'JPEGMAFIA',
      cover: 'https://picsum.photos/200/200?random=13'
    },
    score: 65,
    content: 'peggy putting himself in the cover, letting danny\'s solo side shine for a minute long, and not even making any new music for the directors cut. what a dick. mantle is literally just an old unreleased song but sped up...',
    time: '5d',
    likes: 262,
    comments: 66
  },
  {
    id: '2',
    user: 'PlasticTrees',
    album: {
      title: 'Son Of Spergy',
      artist: 'Daniel Caesar',
      cover: 'https://picsum.photos/200/200?random=14'
    },
    score: 95,
    content: 'not religious but if this isn\'t playing at the rapture i ain\'t going. full review: I feel like people are going to appreciate this more as time goes on. this album is one of the best christian/gospel albums...',
    time: '3d',
    likes: 135,
    comments: 9
  },
  {
    id: '3',
    user: 'MusicLover',
    album: {
      title: 'Random Access Memories',
      artist: 'Daft Punk',
      cover: 'https://picsum.photos/200/200?random=15'
    },
    score: 88,
    content: 'A masterpiece of electronic music. The production is flawless and every track is memorable.',
    time: '1w',
    likes: 423,
    comments: 52
  }
])

/**
 * 根据分数获取颜色
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981' // 绿色
  if (score >= 60) return '#fbbf24' // 黄色
  if (score >= 40) return '#f97316' // 橙色
  return '#ef4444' // 红色
}


/**
 * 计算小圆环进度条的偏移量
 */
function getMiniCircleOffset(score: number): number {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progress = score / 100
  return circumference * (1 - progress)
}

/**
 * 加载可用专辑列表
 */
async function loadAlbums() {
  try {
    const albums = await getAlbumsFromSupabase(50)
    availableAlbums.value = albums
  } catch (error) {
    console.error('加载专辑失败:', error)
  }
}

/**
 * 跳转到专辑评分详情页
 */
function goToAlbumRating() {
  if (!selectedAlbumId.value) return
  router.push({ 
    name: 'AlbumRating', 
    params: { id: selectedAlbumId.value } 
  })
}

onMounted(() => {
  loadAlbums()
})
</script>

<style lang="scss" scoped>
.forum-page {
  min-height: 100vh;
  background: #2a2e35;
  color: #fff;
  padding-bottom: 80px;
}

// 顶部导航
.forum-header {
  background: #34383f;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }
  
  .el-icon {
    font-size: 16px;
  }
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

// 内容区域
.forum-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

// 快速评分入口
.quick-rate-card {
  background: #34383f;
  padding: 20px 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 24px;
  transition: background 0.2s;
  
  &:hover {
    background: #3a3e45;
  }
}

.quick-rate-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.rate-icon {
  color: rgba(255, 255, 255, 0.5);
}

.quick-rate-info {
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px;
    color: #fff;
  }
  
  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }
}

.album-select {
  width: 360px;
  flex-shrink: 0;
}

.album-option {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-cover {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 2px;
}

.option-info {
  flex: 1;
}

.option-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.option-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.view-more-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }
}

// 用户列表
.lists-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-card {
  background: #34383f;
  padding: 20px;
  border-radius: 4px;
  transition: background 0.2s;
  cursor: pointer;
  
  &:hover {
    background: #3a3e45;
  }
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #fff;
  line-height: 1.4;
  flex: 1;
}

.list-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.author-name {
  font-weight: 500;
}

.list-description {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px;
}

// 横向专辑封面排列
.list-albums-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.album-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 2px;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
    z-index: 1;
  }
}

.more-albums {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.list-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  
  .el-icon {
    font-size: 13px;
  }
}

// 用户评论列表
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #34383f;
  border-radius: 4px;
  transition: background 0.2s;
  
  &:hover {
    background: #3a3e45;
  }
}

.review-left {
  display: flex;
  gap: 12px;
  width: 220px;
  flex-shrink: 0;
}

.review-album-cover {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
}

.review-album-info {
  flex: 1;
  min-width: 0;
  
  .album-title {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .album-artist {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
}

.review-main {
  flex: 1;
  min-width: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reviewer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

// 小圆环评分显示
.review-score-circle {
  position: relative;
  width: 36px;
  height: 36px;
}

.mini-circle-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.mini-circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 3;
}

.mini-circle-progress {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 113.097; // 2 * π * 18
  transition: all 0.3s ease;
}

.mini-score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 700;
  transition: color 0.3s ease;
}

.review-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.review-content {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 12px;
}

.review-footer {
  display: flex;
  gap: 16px;
}

.review-action {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .el-icon {
    font-size: 14px;
  }
}


// 响应式设计
@media (max-width: 768px) {
  .forum-content {
    padding: 24px 16px;
    gap: 32px;
  }
  
  .review-card {
    flex-direction: column;
    padding: 16px;
  }
  
  .review-left {
    width: 100%;
  }
  
  .list-card {
    padding: 16px;
  }
  
  .list-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .list-author {
    align-self: flex-start;
  }
  
  .list-albums-row {
    flex-wrap: wrap;
  }
  
  .header-container {
    padding: 0 16px;
  }
  
  .back-btn span {
    display: none;
  }
  
  .quick-rate-card {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }
  
  .quick-rate-left {
    width: 100%;
  }
  
  .album-select {
    width: 100%;
  }
}

// Element Plus 下拉框样式
:deep(.el-select) {
  .el-input__wrapper {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
    
    &:hover {
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    &.is-focus {
      border-color: rgba(255, 255, 255, 0.3);
    }
  }
  
  .el-input__inner {
    color: #fff;
  }
}
</style>

