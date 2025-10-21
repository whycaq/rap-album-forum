import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Album, AlbumDetail } from '@/types/album'

/**
 * 专辑状态管理
 * 管理专辑列表、当前播放专辑等
 */
export const useAlbumStore = defineStore('album', () => {
  // 状态
  const albumList = ref<Album[]>([])
  const currentAlbum = ref<AlbumDetail | null>(null)
  const currentPlayingSong = ref<string | null>(null)
  const favorites = ref<string[]>([]) // 收藏的专辑ID列表

  /**
   * 设置专辑列表
   * @param albums 专辑列表
   */
  function setAlbumList(albums: Album[]) {
    albumList.value = albums
  }

  /**
   * 设置当前专辑详情
   * @param album 专辑详情
   */
  function setCurrentAlbum(album: AlbumDetail) {
    currentAlbum.value = album
  }

  /**
   * 设置当前播放的歌曲
   * @param songId 歌曲ID
   */
  function setCurrentPlayingSong(songId: string | null) {
    currentPlayingSong.value = songId
  }

  /**
   * 添加到收藏
   * @param albumId 专辑ID
   */
  function addToFavorites(albumId: string) {
    if (!favorites.value.includes(albumId)) {
      favorites.value.push(albumId)
      saveFavoritesToStorage()
    }
  }

  /**
   * 从收藏移除
   * @param albumId 专辑ID
   */
  function removeFromFavorites(albumId: string) {
    const index = favorites.value.indexOf(albumId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavoritesToStorage()
    }
  }

  /**
   * 检查是否已收藏
   * @param albumId 专辑ID
   */
  function isFavorite(albumId: string): boolean {
    return favorites.value.includes(albumId)
  }

  /**
   * 保存收藏列表到本地存储
   */
  function saveFavoritesToStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  /**
   * 从本地存储加载收藏列表
   */
  function loadFavoritesFromStorage() {
    const stored = localStorage.getItem('favorites')
    if (stored) {
      try {
        favorites.value = JSON.parse(stored)
      } catch (error) {
        console.error('解析收藏列表失败:', error)
        favorites.value = []
      }
    }
  }

  return {
    albumList,
    currentAlbum,
    currentPlayingSong,
    favorites,
    setAlbumList,
    setCurrentAlbum,
    setCurrentPlayingSong,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    loadFavoritesFromStorage,
  }
})

