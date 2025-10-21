import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Post, ForumCategory } from '@/types/forum'

/**
 * 论坛状态管理
 * 管理帖子列表、论坛分类等
 */
export const useForumStore = defineStore('forum', () => {
  // 状态
  const postList = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const categories = ref<ForumCategory[]>([])
  const unreadCount = ref<number>(0)

  /**
   * 设置帖子列表
   * @param posts 帖子列表
   */
  function setPostList(posts: Post[]) {
    postList.value = posts
  }

  /**
   * 设置当前帖子
   * @param post 帖子详情
   */
  function setCurrentPost(post: Post) {
    currentPost.value = post
  }

  /**
   * 设置论坛分类
   * @param cats 分类列表
   */
  function setCategories(cats: ForumCategory[]) {
    categories.value = cats
  }

  /**
   * 设置未读消息数
   * @param count 未读数量
   */
  function setUnreadCount(count: number) {
    unreadCount.value = count
  }

  /**
   * 增加帖子回复数
   * @param postId 帖子ID
   */
  function incrementReplyCount(postId: string) {
    const post = postList.value.find(p => p.id === postId)
    if (post) {
      post.replyCount = (post.replyCount || 0) + 1
    }
    if (currentPost.value?.id === postId) {
      currentPost.value.replyCount = (currentPost.value.replyCount || 0) + 1
    }
  }

  /**
   * 更新帖子点赞数
   * @param postId 帖子ID
   * @param delta 变化量 (+1 or -1)
   */
  function updatePostLikes(postId: string, delta: number) {
    const post = postList.value.find(p => p.id === postId)
    if (post) {
      post.likes = (post.likes || 0) + delta
    }
    if (currentPost.value?.id === postId) {
      currentPost.value.likes = (currentPost.value.likes || 0) + delta
    }
  }

  return {
    postList,
    currentPost,
    categories,
    unreadCount,
    setPostList,
    setCurrentPost,
    setCategories,
    setUnreadCount,
    incrementReplyCount,
    updatePostLikes,
  }
})

