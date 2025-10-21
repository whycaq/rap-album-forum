# Spotify API 集成指南

## 🎵 如何获取真实的专辑封面和音乐数据

### 1. 注册 Spotify Developer 账号
1. 访问 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. 使用您的 Spotify 账号登录
3. 创建一个新的应用程序

### 2. 获取 API 凭据
1. 在 Dashboard 中点击您的应用程序
2. 复制以下信息：
   - **Client ID**
   - **Client Secret**

### 3. 配置环境变量
1. 复制 `.env.example` 文件为 `.env`
2. 填入您的 Spotify API 凭据：

```env
# Spotify API配置
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Supabase配置
VITE_SUPABASE_URL=https://kpaeljhvwqqqydrtltyj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aGhlb2R6bGpobHFyYmVzc3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjgzMzEsImV4cCI6MjA3NjA0NDMzMX0.gsgBpGhF6wNdmiOOd8B7H_74WoZIzLBCsluROMq1TAw
```

### 4. 功能特性
✅ **真实的专辑封面** - 从 Spotify 获取高质量图片  
✅ **完整的专辑信息** - 艺人、发行日期、流派等  
✅ **歌曲试听功能** - 30秒预览音频  
✅ **自动回退机制** - API 失败时使用模拟数据  

### 5. 支持的搜索关键词
- "hip hop" - 嘻哈音乐
- "rap" - 说唱音乐  
- 艺人名称（如 "Kendrick Lamar"）
- 专辑名称（如 "To Pimp a Butterfly"）

### 6. 数据来源对比
| 功能 | 模拟数据 | Spotify API |
|------|----------|-------------|
| 专辑封面 | 占位图片 | 真实高质量图片 |
| 音频播放 | 模拟播放 | 真实30秒试听 |
| 专辑信息 | 固定数据 | 实时音乐数据 |
| 艺人信息 | 手动输入 | 官方艺人数据 |

### 7. 下一步操作
1. 获取 Spotify API 凭据
2. 配置环境变量
3. 重启开发服务器
4. 享受真实的音乐体验！

## 🔧 故障排除
- **API 错误**: 检查环境变量是否正确配置
- **网络问题**: 确保可以访问 Spotify API
- **配额限制**: 免费账户有 API 调用限制