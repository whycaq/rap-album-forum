<template>
  <div class="spotify-import">
    <div class="import-container">
      <h1>🎧 从Spotify导入专辑</h1>
      <p class="subtitle">使用官方Spotify API，完全合法，全球可用</p>

      <!-- 配置状态 -->
      <el-alert
        v-if="!configReady"
        title="Spotify API未配置"
        type="warning"
        :closable="false"
        style="margin-bottom: 24px"
      >
        <template #default>
          <p>请先配置Spotify API凭证：</p>
          <ol style="margin: 12px 0; padding-left: 20px;">
            <li>访问 <a href="https://developer.spotify.com/dashboard" target="_blank">Spotify开发者控制台</a></li>
            <li>创建应用并获取Client ID和Client Secret</li>
            <li>在.env文件中添加：
              <pre style="background: #f5f7fa; padding: 8px; margin-top: 8px; border-radius: 4px;">
VITE_SPOTIFY_CLIENT_ID=你的Client_ID
VITE_SPOTIFY_CLIENT_SECRET=你的Client_Secret</pre>
            </li>
          </ol>
        </template>
      </el-alert>

      <el-alert
        v-else-if="apiStatus"
        title="Spotify API已就绪"
        type="success"
        :closable="false"
        style="margin-bottom: 24px"
      >
        ✅ 可以开始导入专辑
      </el-alert>

      <!-- 搜索区域 -->
      <el-card class="search-card">
        <template #header>搜索Spotify专辑</template>

        <el-input
          v-model="searchKeyword"
          placeholder="搜索专辑或艺人（如：Eminem, Kendrick Lamar）"
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
              :disabled="!configReady"
            >
              搜索
            </el-button>
          </template>
        </el-input>

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

        <el-divider>或</el-divider>

        <div class="recommended-section">
          <el-button 
            type="success" 
            size="large"
            @click="importRecommended"
            :loading="importing"
            :disabled="!configReady"
          >
            🔥 一键导入20张经典说唱专辑
          </el-button>
          <p class="hint">
            自动导入Eminem、Kendrick Lamar、Drake等顶级说唱艺人的专辑
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
              <p class="preview-note">30秒预览</p>
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
          <el-table-column label="播放" width="100">
            <template #default="{ row }">
              <el-tag type="info" size="small">30秒预览</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 使用说明 -->
      <el-card class="tips-card">
        <template #header>💡 Spotify API优势</template>
        
        <div class="tips-content">
          <h4>为什么选择Spotify？</h4>
          <ul>
            <li>✅ <strong>官方API</strong> - 稳定可靠，永不下架</li>
            <li>✅ <strong>零部署</strong> - 不需要自己的服务器</li>
            <li>✅ <strong>全球可用</strong> - 部署到Vercel后直接可用</li>
            <li>✅ <strong>资源丰富</strong> - 全球最大音乐库</li>
            <li>✅ <strong>完全免费</strong> - 每天25000次API调用</li>
            <li>✅ <strong>高质量封面</strong> - 官方高清封面</li>
          </ul>

          <h4>说明</h4>
          <ul>
            <li>📷 封面会自动下载并上传到Supabase Storage</li>
            <li>🎵 歌曲提供30秒预览（足够演示使用）</li>
            <li>💾 所有数据保存在你的Supabase数据库</li>
            <li>🌍 部署后全球任何地方都能访问</li>
          </ul>

          <h4>注册步骤</h4>
          <ol>
            <li>访问 <a href="https://developer.spotify.com/dashboard" target="_blank">Spotify开发者控制台</a></li>
            <li>登录或注册Spotify账号（免费）</li>
            <li>创建新应用（Create app）</li>
            <li>获取Client ID和Client Secret</li>
            <li>添加到.env文件</li>
          </ol>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { SpotifyService } from '@/services/spotify.service'
import SpotifyToSupabaseService from '@/services/spotify-to-supabase.service'
import type { Album } from '@/types/album'
import { supabase } from '@/utils/supabase'

// 状态
const configReady = ref(false)
const apiStatus = ref(false)
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

const quickTags = ['Eminem', 'Kendrick Lamar', 'Drake', 'J. Cole', 'Hip Hop', 'Rap']

function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const now = new Date()
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  importLogs.value.push({ time, type, message })
}

async function checkConfig() {
  configReady.value = SpotifyService.checkConfig()
  if (configReady.value) {
    apiStatus.value = await SpotifyService.testConnection()
  }
}

async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searching.value = true
  searchResults.value = []

  try {
    const results = await SpotifyService.searchAlbums(searchKeyword.value, 20)
    searchResults.value = results
    
    if (results.length === 0) {
      ElMessage.info('未找到相关专辑')
    } else {
      ElMessage.success(`找到 ${results.length} 张专辑`)
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请检查API配置')
  } finally {
    searching.value = false
  }
}

function quickSearch(keyword: string) {
  searchKeyword.value = keyword
  handleSearch()
}

async function importSingle(albumId: string) {
  importingIds.value.push(albumId)
  
  try {
    addLog(`开始导入专辑 ${albumId}`, 'info')
    
    const dbId = await SpotifyToSupabaseService.importAlbum(albumId)
    
    if (dbId) {
      importedIds.value.push(albumId)
      addLog(`✅ 专辑导入成功`, 'success')
      ElMessage.success('导入成功！')
      
      const album = searchResults.value.find(a => a.id === albumId)
      if (album) {
        importedAlbums.value.push(album)
      }
    } else {
      addLog(`❌ 专辑导入失败`, 'error')
      ElMessage.error('导入失败')
    }
  } catch (error) {
    console.error('导入失败:', error)
    addLog(`❌ 导入异常: ${error}`, 'error')
    ElMessage.error('导入失败')
  } finally {
    importingIds.value = importingIds.value.filter(id => id !== albumId)
  }
}

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
    
    const dbId = await SpotifyToSupabaseService.importAlbum(albumId)
    
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
    await sleep(500)
  }

  importStatus.value = '导入完成！'
  ElMessage.success(`导入完成！成功${importStats.value.success}张`)
  importing.value = false
}

async function importRecommended() {
  const confirmed = await ElMessageBox.confirm(
    '将从Eminem、Kendrick Lamar等顶级说唱艺人导入20张经典专辑，预计2-3分钟。确定继续吗？',
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
  importStats.value = { success: 0, failed: 0, total: 20 }

  addLog('开始导入Spotify推荐专辑', 'info')

  try {
    const importedIds = await SpotifyToSupabaseService.importRecommendedAlbums(2)
    
    importStats.value.success = importedIds.length
    importStats.value.failed = 20 - importedIds.length
    importProgress.value = 100
    
    addLog(`✅ 导入完成：成功${importStats.value.success}张`, 'success')
    ElMessage.success(`成功导入 ${importStats.value.success} 张专辑！`)
    
    loadImportedAlbums()
  } catch (error) {
    console.error('导入推荐专辑失败:', error)
    addLog(`❌ 导入失败: ${error}`, 'error')
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}

async function loadImportedAlbums() {
  try {
    const { data } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
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
    console.error('加载专辑失败:', error)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

onMounted(() => {
  checkConfig()
  loadImportedAlbums()
})
</script>

<style lang="scss" scoped>
// 样式与NeteaseImport.vue类似
.spotify-import {
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
  flex-wrap: wrap;
  
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
    
    .preview-note {
      font-size: 11px;
      color: #1890ff;
      font-weight: 500;
    }
  }
  
  .el-button {
    width: 100%;
  }
}

.progress-info, .import-logs, .tips-content {
  // 样式同NeteaseImport
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
  
  ul, ol {
    padding-left: 24px;
    
    li {
      margin-bottom: 8px;
      color: #606266;
      line-height: 1.6;
    }
  }
  
  a {
    color: #1890ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

