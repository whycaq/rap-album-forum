<template>
  <div class="album-rating-page" v-if="album">
    <!-- AOTY 风格导航栏 -->
    <header class="aoty-header">
      <div class="header-container">
        <button class="back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>Back</span>
        </button>
      </div>
    </header>

    <!-- 专辑信息和评分 -->
    <div class="album-section">
      <div class="album-container">
        <!-- 专辑卡片 -->
        <div class="album-card">
          <img :src="album.coverUrl" :alt="album.title" class="album-cover" />
          <div class="album-details">
            <h1 class="album-title">{{ album.title }}</h1>
            <p class="album-artist">{{ album.artist }}</p>
            <div class="album-meta">
              <span>{{ album.releaseDate.split('-')[0] }}</span>
              <span>·</span>
              <span>{{ album.genre }}</span>
            </div>
          </div>
        </div>

        <!-- 评分区域 -->
        <div class="rating-section">
          <!-- 平均评分展示 -->
          <div class="average-section">
            <div class="score-circle">
              <svg class="circle-svg" viewBox="0 0 120 120">
                <circle 
                  class="circle-bg" 
                  cx="60" 
                  cy="60" 
                  r="54"
                />
                <circle 
                  class="circle-progress" 
                  cx="60" 
                  cy="60" 
                  r="54"
                  :style="{ 
                    stroke: getScoreColor(averageScore),
                    strokeDashoffset: getCircleOffset(averageScore) 
                  }"
                />
              </svg>
              <div class="score-value" :style="{ color: getScoreColor(averageScore) }">
                {{ averageScore }}
              </div>
            </div>
            <div class="score-info">
              <div class="score-label">Average Rating</div>
              <div class="score-count">{{ album.ratingCount || 0 }} ratings</div>
            </div>
          </div>

          <!-- 用户评分 + 评论 -->
          <div class="user-rating-section" v-if="userStore.isLoggedIn">
            <h3 class="subsection-title">Rate & Review</h3>
            
            <!-- 评分和圆环一起 -->
            <div class="rating-input-wrapper">
              <div class="user-score-visual">
                <div class="user-score-circle">
                  <svg class="circle-svg" viewBox="0 0 100 100">
                    <circle 
                      class="circle-bg" 
                      cx="50" 
                      cy="50" 
                      r="45"
                    />
                <circle 
                  class="circle-progress-user" 
                  cx="50" 
                  cy="50" 
                  r="45"
                  :style="{ 
                    stroke: getScoreColor(userRating),
                    strokeDashoffset: getCircleOffsetUser(userRating)
                  }"
                />
                  </svg>
                  <div class="user-score-value" :style="{ color: getScoreColor(userRating) }">
                    {{ userRating }}
                  </div>
                </div>
                <div class="user-score-label">{{ getScoreLabel(userRating) }}</div>
              </div>
              
              <div class="slider-wrapper">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model="userRating"
                  class="user-slider"
                  :style="{
                    '--slider-color': getScoreColor(userRating)
                  }"
                />
                <div class="slider-range">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </div>
            
            <!-- 评论输入 -->
            <div class="review-input-section">
              <textarea 
                v-model="newComment"
                class="review-textarea"
                placeholder="Write your review..."
                :maxlength="1000"
              ></textarea>
              <div class="review-actions">
                <span class="char-count">{{ newComment.length }}/1000</span>
                <button 
                  class="submit-btn" 
                  @click="handleSubmitReview"
                  :disabled="!newComment.trim()"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
          
          <div class="login-box" v-else>
            <p>Sign in to rate and review this album</p>
            <button class="login-btn" @click="router.push('/login')">Sign In</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论区 - AOTY 风格 -->
    <div class="reviews-section">
      <div class="reviews-container">
        <div class="reviews-header">
          <h2 class="reviews-title">Popular User Reviews</h2>
          <button class="view-more-btn">VIEW MORE</button>
        </div>

        <!-- 评论列表 -->
        <div class="reviews-list">
          <div 
            v-for="comment in sortedComments" 
            :key="comment.id"
            class="review-card"
          >
            <div class="review-left">
              <img :src="album.coverUrl" :alt="album.title" class="review-album-cover" />
              <div class="review-album-info">
                <div class="review-album-title">{{ album.title }}</div>
                <div class="review-album-artist">{{ album.artist }}</div>
              </div>
            </div>

            <div class="review-main">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="reviewer-avatar">
                    {{ comment.username?.charAt(0).toUpperCase() }}
                  </div>
                  <div class="reviewer-name">{{ comment.username }}</div>
                  <!-- 小圆环评分 -->
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
                          stroke: getScoreColor(comment.userScore || 75),
                          strokeDashoffset: getMiniCircleOffset(comment.userScore || 75)
                        }"
                      />
                    </svg>
                    <div class="mini-score-value" :style="{ color: getScoreColor(comment.userScore || 75) }">
                      {{ comment.userScore || 75 }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="review-content">
                {{ comment.content }}
                <button v-if="comment.content.length > 300" class="read-more">read more</button>
              </div>

              <div class="review-footer">
                <button class="review-action" @click="handleLikeComment(comment)">
                  <el-icon><Star /></el-icon>
                  {{ comment.likes || 0 }}
                </button>
                <button class="review-action">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ comment.replies?.length || 0 }}
                </button>
                <span class="review-time">{{ formatCommentTime(comment.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 发表评论框 -->
        <div class="write-review" v-if="userStore.isLoggedIn">
          <h3 class="write-review-title">Write a Review</h3>
          <textarea 
            v-model="newComment"
            class="review-textarea"
            placeholder="Share your thoughts about this album..."
            :maxlength="1000"
          ></textarea>
          <div class="write-review-actions">
            <span class="char-count">{{ newComment.length }}/1000</span>
            <button 
              class="submit-review-btn" 
              @click="handleSubmitComment"
              :disabled="!newComment.trim()"
            >
              Submit Review
            </button>
          </div>
        </div>

        <!-- 未登录提示 -->
        <div class="login-prompt-review" v-else>
          <p>Sign in to write a review</p>
          <button class="login-btn" @click="router.push('/login')">Sign In</button>
        </div>
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
import { ArrowLeft, Star, StarFilled, ChatDotRound, Loading } from '@element-plus/icons-vue'
import { getAlbumsFromSupabase } from '@/api/album'
import type { Album } from '@/types/album'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 数据状态
const album = ref<Album | null>(null)
const userRating = ref(0) // 百分制评分 0-100

// 平均评分（转换为百分制）
const averageScore = computed(() => {
  if (!album.value) return 0
  // 如果数据库是5分制，转换为百分制
  const score = album.value.rating > 5 ? album.value.rating : album.value.rating * 20
  return Math.round(score)
})

// 评论状态
const comments = ref<any[]>([
  {
    id: '1',
    username: '说唱爱好者',
    userAvatar: '',
    content: '这张专辑真的太棒了！每首歌都让人回味无穷，特别是第三首，听了无数遍还是觉得不够。',
    likes: 42,
    isLiked: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        id: '1-1',
        username: 'HipHop粉丝',
        userAvatar: '',
        content: '同感！这张专辑的制作水平真的很高',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: '2',
    username: '音乐评论家',
    userAvatar: '',
    content: '从编曲到歌词都展现了艺术家的才华，是今年不可错过的说唱专辑。',
    likes: 28,
    isLiked: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    replies: []
  },
  {
    id: '3',
    username: 'Rap粉',
    userAvatar: '',
    content: '节奏感超强，每一句都能打到心坎上！',
    likes: 15,
    isLiked: false,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    replies: []
  }
])
const newComment = ref('')
const commentSort = ref('latest')
const replyingTo = ref<string | null>(null)
const replyContent = ref('')

// 排序后的评论
const sortedComments = computed(() => {
  const sorted = [...comments.value]
  if (commentSort.value === 'latest') {
    return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else {
    return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  }
})

/**
 * 加载专辑数据
 */
async function loadAlbum() {
  const albumId = route.params.id as string
  
  try {
    const albums = await getAlbumsFromSupabase(20)
    album.value = albums.find(a => a.id === albumId) || null
    
    if (!album.value) {
      ElMessage.error('专辑不存在')
      router.push('/')
      return
    }
    
    console.log('✅ 专辑加载成功:', album.value.title)
  } catch (error) {
    console.error('❌ 加载专辑失败:', error)
    ElMessage.error('加载专辑失败')
  }
}

/**
 * 计算圆环进度条的偏移量（大圆环）
 */
function getCircleOffset(score: number): number {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = score / 100
  return circumference * (1 - progress)
}

/**
 * 计算用户圆环进度条的偏移量（小圆环）
 */
function getCircleOffsetUser(score: number): number {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const progress = score / 100
  return circumference * (1 - progress)
}

/**
 * 根据分数获取颜色（红橙黄绿）
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981' // 绿色
  if (score >= 60) return '#fbbf24' // 黄色
  if (score >= 40) return '#f97316' // 橙色
  return '#ef4444' // 红色
}

/**
 * 根据分数获取标签
 */
function getScoreLabel(score: number): string {
  if (score >= 90) return 'Masterpiece'
  if (score >= 80) return 'Excellent'
  if (score >= 70) return 'Great'
  if (score >= 60) return 'Good'
  if (score >= 50) return 'Decent'
  if (score >= 40) return 'Mixed'
  if (score >= 30) return 'Poor'
  return 'Terrible'
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
 * 提交评分和评论
 */
function handleSubmitReview() {
  if (!newComment.value.trim()) {
    ElMessage.warning('Please write your review')
    return
  }
  
  // 添加评论到列表
  const comment = {
    id: Date.now().toString(),
    username: userStore.userInfo?.username || '匿名用户',
    userAvatar: userStore.userInfo?.avatar || '',
    userScore: userRating.value,
    content: newComment.value.trim(),
    likes: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
    replies: []
  }
  
  comments.value.unshift(comment)
  newComment.value = ''
  
  ElMessage.success(`Review submitted with score: ${userRating.value}`)
  // TODO: 调用API保存评分和评论到数据库
}

/**
 * 提交评论
 */
function handleSubmitComment() {
  if (!newComment.value.trim()) return
  
  const comment = {
    id: Date.now().toString(),
    username: userStore.userInfo?.username || '匿名用户',
    userAvatar: userStore.userInfo?.avatar || '',
    content: newComment.value.trim(),
    likes: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
    replies: []
  }
  
  comments.value.unshift(comment)
  newComment.value = ''
  ElMessage.success('评论发表成功')
  
  // TODO: 调用API保存评论到数据库
}

/**
 * 点赞评论
 */
function handleLikeComment(comment: any) {
  if (comment.isLiked) {
    comment.likes--
    comment.isLiked = false
  } else {
    comment.likes++
    comment.isLiked = true
  }
  
  // TODO: 调用API更新点赞状态
}

/**
 * 回复评论
 */
function handleReplyComment(comment: any) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  replyingTo.value = comment.id
  replyContent.value = ''
}

/**
 * 取消回复
 */
function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

/**
 * 提交回复
 */
function handleSubmitReply(comment: any) {
  if (!replyContent.value.trim()) return
  
  const reply = {
    id: `${comment.id}-${Date.now()}`,
    username: userStore.userInfo?.username || '匿名用户',
    userAvatar: userStore.userInfo?.avatar || '',
    content: replyContent.value.trim(),
    createdAt: new Date().toISOString(),
  }
  
  if (!comment.replies) {
    comment.replies = []
  }
  comment.replies.push(reply)
  
  cancelReply()
  ElMessage.success('回复成功')
  
  // TODO: 调用API保存回复到数据库
}

/**
 * 格式化评论时间
 */
function formatCommentTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', { 
    month: 'long', 
    day: 'numeric' 
  })
}

onMounted(() => {
  loadAlbum()
})
</script>

<style lang="scss" scoped>
// AOTY 风格页面
.album-rating-page {
  min-height: 100vh;
  background: #2a2e35;
  color: #fff;
}

// AOTY 风格导航栏
.aoty-header {
  background: #34383f;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  padding: 12px 0;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 3px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
  
  .el-icon {
    font-size: 16px;
  }
}

// 专辑信息区域
.album-section {
  background: #34383f;
  padding: 32px 0 48px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.album-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 48px;
}

.album-card {
  display: flex;
  gap: 24px;
}

.album-cover {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.album-details {
  flex: 1;
}

.album-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #fff;
}

.album-artist {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px;
}

.album-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

// 评分区域
.rating-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 24px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

// 平均评分区域
.average-section {
  display: flex;
  gap: 20px;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.score-circle {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.circle-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 8;
}

.circle-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 339.292; // 2 * π * 54
  transition: all 0.3s ease;
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-weight: 700;
  transition: color 0.3s ease;
}

.score-info {
  flex: 1;
}

.score-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.score-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

// 用户评分和评论区域
.user-rating-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.rating-input-wrapper {
  display: flex;
  gap: 24px;
  align-items: center;
}

.user-score-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.user-score-circle {
  position: relative;
  width: 80px;
  height: 80px;
  
  .circle-progress-user {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 282.743; // 2 * π * 45
    transition: all 0.3s ease;
  }
}

.user-score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: 700;
  transition: color 0.3s ease;
}

.user-score-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.slider-wrapper {
  flex: 1;
}

.user-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  border-radius: 4px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: var(--slider-color, #10b981);
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
      transform: scale(1.2);
    }
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: var(--slider-color, #10b981);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    transition: transform 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
      transform: scale(1.2);
    }
  }
  
  &::-webkit-slider-runnable-track {
    background: linear-gradient(
      to right,
      #ef4444 0%,
      #f97316 25%,
      #fbbf24 50%,
      #10b981 100%
    );
    height: 8px;
    border-radius: 4px;
  }
  
  &::-moz-range-track {
    background: linear-gradient(
      to right,
      #ef4444 0%,
      #f97316 25%,
      #fbbf24 50%,
      #10b981 100%
    );
    height: 8px;
    border-radius: 4px;
  }
}

.slider-range {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.review-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
}

.review-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.submit-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.login-box {
  text-align: center;
  padding: 20px;
  
  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 12px;
  }
}

.login-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

// 评论区 - AOTY 风格
.reviews-section {
  background: #2a2e35;
  padding: 48px 0;
}

.reviews-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.reviews-title {
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

// 评论列表
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 48px;
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
  
  .review-album-title {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .review-album-artist {
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
  align-items: flex-start;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
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

.review-content {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 12px;
}

.read-more {
  color: rgba(255, 255, 255, 0.5);
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  cursor: pointer;
  margin-left: 4px;
  
  &:hover {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: underline;
  }
}

.review-footer {
  display: flex;
  align-items: center;
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

.review-time {
  margin-left: auto;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

// 发表评论区域
.write-review {
  background: #34383f;
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 48px;
}

.write-review-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #fff;
}

.review-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
}

.write-review-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.submit-review-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.login-prompt-review {
  text-align: center;
  padding: 40px 24px;
  background: #34383f;
  border-radius: 4px;
  
  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 16px;
  }
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #2a2e35;
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

// 响应式设计
@media (max-width: 1024px) {
  .album-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .rating-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .album-section, .reviews-section {
    padding: 24px 0;
  }
  
  .album-container, .reviews-container {
    padding: 0 16px;
  }
  
  .album-card {
    flex-direction: column;
  }
  
  .album-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }
  
  .score-display {
    flex-direction: column;
    text-align: center;
  }
  
  .review-card {
    flex-direction: column;
    gap: 16px;
  }
  
  .review-left {
    width: 100%;
  }
}
</style>


