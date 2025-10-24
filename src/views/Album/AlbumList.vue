<template>
  <div class="album-list-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <button class="back-btn" @click="router.push('/')">
          <el-icon><ArrowLeft /></el-icon>
        </button>
        
        <h1 class="page-title">Albums</h1>
        
        <div class="header-search">
          <el-input
            v-model="searchKeyword"
            placeholder="Search..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 过滤器栏 -->
    <div class="filters-bar">
      <div class="filters-content">
        <div class="filter-group">
          <button 
            v-for="genre in ['All', ...genreOptions]" 
            :key="genre"
            :class="['filter-chip', { active: filters.genre === (genre === 'All' ? '' : genre) }]"
            @click="handleGenreFilter(genre === 'All' ? '' : genre)"
          >
            {{ genre }}
          </button>
        </div>
        
        <div class="filter-actions">
          <el-select v-model="filters.sortBy" @change="handleFilterChange" class="sort-select">
            <el-option label="Latest" value="releaseDate" />
            <el-option label="Top Rated" value="rating" />
            <el-option label="Popular" value="popular" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 专辑网格 -->
    <main class="main-content">
      <div class="albums-grid">
        <div 
          v-for="album in displayedAlbums" 
          :key="album.id"
          class="album-card"
          @click="goToAlbum(album.id)"
        >
          <div class="album-cover-wrapper">
            <img :src="album.coverUrl" :alt="album.title" class="album-cover" />
            <div class="album-hover">
              <el-icon class="play-icon"><VideoPlay /></el-icon>
            </div>
          </div>
          
          <div class="album-info">
            <h3 class="album-title">{{ album.title }}</h3>
            <p class="album-artist">{{ album.artist }}</p>
            <div class="album-meta">
              <span class="meta-item">
                <el-icon><Star /></el-icon>
                {{ album.rating.toFixed(1) }}
              </span>
              <span class="meta-item">{{ formatYear(album.releaseDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="pagination.total > pagination.pageSize">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :hide-on-single-page="false"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="displayedAlbums.length === 0" 
        description="No albums found"
        :image-size="120"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Search, VideoPlay, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAlbumsFromSupabase } from '@/api/album'
import type { Album } from '@/types/album'

const router = useRouter()
const route = useRoute()

// 数据
const allAlbums = ref<Album[]>([])
const searchKeyword = ref('')

// 筛选条件
const filters = ref({
  genre: '',
  sortBy: 'releaseDate',
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 24,
  total: 0,
})

// 流派选项
const genreOptions = computed(() => {
  const genres = new Set<string>()
  allAlbums.value.forEach(album => {
    if (album.genre) genres.add(album.genre)
  })
  return Array.from(genres).sort()
})

// 过滤和排序后的专辑
const filteredAlbums = computed(() => {
  let result = [...allAlbums.value]
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(album =>
      album.title.toLowerCase().includes(keyword) ||
      album.artist.toLowerCase().includes(keyword)
    )
  }
  
  // 流派过滤
  if (filters.value.genre) {
    result = result.filter(album => album.genre === filters.value.genre)
  }
  
  // 排序
  switch (filters.value.sortBy) {
    case 'releaseDate':
      result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'popular':
      result.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))
      break
  }
  
  pagination.value.total = result.length
  return result
})

// 当前页显示的专辑
const displayedAlbums = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredAlbums.value.slice(start, end)
})

/**
 * 加载专辑数据
 */
async function loadAlbums() {
  try {
    const albums = await getAlbumsFromSupabase(100)
    allAlbums.value = albums
  } catch (error) {
    console.error('加载专辑失败:', error)
    ElMessage.error('加载专辑失败')
  }
}

/**
 * 处理搜索
 */
function handleSearch() {
  pagination.value.currentPage = 1
}

/**
 * 处理流派筛选
 */
function handleGenreFilter(genre: string) {
  filters.value.genre = genre
  handleFilterChange()
}

/**
 * 处理筛选条件变化
 */
function handleFilterChange() {
  pagination.value.currentPage = 1
}

/**
 * 处理分页变化
 */
function handlePageChange() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 跳转到专辑详情
 */
function goToAlbum(albumId: string) {
  router.push({ name: 'AlbumDetail', params: { id: albumId } })
}

/**
 * 格式化年份
 */
function formatYear(dateStr: string): string {
  return dateStr.split('-')[0]
}

// 监听路由查询参数
watch(() => route.query.search, (newSearch) => {
  if (newSearch) {
    searchKeyword.value = newSearch as string
  }
}, { immediate: true })

onMounted(() => {
  loadAlbums()
})
</script>

<style lang="scss" scoped>
.album-list-page {
  min-height: 100vh;
  background: #000;
  color: #fff;
  padding-bottom: 80px;
}

// 顶部导航
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #fff;
  }
  
  .el-icon {
    font-size: 20px;
  }
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.header-search {
  width: 300px;
  
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: none;
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    
    &.is-focus {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
  
  :deep(.el-input__inner) {
    color: #fff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

.header-spacer {
  flex: 1;
}

// 过滤器栏
.filters-bar {
  background: #000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 16px 0;
}

.filters-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
}

.filter-chip {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }
  
  &.active {
    background: #fff;
    color: #000;
    border-color: #fff;
  }
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-select {
  width: 140px;
  
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: none;
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }
  
  :deep(.el-input__inner) {
    color: #fff;
  }
}

// 主内容
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.album-card {
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    
    .album-hover {
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

.album-hover {
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
  .album-title {
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
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .el-icon {
      font-size: 12px;
    }
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 48px;
  
  :deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-hover-color: #fff;
    
    .btn-prev,
    .btn-next,
    .el-pager li {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      
      &.is-active {
        background: #fff;
        color: #000;
        border-color: #fff;
      }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .albums-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .albums-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .header-content,
  .filters-content,
  .main-content {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .header-search {
    flex: 1;
    width: auto;
  }
  
  .page-title {
    display: none;
  }
  
  .albums-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .filter-group {
    flex: unset;
    width: 100%;
  }
  
  .filters-content {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
