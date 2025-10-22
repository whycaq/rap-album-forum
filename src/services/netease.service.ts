/**
 * 网易云音乐API服务
 * 用于获取专辑、歌曲信息和播放URL
 */

import type { Album, Song } from '@/types/album'

// API基础URL（本地部署的网易云API服务）
const API_BASE_URL = import.meta.env.VITE_NETEASE_API_URL || 'http://localhost:3000'

/**
 * 网易云音乐服务类
 */
export class NeteaseService {
  /**
   * 搜索专辑
   * @param keywords 搜索关键词
   * @param limit 返回数量限制
   */
  static async searchAlbums(keywords: string, limit: number = 30): Promise<Album[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/search?keywords=${encodeURIComponent(keywords)}&type=10&limit=${limit}`
      )
      const data = await response.json()
      
      if (data.code !== 200 || !data.result?.albums) {
        console.warn('搜索专辑失败:', data)
        return []
      }
      
      return this.transformAlbums(data.result.albums)
    } catch (error) {
      console.error('搜索专辑出错:', error)
      return []
    }
  }

  /**
   * 获取专辑详情
   * @param albumId 专辑ID
   */
  static async getAlbumDetail(albumId: string): Promise<{
    album: Album
    songs: Song[]
  } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/album?id=${albumId}`)
      const data = await response.json()
      
      if (data.code !== 200 || !data.album) {
        console.warn('获取专辑详情失败:', data)
        return null
      }
      
      const album = this.transformAlbum(data.album)
      const songs = this.transformSongs(data.songs, albumId)
      
      return { album, songs }
    } catch (error) {
      console.error('获取专辑详情出错:', error)
      return null
    }
  }

  /**
   * 获取歌曲播放URL
   * @param songId 歌曲ID
   */
  static async getSongUrl(songId: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/song/url?id=${songId}`)
      const data = await response.json()
      
      if (data.code !== 200 || !data.data?.[0]?.url) {
        console.warn('获取歌曲URL失败:', data)
        return null
      }
      
      return data.data[0].url
    } catch (error) {
      console.error('获取歌曲URL出错:', error)
      return null
    }
  }

  /**
   * 批量获取歌曲播放URL
   * @param songIds 歌曲ID数组
   */
  static async getSongUrls(songIds: string[]): Promise<Record<string, string>> {
    try {
      const ids = songIds.join(',')
      const response = await fetch(`${API_BASE_URL}/song/url?id=${ids}`)
      const data = await response.json()
      
      if (data.code !== 200 || !data.data) {
        console.warn('批量获取歌曲URL失败:', data)
        return {}
      }
      
      const urlMap: Record<string, string> = {}
      data.data.forEach((item: any) => {
        if (item.url) {
          urlMap[item.id.toString()] = item.url
        }
      })
      
      return urlMap
    } catch (error) {
      console.error('批量获取歌曲URL出错:', error)
      return {}
    }
  }

  /**
   * 搜索歌曲
   * @param keywords 搜索关键词
   * @param limit 返回数量限制
   */
  static async searchSongs(keywords: string, limit: number = 30): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/search?keywords=${encodeURIComponent(keywords)}&limit=${limit}`
      )
      const data = await response.json()
      
      if (data.code !== 200 || !data.result?.songs) {
        console.warn('搜索歌曲失败:', data)
        return []
      }
      
      return data.result.songs
    } catch (error) {
      console.error('搜索歌曲出错:', error)
      return []
    }
  }

  /**
   * 获取热门专辑（说唱类）
   * @param limit 返回数量
   */
  static async getHotAlbums(limit: number = 20): Promise<Album[]> {
    try {
      // 搜索热门说唱关键词
      const keywords = ['说唱', 'Hip Hop', 'Rap', '嘻哈']
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
      
      return await this.searchAlbums(randomKeyword, limit)
    } catch (error) {
      console.error('获取热门专辑出错:', error)
      return []
    }
  }

  /**
   * 转换网易云专辑数据为项目格式
   */
  private static transformAlbums(albums: any[]): Album[] {
    return albums.map(album => this.transformAlbum(album))
  }

  /**
   * 转换单个专辑数据
   */
  private static transformAlbum(album: any): Album {
    return {
      id: album.id.toString(),
      title: album.name,
      artist: album.artist?.name || album.artists?.[0]?.name || '未知艺人',
      coverUrl: album.picUrl || album.blurPicUrl || '',
      releaseDate: album.publishTime 
        ? new Date(album.publishTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      genre: 'Hip Hop',
      rating: 0,
      ratingCount: 0,
      songCount: album.size || 0,
      description: album.description || ''
    }
  }

  /**
   * 转换歌曲数据
   */
  private static transformSongs(songs: any[], albumId: string): Song[] {
    return songs.map((song, index) => ({
      id: song.id.toString(),
      albumId: albumId,
      title: song.name,
      duration: Math.floor(song.duration / 1000), // 毫秒转秒
      audioUrl: '', // 需要单独获取
      trackNumber: index + 1,
      lyrics: ''
    }))
  }

  /**
   * 检查API服务是否可用
   */
  static async checkApiStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/`)
      return response.ok
    } catch (error) {
      console.error('网易云API服务不可用:', error)
      return false
    }
  }
}

export default NeteaseService

