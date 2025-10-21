<template>
  <div class="album-card" @click="handleClick">
    <!-- 封面区域 -->
    <div class="album-card__cover">
      <img
        :src="album.coverUrl"
        :alt="album.title"
        class="cover-image"
        @error="handleImageError"
      />
      <div class="album-card__overlay">
        <slot name="overlay">
          <el-icon class="play-icon" :size="48">
            <VideoPlay />
          </el-icon>
        </slot>
      </div>
      <!-- 角标插槽 -->
      <div v-if="$slots.badge" class="album-card__badge">
        <slot name="badge" />
      </div>
    </div>

    <!-- 信息区域 -->
    <div class="album-card__info">
      <h4 class="album-card__title" :title="album.title">
        {{ album.title }}
      </h4>
      <p class="album-card__artist" :title="album.artist">
        {{ album.artist }}
      </p>
      <div class="album-card__meta">
        <el-rate
          v-model="album.rating"
          disabled
          :show-score="showRating"
          text-color="#ff9900"
        />
        <span v-if="showDate" class="release-date">
          {{ formatDate(album.releaseDate) }}
        </span>
      </div>
      <!-- 额外信息插槽 -->
      <div v-if="$slots.extra" class="album-card__extra">
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 专辑卡片组件
 * 
 * @description 展示专辑的封面、标题、艺人等信息
 * 
 * Props:
 * - album: 专辑信息对象
 * - showRating: 是否显示评分
 * - showDate: 是否显示发行日期
 * 
 * Emits:
 * - click: 点击卡片时触发，参数为专辑ID
 * 
 * Slots:
 * - overlay: 覆盖层内容（默认显示播放图标）
 * - badge: 角标内容（如"热门"、"新品"等）
 * - extra: 额外信息区域
 * 
 * @example
 * ```vue
 * <AlbumCard :album="albumData" @click="handleAlbumClick">
 *   <template #badge>
 *     <span class="hot-badge">🔥 热门</span>
 *   </template>
 * </AlbumCard>
 * ```
 */

import { VideoPlay } from '@element-plus/icons-vue'
import type { Album } from '@/types/album'

interface Props {
  /** 专辑信息 */
  album: Album
  /** 是否显示评分 */
  showRating?: boolean
  /** 是否显示发行日期 */
  showDate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRating: true,
  showDate: false,
})

interface Emits {
  /** 点击卡片事件 */
  (e: 'click', albumId: string): void
}

const emit = defineEmits<Emits>()

/**
 * 处理点击事件
 */
function handleClick() {
  emit('click', props.album.id)
}

/**
 * 处理图片加载失败
 */
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder.png' // 替换为默认图片
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.getFullYear().toString()
}
</script>

<style lang="scss" scoped>
.album-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .album-card__overlay {
      opacity: 1;
    }
  }

  &__cover {
    position: relative;
    width: 100%;
    padding-top: 100%; // 1:1 宽高比
    overflow: hidden;
    background-color: #f5f5f5;

    .cover-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;

    .play-icon {
      color: #fff;
    }
  }

  &__badge {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
  }

  &__info {
    padding: 16px;
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__artist {
    font-size: 14px;
    color: #666;
    margin: 0 0 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    .release-date {
      font-size: 12px;
      color: #999;
    }
  }

  &__extra {
    margin-top: 12px;
  }
}
</style>

