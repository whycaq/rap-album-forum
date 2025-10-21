import { request } from './request'
import type { Album, AlbumDetail, AlbumSearchParams, AlbumComment, AlbumRating } from '@/types/album'
import type { PageData } from '@/types/common'

/**
 * 专辑相关API
 */

/**
 * 获取专辑列表
 */
export function getAlbumList(params: AlbumSearchParams) {
  return request.get<PageData<Album>>('/albums', params)
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

