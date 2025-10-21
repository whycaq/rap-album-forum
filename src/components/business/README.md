# 业务组件

本目录包含项目特定的业务组件。

## 组件列表

### AlbumCard
专辑卡片组件，用于展示专辑信息。

**Props:**
- `album`: 专辑信息对象
- `showRating`: 是否显示评分（默认true）
- `showDate`: 是否显示发行日期（默认false）

**Events:**
- `click`: 点击卡片时触发，参数为专辑ID

**Slots:**
- `overlay`: 覆盖层内容（默认显示播放图标）
- `badge`: 角标内容（如"热门"、"新品"等）
- `extra`: 额外信息区域

**使用示例:**
```vue
<AlbumCard 
  :album="albumData" 
  show-date
  @click="goToAlbumDetail"
>
  <template #badge>
    <span class="hot-badge">🔥</span>
  </template>
  <template #extra>
    <div>收藏数: {{ albumData.favoriteCount }}</div>
  </template>
</AlbumCard>
```

## 开发规范

### 组件职责
- 每个组件只负责一个明确的业务功能
- 复杂组件应拆分为多个小组件
- 避免组件过度耦合

### 数据传递
- 使用Props进行父子组件数据传递
- 不要直接修改Props
- 使用Emits向父组件发送事件

### 样式规范
- 使用scoped避免样式污染
- 使用BEM命名规范
- 提供主题定制能力

### 性能优化
- 合理使用v-if和v-show
- 图片懒加载
- 避免不必要的重渲染

## 待开发组件

- [ ] CommentList - 评论列表
- [ ] CommentItem - 评论项
- [ ] MusicPlayer - 音乐播放器
- [ ] PostCard - 帖子卡片
- [ ] UserAvatar - 用户头像
- [ ] RatingStars - 评分星星
- [ ] SearchBar - 搜索栏
- [ ] ForumCategory - 论坛分类

