<template>
  <div class="album-rating-page" v-if="album">
    <!-- 顶部导航栏 -->
    <header class="rating-header">
      <button class="back-button" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回专辑
      </button>
      <div class="album-info-mini">
        <img :src="album.coverUrl" :alt="album.title" class="mini-cover" />
        <div class="mini-info">
          <h2>{{ album.title }}</h2>
          <p>{{ album.artist }}</p>
        </div>
      </div>
    </header>

    <!-- 评分和评论内容 -->
    <div class="rating-content">
      <div class="content-container">
        
        <!-- 评分卡片 -->
        <div class="rating-card">
          <h3 class="section-title">为这张专辑评分</h3>
          
          <div class="rating-display">
            <div class="average-rating">
              <div class="rating-score">{{ album.rating.toFixed(1) }}</div>
              <el-rate 
                :model-value="album.rating" 
                disabled 
                :show-score="false"
                size="large"
              />
              <div class="rating-count">{{ album.ratingCount || 0 }} 人评分</div>
            </div>
            
            <!-- 用户评分 -->
            <div class="user-rating" v-if="userStore.isLoggedIn">
              <p class="rating-prompt">你的评分：</p>
              <el-rate 
                v-model="userRating" 
                :show-score="false"
                size="large"
                @change="handleRateAlbum"
              />
              <p class="rating-hint" v-if="userRating > 0">{{ getRatingText(userRating) }}</p>
            </div>
            <div class="login-prompt" v-else>
              <p>登录后即可评分</p>
              <el-button type="primary" size="small" @click="router.push('/login')">
                立即登录
              </el-button>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <div class="comments-header">
            <h3 class="section-title">专辑评论 ({{ comments.length }})</h3>
            <el-select v-model="commentSort" size="small" style="width: 120px">
              <el-option label="最新" value="latest" />
              <el-option label="最热" value="hot" />
            </el-select>
          </div>

          <!-- 发表评论 -->
          <div class="comment-input-box" v-if="userStore.isLoggedIn">
            <el-avatar :size="40" :src="userStore.userInfo?.avatar" class="user-avatar">
              <span>{{ userStore.userInfo?.username?.charAt(0).toUpperCase() }}</span>
            </el-avatar>
            <div class="input-wrapper">
              <el-input
                v-model="newComment"
                type="textarea"
                :rows="3"
                placeholder="说说你对这张专辑的看法..."
                :maxlength="500"
                show-word-limit
              />
              <div class="input-actions">
                <el-button @click="newComment = ''" :disabled="!newComment.trim()">
                  取消
                </el-button>
                <el-button type="primary" @click="handleSubmitComment" :disabled="!newComment.trim()">
                  发表评论
                </el-button>
              </div>
            </div>
          </div>
          <div class="login-prompt-box" v-else>
            <p>登录后即可发表评论</p>
            <el-button type="primary" @click="router.push('/login')">立即登录</el-button>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div 
              v-for="comment in sortedComments" 
              :key="comment.id"
              class="comment-item"
            >
              <el-avatar :size="40" :src="comment.userAvatar" class="comment-avatar">
                <span>{{ comment.username?.charAt(0).toUpperCase() }}</span>
              </el-avatar>
              
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-username">{{ comment.username }}</span>
                  <span class="comment-time">{{ formatCommentTime(comment.createdAt) }}</span>
                </div>
                
                <p class="comment-text">{{ comment.content }}</p>
                
                <div class="comment-actions">
                  <button class="action-btn" @click="handleLikeComment(comment)">
                    <el-icon><StarFilled v-if="comment.isLiked" /><Star v-else /></el-icon>
                    <span>{{ comment.likes || 0 }}</span>
                  </button>
                  <button class="action-btn" @click="handleReplyComment(comment)">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>回复</span>
                  </button>
                </div>

                <!-- 回复输入框 -->
                <div v-if="replyingTo === comment.id" class="reply-input-box">
                  <el-input
                    v-model="replyContent"
                    type="textarea"
                    :rows="2"
                    :placeholder="`回复 @${comment.username}...`"
                    :maxlength="300"
                  />
                  <div class="reply-actions">
                    <el-button size="small" @click="cancelReply">取消</el-button>
                    <el-button size="small" type="primary" @click="handleSubmitReply(comment)">
                      发送
                    </el-button>
                  </div>
                </div>

                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                  <div 
                    v-for="reply in comment.replies" 
                    :key="reply.id"
                    class="reply-item"
                  >
                    <el-avatar :size="32" :src="reply.userAvatar" class="reply-avatar">
                      <span>{{ reply.username?.charAt(0).toUpperCase() }}</span>
                    </el-avatar>
                    <div class="reply-content">
                      <span class="reply-username">{{ reply.username }}</span>
                      <span class="reply-text">{{ reply.content }}</span>
                      <span class="reply-time">{{ formatCommentTime(reply.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty 
            v-if="comments.length === 0" 
            description="还没有评论，快来发表第一条评论吧！"
            :image-size="120"
          />
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
const userRating = ref(0)

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
 * 处理专辑评分
 */
function handleRateAlbum(value: number) {
  ElMessage.success(`你给这张专辑评了 ${value} 星`)
  // TODO: 调用API保存评分到数据库
}

/**
 * 获取评分文案
 */
function getRatingText(rating: number): string {
  const texts = ['', '一般般', '还可以', '不错哦', '很喜欢', '超级棒！']
  return texts[rating] || ''
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
.album-rating-page {
  min-height: 100vh;
  background: #121212;
  color: #fff;
  padding-bottom: 100px;
}

// 顶部导航栏
.rating-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 32px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #fff;
  }
}

.album-info-mini {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .mini-cover {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
  }
  
  .mini-info {
    h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px;
      color: #fff;
    }
    
    p {
      font-size: 14px;
      color: #b3b3b3;
      margin: 0;
    }
  }
}

// 评分评论内容
.rating-content {
  padding: 48px 32px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 48px;
  align-items: start;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 24px;
}

// 评分卡片
.rating-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 32px;
  position: sticky;
  top: 100px;
}

.rating-display {
  .average-rating {
    text-align: center;
    padding-bottom: 32px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 32px;
    
    .rating-score {
      font-size: 64px;
      font-weight: 900;
      color: #fff;
      line-height: 1;
      margin-bottom: 16px;
    }
    
    .rating-count {
      font-size: 14px;
      color: #b3b3b3;
      margin-top: 12px;
    }
  }
  
  .user-rating {
    text-align: center;
    
    .rating-prompt {
      font-size: 16px;
      color: #b3b3b3;
      margin-bottom: 16px;
    }
    
    .rating-hint {
      font-size: 18px;
      font-weight: 600;
      color: #73BA9B;
      margin-top: 12px;
    }
  }
  
  .login-prompt {
    text-align: center;
    
    p {
      font-size: 14px;
      color: #b3b3b3;
      margin-bottom: 16px;
    }
  }
}

// 评论区
.comments-section {
  .comments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
}

.comment-input-box {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  
  .user-avatar {
    flex-shrink: 0;
    background: linear-gradient(135deg, #73BA9B 0%, #5A9B7F 100%);
  }
  
  .input-wrapper {
    flex: 1;
    
    .input-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 12px;
    }
  }
}

.login-prompt-box {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 32px;
  
  p {
    color: #b3b3b3;
    margin-bottom: 16px;
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .comment-avatar {
    flex-shrink: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .comment-content {
    flex: 1;
  }
  
  .comment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .comment-username {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }
    
    .comment-time {
      font-size: 14px;
      color: #b3b3b3;
    }
  }
  
  .comment-text {
    font-size: 15px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 12px;
  }
  
  .comment-actions {
    display: flex;
    gap: 16px;
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: #b3b3b3;
      font-size: 14px;
      cursor: pointer;
      transition: color 0.2s ease;
      
      &:hover {
        color: #fff;
      }
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
}

.reply-input-box {
  margin-top: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  
  .reply-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }
}

.replies-list {
  margin-top: 16px;
  padding-left: 16px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  
  .reply-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    
    &:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .reply-avatar {
      flex-shrink: 0;
      background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
    }
    
    .reply-content {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: baseline;
      
      .reply-username {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
      }
      
      .reply-text {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
      }
      
      .reply-time {
        font-size: 12px;
        color: #b3b3b3;
        margin-left: auto;
      }
    }
  }
}

// Element Plus 组件样式覆盖
:deep(.el-rate) {
  .el-rate__icon {
    font-size: 28px;
    margin-right: 8px;
  }
}

:deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    border-color: #73BA9B;
  }
}

:deep(.el-input__count) {
  background: transparent;
  color: #b3b3b3;
}

:deep(.el-select) {
  .el-input__wrapper {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
    
    &:hover, &.is-focus {
      border-color: rgba(255, 255, 255, 0.3);
    }
  }
  
  .el-input__inner {
    color: #fff;
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

// 响应式设计
@media (max-width: 1200px) {
  .content-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .rating-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .rating-header {
    padding: 12px 16px;
  }
  
  .rating-content {
    padding: 32px 16px;
  }
  
  .comment-input-box {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

