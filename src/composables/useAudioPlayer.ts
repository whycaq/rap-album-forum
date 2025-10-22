/**
 * 音频播放器 Composable
 * 用于管理音乐播放状态和控制
 */

import { ref, computed, watch, onUnmounted } from 'vue'
import type { Song } from '@/types/album'
import { NeteaseService } from '@/services/netease.service'

export function useAudioPlayer() {
  // 音频实例
  const audio = ref<HTMLAudioElement | null>(null)
  
  // 状态
  const currentSong = ref<Song | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  /**
   * 初始化音频播放器
   */
  function initAudio() {
    if (audio.value) return
    
    audio.value = new Audio()
    audio.value.volume = volume.value
    
    // 监听事件
    audio.value.addEventListener('loadstart', handleLoadStart)
    audio.value.addEventListener('canplay', handleCanPlay)
    audio.value.addEventListener('timeupdate', handleTimeUpdate)
    audio.value.addEventListener('durationchange', handleDurationChange)
    audio.value.addEventListener('ended', handleEnded)
    audio.value.addEventListener('error', handleError)
    audio.value.addEventListener('play', () => { isPlaying.value = true })
    audio.value.addEventListener('pause', () => { isPlaying.value = false })
  }

  /**
   * 播放歌曲
   */
  async function playSong(song: Song) {
    try {
      initAudio()
      
      isLoading.value = true
      error.value = null
      
      // 如果有音频URL直接播放
      if (song.audioUrl && song.audioUrl.startsWith('http')) {
        await loadAndPlay(song.audioUrl, song)
        return
      }
      
      // 否则从网易云获取URL
      const url = await NeteaseService.getSongUrl(song.id)
      if (!url) {
        error.value = '无法获取播放链接'
        isLoading.value = false
        return
      }
      
      await loadAndPlay(url, song)
    } catch (err) {
      console.error('播放失败:', err)
      error.value = '播放失败'
      isLoading.value = false
    }
  }

  /**
   * 加载并播放音频
   */
  async function loadAndPlay(url: string, song: Song) {
    if (!audio.value) return
    
    audio.value.src = url
    currentSong.value = song
    
    try {
      await audio.value.play()
      isLoading.value = false
    } catch (err) {
      console.error('播放出错:', err)
      error.value = '播放出错'
      isLoading.value = false
    }
  }

  /**
   * 播放/暂停切换
   */
  function togglePlay() {
    if (!audio.value || !currentSong.value) return
    
    if (isPlaying.value) {
      audio.value.pause()
    } else {
      audio.value.play().catch(err => {
        console.error('播放失败:', err)
        error.value = '播放失败'
      })
    }
  }

  /**
   * 暂停
   */
  function pause() {
    if (audio.value) {
      audio.value.pause()
    }
  }

  /**
   * 继续播放
   */
  function play() {
    if (audio.value && currentSong.value) {
      audio.value.play().catch(err => {
        console.error('播放失败:', err)
        error.value = '播放失败'
      })
    }
  }

  /**
   * 停止播放
   */
  function stop() {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
    }
    currentSong.value = null
  }

  /**
   * 跳转到指定时间
   */
  function seek(time: number) {
    if (audio.value) {
      audio.value.currentTime = time
    }
  }

  /**
   * 设置音量
   */
  function setVolume(vol: number) {
    volume.value = Math.max(0, Math.min(1, vol))
    if (audio.value) {
      audio.value.volume = volume.value
    }
  }

  /**
   * 静音/取消静音
   */
  function toggleMute() {
    if (audio.value) {
      audio.value.muted = !audio.value.muted
    }
  }

  // 事件处理
  function handleLoadStart() {
    isLoading.value = true
  }

  function handleCanPlay() {
    isLoading.value = false
  }

  function handleTimeUpdate() {
    if (audio.value) {
      currentTime.value = audio.value.currentTime
    }
  }

  function handleDurationChange() {
    if (audio.value) {
      duration.value = audio.value.duration || 0
    }
  }

  function handleEnded() {
    isPlaying.value = false
    currentTime.value = 0
  }

  function handleError(e: Event) {
    console.error('音频加载错误:', e)
    error.value = '音频加载失败'
    isLoading.value = false
  }

  /**
   * 格式化时间
   */
  function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00'
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 监听音量变化
  watch(volume, (newVol) => {
    if (audio.value) {
      audio.value.volume = newVol
    }
  })

  // 组件卸载时清理
  onUnmounted(() => {
    if (audio.value) {
      audio.value.pause()
      audio.value.src = ''
      audio.value.removeEventListener('loadstart', handleLoadStart)
      audio.value.removeEventListener('canplay', handleCanPlay)
      audio.value.removeEventListener('timeupdate', handleTimeUpdate)
      audio.value.removeEventListener('durationchange', handleDurationChange)
      audio.value.removeEventListener('ended', handleEnded)
      audio.value.removeEventListener('error', handleError)
      audio.value = null
    }
  })

  return {
    // 状态
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    progress,
    formattedCurrentTime,
    formattedDuration,
    
    // 方法
    playSong,
    togglePlay,
    pause,
    play,
    stop,
    seek,
    setVolume,
    toggleMute,
  }
}

