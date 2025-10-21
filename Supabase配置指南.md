# Supabase 数据库配置指南

## 📋 概述

本指南将帮助你在 Supabase 上创建说唱专辑论坛网站所需的数据库表。

## 🎯 数据库架构说明

### 数据表结构

项目包含以下10个核心数据表：

1. **users** - 用户信息表
   - 存储用户的基本信息（用户名、邮箱、头像、简介等）
   - 关联到 Supabase Auth 的用户认证系统

2. **albums** - 专辑表
   - 存储说唱专辑的详细信息
   - 包含封面、艺人、发行日期、评分等

3. **songs** - 歌曲表
   - 存储专辑中的歌曲信息
   - 包含歌曲标题、时长、试听链接、歌词等

4. **album_ratings** - 专辑评分表
   - 用户对专辑的评分（1-5星）
   - 每个用户对每个专辑只能评一次分

5. **album_comments** - 专辑评论表
   - 用户对专辑的评论
   - 支持嵌套回复（楼中楼）

6. **forum_categories** - 论坛版块表
   - 论坛的分类版块
   - 已预设5个版块（专辑讨论、歌曲故事、说唱文化、新人推荐、站务公告）

7. **posts** - 帖子表
   - 论坛帖子
   - 支持关联专辑、置顶、精华等功能

8. **post_replies** - 帖子回复表
   - 对帖子的回复
   - 支持楼中楼回复

9. **favorites** - 收藏表
   - 用户收藏的专辑

10. **notifications** - 通知表
    - 用户的消息通知（回复、点赞、系统通知）

### 核心功能特性

✅ **自动触发器**
- 自动更新 `updated_at` 时间戳
- 自动计算专辑平均评分和评分人数
- 自动更新帖子回复数量
- 自动更新专辑歌曲数量

✅ **Row Level Security (RLS)**
- 完整的权限控制策略
- 用户只能修改自己的数据
- 管理员拥有更多权限
- 保护隐私数据（收藏、通知等）

✅ **性能优化**
- 所有表都有合理的索引
- 支持全文搜索（专辑、歌曲、帖子）
- 优化的查询视图

✅ **数据完整性**
- 外键约束确保数据一致性
- CHECK 约束验证数据有效性
- UNIQUE 约束防止重复数据

## 🚀 配置步骤

### 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - **Name**: `rap-album-forum`（或你喜欢的名字）
   - **Database Password**: 设置一个强密码（请妥善保存）
   - **Region**: 选择离你最近的区域（建议选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`）
4. 点击 "Create new project" 并等待项目创建完成（约2分钟）

### 步骤 2: 执行 SQL 脚本

1. 在 Supabase 控制台左侧菜单，点击 "SQL Editor"
2. 点击 "New Query" 创建新查询
3. 打开项目根目录的 `supabase_schema.sql` 文件
4. 复制全部内容
5. 粘贴到 Supabase SQL Editor 中
6. 点击 "Run" 按钮执行脚本
7. 等待执行完成，应该看到成功提示

> ⚠️ **注意**: 脚本执行可能需要几秒钟，请耐心等待。如果出现错误，请查看错误信息并联系技术支持。

### 步骤 3: 验证表创建

1. 在左侧菜单点击 "Table Editor"
2. 应该能看到以下10个表：
   - ✅ users
   - ✅ albums
   - ✅ songs
   - ✅ album_ratings
   - ✅ album_comments
   - ✅ forum_categories
   - ✅ posts
   - ✅ post_replies
   - ✅ favorites
   - ✅ notifications

3. 点击任意表，可以查看表结构和数据

### 步骤 4: 检查初始数据

1. 在 "Table Editor" 中点击 `forum_categories` 表
2. 应该能看到5条预设的论坛版块数据：
   - 专辑讨论 🎵
   - 歌曲故事 📖
   - 说唱文化 🎤
   - 新人推荐 ⭐
   - 站务公告 📢

### 步骤 5: 获取 API 凭证

1. 在左侧菜单点击 "Project Settings" → "API"
2. 记录以下信息：
   - **Project URL**: 你的项目API地址
   - **anon public key**: 公开API密钥
   - **service_role key**: 服务端API密钥（请妥善保存，不要泄露）

### 步骤 6: 配置项目环境变量

1. 在项目根目录创建 `.env` 文件（如果不存在）：

```bash
# Supabase 配置
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的anon_public_key

# API Base URL
VITE_API_BASE_URL=你的项目URL
```

2. 将步骤5中获取的信息填入相应位置

### 步骤 7: 配置认证设置

1. 在左侧菜单点击 "Authentication" → "Providers"
2. 配置邮箱认证（默认已启用）
3. 可选：配置第三方登录（Google, GitHub等）

## 📊 数据关系图

```
users (用户)
  ├─→ album_ratings (评分)
  ├─→ album_comments (评论)
  ├─→ posts (帖子)
  ├─→ post_replies (回复)
  ├─→ favorites (收藏)
  └─→ notifications (通知)

albums (专辑)
  ├─→ songs (歌曲)
  ├─→ album_ratings (评分)
  ├─→ album_comments (评论)
  ├─→ favorites (收藏)
  └─→ posts.related_album_id (关联帖子)

forum_categories (版块)
  └─→ posts (帖子)

posts (帖子)
  └─→ post_replies (回复)

album_comments (评论)
  └─→ album_comments.parent_id (子评论)

post_replies (回复)
  └─→ post_replies.parent_id (子回复)
```

## 🔐 权限说明

### 普通用户权限

- ✅ 查看所有公开内容（专辑、歌曲、帖子、评论）
- ✅ 发表评论和回复
- ✅ 对专辑评分
- ✅ 收藏专辑
- ✅ 发布和管理自己的帖子
- ✅ 修改自己的个人信息
- ✅ 查看和管理自己的通知
- ❌ 不能修改别人的内容
- ❌ 不能管理专辑和歌曲

### 管理员权限

- ✅ 所有普通用户权限
- ✅ 添加、编辑、删除专辑和歌曲
- ✅ 管理论坛版块
- ✅ 删除任何不当内容（评论、帖子、回复）
- ✅ 置顶和加精帖子
- ✅ 管理用户（禁用、解禁等）

## 🛠️ 常用 SQL 查询

### 获取热门专辑（按评分）

```sql
SELECT * FROM albums 
WHERE rating_count >= 10 
ORDER BY rating DESC, rating_count DESC 
LIMIT 10;
```

### 获取最新发布的专辑

```sql
SELECT * FROM albums 
ORDER BY release_date DESC 
LIMIT 20;
```

### 获取用户的所有收藏

```sql
SELECT a.* 
FROM favorites f
JOIN albums a ON f.album_id = a.id
WHERE f.user_id = '用户ID'
ORDER BY f.created_at DESC;
```

### 获取帖子及其回复数

```sql
SELECT p.*, u.username, u.avatar as user_avatar, fc.name as category_name
FROM posts p
JOIN users u ON p.user_id = u.id
JOIN forum_categories fc ON p.category_id = fc.id
ORDER BY p.created_at DESC;
```

### 搜索专辑（使用函数）

```sql
SELECT * FROM search_albums(
    search_query := '专辑名或艺人名',
    genre_filter := NULL,
    year_filter := 2023,
    sort_by := 'rating',
    page_num := 1,
    page_size := 20
);
```

## 🧪 测试数据

### 创建测试用户（通过 Supabase Auth）

在 Supabase Dashboard:
1. 点击 "Authentication" → "Users"
2. 点击 "Add user" → "Create new user"
3. 填写邮箱和密码
4. 用户创建后，需要在 `public.users` 表中添加对应记录

### 插入测试专辑

```sql
-- 插入测试专辑
INSERT INTO public.albums (title, artist, cover_url, release_date, genre, description, rating, rating_count) VALUES
('The Eminem Show', 'Eminem', 'https://example.com/eminem-show.jpg', '2002-05-26', 'Hip Hop', 'Eminem的经典专辑', 4.8, 1250),
('Illmatic', 'Nas', 'https://example.com/illmatic.jpg', '1994-04-19', 'Hip Hop', 'Nas的首张专辑，被誉为嘻哈史上最伟大的专辑之一', 4.9, 2100),
('中国新说唱', 'Various Artists', 'https://example.com/rap-china.jpg', '2023-08-15', 'Chinese Hip Hop', '中国说唱音乐合辑', 4.3, 850);
```

### 插入测试歌曲

```sql
-- 获取刚插入的专辑ID
-- 假设 Eminem Show 的 ID 是 'album-id-1'

INSERT INTO public.songs (album_id, title, track_number, duration, audio_url) VALUES
('album-id-1', 'Without Me', 1, 290, 'https://example.com/without-me.mp3'),
('album-id-1', 'Cleanin Out My Closet', 2, 297, 'https://example.com/cleaning.mp3'),
('album-id-1', 'Superman', 3, 350, 'https://example.com/superman.mp3');
```

## 🔧 故障排除

### 问题1: SQL脚本执行失败

**可能原因**: 
- 数据库扩展未启用
- 权限不足
- SQL语法错误

**解决方案**:
1. 确保以超级管理员身份执行脚本
2. 检查错误信息，定位问题所在行
3. 尝试分段执行（先创建表，再创建触发器，最后创建RLS策略）

### 问题2: RLS策略阻止了数据访问

**可能原因**: 
- 用户未登录
- `public.users` 表中没有对应的用户记录
- auth.uid() 无法正确识别

**解决方案**:
1. 确保用户已通过 Supabase Auth 登录
2. 在 `public.users` 表中创建对应的用户记录，并正确设置 `auth_id` 字段
3. 检查 RLS 策略是否正确

### 问题3: 触发器未生效

**可能原因**: 
- 触发器创建失败
- 触发器被禁用

**解决方案**:
1. 在 SQL Editor 中执行: `SELECT * FROM pg_trigger;` 查看所有触发器
2. 重新执行触发器创建语句
3. 检查触发器函数是否正确

### 问题4: 无法连接到数据库

**可能原因**: 
- 网络问题
- API密钥错误
- 项目暂停

**解决方案**:
1. 检查网络连接
2. 验证 `.env` 文件中的配置是否正确
3. 在 Supabase Dashboard 检查项目状态

## 📚 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)

## 🎯 下一步

数据库配置完成后，你可以：

1. ✅ 安装 Supabase JavaScript 客户端
   ```bash
   npm install @supabase/supabase-js
   ```

2. ✅ 在项目中初始化 Supabase 客户端
   ```typescript
   // src/utils/supabase.ts
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

3. ✅ 修改 API 层，使用 Supabase 替代原有的 Mock 数据

4. ✅ 实现用户认证功能

5. ✅ 开始开发具体的业务功能

## 💡 提示

- 定期备份数据库（Supabase 自动备份，但建议定期导出重要数据）
- 监控数据库性能和使用量
- 合理设置 RLS 策略，保护用户隐私
- 在开发环境和生产环境使用不同的 Supabase 项目

---

**配置完成！现在你可以开始开发说唱专辑论坛网站了！** 🎉

