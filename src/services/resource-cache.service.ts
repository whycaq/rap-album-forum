/**
 * 资源缓存服务
 * 自动从第三方API获取资源并缓存到Supabase Storage
 */

import { supabase } from '@/utils/supabase'
import { NeteaseService } from './netease.service'

export class ResourceCacheService {
  /**
   * 获取或缓存专辑封面
   * 1. 先查Supabase数据库
   * 2. 如果没有，从网易云API获取
   * 3. 下载图片并上传到Supabase Storage
   * 4. 更新数据库记录
   * 
   * @param albumId 数据库中的专辑ID
   * @param neteaseAlbumId 网易云专辑ID（如果需要从API获取）
   */
  static async getOrCacheAlbumCover(
    albumId: string,
    neteaseAlbumId?: string
  ): Promise<string> {
    try {
      // 1. 先从数据库查询
      const { data: album } = await supabase
        .from('albums')
        .select('cover_url')
        .eq('id', albumId)
        .single()
      
      // 如果已有Supabase的URL，直接返回
      if (album?.cover_url && album.cover_url.includes('supabase.co')) {
        console.log('✅ 使用缓存的封面')
        return album.cover_url
      }
      
      // 如果有外部URL但不需要缓存，也直接返回
      if (album?.cover_url && !neteaseAlbumId) {
        return album.cover_url
      }
      
      // 2. 如果没有网易云ID，无法获取，返回默认
      if (!neteaseAlbumId) {
        return this.getDefaultCover()
      }
      
      console.log('📥 从网易云API获取封面并缓存...')
      
      // 3. 从网易云获取专辑信息
      const result = await NeteaseService.getAlbumDetail(neteaseAlbumId)
      if (!result || !result.album.coverUrl) {
        return this.getDefaultCover()
      }
      
      const originalUrl = result.album.coverUrl
      
      // 4. 下载图片
      const imageBlob = await this.downloadImage(originalUrl)
      if (!imageBlob) {
        return originalUrl // 下载失败，返回原URL
      }
      
      // 5. 上传到Supabase Storage
      const fileName = `${albumId}-${Date.now()}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('album-covers')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
          cacheControl: '31536000' // 缓存1年
        })
      
      if (uploadError) {
        console.error('上传封面失败:', uploadError)
        return originalUrl
      }
      
      // 6. 获取公开URL
      const { data: { publicUrl } } = supabase.storage
        .from('album-covers')
        .getPublicUrl(fileName)
      
      // 7. 更新数据库
      await supabase
        .from('albums')
        .update({ cover_url: publicUrl })
        .eq('id', albumId)
      
      console.log('✅ 封面已缓存到Supabase')
      return publicUrl
      
    } catch (error) {
      console.error('获取封面失败:', error)
      return this.getDefaultCover()
    }
  }

  /**
   * 下载图片
   */
  private static async downloadImage(url: string): Promise<Blob | null> {
    try {
      const response = await fetch(url, {
        mode: 'cors'
      })
      
      if (!response.ok) {
        console.error('下载图片失败:', response.status)
        return null
      }
      
      return await response.blob()
    } catch (error) {
      console.error('下载图片异常:', error)
      return null
    }
  }

  /**
   * 批量缓存专辑封面
   * 用于一次性缓存多个专辑
   */
  static async batchCacheCovers(albums: Array<{
    id: string
    neteaseId: string
  }>) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }
    
    for (const album of albums) {
      try {
        await this.getOrCacheAlbumCover(album.id, album.neteaseId)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`${album.id}: ${error}`)
      }
      
      // 避免请求过快
      await this.sleep(500)
    }
    
    return results
  }

  /**
   * 获取默认封面
   */
  private static getDefaultCover(): string {
    return 'https://via.placeholder.com/400x400/1a3658/ffffff?text=No+Cover'
  }

  /**
   * 延迟函数
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 检查Supabase Storage是否已配置
   */
  static async checkStorageConfig(): Promise<{
    albumCoversExists: boolean
    albumMusicExists: boolean
  }> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      
      return {
        albumCoversExists: buckets?.some(b => b.name === 'album-covers') || false,
        albumMusicExists: buckets?.some(b => b.name === 'album-music') || false
      }
    } catch (error) {
      console.error('检查Storage配置失败:', error)
      return {
        albumCoversExists: false,
        albumMusicExists: false
      }
    }
  }

  /**
   * 创建必要的Storage Buckets
   * 注意：需要在Supabase Dashboard中手动创建，或使用Management API
   */
  static async createStorageBuckets() {
    // 创建album-covers bucket
    const { error: coverError } = await supabase.storage
      .createBucket('album-covers', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      })
    
    if (coverError && !coverError.message.includes('already exists')) {
      console.error('创建album-covers失败:', coverError)
    }
    
    // 创建album-music bucket
    const { error: musicError } = await supabase.storage
      .createBucket('album-music', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['audio/mpeg', 'audio/mp3']
      })
    
    if (musicError && !musicError.message.includes('already exists')) {
      console.error('创建album-music failed:', musicError)
    }
  }
}

export default ResourceCacheService

