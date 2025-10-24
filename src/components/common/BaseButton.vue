<template>
  <button
    :class="[
      'base-button',
      `base-button--${type}`,
      `base-button--${size}`,
      {
        'is-disabled': disabled,
        'is-loading': loading,
        'is-round': round,
        'is-plain': plain,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-icon">⏳</span>
    <slot name="icon" />
    <span v-if="$slots.default" class="button-text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
/**
 * 基础按钮组件
 * 
 * @description 统一的按钮样式和交互
 * 
 * @example
 * ```vue
 * <BaseButton type="primary" @click="handleClick">
 *   点击我
 * </BaseButton>
 * ```
 */

interface Props {
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 是否圆角 */
  round?: boolean
  /** 是否朴素按钮 */
  plain?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false,
  round: false,
  plain: false,
})

interface Emits {
  /** 点击事件 */
  (e: 'click', event: MouseEvent): void
}

const emit = defineEmits<Emits>()

/**
 * 处理点击事件
 */
function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(.is-disabled):not(.is-loading) {
    opacity: 0.8;
  }

  &:active:not(.is-disabled):not(.is-loading) {
    transform: translateY(1px);
  }

  &.is-disabled,
  &.is-loading {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.is-round {
    border-radius: 20px;
  }

  // 类型样式
  &--primary {
    background-color: #73BA9B;
    border-color: #73BA9B;
    color: #fff;

    &.is-plain {
      background-color: rgba(115, 186, 155, 0.1);
      border-color: rgba(115, 186, 155, 0.3);
      color: #73BA9B;
    }
  }

  &--success {
    background-color: #52c41a;
    border-color: #52c41a;
    color: #fff;

    &.is-plain {
      background-color: #f6ffed;
      border-color: #b7eb8f;
      color: #52c41a;
    }
  }

  &--warning {
    background-color: #faad14;
    border-color: #faad14;
    color: #fff;

    &.is-plain {
      background-color: #fffbe6;
      border-color: #ffe58f;
      color: #faad14;
    }
  }

  &--danger {
    background-color: #f5222d;
    border-color: #f5222d;
    color: #fff;

    &.is-plain {
      background-color: #fff1f0;
      border-color: #ffa39e;
      color: #f5222d;
    }
  }

  // 尺寸样式
  &--small {
    padding: 4px 12px;
    font-size: 12px;
  }

  &--large {
    padding: 12px 20px;
    font-size: 16px;
  }
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

