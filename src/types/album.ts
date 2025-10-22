/**
 * 专辑相关类型定义
 */

/**
 * 专辑基本信息
 */
export interface Album {
  /** 专辑ID */
  id: string
  /** 专辑标题 */
  title: string
  /** 艺人 */
  artist: string
  /** 封面URL */
  coverUrl: string
  /** 发行日期 */
  releaseDate: string
  /** 流派 */
  genre: string
  /** 平均评分 */
  rating: number
  /** 评分人数 */
  ratingCount: number
  /** 歌曲数量 */
  songCount?: number
  /** 试听URL（第一首歌曲的试听链接） */
  previewUrl?: string
}

/**
 * 歌曲信息
 */
export interface Song {
  /** 歌曲ID */
  id: string
  /** 专辑ID */
  albumId: string
  /** 歌曲标题 */
  title: string
  /** 时长（秒） */
  duration?: number
  /** 试听URL */
  audioUrl?: string
  /** 歌词 */
  lyrics?: string
  /** 曲目编号 */
  trackNumber: number
}

/**
 * 专辑详情
 */
export interface AlbumDetail extends Album {
  /** 专辑介绍 */
  description: string
  /** 艺人简介 */
  artistBio?: string
  /** 歌曲列表 */
  songs: Song[]
}

/**
 * 专辑评分
 */
export interface AlbumRating {
  /** 用户ID */
  userId: string
  /** 专辑ID */
  albumId: string
  /** 评分 (1-5) */
  score: number
  /** 评分时间 */
  createdAt: string
}

/**
 * 专辑评论
 */
export interface AlbumComment {
  /** 评论ID */
  id: string
  /** 用户ID */
  userId: string
  /** 用户名 */
  username: string
  /** 用户头像 */
  userAvatar?: string
  /** 专辑ID */
  albumId: string
  /** 评论内容 */
  content: string
  /** 点赞数 */
  likes: number
  /** 发布时间 */
  createdAt: string
  /** 父评论ID（回复） */
  parentId?: string
  /** 子评论列表 */
  replies?: AlbumComment[]
}

/**
 * 专辑搜索参数
 */
export interface AlbumSearchParams {
  /** 关键词 */
  keyword?: string
  /** 流派 */
  genre?: string
  /** 年份 */
  year?: number
  /** 排序方式 */
  sortBy?: 'releaseDate' | 'rating' | 'popular'
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

