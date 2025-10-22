# 🎵 Rap Album Forum - 说唱音乐专辑论坛

一个现代化的说唱音乐专辑论坛网站，采用 **Vue 3 + TypeScript + Vite + Supabase** 全栈技术开发。

## ✨ 项目特色

- 🎵 **极简专辑浏览体验** - 深蓝色主题，专辑轮播展示
- 🎧 **真实音频播放** - 支持从 Supabase 加载并播放音频
- 🗄️ **Supabase 后端** - 完整的数据库支持，真实数据存储
- 🔐 **用户认证系统** - 使用 Supabase Auth 的完整登录注册
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **现代技术栈** - Vue 3 Composition API + TypeScript + Vite
- 🎨 **精美UI设计** - 现代化界面，流畅的动画效果

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0
- Supabase 账号（免费）

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/whycaq/rap-album-forum.git
cd rap-album-forum
npm install
```

#### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# Supabase 配置（需要替换为你自己的）
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_API_BASE_URL=你的Supabase项目URL

# 可选：网易云音乐API（用于导入数据）
VITE_NETEASE_API_URL=http://localhost:3000
```

> 📌 **获取 Supabase 配置**：
> 1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
> 2. 创建新项目或选择现有项目
> 3. 在 Settings → API 中找到 URL 和 anon key

#### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看网站

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

### 核心文档（必读）⭐

```
├── 📄 README.md                    # 项目说明和快速开始
├── 📄 需求文档.md                  # 功能需求文档
├── 📄 开发指南.md                  # 开发规范和最佳实践
├── 📄 Spotify快速开始指南.md       # Spotify API配置教程
├── 📄 supabase_schema.sql          # 数据库建表脚本（已执行）
└── 📄 supabase_test_data.sql       # 测试数据脚本（可选）
```

### 代码目录结构

```
src/
├── services/      # ⭐ Spotify服务、资源缓存
├── composables/   # ⭐ 音频播放器、请求等Hook
├── utils/         # ⭐ Supabase客户端配置
├── views/
│   └── Admin/     # ⭐ Spotify导入管理界面
├── api/           # API接口层
├── components/    # 公共组件
├── stores/        # 状态管理
├── types/         # TypeScript类型
└── router/        # 路由配置
```

### 其他文档（可选阅读）

数据库和架构的详细文档，深入了解时查阅：
- 数据库架构总结.md
- Supabase配置指南.md  
- 架构优化说明.md
- 等...

## 🎯 核心功能

### ✅ 已实现功能

#### 核心功能
- 🎵 **首页专辑展示** - 从 Supabase 加载真实专辑数据
- 🎧 **音频播放器** - 支持播放、暂停、上一首、下一首
- 🔄 **自动切换** - 点击专辑或箭头自动切换并播放
- 📱 **响应式设计** - 完美适配桌面端和移动端

#### 用户系统
- 🔐 **注册功能** - 用户名、邮箱、密码注册
- 🔑 **登录功能** - 支持用户名或邮箱登录
- 💾 **状态持久化** - 自动保持登录状态
- 🛡️ **路由守卫** - 受保护页面需要登录

#### 数据管理
- 🗄️ **Supabase 集成** - 完整的后端数据库支持
- 📀 **专辑管理** - 从数据库读取专辑和歌曲
- 🎵 **音频URL** - 支持真实音频文件播放

### 🎮 功能演示

1. **首页浏览**
   - 访问首页自动加载并播放中间的专辑
   - 点击左右箭头切换专辑
   - 点击任意专辑封面切换到该专辑并播放

2. **用户注册/登录**
   - 访问 `/register` 注册新账号
   - 访问 `/login` 登录
   - 密码要求：8位+大小写字母+数字（如 `Test1234`）

3. **音频播放**
   - 在 Supabase 中为歌曲添加 `audio_url`
   - 首页自动加载并播放该音频
   - 支持播放控制和进度显示

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

## 📦 技术栈

### 前端框架
- **Vue 3.3+** - 渐进式JavaScript框架
- **TypeScript 5.0+** - 类型安全
- **Vite 5.0+** - 下一代前端构建工具

### UI & 样式
- **Element Plus** - Vue 3 UI组件库
- **SCSS** - CSS预处理器
- **响应式设计** - 移动端适配

### 状态管理
- **Pinia** - Vue 官方状态管理库
- **Composition API** - 逻辑复用

### 后端服务
- **Supabase** - 开源 Firebase 替代品
  - PostgreSQL 数据库
  - Auth 认证系统
  - 实时订阅
  - Storage 文件存储
  - Row Level Security (RLS)

### 开发工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查

## 🗄️ 数据库架构

项目使用 **Supabase (PostgreSQL)** 作为后端数据库。

### 核心数据表

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `users` | 用户信息 | id, username, email, auth_id, role |
| `albums` | 专辑信息 | id, title, artist, cover_url, rating |
| `songs` | 歌曲信息 | id, album_id, title, audio_url, duration |
| `album_ratings` | 专辑评分 | user_id, album_id, score |
| `album_comments` | 专辑评论 | id, user_id, album_id, content |
| `forum_categories` | 论坛版块 | id, name, description |
| `posts` | 论坛帖子 | id, user_id, category_id, title, content |
| `post_replies` | 帖子回复 | id, post_id, user_id, content |
| `favorites` | 用户收藏 | user_id, album_id |
| `notifications` | 通知消息 | id, user_id, type, content |

### 关键特性
- ✅ **Row Level Security (RLS)** - 细粒度权限控制
- ✅ **自动触发器** - 自动更新评分、统计等
- ✅ **外键约束** - 保证数据完整性
- ✅ **索引优化** - 提升查询性能
- ✅ **Auth 集成** - users 表通过 auth_id 关联到 Supabase Auth

### 配置数据库

数据库 schema 可以在 Supabase SQL Editor 中执行，包含：
- 表结构定义
- RLS 策略
- 触发器和函数
- 索引优化

## 🔧 开发指南

### 项目结构

```
src/
├── api/              # API 接口封装
│   ├── album.ts      # 专辑相关API
│   ├── user.ts       # 用户认证API
│   ├── request.ts    # HTTP请求封装
│   └── ...
├── components/       # 公共组件
├── composables/      # 组合式函数
│   ├── useAudioPlayer.ts  # 音频播放Hook
│   └── ...
├── services/         # 业务服务层
├── stores/           # Pinia状态管理
│   ├── user.ts       # 用户状态
│   ├── album.ts      # 专辑状态
│   └── ...
├── types/            # TypeScript类型定义
├── utils/            # 工具函数
│   └── supabase.ts   # Supabase客户端
├── views/            # 页面组件
│   ├── Home/         # 首页
│   ├── User/         # 用户相关（登录/注册）
│   ├── Album/        # 专辑相关
│   ├── Admin/        # 管理后台
│   └── ...
└── router/           # 路由配置
```

### 添加新功能

1. **添加新API**：在 `src/api/` 中创建对应的 API 文件
2. **添加状态管理**：在 `src/stores/` 中创建 Pinia store
3. **添加类型定义**：在 `src/types/` 中定义 TypeScript 类型
4. **创建页面组件**：在 `src/views/` 中创建 Vue 组件
5. **配置路由**：在 `src/router/index.ts` 中添加路由

### 代码规范

- 使用 TypeScript 严格模式
- 组件采用 `<script setup>` 语法
- 使用 Composition API
- Props 和 Emits 需要类型定义
- 遵循 ESLint 规则

## 🚧 开发路线图

### ✅ 已完成
- [x] 项目基础架构
- [x] Supabase 集成
- [x] 用户认证系统
- [x] 专辑展示和播放
- [x] 音频播放器

### 🚀 进行中
- [ ] 专辑详情页面
- [ ] 用户个人主页
- [ ] 管理后台完善

### 📅 计划中
- [ ] 论坛功能实现
- [ ] 搜索功能
- [ ] 评论系统
- [ ] 收藏功能
- [ ] 社交分享

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交 Issue
- 描述问题或建议
- 提供复现步骤
- 附上截图（如果可能）

### 提交 Pull Request
1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Supabase](https://supabase.com/) - 开源后端服务
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vite](https://vitejs.dev/) - 下一代前端工具

## 📞 联系方式

- **GitHub Issues**: [https://github.com/whycaq/rap-album-forum/issues](https://github.com/whycaq/rap-album-forum/issues)
- **项目主页**: [https://github.com/whycaq/rap-album-forum](https://github.com/whycaq/rap-album-forum)

---

**⭐ 如果这个项目对你有帮助，欢迎给个 Star！**

**开发说明**: 本项目采用 AI 辅助开发，遵循 Vue 3 和 TypeScript 最佳实践。