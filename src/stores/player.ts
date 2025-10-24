/**
 * 全局音频播放器状态管理
 * 确保整个应用只有一个音频播放器实例
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Song, Album } from '@/types/album'
import { ElMessage } from 'element-plus'

export const usePlayerStore = defineStore('player', () => {
  // 音频播放器实例（全局唯一）
  const audioPlayer = ref<HTMLAudioElement | null>(null)
  
  // 当前播放状态
  const currentSong = ref<Song | null>(null)
  const currentAlbum = ref<Album | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const progress = ref(0)
  
  // 播放列表
  const playlist = ref<Song[]>([])
  const currentIndex = ref(0)

  /**
   * 初始化音频播放器
   */
  function initPlayer() {
    if (audioPlayer.value) return
    
    audioPlayer.value = new Audio()
    
    // 监听音频事件
    audioPlayer.value.addEventListener('loadedmetadata', () => {
      duration.value = audioPlayer.value?.duration || 0
    })
    
    audioPlayer.value.addEventListener('timeupdate', () => {
      currentTime.value = audioPlayer.value?.currentTime || 0
      progress.value = duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
    })
    
    audioPlayer.value.addEventListener('ended', () => {
      playNext()
    })
    
    audioPlayer.value.addEventListener('error', (e) => {
      console.error('音频播放错误:', e)
      ElMessage.error('音频播放失败')
      isPlaying.value = false
    })
    
    console.log('✅ 全局音频播放器已初始化')
  }

  /**
   * 播放歌曲
   */
  async function play(song: Song, album: Album, songs: Song[] = [], index: number = 0) {
    // 确保播放器已初始化
    if (!audioPlayer.value) {
      initPlayer()
    }
    
    if (!song.audioUrl) {
      ElMessage.warning('该歌曲暂无音频')
      return
    }
    
    // 更新当前播放信息
    currentSong.value = song
    currentAlbum.value = album
    playlist.value = songs
    currentIndex.value = index
    
    // 设置音频源
    if (audioPlayer.value) {
      audioPlayer.value.src = song.audioUrl
      audioPlayer.value.load()
      
      try {
        await audioPlayer.value.play()
        isPlaying.value = true
        console.log('🎵 正在播放:', song.title)
        ElMessage.success(`正在播放: ${song.title}`)
      } catch (error) {
        console.error('播放失败:', error)
        ElMessage.error('播放失败')
        isPlaying.value = false
      }
    }
  }

  /**
   * 暂停播放
   */
  function pause() {
    if (audioPlayer.value) {
      audioPlayer.value.pause()
      isPlaying.value = false
    }
  }

  /**
   * 继续播放
   */
  async function resume() {
    if (audioPlayer.value && currentSong.value) {
      try {
        await audioPlayer.value.play()
        isPlaying.value = true
      } catch (error) {
        console.error('继续播放失败:', error)
      }
    }
  }

  /**
   * 切换播放/暂停
   */
  function toggle() {
    if (isPlaying.value) {
      pause()
    } else {
      resume()
    }
  }

  /**
   * 播放下一首
   */
  function playNext() {
    if (playlist.value.length === 0 || !currentAlbum.value) {
      isPlaying.value = false
      return
    }
    
    const nextIndex = (currentIndex.value + 1) % playlist.value.length
    const nextSong = playlist.value[nextIndex]
    
    if (nextSong) {
      play(nextSong, currentAlbum.value, playlist.value, nextIndex)
    }
  }

  /**
   * 播放上一首
   */
  function playPrev() {
    if (playlist.value.length === 0 || !currentAlbum.value) {
      return
    }
    
    const prevIndex = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
    const prevSong = playlist.value[prevIndex]
    
    if (prevSong) {
      play(prevSong, currentAlbum.value, playlist.value, prevIndex)
    }
  }

  /**
   * 停止播放并清空状态
   */
  function stop() {
    if (audioPlayer.value) {
      audioPlayer.value.pause()
      audioPlayer.value.currentTime = 0
    }
    isPlaying.value = false
    currentTime.value = 0
    progress.value = 0
  }

  /**
   * 跳转到指定时间
   */
  function seek(time: number) {
    if (audioPlayer.value) {
      audioPlayer.value.currentTime = time
    }
  }

  /**
   * 格式化时间
   */
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 计算属性
  const hasCurrentSong = computed(() => currentSong.value !== null)
  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  return {
    // 状态
    audioPlayer,
    currentSong,
    currentAlbum,
    isPlaying,
    currentTime,
    duration,
    progress,
    playlist,
    currentIndex,
    
    // 计算属性
    hasCurrentSong,
    formattedCurrentTime,
    formattedDuration,
    
    // 方法
    initPlayer,
    play,
    pause,
    resume,
    toggle,
    playNext,
    playPrev,
    stop,
    seek,
    formatTime
  }
})

