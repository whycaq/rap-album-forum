<template>
  <div class="music-upload">
    <div class="upload-container">
      <h1>🎵 音乐资源上传管理</h1>
      
      <!-- Storage状态检查 -->
      <el-alert
        v-if="!storageReady"
        title="Storage未配置"
        type="warning"
        description="请先在Supabase Dashboard创建 album-covers 和 album-music 两个公开Bucket"
        show-icon
        :closable="false"
      />

      <!-- 上传表单 -->
      <el-card class="upload-card">
        <template #header>
          <div class="card-header">
            <span>上传新专辑</span>
            <el-button type="primary" @click="handleSubmit" :loading="uploading">
              提交保存
            </el-button>
          </div>
        </template>

        <el-form :model="form" label-width="120px" ref="formRef">
          <!-- 基本信息 -->
          <el-divider content-position="left">基本信息</el-divider>
          
          <el-form-item label="专辑名称" required>
            <el-input v-model="form.title" placeholder="输入专辑名称" />
          </el-form-item>

          <el-form-item label="艺人" required>
            <el-input v-model="form.artist" placeholder="输入艺人名称" />
          </el-form-item>

          <el-form-item label="发行日期" required>
            <el-date-picker
              v-model="form.releaseDate"
              type="date"
              placeholder="选择发行日期"
            />
          </el-form-item>

          <el-form-item label="流派">
            <el-select v-model="form.genre" placeholder="选择流派">
              <el-option label="Hip Hop" value="Hip Hop" />
              <el-option label="Rap" value="Rap" />
              <el-option label="Trap" value="Trap" />
              <el-option label="Chinese Hip Hop" value="Chinese Hip Hop" />
              <el-option label="Other" value="Other" />
            </el-select>
          </el-form-item>

          <el-form-item label="专辑介绍">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="输入专辑介绍"
            />
          </el-form-item>

          <!-- 封面上传 -->
          <el-divider content-position="left">专辑封面</el-divider>

          <el-form-item label="封面图片" required>
            <el-upload
              class="cover-uploader"
              :show-file-list="false"
              :before-upload="handleCoverSelect"
              accept="image/jpeg,image/png,image/webp"
              drag
            >
              <img v-if="coverPreview" :src="coverPreview" class="cover-preview" />
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击或拖拽上传封面</div>
                <div class="upload-hint">支持 JPG/PNG/WEBP，最大5MB</div>
              </div>
            </el-upload>
          </el-form-item>

          <!-- 歌曲上传 -->
          <el-divider content-position="left">歌曲列表</el-divider>

          <div class="songs-section">
            <div 
              class="song-item" 
              v-for="(song, index) in form.songs" 
              :key="index"
            >
              <div class="song-header">
                <span class="song-number">{{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="removeSong(index)"
                >
                  删除
                </el-button>
              </div>

              <el-form-item label="歌曲名称">
                <el-input v-model="song.title" placeholder="输入歌曲名称" />
              </el-form-item>

              <el-form-item label="音频文件">
                <el-upload
                  :show-file-list="false"
                  :before-upload="(file) => handleAudioSelect(file, index)"
                  accept="audio/mpeg,audio/mp3"
                  drag
                >
                  <div v-if="song.audioFile" class="audio-info">
                    <el-icon><Headset /></el-icon>
                    <span>{{ song.audioFile.name }}</span>
                    <span class="file-size">{{ formatFileSize(song.audioFile.size) }}</span>
                  </div>
                  <div v-else class="upload-placeholder small">
                    <el-icon><Upload /></el-icon>
                    <span>点击上传音频（MP3格式，最大50MB）</span>
                  </div>
                </el-upload>
              </el-form-item>
            </div>

            <el-button @click="addSong" class="add-song-btn">
              <el-icon><Plus /></el-icon>
              添加歌曲
            </el-button>
          </div>
        </el-form>

        <!-- 上传进度 -->
        <div v-if="uploading" class="upload-progress">
          <el-progress :percentage="uploadProgress" />
          <p>{{ uploadStatus }}</p>
        </div>
      </el-card>

      <!-- 资源来源说明 -->
      <el-card class="tips-card">
        <template #header>💡 资源获取途径</template>
        
        <div class="tips-content">
          <h4>免费音乐资源</h4>
          <ul>
            <li>
              <a href="https://freemusicarchive.org" target="_blank">
                Free Music Archive
              </a>
              - 大量CC许可音乐
            </li>
            <li>
              <a href="https://youtube.com/audiolibrary" target="_blank">
                YouTube Audio Library
              </a>
              - 免费背景音乐
            </li>
            <li>
              <a href="https://incompetech.com" target="_blank">
                Incompetech
              </a>
              - Kevin MacLeod音乐库
            </li>
          </ul>

          <h4>免费封面图片</h4>
          <ul>
            <li>
              <a href="https://unsplash.com" target="_blank">
                Unsplash
              </a>
              - 高质量免费图片
            </li>
            <li>
              <a href="https://canva.com" target="_blank">
                Canva
              </a>
              - 在线设计工具
            </li>
          </ul>

          <el-alert
            type="warning"
            :closable="false"
            show-icon
          >
            <template #title>
              ⚠️ 版权提醒
            </template>
            请确保上传的音乐有合法使用权。建议使用：
            <ul>
              <li>Creative Commons许可的音乐</li>
              <li>公共领域音乐</li>
              <li>自己创作的原创音乐</li>
            </ul>
          </el-alert>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload, Headset } from '@element-plus/icons-vue'
import { supabase } from '@/utils/supabase'
import { ResourceCacheService } from '@/services/resource-cache.service'

// 状态
const storageReady = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const coverPreview = ref('')
const coverFile = ref<File | null>(null)

// 表单数据
const form = reactive({
  title: '',
  artist: '',
  releaseDate: new Date(),
  genre: 'Hip Hop',
  description: '',
  songs: [] as Array<{
    title: string
    audioFile: File | null
  }>
})

/**
 * 检查Storage配置
 */
async function checkStorage() {
  const config = await ResourceCacheService.checkStorageConfig()
  storageReady.value = config.albumCoversExists && config.albumMusicExists
  
  if (!storageReady.value) {
    ElMessage.warning({
      message: '请先在Supabase Dashboard创建Storage Buckets',
      duration: 5000
    })
  }
}

/**
 * 处理封面选择
 */
function handleCoverSelect(file: File) {
  // 检查文件大小
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('封面图片不能超过5MB')
    return false
  }

  coverFile.value = file
  
  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  return false // 阻止自动上传
}

/**
 * 处理音频选择
 */
function handleAudioSelect(file: File, index: number) {
  // 检查文件大小
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error('音频文件不能超过50MB')
    return false
  }

  form.songs[index].audioFile = file
  return false
}

/**
 * 添加歌曲
 */
function addSong() {
  form.songs.push({
    title: '',
    audioFile: null
  })
}

/**
 * 删除歌曲
 */
function removeSong(index: number) {
  form.songs.splice(index, 1)
}

/**
 * 提交表单
 */
async function handleSubmit() {
  // 验证
  if (!form.title || !form.artist) {
    ElMessage.error('请填写专辑名称和艺人')
    return
  }

  if (!coverFile.value) {
    ElMessage.error('请上传专辑封面')
    return
  }

  if (form.songs.length === 0) {
    ElMessage.error('请至少添加一首歌曲')
    return
  }

  const hasEmptySongs = form.songs.some(s => !s.title || !s.audioFile)
  if (hasEmptySongs) {
    ElMessage.error('请完善所有歌曲信息')
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  try {
    // 1. 上传封面
    uploadStatus.value = '正在上传封面...'
    uploadProgress.value = 10
    
    const coverUrl = await uploadCover(coverFile.value)
    uploadProgress.value = 30

    // 2. 插入专辑数据
    uploadStatus.value = '正在创建专辑记录...'
    const { data: albumData, error: albumError } = await supabase
      .from('albums')
      .insert({
        title: form.title,
        artist: form.artist,
        cover_url: coverUrl,
        release_date: form.releaseDate.toISOString().split('T')[0],
        genre: form.genre,
        description: form.description,
        song_count: form.songs.length
      })
      .select()
      .single()

    if (albumError) throw albumError
    
    const albumId = albumData.id
    uploadProgress.value = 40

    // 3. 上传歌曲
    const totalSongs = form.songs.length
    for (let i = 0; i < form.songs.length; i++) {
      const song = form.songs[i]
      uploadStatus.value = `正在上传歌曲 ${i + 1}/${totalSongs}...`
      
      const audioUrl = await uploadAudio(song.audioFile!, albumId, i + 1)
      
      // 获取音频时长（使用Audio API）
      const duration = await getAudioDuration(song.audioFile!)
      
      // 插入歌曲记录
      await supabase.from('songs').insert({
        album_id: albumId,
        title: song.title,
        track_number: i + 1,
        duration: duration,
        audio_url: audioUrl
      })
      
      uploadProgress.value = 40 + ((i + 1) / totalSongs) * 60
    }

    uploadProgress.value = 100
    uploadStatus.value = '上传完成！'
    
    ElMessage.success('专辑上传成功！')
    
    // 重置表单
    resetForm()
    
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败: ' + (error as Error).message)
  } finally {
    uploading.value = false
  }
}

/**
 * 上传封面
 */
async function uploadCover(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`
  
  const { data, error } = await supabase.storage
    .from('album-covers')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '31536000'
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('album-covers')
    .getPublicUrl(fileName)

  return publicUrl
}

/**
 * 上传音频
 */
async function uploadAudio(file: File, albumId: string, trackNumber: number): Promise<string> {
  const fileName = `${albumId}-track${trackNumber}-${Date.now()}.mp3`
  
  const { data, error } = await supabase.storage
    .from('album-music')
    .upload(fileName, file, {
      contentType: 'audio/mpeg',
      cacheControl: '31536000'
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('album-music')
    .getPublicUrl(fileName)

  return publicUrl
}

/**
 * 获取音频时长
 */
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.onloadedmetadata = () => {
      resolve(Math.floor(audio.duration))
    }
    audio.onerror = () => {
      resolve(0)
    }
    audio.src = URL.createObjectURL(file)
  })
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 重置表单
 */
function resetForm() {
  form.title = ''
  form.artist = ''
  form.releaseDate = new Date()
  form.genre = 'Hip Hop'
  form.description = ''
  form.songs = []
  coverFile.value = null
  coverPreview.value = ''
  uploadProgress.value = 0
}

onMounted(() => {
  checkStorage()
  // 默认添加一首歌
  addSong()
})
</script>

<style lang="scss" scoped>
.music-upload {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.upload-container {
  max-width: 900px;
  margin: 0 auto;
  
  h1 {
    font-size: 28px;
    margin-bottom: 24px;
    color: #303133;
  }
}

.upload-card {
  margin: 24px 0;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.cover-uploader {
  :deep(.el-upload) {
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409eff;
    }
  }
  
  .cover-preview {
    width: 300px;
    height: 300px;
    object-fit: cover;
    display: block;
  }
  
  .upload-placeholder {
    width: 300px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #606266;
    
    .upload-icon {
      font-size: 48px;
      margin-bottom: 16px;
      color: #c0c4cc;
    }
    
    .upload-text {
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .upload-hint {
      font-size: 12px;
      color: #909399;
    }
  }
}

.songs-section {
  .song-item {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    
    .song-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .song-number {
        font-size: 18px;
        font-weight: 600;
        color: #409eff;
      }
    }
  }
  
  .add-song-btn {
    width: 100%;
  }
}

.audio-info {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #67c23a;
  
  .file-size {
    font-size: 12px;
    color: #909399;
  }
}

.upload-placeholder.small {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.upload-progress {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  
  p {
    margin-top: 8px;
    text-align: center;
    color: #606266;
    font-size: 14px;
  }
}

.tips-card {
  margin-top: 24px;
  
  .tips-content {
    h4 {
      font-size: 16px;
      margin-bottom: 12px;
      color: #303133;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin-bottom: 24px;
      
      li {
        margin-bottom: 8px;
        
        a {
          color: #409eff;
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>

