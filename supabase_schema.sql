-- ============================================
-- 说唱音乐专辑论坛 - Supabase数据库架构
-- ============================================
-- 创建日期: 2025-10-21
-- 数据库: PostgreSQL (Supabase)
-- 版本: 1.0
-- ============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. 用户表 (users)
-- ============================================
-- 注意: Supabase自带auth.users表，这里创建一个public.users表来存储扩展信息
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- 关联到auth.users的id
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar TEXT,
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 用户表索引
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- 用户表注释
COMMENT ON TABLE public.users IS '用户信息扩展表';
COMMENT ON COLUMN public.users.auth_id IS '关联Supabase Auth的用户ID';
COMMENT ON COLUMN public.users.username IS '用户名（唯一）';
COMMENT ON COLUMN public.users.email IS '邮箱（唯一）';
COMMENT ON COLUMN public.users.avatar IS '头像URL';
COMMENT ON COLUMN public.users.bio IS '个人简介';
COMMENT ON COLUMN public.users.role IS '用户角色: user=普通用户, admin=管理员';

-- ============================================
-- 2. 专辑表 (albums)
-- ============================================
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    cover_url TEXT NOT NULL,
    release_date DATE NOT NULL,
    genre VARCHAR(100) NOT NULL,
    description TEXT,
    artist_bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
    song_count INTEGER DEFAULT 0 CHECK (song_count >= 0),
    preview_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT artist_not_empty CHECK (char_length(trim(artist)) > 0)
);

-- 专辑表索引
CREATE INDEX idx_albums_artist ON public.albums(artist);
CREATE INDEX idx_albums_genre ON public.albums(genre);
CREATE INDEX idx_albums_release_date ON public.albums(release_date DESC);
CREATE INDEX idx_albums_rating ON public.albums(rating DESC);
CREATE INDEX idx_albums_title ON public.albums USING gin(to_tsvector('simple', title));
CREATE INDEX idx_albums_created_at ON public.albums(created_at DESC);

-- 专辑表注释
COMMENT ON TABLE public.albums IS '说唱音乐专辑表';
COMMENT ON COLUMN public.albums.title IS '专辑标题';
COMMENT ON COLUMN public.albums.artist IS '艺人名称';
COMMENT ON COLUMN public.albums.cover_url IS '专辑封面URL';
COMMENT ON COLUMN public.albums.release_date IS '发行日期';
COMMENT ON COLUMN public.albums.genre IS '音乐流派';
COMMENT ON COLUMN public.albums.description IS '专辑介绍';
COMMENT ON COLUMN public.albums.artist_bio IS '艺人简介';
COMMENT ON COLUMN public.albums.rating IS '平均评分（0-5）';
COMMENT ON COLUMN public.albums.rating_count IS '评分人数';
COMMENT ON COLUMN public.albums.song_count IS '歌曲数量';

-- ============================================
-- 3. 歌曲表 (songs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    track_number INTEGER NOT NULL CHECK (track_number > 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    audio_url TEXT NOT NULL,
    lyrics TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
    UNIQUE(album_id, track_number)
);

-- 歌曲表索引
CREATE INDEX idx_songs_album_id ON public.songs(album_id);
CREATE INDEX idx_songs_track_number ON public.songs(album_id, track_number);
CREATE INDEX idx_songs_title ON public.songs USING gin(to_tsvector('simple', title));

-- 歌曲表注释
COMMENT ON TABLE public.songs IS '歌曲信息表';
COMMENT ON COLUMN public.songs.album_id IS '所属专辑ID';
COMMENT ON COLUMN public.songs.title IS '歌曲标题';
COMMENT ON COLUMN public.songs.track_number IS '曲目编号';
COMMENT ON COLUMN public.songs.duration IS '时长（秒）';
COMMENT ON COLUMN public.songs.audio_url IS '音频文件URL';
COMMENT ON COLUMN public.songs.lyrics IS '歌词';

-- ============================================
-- 4. 专辑评分表 (album_ratings)
-- ============================================
CREATE TABLE IF NOT EXISTS public.album_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, album_id)
);

-- 专辑评分表索引
CREATE INDEX idx_album_ratings_user_id ON public.album_ratings(user_id);
CREATE INDEX idx_album_ratings_album_id ON public.album_ratings(album_id);
CREATE INDEX idx_album_ratings_score ON public.album_ratings(score);
CREATE INDEX idx_album_ratings_created_at ON public.album_ratings(created_at DESC);

-- 专辑评分表注释
COMMENT ON TABLE public.album_ratings IS '专辑评分表';
COMMENT ON COLUMN public.album_ratings.user_id IS '用户ID';
COMMENT ON COLUMN public.album_ratings.album_id IS '专辑ID';
COMMENT ON COLUMN public.album_ratings.score IS '评分（1-5星）';

-- ============================================
-- 5. 专辑评论表 (album_comments)
-- ============================================
CREATE TABLE IF NOT EXISTS public.album_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.album_comments(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

-- 专辑评论表索引
CREATE INDEX idx_album_comments_user_id ON public.album_comments(user_id);
CREATE INDEX idx_album_comments_album_id ON public.album_comments(album_id);
CREATE INDEX idx_album_comments_parent_id ON public.album_comments(parent_id);
CREATE INDEX idx_album_comments_created_at ON public.album_comments(created_at DESC);
CREATE INDEX idx_album_comments_likes ON public.album_comments(likes DESC);

-- 专辑评论表注释
COMMENT ON TABLE public.album_comments IS '专辑评论表';
COMMENT ON COLUMN public.album_comments.user_id IS '评论用户ID';
COMMENT ON COLUMN public.album_comments.album_id IS '专辑ID';
COMMENT ON COLUMN public.album_comments.content IS '评论内容';
COMMENT ON COLUMN public.album_comments.parent_id IS '父评论ID（用于回复）';
COMMENT ON COLUMN public.album_comments.likes IS '点赞数';

-- ============================================
-- 6. 论坛版块表 (forum_categories)
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT name_not_empty CHECK (char_length(trim(name)) > 0)
);

-- 论坛版块表索引
CREATE INDEX idx_forum_categories_sort_order ON public.forum_categories(sort_order);

-- 论坛版块表注释
COMMENT ON TABLE public.forum_categories IS '论坛版块表';
COMMENT ON COLUMN public.forum_categories.name IS '版块名称';
COMMENT ON COLUMN public.forum_categories.description IS '版块描述';
COMMENT ON COLUMN public.forum_categories.icon IS '版块图标';
COMMENT ON COLUMN public.forum_categories.sort_order IS '排序顺序';

-- ============================================
-- 7. 帖子表 (posts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    related_album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
    reply_count INTEGER DEFAULT 0 CHECK (reply_count >= 0),
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_highlighted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

-- 帖子表索引
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_category_id ON public.posts(category_id);
CREATE INDEX idx_posts_related_album_id ON public.posts(related_album_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_is_pinned ON public.posts(is_pinned, created_at DESC);
CREATE INDEX idx_posts_is_highlighted ON public.posts(is_highlighted, created_at DESC);
CREATE INDEX idx_posts_title ON public.posts USING gin(to_tsvector('simple', title));
CREATE INDEX idx_posts_content ON public.posts USING gin(to_tsvector('simple', content));

-- 帖子表注释
COMMENT ON TABLE public.posts IS '论坛帖子表';
COMMENT ON COLUMN public.posts.user_id IS '发帖用户ID';
COMMENT ON COLUMN public.posts.category_id IS '所属版块ID';
COMMENT ON COLUMN public.posts.title IS '帖子标题';
COMMENT ON COLUMN public.posts.content IS '帖子内容';
COMMENT ON COLUMN public.posts.related_album_id IS '关联的专辑ID';
COMMENT ON COLUMN public.posts.reply_count IS '回复数量';
COMMENT ON COLUMN public.posts.likes IS '点赞数';
COMMENT ON COLUMN public.posts.is_pinned IS '是否置顶';
COMMENT ON COLUMN public.posts.is_highlighted IS '是否精华';

-- ============================================
-- 8. 帖子回复表 (post_replies)
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.post_replies(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

-- 帖子回复表索引
CREATE INDEX idx_post_replies_post_id ON public.post_replies(post_id);
CREATE INDEX idx_post_replies_user_id ON public.post_replies(user_id);
CREATE INDEX idx_post_replies_parent_id ON public.post_replies(parent_id);
CREATE INDEX idx_post_replies_created_at ON public.post_replies(created_at DESC);
CREATE INDEX idx_post_replies_likes ON public.post_replies(likes DESC);

-- 帖子回复表注释
COMMENT ON TABLE public.post_replies IS '帖子回复表';
COMMENT ON COLUMN public.post_replies.post_id IS '所属帖子ID';
COMMENT ON COLUMN public.post_replies.user_id IS '回复用户ID';
COMMENT ON COLUMN public.post_replies.content IS '回复内容';
COMMENT ON COLUMN public.post_replies.parent_id IS '父回复ID（楼中楼）';
COMMENT ON COLUMN public.post_replies.likes IS '点赞数';

-- ============================================
-- 9. 收藏表 (favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, album_id)
);

-- 收藏表索引
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_album_id ON public.favorites(album_id);
CREATE INDEX idx_favorites_created_at ON public.favorites(created_at DESC);

-- 收藏表注释
COMMENT ON TABLE public.favorites IS '用户收藏专辑表';
COMMENT ON COLUMN public.favorites.user_id IS '用户ID';
COMMENT ON COLUMN public.favorites.album_id IS '收藏的专辑ID';

-- ============================================
-- 10. 通知表 (notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('reply', 'like', 'system')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0)
);

-- 通知表索引
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- 通知表注释
COMMENT ON TABLE public.notifications IS '用户通知表';
COMMENT ON COLUMN public.notifications.user_id IS '接收通知的用户ID';
COMMENT ON COLUMN public.notifications.type IS '通知类型: reply=回复, like=点赞, system=系统通知';
COMMENT ON COLUMN public.notifications.title IS '通知标题';
COMMENT ON COLUMN public.notifications.content IS '通知内容';
COMMENT ON COLUMN public.notifications.link IS '相关链接';
COMMENT ON COLUMN public.notifications.is_read IS '是否已读';

-- ============================================
-- 触发器函数: 自动更新 updated_at 字段
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为各表添加 updated_at 自动更新触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON public.albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_album_ratings_updated_at BEFORE UPDATE ON public.album_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_album_comments_updated_at BEFORE UPDATE ON public.album_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_categories_updated_at BEFORE UPDATE ON public.forum_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_replies_updated_at BEFORE UPDATE ON public.post_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 触发器函数: 更新专辑评分
-- ============================================
CREATE OR REPLACE FUNCTION update_album_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.albums
    SET 
        rating = (SELECT COALESCE(AVG(score), 0) FROM public.album_ratings WHERE album_id = NEW.album_id),
        rating_count = (SELECT COUNT(*) FROM public.album_ratings WHERE album_id = NEW.album_id)
    WHERE id = NEW.album_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_album_rating_on_insert AFTER INSERT ON public.album_ratings
    FOR EACH ROW EXECUTE FUNCTION update_album_rating();

CREATE TRIGGER update_album_rating_on_update AFTER UPDATE ON public.album_ratings
    FOR EACH ROW EXECUTE FUNCTION update_album_rating();

CREATE OR REPLACE FUNCTION update_album_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.albums
    SET 
        rating = (SELECT COALESCE(AVG(score), 0) FROM public.album_ratings WHERE album_id = OLD.album_id),
        rating_count = (SELECT COUNT(*) FROM public.album_ratings WHERE album_id = OLD.album_id)
    WHERE id = OLD.album_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_album_rating_on_delete AFTER DELETE ON public.album_ratings
    FOR EACH ROW EXECUTE FUNCTION update_album_rating_on_delete();

-- ============================================
-- 触发器函数: 更新帖子回复数
-- ============================================
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts
    SET reply_count = (SELECT COUNT(*) FROM public.post_replies WHERE post_id = NEW.post_id)
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_reply_count_on_insert AFTER INSERT ON public.post_replies
    FOR EACH ROW EXECUTE FUNCTION update_post_reply_count();

CREATE OR REPLACE FUNCTION update_post_reply_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts
    SET reply_count = (SELECT COUNT(*) FROM public.post_replies WHERE post_id = OLD.post_id)
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_reply_count_on_delete AFTER DELETE ON public.post_replies
    FOR EACH ROW EXECUTE FUNCTION update_post_reply_count_on_delete();

-- ============================================
-- 触发器函数: 更新专辑歌曲数
-- ============================================
CREATE OR REPLACE FUNCTION update_album_song_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.albums
    SET song_count = (SELECT COUNT(*) FROM public.songs WHERE album_id = NEW.album_id)
    WHERE id = NEW.album_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_album_song_count_on_insert AFTER INSERT ON public.songs
    FOR EACH ROW EXECUTE FUNCTION update_album_song_count();

CREATE OR REPLACE FUNCTION update_album_song_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.albums
    SET song_count = (SELECT COUNT(*) FROM public.songs WHERE album_id = OLD.album_id)
    WHERE id = OLD.album_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_album_song_count_on_delete AFTER DELETE ON public.songs
    FOR EACH ROW EXECUTE FUNCTION update_album_song_count_on_delete();

-- ============================================
-- 视图: 专辑详细信息（含艺人和评分）
-- ============================================
CREATE OR REPLACE VIEW album_details AS
SELECT 
    a.*,
    COUNT(DISTINCT s.id) as actual_song_count,
    COUNT(DISTINCT f.id) as favorite_count
FROM public.albums a
LEFT JOIN public.songs s ON a.id = s.album_id
LEFT JOIN public.favorites f ON a.id = f.album_id
GROUP BY a.id;

COMMENT ON VIEW album_details IS '专辑详细信息视图，包含实际歌曲数和收藏数';

-- ============================================
-- 视图: 帖子详细信息（含用户和版块信息）
-- ============================================
CREATE OR REPLACE VIEW post_details AS
SELECT 
    p.*,
    u.username,
    u.avatar as user_avatar,
    fc.name as category_name,
    a.title as related_album_title,
    a.artist as related_album_artist
FROM public.posts p
LEFT JOIN public.users u ON p.user_id = u.id
LEFT JOIN public.forum_categories fc ON p.category_id = fc.id
LEFT JOIN public.albums a ON p.related_album_id = a.id;

COMMENT ON VIEW post_details IS '帖子详细信息视图，包含用户、版块和关联专辑信息';

-- ============================================
-- 视图: 评论详细信息（含用户信息）
-- ============================================
CREATE OR REPLACE VIEW album_comment_details AS
SELECT 
    ac.*,
    u.username,
    u.avatar as user_avatar
FROM public.album_comments ac
LEFT JOIN public.users u ON ac.user_id = u.id;

COMMENT ON VIEW album_comment_details IS '专辑评论详细信息视图，包含用户信息';

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================
-- 启用RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 用户表 RLS 策略
CREATE POLICY "用户可以查看所有用户的公开信息" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "用户只能更新自己的信息" ON public.users
    FOR UPDATE USING (auth.uid() = auth_id);

-- 专辑表 RLS 策略（公开可读，管理员可写）
CREATE POLICY "所有人可以查看专辑" ON public.albums
    FOR SELECT USING (true);

CREATE POLICY "管理员可以管理专辑" ON public.albums
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() AND role = 'admin'
        )
    );

-- 歌曲表 RLS 策略
CREATE POLICY "所有人可以查看歌曲" ON public.songs
    FOR SELECT USING (true);

CREATE POLICY "管理员可以管理歌曲" ON public.songs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() AND role = 'admin'
        )
    );

-- 评分表 RLS 策略
CREATE POLICY "所有人可以查看评分" ON public.album_ratings
    FOR SELECT USING (true);

CREATE POLICY "用户可以添加自己的评分" ON public.album_ratings
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以修改自己的评分" ON public.album_ratings
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以删除自己的评分" ON public.album_ratings
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

-- 评论表 RLS 策略
CREATE POLICY "所有人可以查看评论" ON public.album_comments
    FOR SELECT USING (true);

CREATE POLICY "登录用户可以发表评论" ON public.album_comments
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以修改自己的评论" ON public.album_comments
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以删除自己的评论或管理员可以删除任何评论" ON public.album_comments
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() AND role = 'admin'
        )
    );

-- 论坛版块 RLS 策略
CREATE POLICY "所有人可以查看版块" ON public.forum_categories
    FOR SELECT USING (true);

CREATE POLICY "管理员可以管理版块" ON public.forum_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() AND role = 'admin'
        )
    );

-- 帖子表 RLS 策略
CREATE POLICY "所有人可以查看帖子" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "登录用户可以发帖" ON public.posts
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以修改自己的帖子" ON public.posts
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "用户可以删除自己的帖子或管理员可以删除任何帖子" ON public.posts
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() AND role = 'admin'
        )
    );

-- 帖子回复表 RLS 策略
CREATE POLICY "所有人可以查看回复" ON public.post_replies
    FOR SELECT USING (true);

CREATE POLICY "登录用户可以回复" ON public.post_replies
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以修改自己的回复" ON public.post_replies
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以删除自己的回复或管理员可以删除任何回复" ON public.post_replies
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() AND role = 'admin'
        )
    );

-- 收藏表 RLS 策略
CREATE POLICY "用户只能查看自己的收藏" ON public.favorites
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以添加自己的收藏" ON public.favorites
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以删除自己的收藏" ON public.favorites
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

-- 通知表 RLS 策略
CREATE POLICY "用户只能查看自己的通知" ON public.notifications
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "用户可以更新自己的通知状态" ON public.notifications
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- 初始数据: 论坛版块
-- ============================================
INSERT INTO public.forum_categories (name, description, icon, sort_order) VALUES
    ('专辑讨论', '讨论各类说唱专辑的精彩内容', '🎵', 1),
    ('歌曲故事', '分享歌曲背后的故事和个人感悟', '📖', 2),
    ('说唱文化', '探讨说唱音乐的文化和发展', '🎤', 3),
    ('新人推荐', '推荐优秀的新晋说唱艺人', '⭐', 4),
    ('站务公告', '网站公告和意见建议', '📢', 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 数据库函数: 搜索专辑
-- ============================================
CREATE OR REPLACE FUNCTION search_albums(
    search_query TEXT,
    genre_filter TEXT DEFAULT NULL,
    year_filter INTEGER DEFAULT NULL,
    sort_by TEXT DEFAULT 'releaseDate',
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    artist VARCHAR,
    cover_url TEXT,
    release_date DATE,
    genre VARCHAR,
    rating DECIMAL,
    rating_count INTEGER,
    song_count INTEGER,
    total_count BIGINT
) AS $$
DECLARE
    offset_count INTEGER;
BEGIN
    offset_count := (page_num - 1) * page_size;
    
    RETURN QUERY
    WITH filtered_albums AS (
        SELECT a.*
        FROM public.albums a
        WHERE 
            (search_query IS NULL OR search_query = '' OR 
             a.title ILIKE '%' || search_query || '%' OR 
             a.artist ILIKE '%' || search_query || '%')
            AND (genre_filter IS NULL OR a.genre = genre_filter)
            AND (year_filter IS NULL OR EXTRACT(YEAR FROM a.release_date) = year_filter)
    ),
    total_count_cte AS (
        SELECT COUNT(*) as total FROM filtered_albums
    )
    SELECT 
        a.id,
        a.title,
        a.artist,
        a.cover_url,
        a.release_date,
        a.genre,
        a.rating,
        a.rating_count,
        a.song_count,
        tc.total
    FROM filtered_albums a
    CROSS JOIN total_count_cte tc
    ORDER BY 
        CASE WHEN sort_by = 'releaseDate' THEN a.release_date END DESC,
        CASE WHEN sort_by = 'rating' THEN a.rating END DESC,
        CASE WHEN sort_by = 'popular' THEN a.rating_count END DESC
    LIMIT page_size OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_albums IS '搜索和筛选专辑的函数，支持分页和多种排序';

-- ============================================
-- 数据库函数: 获取用户统计信息
-- ============================================
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS TABLE (
    post_count BIGINT,
    reply_count BIGINT,
    comment_count BIGINT,
    favorite_count BIGINT,
    rating_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.posts WHERE user_id = target_user_id),
        (SELECT COUNT(*) FROM public.post_replies WHERE user_id = target_user_id),
        (SELECT COUNT(*) FROM public.album_comments WHERE user_id = target_user_id),
        (SELECT COUNT(*) FROM public.favorites WHERE user_id = target_user_id),
        (SELECT COUNT(*) FROM public.album_ratings WHERE user_id = target_user_id);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_stats IS '获取用户的统计信息（发帖数、回复数、评论数等）';

-- ============================================
-- 完成提示
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '============================================';
    RAISE NOTICE '数据库架构创建完成！';
    RAISE NOTICE '============================================';
    RAISE NOTICE '已创建的表:';
    RAISE NOTICE '  1. users - 用户表';
    RAISE NOTICE '  2. albums - 专辑表';
    RAISE NOTICE '  3. songs - 歌曲表';
    RAISE NOTICE '  4. album_ratings - 专辑评分表';
    RAISE NOTICE '  5. album_comments - 专辑评论表';
    RAISE NOTICE '  6. forum_categories - 论坛版块表';
    RAISE NOTICE '  7. posts - 帖子表';
    RAISE NOTICE '  8. post_replies - 帖子回复表';
    RAISE NOTICE '  9. favorites - 收藏表';
    RAISE NOTICE ' 10. notifications - 通知表';
    RAISE NOTICE '';
    RAISE NOTICE '已创建的视图:';
    RAISE NOTICE '  1. album_details - 专辑详细信息';
    RAISE NOTICE '  2. post_details - 帖子详细信息';
    RAISE NOTICE '  3. album_comment_details - 评论详细信息';
    RAISE NOTICE '';
    RAISE NOTICE '已启用 Row Level Security (RLS)';
    RAISE NOTICE '已添加自动更新触发器';
    RAISE NOTICE '已创建索引以优化查询性能';
    RAISE NOTICE '============================================';
END $$;

