import { request } from './request'
import { supabase, TABLES } from '@/utils/supabase'
import type { Album, AlbumDetail, AlbumSearchParams, AlbumComment, AlbumRating } from '@/types/album'
import type { PageData } from '@/types/common'

/**
 * 专辑相关API
 */

/**
 * 从 Supabase 获取专辑列表
 */
export async function getAlbumsFromSupabase(limit: number = 10): Promise<Album[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.ALBUMS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('获取专辑列表失败:', error)
      throw error
    }

    // 转换数据格式
    return (data || []).map(album => ({
      id: album.id,
      title: album.title,
      artist: album.artist,
      coverUrl: album.cover_url || album.coverUrl,
      releaseDate: album.release_date || album.releaseDate,
      genre: album.genre,
      rating: album.rating || 0,
      ratingCount: album.rating_count || album.ratingCount || 0,
      songCount: album.song_count || album.songCount || 0,
      description: album.description,
    }))
  } catch (error) {
    console.error('从Supabase获取专辑失败:', error)
    return []
  }
}

/**
 * 获取专辑列表
 */
export function getAlbumList(params: AlbumSearchParams) {
  return request.get<PageData<Album>>('/albums', params)
}

/**
 * 从 Supabase 获取专辑的歌曲列表
 */
export async function getSongsFromSupabase(albumId: string) {
  try {
    const { data, error } = await supabase
      .from(TABLES.SONGS)
      .select('*')
      .eq('album_id', albumId)
      .order('track_number', { ascending: true })

    if (error) {
      console.error('获取歌曲列表失败:', error)
      throw error
    }

    // 转换数据格式
    return (data || []).map(song => ({
      id: song.id,
      albumId: song.album_id,
      title: song.title,
      trackNumber: song.track_number,
      duration: song.duration,
      audioUrl: song.audio_url,
      lyrics: song.lyrics,
    }))
  } catch (error) {
    console.error('从Supabase获取歌曲失败:', error)
    return []
  }
}

/**
 * 获取专辑详情
 */
export function getAlbumDetail(albumId: string) {
  return request.get<AlbumDetail>(`/albums/${albumId}`)
}

/**
 * 搜索专辑
 */
export function searchAlbums(keyword: string, params?: AlbumSearchParams) {
  return request.get<PageData<Album>>('/albums/search', { keyword, ...params })
}

/**
 * 获取热门专辑
 */
export function getHotAlbums(limit: number = 10) {
  return request.get<Album[]>('/albums/hot', { limit })
}

/**
 * 获取推荐专辑
 */
export function getRecommendedAlbums(limit: number = 10) {
  return request.get<Album[]>('/albums/recommended', { limit })
}

/**
 * 对专辑评分
 */
export function rateAlbum(albumId: string, score: number) {
  return request.post<AlbumRating>(`/albums/${albumId}/rate`, { score })
}

/**
 * 获取专辑评论
 */
export function getAlbumComments(albumId: string, page: number = 1, pageSize: number = 20) {
  return request.get<PageData<AlbumComment>>(`/albums/${albumId}/comments`, { page, pageSize })
}

/**
 * 发表专辑评论
 */
export function createAlbumComment(albumId: string, content: string, parentId?: string) {
  return request.post<AlbumComment>(`/albums/${albumId}/comments`, { content, parentId })
}

/**
 * 点赞评论
 */
export function likeComment(commentId: string) {
  return request.post(`/comments/${commentId}/like`)
}

/**
 * 取消点赞评论
 */
export function unlikeComment(commentId: string) {
  return request.delete(`/comments/${commentId}/like`)
}

