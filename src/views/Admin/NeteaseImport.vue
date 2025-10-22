<template>
  <div class="netease-import">
    <div class="import-container">
      <h1>🎵 从网易云音乐导入专辑</h1>
      <p class="subtitle">搜索网易云音乐专辑，自动下载封面并导入到Supabase</p>

      <!-- Storage状态检查 -->
      <el-alert
        v-if="storageReady === false"
        title="Storage未就绪"
        type="error"
        description="Supabase Storage配置有误，请检查"
        show-icon
        :closable="false"
        style="margin-bottom: 24px"
      />

      <el-alert
        v-else-if="storageReady === true"
        title="Storage已就绪"
        type="success"
        description="album-covers 和 album-music 存储桶已配置"
        show-icon
        :closable="false"
        style="margin-bottom: 24px"
      />

      <!-- 搜索区域 -->
      <el-card class="search-card">
        <template #header>
          <span>搜索网易云专辑</span>
        </template>

        <el-input
          v-model="searchKeyword"
          placeholder="输入专辑名或艺人名..."
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

        <!-- 快速搜索 -->
        <div class="quick-search">
          <span>快速搜索：</span>
          <el-tag 
            v-for="tag in quickTags" 
            :key="tag"
            @click="quickSearch(tag)"
            style="cursor: pointer; margin: 0 4px;"
          >
            {{ tag }}
          </el-tag>
        </div>

        <!-- 或使用推荐ID -->
        <el-divider>或</el-divider>
        
        <div class="recommended-section">
          <el-button 
            type="success" 
            @click="importRecommended"
            :loading="importing"
          >
            一键导入10张推荐说唱专辑
          </el-button>
          <p class="hint">
            包括：Eminem, Kendrick Lamar, Nas, Jay-Z 等经典专辑
          </p>
        </div>
      </el-card>

      <!-- 搜索结果 -->
      <el-card class="results-card" v-if="searchResults.length > 0">
        <template #header>
          <div class="results-header">
            <span>搜索结果 ({{ searchResults.length }})</span>
            <el-button 
              type="primary"
              size="small"
              @click="importAllResults"
              :loading="importing"
            >
              导入全部
            </el-button>
          </div>
        </template>

        <div class="albums-grid">
          <div 
            class="album-preview" 
            v-for="album in searchResults" 
            :key="album.id"
          >
            <img :src="album.coverUrl" :alt="album.title" class="preview-cover" />
            <div class="preview-info">
              <h3>{{ album.title }}</h3>
              <p>{{ album.artist }}</p>
              <p class="songs-count">{{ album.songCount }} 首歌曲</p>
            </div>
            <el-button 
              type="primary" 
              size="small"
              @click="importSingle(album.id)"
              :loading="importingIds.includes(album.id)"
              :disabled="importedIds.includes(album.id)"
            >
              {{ importedIds.includes(album.id) ? '已导入' : '导入' }}
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 导入进度 -->
      <el-card class="progress-card" v-if="importing">
        <template #header>导入进度</template>
        
        <el-progress 
          :percentage="importProgress" 
          :status="importProgress === 100 ? 'success' : undefined"
        />
        
        <div class="progress-info">
          <p>{{ importStatus }}</p>
          <p class="stats">
            成功: {{ importStats.success }} | 
            失败: {{ importStats.failed }} | 
            总计: {{ importStats.total }}
          </p>
        </div>

        <!-- 详细日志 -->
        <div class="import-logs" v-if="importLogs.length > 0">
          <h4>导入日志</h4>
          <div 
            class="log-item" 
            v-for="(log, index) in importLogs" 
            :key="index"
            :class="log.type"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </el-card>

      <!-- 已导入列表 -->
      <el-card class="imported-card" v-if="importedAlbums.length > 0">
        <template #header>
          <span>已导入专辑 ({{ importedAlbums.length }})</span>
        </template>

        <el-table :data="importedAlbums" style="width: 100%">
          <el-table-column prop="title" label="专辑名称" width="300" />
          <el-table-column prop="artist" label="艺人" width="200" />
          <el-table-column prop="songCount" label="歌曲数" width="100" />
          <el-table-column label="封面">
            <template #default="{ row }">
              <img :src="row.coverUrl" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                text
                @click="viewInDatabase(row.id)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 使用说明 -->
      <el-card class="tips-card">
        <template #header>💡 使用说明</template>
        
        <div class="tips-content">
          <h4>导入流程</h4>
          <ol>
            <li>搜索网易云音乐专辑（或使用推荐列表）</li>
            <li>系统自动从网易云下载封面图片</li>
            <li>封面上传到Supabase Storage</li>
            <li>专辑信息和歌曲列表保存到数据库</li>
            <li>歌曲播放URL保存（可直接使用）</li>
          </ol>

          <h4>注意事项</h4>
          <ul>
            <li>✅ 封面会自动上传到Supabase，加载速度快</li>
            <li>✅ 歌曲播放URL保存，可直接播放</li>
            <li>⚠️ 歌曲文件不会下载（节省空间）</li>
            <li>⚠️ 播放仍依赖网易云API服务</li>
            <li>⚠️ 仅供学习使用，商业使用需授权</li>
          </ul>

          <h4>存储空间估算</h4>
          <ul>
            <li>10张专辑封面：约 5-10MB</li>
            <li>50张专辑封面：约 25-50MB</li>
            <li>100张专辑封面：约 50-100MB</li>
            <li>💡 音频不下载，节省大量空间！</li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { NeteaseService } from '@/services/netease.service'
import NeteaseToSupabaseService from '@/services/netease-to-supabase.service'
import type { Album } from '@/types/album'

// 状态
const storageReady = ref<boolean | null>(null)
const searchKeyword = ref('')
const searching = ref(false)
const searchResults = ref<Album[]>([])
const importing = ref(false)
const importingIds = ref<string[]>([])
const importedIds = ref<string[]>([])
const importedAlbums = ref<Album[]>([])
const importProgress = ref(0)
const importStatus = ref('')
const importStats = ref({
  success: 0,
  failed: 0,
  total: 0
})
const importLogs = ref<Array<{
  time: string
  type: 'info' | 'success' | 'error'
  message: string
}>>([])

const quickTags = ['说唱', 'Hip Hop', 'Eminem', 'Kendrick Lamar', 'Nas', 'Jay-Z']

/**
 * 检查Storage配置
 */
async function checkStorage() {
  storageReady.value = await NeteaseToSupabaseService.checkStorageReady()
}

/**
 * 添加日志
 */
function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const now = new Date()
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  
  importLogs.value.push({
    time,
    type,
    message
  })
}

/**
 * 搜索专辑
 */
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searching.value = true
  searchResults.value = []

  try {
    const results = await NeteaseService.searchAlbums(searchKeyword.value, 20)
    searchResults.value = results
    
    if (results.length === 0) {
      ElMessage.info('未找到相关专辑')
    } else {
      ElMessage.success(`找到 ${results.length} 张专辑`)
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请确保网易云API服务正在运行')
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
 * 导入单个专辑
 */
async function importSingle(albumId: string) {
  importingIds.value.push(albumId)
  
  try {
    addLog(`开始导入专辑 ${albumId}`, 'info')
    
    const dbId = await NeteaseToSupabaseService.importAlbum(albumId)
    
    if (dbId) {
      importedIds.value.push(albumId)
      addLog(`✅ 专辑 ${albumId} 导入成功`, 'success')
      ElMessage.success('导入成功！')
      
      // 添加到已导入列表
      const album = searchResults.value.find(a => a.id === albumId)
      if (album) {
        importedAlbums.value.push(album)
      }
    } else {
      addLog(`❌ 专辑 ${albumId} 导入失败`, 'error')
      ElMessage.error('导入失败')
    }
  } catch (error) {
    console.error('导入失败:', error)
    addLog(`❌ 专辑 ${albumId} 导入异常: ${error}`, 'error')
    ElMessage.error('导入失败')
  } finally {
    importingIds.value = importingIds.value.filter(id => id !== albumId)
  }
}

/**
 * 导入全部搜索结果
 */
async function importAllResults() {
  const confirmed = await ElMessageBox.confirm(
    `确定要导入全部 ${searchResults.value.length} 张专辑吗？`,
    '批量导入',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)

  if (!confirmed) return

  importing.value = true
  importProgress.value = 0
  importStats.value = { success: 0, failed: 0, total: searchResults.value.length }
  importLogs.value = []

  addLog(`开始批量导入 ${searchResults.value.length} 张专辑`, 'info')

  const albumIds = searchResults.value.map(a => a.id)
  
  for (let i = 0; i < albumIds.length; i++) {
    const albumId = albumIds[i]
    const album = searchResults.value[i]
    
    importStatus.value = `导入中 ${i + 1}/${albumIds.length}: ${album.title}`
    addLog(`导入 ${album.title} - ${album.artist}`, 'info')
    
    const dbId = await NeteaseToSupabaseService.importAlbum(albumId)
    
    if (dbId) {
      importStats.value.success++
      importedIds.value.push(albumId)
      importedAlbums.value.push(album)
      addLog(`✅ ${album.title} 导入成功`, 'success')
    } else {
      importStats.value.failed++
      addLog(`❌ ${album.title} 导入失败`, 'error')
    }
    
    importProgress.value = Math.round(((i + 1) / albumIds.length) * 100)
    
    // 避免请求过快
    await sleep(1000)
  }

  importStatus.value = '导入完成！'
  addLog(`批量导入完成：成功${importStats.value.success}张，失败${importStats.value.failed}张`, 'success')
  
  ElMessage.success({
    message: `导入完成！成功${importStats.value.success}张`,
    duration: 3000
  })
  
  importing.value = false
}

/**
 * 导入推荐专辑
 */
async function importRecommended() {
  const confirmed = await ElMessageBox.confirm(
    '将导入10张经典说唱专辑到你的数据库，预计需要1-2分钟。确定继续吗？',
    '导入推荐专辑',
    {
      confirmButtonText: '开始导入',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).catch(() => false)

  if (!confirmed) return

  importing.value = true
  importProgress.value = 0
  importLogs.value = []
  
  const recommendedIds = NeteaseToSupabaseService.getRecommendedAlbumIds()
  importStats.value = { 
    success: 0, 
    failed: 0, 
    total: recommendedIds.length 
  }

  addLog('开始导入推荐专辑', 'info')

  for (let i = 0; i < recommendedIds.length; i++) {
    const albumId = recommendedIds[i]
    
    importStatus.value = `导入推荐专辑 ${i + 1}/${recommendedIds.length}`
    addLog(`导入网易云专辑ID: ${albumId}`, 'info')
    
    const dbId = await NeteaseToSupabaseService.importAlbum(albumId)
    
    if (dbId) {
      importStats.value.success++
      addLog(`✅ 专辑 ${albumId} 导入成功`, 'success')
    } else {
      importStats.value.failed++
      addLog(`❌ 专辑 ${albumId} 导入失败`, 'error')
    }
    
    importProgress.value = Math.round(((i + 1) / recommendedIds.length) * 100)
    
    await sleep(1000)
  }

  importStatus.value = '推荐专辑导入完成！'
  addLog(`推荐专辑导入完成：成功${importStats.value.success}张`, 'success')
  
  ElMessage.success({
    message: `成功导入 ${importStats.value.success} 张专辑！`,
    duration: 3000
  })
  
  importing.value = false
  
  // 刷新已导入列表
  loadImportedAlbums()
}

/**
 * 查看数据库中的专辑
 */
function viewInDatabase(albumId: string) {
  window.open(
    `https://supabase.com/dashboard/project/kpaeljhvwqqqydrtltyj/editor/${albumId}`,
    '_blank'
  )
}

/**
 * 加载已导入的专辑列表
 */
async function loadImportedAlbums() {
  try {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) throw error
    
    if (data) {
      importedAlbums.value = data.map(album => ({
        id: album.id,
        title: album.title,
        artist: album.artist,
        coverUrl: album.cover_url,
        releaseDate: album.release_date,
        genre: album.genre,
        rating: album.rating,
        ratingCount: album.rating_count,
        songCount: album.song_count
      }))
    }
  } catch (error) {
    console.error('加载已导入专辑失败:', error)
  }
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

onMounted(() => {
  checkStorage()
  loadImportedAlbums()
})
</script>

<style lang="scss" scoped>
.netease-import {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.import-container {
  max-width: 1200px;
  margin: 0 auto;
  
  h1 {
    font-size: 28px;
    margin-bottom: 8px;
    color: #303133;
  }
  
  .subtitle {
    color: #909399;
    margin-bottom: 24px;
  }
}

.search-card,
.results-card,
.progress-card,
.imported-card,
.tips-card {
  margin-bottom: 24px;
}

.quick-search {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    color: #606266;
    font-size: 14px;
  }
}

.recommended-section {
  text-align: center;
  
  .hint {
    margin-top: 12px;
    font-size: 13px;
    color: #909399;
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.album-preview {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .preview-cover {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 12px;
  }
  
  .preview-info {
    margin-bottom: 12px;
    
    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    p {
      font-size: 13px;
      color: #606266;
      margin-bottom: 2px;
    }
    
    .songs-count {
      font-size: 12px;
      color: #909399;
    }
  }
  
  .el-button {
    width: 100%;
  }
}

.progress-info {
  margin-top: 16px;
  
  p {
    margin: 8px 0;
    color: #606266;
    text-align: center;
  }
  
  .stats {
    font-size: 13px;
    color: #909399;
  }
}

.import-logs {
  margin-top: 24px;
  max-height: 300px;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  
  h4 {
    font-size: 14px;
    margin-bottom: 12px;
    color: #303133;
  }
  
  .log-item {
    display: flex;
    gap: 12px;
    padding: 6px 0;
    font-size: 13px;
    border-bottom: 1px solid #e4e7ed;
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-time {
      color: #909399;
      min-width: 60px;
    }
    
    .log-message {
      flex: 1;
      color: #606266;
    }
    
    &.success .log-message {
      color: #67c23a;
    }
    
    &.error .log-message {
      color: #f56c6c;
    }
  }
}

.tips-content {
  h4 {
    font-size: 16px;
    margin: 16px 0 12px;
    color: #303133;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  ol, ul {
    padding-left: 24px;
    
    li {
      margin-bottom: 8px;
      color: #606266;
      line-height: 1.6;
    }
  }
}
</style>

