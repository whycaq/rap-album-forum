# Rap Album Forum - 说唱音乐专辑论坛

一个现代化的说唱音乐专辑论坛网站，采用Vue 3 + TypeScript + Vite技术栈开发。

## ✨ 项目特色

- 🎵 **极简专辑浏览体验** - 深蓝色主题，左右滚动专辑封面
- 🎧 **在线试听功能** - 支持专辑歌曲播放和切换
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **现代技术栈** - Vue 3 + TypeScript + Vite + Element Plus
- 🎨 **精美UI设计** - 现代化界面，流畅的动画效果

## 🚀 快速开始

### ⚡ 3分钟快速启动

**数据库已配置完成！** 只需3步即可开始开发：

1. **创建 `.env` 文件** - 复制以下内容到项目根目录的 `.env` 文件：
```bash
VITE_SUPABASE_URL=https://kpaeljhvwqqqydrtltyj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwYWVsamh2d3FxcXlkcnRsdHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5OTA4NDUsImV4cCI6MjA3NjU2Njg0NX0.Uj-8-8m3OER0KkWkqL3GqoCLiOZr5acqWmzG35k6kUM
VITE_API_BASE_URL=https://kpaeljhvwqqqydrtltyj.supabase.co
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **开始开发** - 打开 http://localhost:5173 即可！

📖 **详细指南**: 查看 [快速开始.md](./快速开始.md) 和 [SUPABASE_CONFIG.md](./SUPABASE_CONFIG.md)

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 其他命令

#### 构建生产版本
```bash
npm run build
```

#### 预览生产构建
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── api/           # API接口层
├── components/    # 公共组件
├── composables/   # 组合式函数
├── router/        # 路由配置
├── stores/        # 状态管理
├── types/         # TypeScript类型
├── utils/         # 工具函数
├── views/         # 页面组件
└── assets/        # 静态资源
```

## 🎯 核心功能

### 已实现功能

- ✅ **极简首页设计** - 深蓝色主题，三张专辑封面轮播
- ✅ **专辑浏览** - 左右切换，中间专辑突出显示
- ✅ **音乐播放** - 播放控制，进度显示
- ✅ **用户认证** - 登录/注册界面
- ✅ **响应式布局** - 适配不同屏幕尺寸

### 技术特性

- **Vue 3 Composition API** - 现代化的组件开发方式
- **TypeScript支持** - 完整的类型安全
- **Pinia状态管理** - 轻量级的状态管理方案
- **Element Plus UI** - 丰富的UI组件库
- **SCSS样式预处理器** - 强大的样式管理

## 🎨 界面预览

### 首页特色
- 深蓝色渐变背景 (#0a1929 → #1a3658)
- 左右滚动专辑封面展示
- 三张封面布局（左中右）
- 中间专辑突出显示并支持播放
- 底部播放控制栏

### 交互功能
- 点击左右按钮切换专辑
- 点击中间专辑开始播放
- 播放/暂停控制
- 上一首/下一首切换

## 🔧 开发规范

### 代码规范
- 使用ESLint + Prettier进行代码格式化
- TypeScript严格模式
- 组件采用PascalCase命名
- 函数采用camelCase命名

### 组件开发
- 使用`<script setup>`语法糖
- 合理使用Composition API
- 组件单一职责原则
- 类型安全的Props定义

## 📦 依赖说明

### 核心依赖
- `vue` - Vue 3框架
- `vue-router` - 路由管理
- `pinia` - 状态管理
- `element-plus` - UI组件库
- `axios` - HTTP客户端
- `@supabase/supabase-js` - Supabase 客户端

### 开发依赖
- `typescript` - TypeScript支持
- `vite` - 构建工具
- `sass` - CSS预处理器
- `eslint` - 代码检查

## 🗄️ 数据库架构

项目使用 **Supabase (PostgreSQL)** 作为后端数据库。

### 数据表
- **users** - 用户信息
- **albums** - 专辑信息
- **songs** - 歌曲信息
- **album_ratings** - 专辑评分
- **album_comments** - 专辑评论
- **forum_categories** - 论坛版块
- **posts** - 论坛帖子
- **post_replies** - 帖子回复
- **favorites** - 用户收藏
- **notifications** - 通知消息

### 核心特性
- ✅ 自动触发器（更新评分、回复数等）
- ✅ Row Level Security (RLS) 权限控制
- ✅ 全文搜索索引
- ✅ 级联删除和约束检查
- ✅ 性能优化索引

详细架构说明请查看：
- [数据库架构总结.md](./数据库架构总结.md) - 完整的表结构和关系
- [Supabase配置指南.md](./Supabase配置指南.md) - 配置步骤和使用说明

## 🚧 开发计划

### 近期计划
- [ ] 专辑详情页面开发
- [ ] 论坛功能实现
- [ ] 用户个人主页
- [ ] 搜索功能优化

### 长期规划
- [ ] 移动端APP开发
- [ ] 社交分享功能
- [ ] 离线播放支持
- [ ] 多语言支持

## 🤝 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues: [https://github.com/whycaq/rap-album-forum](https://github.com/whycaq/rap-album-forum)

---

**开发说明**: 本项目采用AI辅助开发，遵循现代Web开发最佳实践。