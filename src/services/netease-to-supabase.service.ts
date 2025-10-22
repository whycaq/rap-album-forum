/**
 * 网易云音乐到Supabase自动导入服务
 * 从网易云API获取资源并自动上传到Supabase Storage
 */

import { supabase } from '@/utils/supabase'
import { NeteaseService } from './netease.service'

export class NeteaseToSupabaseService {
  /**
   * 导入专辑（从网易云到Supabase）
   * @param neteaseAlbumId 网易云专辑ID
   * @returns 导入后的数据库ID
   */
  static async importAlbum(neteaseAlbumId: string): Promise<string | null> {
    try {
      console.log(`📥 开始导入网易云专辑: ${neteaseAlbumId}`)
      
      // 1. 从网易云获取专辑详情
      const result = await NeteaseService.getAlbumDetail(neteaseAlbumId)
      if (!result) {
        console.error('获取专辑详情失败')
        return null
      }
      
      const { album, songs } = result
      
      // 2. 下载并上传专辑封面
      console.log('📷 下载封面...')
      const coverUrl = await this.downloadAndUploadCover(album.coverUrl, neteaseAlbumId)
      
      if (!coverUrl) {
        console.error('封面上传失败')
        return null
      }
      
      // 3. 插入专辑数据到数据库
      console.log('💾 保存专辑信息到数据库...')
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert({
          title: album.title,
          artist: album.artist,
          cover_url: coverUrl,
          release_date: album.releaseDate,
          genre: album.genre,
          description: album.description || '',
          song_count: songs.length
        })
        .select()
        .single()
      
      if (albumError) {
        console.error('保存专辑失败:', albumError)
        return null
      }
      
      const dbAlbumId = albumData.id
      
      // 4. 处理每首歌曲（仅保存元数据，不下载音频）
      console.log(`🎵 保存 ${songs.length} 首歌曲信息...`)
      const songPromises = songs.map(async (song, index) => {
        // 获取播放URL（仅用于验证）
        const audioUrl = await NeteaseService.getSongUrl(song.id)
        
        return supabase.from('songs').insert({
          album_id: dbAlbumId,
          title: song.title,
          track_number: song.trackNumber,
          duration: song.duration,
          audio_url: audioUrl || '', // 保存网易云的URL
          lyrics: song.lyrics || ''
        })
      })
      
      await Promise.all(songPromises)
      
      console.log(`✅ 专辑导入完成！数据库ID: ${dbAlbumId}`)
      return dbAlbumId
      
    } catch (error) {
      console.error('导入专辑失败:', error)
      return null
    }
  }

  /**
   * 批量导入专辑
   * @param neteaseAlbumIds 网易云专辑ID数组
   */
  static async batchImportAlbums(neteaseAlbumIds: string[]): Promise<{
    success: number
    failed: number
    results: Array<{ id: string, status: string, dbId?: string }>
  }> {
    const results = {
      success: 0,
      failed: 0,
      results: [] as Array<{ id: string, status: string, dbId?: string }>
    }
    
    for (const albumId of neteaseAlbumIds) {
      try {
        const dbId = await this.importAlbum(albumId)
        
        if (dbId) {
          results.success++
          results.results.push({
            id: albumId,
            status: 'success',
            dbId
          })
        } else {
          results.failed++
          results.results.push({
            id: albumId,
            status: 'failed'
          })
        }
        
        // 避免请求过快，延迟1秒
        await this.sleep(1000)
        
      } catch (error) {
        results.failed++
        results.results.push({
          id: albumId,
          status: 'error',
        })
      }
    }
    
    return results
  }

  /**
   * 搜索并导入专辑
   * @param keyword 搜索关键词
   * @param limit 导入数量
   */
  static async searchAndImport(keyword: string, limit: number = 5): Promise<string[]> {
    try {
      // 1. 搜索专辑
      console.log(`🔍 搜索专辑: ${keyword}`)
      const albums = await NeteaseService.searchAlbums(keyword, limit)
      
      if (albums.length === 0) {
        console.log('未找到专辑')
        return []
      }
      
      console.log(`找到 ${albums.length} 张专辑，开始导入...`)
      
      // 2. 批量导入
      const albumIds = albums.map(a => a.id)
      const result = await this.batchImportAlbums(albumIds)
      
      console.log(`✅ 导入完成: 成功${result.success}张，失败${result.failed}张`)
      
      return result.results
        .filter(r => r.dbId)
        .map(r => r.dbId!)
      
    } catch (error) {
      console.error('搜索并导入失败:', error)
      return []
    }
  }

  /**
   * 下载图片并上传到Supabase Storage
   */
  private static async downloadAndUploadCover(
    imageUrl: string,
    albumId: string
  ): Promise<string | null> {
    try {
      // 1. 下载图片
      const response = await fetch(imageUrl, {
        mode: 'cors'
      })
      
      if (!response.ok) {
        console.error('下载图片失败:', response.status)
        return null
      }
      
      const blob = await response.blob()
      
      // 2. 上传到Supabase Storage
      const fileName = `netease-${albumId}-${Date.now()}.jpg`
      const { data, error } = await supabase.storage
        .from('album-covers')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '31536000', // 缓存1年
          upsert: false
        })
      
      if (error) {
        console.error('上传封面失败:', error)
        return null
      }
      
      // 3. 获取公开URL
      const { data: { publicUrl } } = supabase.storage
        .from('album-covers')
        .getPublicUrl(fileName)
      
      console.log(`✅ 封面已上传: ${publicUrl}`)
      return publicUrl
      
    } catch (error) {
      console.error('下载或上传封面失败:', error)
      return null
    }
  }

  /**
   * 下载音频并上传到Supabase Storage（可选，占用空间大）
   * 注意：这可能涉及版权问题，仅供学习使用
   */
  private static async downloadAndUploadAudio(
    audioUrl: string,
    songId: string
  ): Promise<string | null> {
    try {
      console.log('⚠️ 下载音频文件（仅供学习）...')
      
      const response = await fetch(audioUrl)
      if (!response.ok) return null
      
      const blob = await response.blob()
      
      const fileName = `netease-${songId}-${Date.now()}.mp3`
      const { data, error } = await supabase.storage
        .from('album-music')
        .upload(fileName, blob, {
          contentType: 'audio/mpeg',
          cacheControl: '31536000'
        })
      
      if (error) {
        console.error('上传音频失败:', error)
        return null
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('album-music')
        .getPublicUrl(fileName)
      
      return publicUrl
      
    } catch (error) {
      console.error('下载或上传音频失败:', error)
      return null
    }
  }

  /**
   * 延迟函数
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 检查Storage是否已配置
   */
  static async checkStorageReady(): Promise<boolean> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      
      const hasCovers = buckets?.some(b => b.name === 'album-covers')
      const hasMusic = buckets?.some(b => b.name === 'album-music')
      
      return hasCovers && hasMusic
    } catch (error) {
      console.error('检查Storage失败:', error)
      return false
    }
  }

  /**
   * 获取推荐的网易云专辑ID列表（说唱相关）
   */
  static getRecommendedAlbumIds(): string[] {
    return [
      '32311',    // Eminem - The Marshall Mathers LP
      '3069962',  // Kendrick Lamar - good kid, m.A.A.d city
      '34612',    // Jay-Z - The Blueprint
      '34586',    // Nas - Illmatic
      '3406843',  // Kendrick Lamar - To Pimp a Butterfly
      '2734830',  // Kanye West - My Beautiful Dark Twisted Fantasy
      '3069313',  // Drake - Take Care
      '35023',    // 50 Cent - Get Rich or Die Tryin'
      '71051349', // Tyler, The Creator - IGOR
      '78130568'  // Travis Scott - ASTROWORLD
    ]
  }
}

export default NeteaseToSupabaseService

