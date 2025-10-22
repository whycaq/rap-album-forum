/**
 * Spotify到Supabase自动导入服务
 * 从Spotify API获取资源并导入到Supabase
 */

import { supabase } from '@/utils/supabase'
import { SpotifyService } from './spotify.service'

export class SpotifyToSupabaseService {
  /**
   * 导入专辑（从Spotify到Supabase）
   */
  static async importAlbum(spotifyAlbumId: string): Promise<string | null> {
    try {
      console.log(`📥 开始导入Spotify专辑: ${spotifyAlbumId}`)
      
      // 1. 从Spotify获取专辑详情
      const albumDetail = await SpotifyService.getAlbumDetail(spotifyAlbumId)
      if (!albumDetail) {
        console.error('获取专辑详情失败')
        return null
      }
      
      // 2. 下载并上传封面
      console.log('📷 下载封面...')
      const coverUrl = await this.downloadAndUploadCover(
        albumDetail.coverUrl,
        spotifyAlbumId
      )
      
      // 3. 插入专辑数据
      console.log('💾 保存专辑信息...')
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert({
          title: albumDetail.title,
          artist: albumDetail.artist,
          cover_url: coverUrl || albumDetail.coverUrl, // 优先使用上传的URL
          release_date: albumDetail.releaseDate,
          genre: albumDetail.genre,
          description: albumDetail.description || `来自Spotify的专辑：${albumDetail.title}`,
          artist_bio: albumDetail.artistBio || '',
          song_count: albumDetail.songs.length
        })
        .select()
        .single()
      
      if (albumError) {
        console.error('保存专辑失败:', albumError)
        return null
      }
      
      const dbAlbumId = albumData.id
      
      // 4. 保存歌曲信息
      console.log(`🎵 保存 ${albumDetail.songs.length} 首歌曲...`)
      const songPromises = albumDetail.songs.map((song) => 
        supabase.from('songs').insert({
          album_id: dbAlbumId,
          title: song.title,
          track_number: song.trackNumber,
          duration: song.duration,
          audio_url: song.audioUrl, // Spotify 30秒预览URL
          lyrics: ''
        })
      )
      
      await Promise.all(songPromises)
      
      console.log(`✅ 专辑导入完成！ID: ${dbAlbumId}`)
      return dbAlbumId
      
    } catch (error) {
      console.error('导入专辑失败:', error)
      return null
    }
  }

  /**
   * 批量导入专辑
   */
  static async batchImportAlbums(spotifyAlbumIds: string[]): Promise<{
    success: number
    failed: number
    results: Array<{ id: string, status: string, dbId?: string }>
  }> {
    const results = {
      success: 0,
      failed: 0,
      results: [] as Array<{ id: string, status: string, dbId?: string }>
    }
    
    for (const albumId of spotifyAlbumIds) {
      try {
        const dbId = await this.importAlbum(albumId)
        
        if (dbId) {
          results.success++
          results.results.push({ id: albumId, status: 'success', dbId })
        } else {
          results.failed++
          results.results.push({ id: albumId, status: 'failed' })
        }
        
        // 避免请求过快
        await this.sleep(500)
        
      } catch (error) {
        results.failed++
        results.results.push({ id: albumId, status: 'error' })
      }
    }
    
    return results
  }

  /**
   * 搜索并导入
   */
  static async searchAndImport(keyword: string, limit: number = 5): Promise<string[]> {
    try {
      console.log(`🔍 搜索: ${keyword}`)
      
      const albums = await SpotifyService.searchAlbums(keyword, limit)
      if (albums.length === 0) {
        console.log('未找到专辑')
        return []
      }
      
      console.log(`找到 ${albums.length} 张专辑，开始导入...`)
      
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
   * 下载图片并上传到Supabase
   */
  private static async downloadAndUploadCover(
    imageUrl: string,
    albumId: string
  ): Promise<string | null> {
    try {
      // 1. 下载图片
      const response = await fetch(imageUrl)
      if (!response.ok) return null
      
      const blob = await response.blob()
      
      // 2. 上传到Supabase
      const fileName = `spotify-${albumId}-${Date.now()}.jpg`
      const { data, error } = await supabase.storage
        .from('album-covers')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '31536000'
        })
      
      if (error) {
        console.error('上传封面失败:', error)
        return null
      }
      
      // 3. 获取公开URL
      const { data: { publicUrl } } = supabase.storage
        .from('album-covers')
        .getPublicUrl(fileName)
      
      console.log(`✅ 封面已上传到Supabase`)
      return publicUrl
      
    } catch (error) {
      console.error('处理封面失败:', error)
      return null
    }
  }

  /**
   * 获取推荐的说唱艺人Spotify ID
   */
  static getRecommendedArtistIds(): string[] {
    return [
      '7dGJo4pcD2V6oG8kP0tJRR', // Eminem
      '2YZyLoL8N0Wb9xBt1NhZWg', // Kendrick Lamar
      '3TVXtAsR1Inumwj472S9r4', // Drake
      '6l3HvQ5sa6mXTsMTB19rO5', // J. Cole
      '0Y5tJX1MQlPlqiwlOH1tJY', // Travis Scott
      '5K4W6rqBFWDnAN6FQUkS6x', // Kanye West
      '3MZsBdqDrRTJihTHQrO6Dq', // Nas
      '3nFkdlSjzX9mRTtwJOzDYB', // Jay-Z
      '5me0Irg2ANcsgc93uaYrpb', // 2Pac
      '1McMsnEElThX1knmY4oliG'  // Notorious B.I.G.
    ]
  }

  /**
   * 导入推荐艺人的专辑
   */
  static async importRecommendedAlbums(albumsPerArtist: number = 2): Promise<string[]> {
    const artistIds = this.getRecommendedArtistIds()
    const importedIds: string[] = []
    
    for (const artistId of artistIds) {
      try {
        const albums = await SpotifyService.getArtistAlbums(artistId, albumsPerArtist)
        
        for (const album of albums.slice(0, albumsPerArtist)) {
          const dbId = await this.importAlbum(album.id)
          if (dbId) {
            importedIds.push(dbId)
          }
          
          await this.sleep(500)
        }
      } catch (error) {
        console.error(`导入艺人${artistId}的专辑失败:`, error)
      }
    }
    
    return importedIds
  }

  /**
   * 延迟函数
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 检查配置
   */
  static checkConfig(): boolean {
    return SpotifyService.checkConfig()
  }
}

export default SpotifyToSupabaseService

