/**
 * Spotify API 服务
 * 官方API，完全合法，全球可用
 */

import type { Album, Song, AlbumDetail } from '@/types/album'

// 从环境变量获取配置
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ''

// Token缓存
let cachedToken: string | null = null
let tokenExpiry: number = 0

export class SpotifyService {
  /**
   * 获取访问令牌
   */
  private static async getAccessToken(): Promise<string> {
    // 如果token还有效，直接返回
    if (cachedToken && Date.now() < tokenExpiry) {
      return cachedToken
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        console.error('获取Spotify token失败:', response.status)
        throw new Error('Failed to get Spotify token')
      }

      const data = await response.json()
      cachedToken = data.access_token
      tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // 提前1分钟刷新
      
      return cachedToken
    } catch (error) {
      console.error('Spotify认证失败:', error)
      throw error
    }
  }

  /**
   * 搜索专辑
   */
  static async searchAlbums(query: string, limit: number = 20): Promise<Album[]> {
    try {
      const token = await this.getAccessToken()
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        console.error('搜索失败:', response.status)
        return []
      }

      const data = await response.json()
      
      if (!data.albums?.items) {
        return []
      }

      return data.albums.items.map((album: any) => this.transformAlbum(album))
    } catch (error) {
      console.error('搜索专辑失败:', error)
      return []
    }
  }

  /**
   * 获取专辑详情
   */
  static async getAlbumDetail(albumId: string): Promise<AlbumDetail | null> {
    try {
      const token = await this.getAccessToken()
      
      // 获取专辑信息
      const albumResponse = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!albumResponse.ok) {
        console.error('获取专辑详情失败:', albumResponse.status)
        return null
      }

      const albumData = await albumResponse.json()
      
      // 转换为项目格式
      const album = this.transformAlbum(albumData)
      const songs = albumData.tracks.items.map((track: any, index: number) => 
        this.transformTrack(track, albumId, index + 1)
      )

      return {
        ...album,
        description: albumData.label || '',
        artistBio: '',
        songs
      }
    } catch (error) {
      console.error('获取专辑详情失败:', error)
      return null
    }
  }

  /**
   * 获取艺人热门专辑
   */
  static async getArtistAlbums(artistId: string, limit: number = 20): Promise<Album[]> {
    try {
      const token = await this.getAccessToken()
      
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/albums?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) return []

      const data = await response.json()
      return data.items.map((album: any) => this.transformAlbum(album))
    } catch (error) {
      console.error('获取艺人专辑失败:', error)
      return []
    }
  }

  /**
   * 搜索艺人
   */
  static async searchArtists(query: string, limit: number = 20): Promise<any[]> {
    try {
      const token = await this.getAccessToken()
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) return []

      const data = await response.json()
      return data.artists?.items || []
    } catch (error) {
      console.error('搜索艺人失败:', error)
      return []
    }
  }

  /**
   * 获取推荐说唱专辑
   */
  static async getHipHopAlbums(limit: number = 20): Promise<Album[]> {
    // 搜索热门说唱艺人的专辑
    const artists = ['Eminem', 'Kendrick Lamar', 'Drake', 'J. Cole', 'Travis Scott']
    const randomArtist = artists[Math.floor(Math.random() * artists.length)]
    
    return await this.searchAlbums(`artist:${randomArtist} genre:hip-hop`, limit)
  }

  /**
   * 转换专辑数据格式
   */
  private static transformAlbum(spotifyAlbum: any): Album {
    // 获取最大的封面图
    const coverUrl = spotifyAlbum.images?.[0]?.url || 
                     spotifyAlbum.images?.[1]?.url || 
                     ''

    return {
      id: spotifyAlbum.id,
      title: spotifyAlbum.name,
      artist: spotifyAlbum.artists?.[0]?.name || 'Unknown Artist',
      coverUrl: coverUrl,
      releaseDate: spotifyAlbum.release_date || new Date().toISOString().split('T')[0],
      genre: 'Hip Hop',
      rating: 0,
      ratingCount: 0,
      songCount: spotifyAlbum.total_tracks || 0,
      previewUrl: spotifyAlbum.external_urls?.spotify || ''
    }
  }

  /**
   * 转换歌曲数据格式
   */
  private static transformTrack(spotifyTrack: any, albumId: string, trackNumber: number): Song {
    return {
      id: spotifyTrack.id,
      albumId: albumId,
      title: spotifyTrack.name,
      duration: Math.floor(spotifyTrack.duration_ms / 1000),
      audioUrl: spotifyTrack.preview_url || '', // 30秒预览URL
      trackNumber: trackNumber,
      lyrics: ''
    }
  }

  /**
   * 检查API配置
   */
  static checkConfig(): boolean {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('❌ Spotify配置缺失！请在.env中配置：')
      console.error('VITE_SPOTIFY_CLIENT_ID=...')
      console.error('VITE_SPOTIFY_CLIENT_SECRET=...')
      return false
    }
    return true
  }

  /**
   * 测试API连接
   */
  static async testConnection(): Promise<boolean> {
    try {
      const token = await this.getAccessToken()
      return !!token
    } catch (error) {
      console.error('Spotify API连接失败:', error)
      return false
    }
  }
}

export default SpotifyService

