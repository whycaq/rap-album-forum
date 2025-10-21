/**
 * 论坛相关类型定义
 */

/**
 * 论坛分类/版块
 */
export interface ForumCategory {
  /** 版块ID */
  id: string
  /** 版块名称 */
  name: string
  /** 版块描述 */
  description: string
  /** 图标 */
  icon?: string
}

/**
 * 帖子
 */
export interface Post {
  /** 帖子ID */
  id: string
  /** 用户ID */
  userId: string
  /** 用户名 */
  username: string
  /** 用户头像 */
  userAvatar?: string
  /** 版块ID */
  categoryId: string
  /** 版块名称 */
  categoryName?: string
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** 发布时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string
  /** 回复数 */
  replyCount: number
  /** 点赞数 */
  likes: number
  /** 关联的专辑ID */
  relatedAlbumId?: string
  /** 是否置顶 */
  isPinned?: boolean
  /** 是否精华 */
  isHighlighted?: boolean
}

/**
 * 帖子回复
 */
export interface PostReply {
  /** 回复ID */
  id: string
  /** 帖子ID */
  postId: string
  /** 用户ID */
  userId: string
  /** 用户名 */
  username: string
  /** 用户头像 */
  userAvatar?: string
  /** 回复内容 */
  content: string
  /** 点赞数 */
  likes: number
  /** 发布时间 */
  createdAt: string
  /** 父回复ID（楼中楼） */
  parentId?: string
}

/**
 * 发布帖子请求
 */
export interface CreatePostRequest {
  /** 版块ID */
  categoryId: string
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** 关联的专辑ID */
  relatedAlbumId?: string
}

/**
 * 发布回复请求
 */
export interface CreateReplyRequest {
  /** 帖子ID */
  postId: string
  /** 回复内容 */
  content: string
  /** 父回复ID */
  parentId?: string
}

/**
 * 消息通知
 */
export interface Notification {
  /** 通知ID */
  id: string
  /** 用户ID */
  userId: string
  /** 通知类型 */
  type: 'reply' | 'like' | 'system'
  /** 通知标题 */
  title: string
  /** 通知内容 */
  content: string
  /** 是否已读 */
  isRead: boolean
  /** 创建时间 */
  createdAt: string
  /** 相关链接 */
  link?: string
}

