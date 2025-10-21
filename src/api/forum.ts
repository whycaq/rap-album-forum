import { request } from './request'
import type { Post, PostReply, ForumCategory, CreatePostRequest, CreateReplyRequest, Notification } from '@/types/forum'
import type { PageData } from '@/types/common'

/**
 * 论坛相关API
 */

/**
 * 获取论坛分类列表
 */
export function getForumCategories() {
  return request.get<ForumCategory[]>('/forum/categories')
}

/**
 * 获取帖子列表
 */
export function getPostList(categoryId?: string, page: number = 1, pageSize: number = 20, sortBy: string = 'latest') {
  return request.get<PageData<Post>>('/forum/posts', { categoryId, page, pageSize, sortBy })
}

/**
 * 获取帖子详情
 */
export function getPostDetail(postId: string) {
  return request.get<Post>(`/forum/posts/${postId}`)
}

/**
 * 发布帖子
 */
export function createPost(data: CreatePostRequest) {
  return request.post<Post>('/forum/posts', data)
}

/**
 * 更新帖子
 */
export function updatePost(postId: string, data: Partial<CreatePostRequest>) {
  return request.put<Post>(`/forum/posts/${postId}`, data)
}

/**
 * 删除帖子
 */
export function deletePost(postId: string) {
  return request.delete(`/forum/posts/${postId}`)
}

/**
 * 获取帖子回复列表
 */
export function getPostReplies(postId: string, page: number = 1, pageSize: number = 50) {
  return request.get<PageData<PostReply>>(`/forum/posts/${postId}/replies`, { page, pageSize })
}

/**
 * 发表回复
 */
export function createReply(data: CreateReplyRequest) {
  return request.post<PostReply>('/forum/replies', data)
}

/**
 * 点赞帖子
 */
export function likePost(postId: string) {
  return request.post(`/forum/posts/${postId}/like`)
}

/**
 * 取消点赞帖子
 */
export function unlikePost(postId: string) {
  return request.delete(`/forum/posts/${postId}/like`)
}

/**
 * 点赞回复
 */
export function likeReply(replyId: string) {
  return request.post(`/forum/replies/${replyId}/like`)
}

/**
 * 取消点赞回复
 */
export function unlikeReply(replyId: string) {
  return request.delete(`/forum/replies/${replyId}/like`)
}

/**
 * 获取用户通知列表
 */
export function getNotifications(page: number = 1, pageSize: number = 20) {
  return request.get<PageData<Notification>>('/notifications', { page, pageSize })
}

/**
 * 标记通知为已读
 */
export function markNotificationAsRead(notificationId: string) {
  return request.put(`/notifications/${notificationId}/read`)
}

/**
 * 标记所有通知为已读
 */
export function markAllNotificationsAsRead() {
  return request.put('/notifications/read-all')
}

/**
 * 获取未读通知数量
 */
export function getUnreadNotificationCount() {
  return request.get<{ count: number }>('/notifications/unread-count')
}

