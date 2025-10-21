# 通用组件

本目录包含项目中可复用的基础通用组件。

## 组件列表

### BaseButton
基础按钮组件，提供统一的按钮样式和交互。

**Props:**
- `type`: 按钮类型（default | primary | success | warning | danger）
- `size`: 按钮尺寸（small | medium | large）
- `disabled`: 是否禁用
- `loading`: 是否加载中
- `round`: 是否圆角
- `plain`: 是否朴素按钮

**Events:**
- `click`: 点击事件

**Slots:**
- `default`: 按钮文本
- `icon`: 图标插槽

**使用示例:**
```vue
<BaseButton type="primary" size="large" @click="handleClick">
  提交
</BaseButton>

<BaseButton type="danger" :loading="loading">
  <template #icon>
    <el-icon><Delete /></el-icon>
  </template>
  删除
</BaseButton>
```

## 开发规范

### 组件命名
- 使用PascalCase命名（如：BaseButton、FormInput）
- 以Base前缀表示基础组件

### 组件结构
```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
/**
 * 组件说明文档
 * 
 * @description 组件功能描述
 * 
 * Props: 属性说明
 * Emits: 事件说明
 * Slots: 插槽说明
 * 
 * @example 使用示例
 */

// Props定义
interface Props {
  // ...
}

// Emits定义
interface Emits {
  // ...
}
</script>

<style lang="scss" scoped>
/* 样式 */
</style>
```

### TypeScript类型
- 所有Props必须定义完整的类型
- 所有Emits必须定义事件签名
- 提供合理的默认值

### 文档注释
- 每个组件必须有完整的JSDoc注释
- 说明Props、Emits、Slots的用途
- 提供使用示例

### 可访问性
- 添加适当的ARIA属性
- 支持键盘操作
- 考虑屏幕阅读器

## 待开发组件

- [ ] BaseInput - 输入框
- [ ] BaseSelect - 选择器
- [ ] BaseDialog - 对话框
- [ ] BaseTabs - 标签页
- [ ] BaseTable - 表格
- [ ] BasePagination - 分页
- [ ] BaseLoading - 加载中
- [ ] BaseEmpty - 空状态

