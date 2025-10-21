-- ============================================
-- 说唱音乐专辑论坛 - 测试数据
-- ============================================
-- 用途: 为开发和测试环境提供初始数据
-- 注意: 这些是示例数据，生产环境请勿直接使用
-- ============================================

-- ============================================
-- 注意事项
-- ============================================
-- 1. 在运行此脚本前，请确保已经执行了 supabase_schema.sql
-- 2. 用户数据需要先在 Supabase Auth 中创建，然后在 public.users 表中关联
-- 3. 所有的 UUID 都是示例值，实际使用时会自动生成
-- 4. 图片URL和音频URL需要替换为真实的资源地址
-- ============================================

BEGIN;

-- ============================================
-- 1. 测试专辑数据
-- ============================================

-- 插入经典说唱专辑
INSERT INTO public.albums (id, title, artist, cover_url, release_date, genre, description, artist_bio, rating, rating_count, song_count) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'The Eminem Show',
    'Eminem',
    'https://picsum.photos/seed/eminem/400/400',
    '2002-05-26',
    'Hip Hop',
    'Eminem的第四张录音室专辑，也是他最成功的专辑之一。专辑展现了Eminem作为说唱艺人和制作人的全面才华，涉及个人生活、名声和美国文化等主题。',
    'Eminem，本名Marshall Bruce Mathers III，是美国最具影响力的说唱歌手之一。他的快节奏说唱和犀利的歌词风格影响了整个嘻哈音乐界。',
    4.8,
    1250,
    20
),
(
    '22222222-2222-2222-2222-222222222222',
    'Illmatic',
    'Nas',
    'https://picsum.photos/seed/nas/400/400',
    '1994-04-19',
    'Hip Hop',
    'Nas的首张录音室专辑，被广泛认为是有史以来最伟大的嘻哈专辑之一。专辑以其诗意的歌词和对纽约街头生活的真实描绘而闻名。',
    'Nas，本名Nasir bin Olu Dara Jones，是美国说唱歌手、词曲作者和企业家。他被认为是有史以来最伟大的说唱歌手之一。',
    4.9,
    2100,
    10
),
(
    '33333333-3333-3333-3333-333333333333',
    'good kid, m.A.A.d city',
    'Kendrick Lamar',
    'https://picsum.photos/seed/kendrick/400/400',
    '2012-10-22',
    'Hip Hop',
    'Kendrick Lamar的主流厂牌首张专辑，一部关于康普顿青少年的概念专辑。专辑讲述了一个关于Kendrick在家乡康普顿成长的故事。',
    'Kendrick Lamar是当代最具影响力的说唱艺人之一，以其深刻的歌词和创新的音乐风格而闻名。',
    4.7,
    3200,
    12
),
(
    '44444444-4444-4444-4444-444444444444',
    '中国新说唱2023',
    'Various Artists',
    'https://picsum.photos/seed/china-rap/400/400',
    '2023-08-15',
    'Chinese Hip Hop',
    '汇集了中国最优秀的说唱艺人的作品合辑，展现了中文说唱的多样性和创造力。',
    '众多中国说唱艺人的集合，代表了中文说唱音乐的新时代。',
    4.3,
    850,
    15
),
(
    '55555555-5555-5555-5555-555555555555',
    'To Pimp a Butterfly',
    'Kendrick Lamar',
    'https://picsum.photos/seed/butterfly/400/400',
    '2015-03-15',
    'Hip Hop',
    'Kendrick Lamar的第三张录音室专辑，融合了爵士、灵魂和放克音乐元素，探讨种族、抑郁和自我认同等深刻主题。',
    'Kendrick Lamar继续在说唱音乐中探索社会和政治议题，被认为是当代最重要的艺术家之一。',
    4.9,
    2800,
    16
),
(
    '66666666-6666-6666-6666-666666666666',
    'The College Dropout',
    'Kanye West',
    'https://picsum.photos/seed/kanye/400/400',
    '2004-02-10',
    'Hip Hop',
    'Kanye West的首张专辑，挑战了当时说唱音乐的主流趋势，带来了更加灵魂和采样驱动的声音。',
    'Kanye West是美国说唱歌手、制作人和时尚设计师，以其创新的音乐制作和争议性人格而闻名。',
    4.6,
    1950,
    21
);

-- ============================================
-- 2. 测试歌曲数据
-- ============================================

-- The Eminem Show 歌曲
INSERT INTO public.songs (album_id, title, track_number, duration, audio_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Without Me', 1, 290, 'https://example.com/audio/without-me.mp3'),
('11111111-1111-1111-1111-111111111111', 'Cleanin Out My Closet', 2, 297, 'https://example.com/audio/cleaning.mp3'),
('11111111-1111-1111-1111-111111111111', 'Superman', 3, 350, 'https://example.com/audio/superman.mp3'),
('11111111-1111-1111-1111-111111111111', 'Sing for the Moment', 4, 339, 'https://example.com/audio/sing.mp3'),
('11111111-1111-1111-1111-111111111111', 'Till I Collapse', 5, 297, 'https://example.com/audio/collapse.mp3');

-- Illmatic 歌曲
INSERT INTO public.songs (album_id, title, track_number, duration, audio_url) VALUES
('22222222-2222-2222-2222-222222222222', 'N.Y. State of Mind', 1, 294, 'https://example.com/audio/ny-state.mp3'),
('22222222-2222-2222-2222-222222222222', 'Life''s a Bitch', 2, 208, 'https://example.com/audio/lifes-bitch.mp3'),
('22222222-2222-2222-2222-222222222222', 'The World Is Yours', 3, 258, 'https://example.com/audio/world.mp3'),
('22222222-2222-2222-2222-222222222222', 'One Love', 4, 303, 'https://example.com/audio/one-love.mp3');

-- good kid, m.A.A.d city 歌曲
INSERT INTO public.songs (album_id, title, track_number, duration, audio_url) VALUES
('33333333-3333-3333-3333-333333333333', 'Swimming Pools (Drank)', 1, 313, 'https://example.com/audio/swimming.mp3'),
('33333333-3333-3333-3333-333333333333', 'Poetic Justice', 2, 301, 'https://example.com/audio/poetic.mp3'),
('33333333-3333-3333-3333-333333333333', 'm.A.A.d city', 3, 331, 'https://example.com/audio/maad.mp3'),
('33333333-3333-3333-3333-333333333333', 'Sing About Me, I''m Dying of Thirst', 4, 732, 'https://example.com/audio/sing-about.mp3');

-- To Pimp a Butterfly 歌曲
INSERT INTO public.songs (album_id, title, track_number, duration, audio_url) VALUES
('55555555-5555-5555-5555-555555555555', 'King Kunta', 1, 234, 'https://example.com/audio/kunta.mp3'),
('55555555-5555-5555-5555-555555555555', 'Alright', 2, 219, 'https://example.com/audio/alright.mp3'),
('55555555-5555-5555-5555-555555555555', 'The Blacker the Berry', 3, 328, 'https://example.com/audio/blacker.mp3');

-- ============================================
-- 3. 测试帖子数据
-- ============================================

-- 注意: 这里使用的 user_id 需要在实际使用时替换为真实的用户ID
-- 为了演示，我们假设已经有一些用户ID

-- 获取论坛版块ID
DO $$
DECLARE
    cat_discussion_id UUID;
    cat_story_id UUID;
    cat_culture_id UUID;
BEGIN
    -- 获取版块ID
    SELECT id INTO cat_discussion_id FROM public.forum_categories WHERE name = '专辑讨论' LIMIT 1;
    SELECT id INTO cat_story_id FROM public.forum_categories WHERE name = '歌曲故事' LIMIT 1;
    SELECT id INTO cat_culture_id FROM public.forum_categories WHERE name = '说唱文化' LIMIT 1;

    -- 插入测试帖子（注意：user_id 需要替换为实际的用户ID）
    INSERT INTO public.posts (id, user_id, category_id, title, content, related_album_id, likes, is_pinned) VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'user-id-1',  -- 需要替换为实际用户ID
        cat_discussion_id,
        '《Illmatic》为什么被称为史上最伟大的嘻哈专辑？',
        '最近重听了Nas的Illmatic，真的是百听不厌。这张专辑从词到曲都堪称完美，每一首歌都是经典。想听听大家对这张专辑的看法，它到底好在哪里？',
        '22222222-2222-2222-2222-222222222222',
        125,
        true
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'user-id-2',  -- 需要替换为实际用户ID
        cat_story_id,
        '分享一下Eminem的Without Me背后的故事',
        'Without Me这首歌是Eminem对音乐界的讽刺和自嘲，歌词中充满了对当时流行文化的调侃。当年听这首歌的时候还小，现在重听才发现里面的梗真的太多了...',
        '11111111-1111-1111-1111-111111111111',
        88,
        false
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'user-id-1',  -- 需要替换为实际用户ID
        cat_culture_id,
        '说唱音乐在中国的发展现状和未来',
        '随着《中国新说唱》等节目的热播，说唱音乐在国内越来越受欢迎。但是相比于美国的嘻哈文化，我们还有很长的路要走。大家觉得中文说唱应该如何发展？',
        NULL,
        156,
        false
    );

END $$;

-- ============================================
-- 4. 示例评论数据
-- ============================================

-- 注意: 这些评论的 user_id 需要替换为实际的用户ID

/*
-- 示例评论（需要在有真实用户后执行）
INSERT INTO public.album_comments (user_id, album_id, content, likes) VALUES
('user-id-1', '22222222-2222-2222-2222-222222222222', 'Illmatic真的是神专，N.Y. State of Mind那段Flow简直完美！', 45),
('user-id-2', '22222222-2222-2222-2222-222222222222', '每次听The World Is Yours都能感受到90年代纽约的街头氛围', 32),
('user-id-3', '11111111-1111-1111-1111-111111111111', 'Eminem的文字游戏玩得太6了，Till I Collapse是我的健身必听曲目！', 67);

-- 示例回复评论
INSERT INTO public.album_comments (user_id, album_id, content, parent_id, likes) VALUES
('user-id-2', '22222222-2222-2222-2222-222222222222', '同意！Nas的Flow在当时真的是超越时代的存在', 'comment-id-1', 12);
*/

-- ============================================
-- 5. 使用说明
-- ============================================

-- 在实际使用此测试数据前，请执行以下步骤：

-- 步骤1: 在 Supabase Auth 中创建测试用户
-- 在 Supabase Dashboard > Authentication > Users 中创建用户

-- 步骤2: 在 public.users 表中创建对应记录
-- 示例:
/*
INSERT INTO public.users (auth_id, username, email, avatar, bio, role) VALUES
('auth-user-id-1', 'test_user_1', 'test1@example.com', 'https://i.pravatar.cc/150?u=test1', '这是一个测试用户', 'user'),
('auth-user-id-2', 'test_user_2', 'test2@example.com', 'https://i.pravatar.cc/150?u=test2', '我是第二个测试用户', 'user'),
('auth-user-id-3', 'admin_user', 'admin@example.com', 'https://i.pravatar.cc/150?u=admin', '管理员账号', 'admin');
*/

-- 步骤3: 获取创建的用户ID，替换上面帖子和评论中的 user_id

-- 步骤4: 执行帖子和评论的插入语句

COMMIT;

-- ============================================
-- 验证数据
-- ============================================

-- 查看插入的专辑数量
SELECT COUNT(*) as album_count FROM public.albums;

-- 查看插入的歌曲数量
SELECT COUNT(*) as song_count FROM public.songs;

-- 查看专辑及其歌曲数
SELECT 
    a.title as album_title,
    a.artist,
    a.song_count,
    COUNT(s.id) as actual_songs
FROM public.albums a
LEFT JOIN public.songs s ON a.id = s.album_id
GROUP BY a.id, a.title, a.artist, a.song_count
ORDER BY a.release_date DESC;

-- 查看论坛版块
SELECT * FROM public.forum_categories ORDER BY sort_order;

-- ============================================
-- 清理测试数据（可选）
-- ============================================

-- 如果需要清理所有测试数据，可以执行以下语句
-- 警告：这将删除所有数据！

/*
BEGIN;

-- 按照依赖关系的相反顺序删除
DELETE FROM public.post_replies;
DELETE FROM public.album_comments;
DELETE FROM public.album_ratings;
DELETE FROM public.favorites;
DELETE FROM public.notifications;
DELETE FROM public.posts;
DELETE FROM public.songs;
DELETE FROM public.albums;
-- 不删除 forum_categories，因为这些是必需的
-- 不删除 users，因为这些可能关联到 Auth

COMMIT;
*/

-- ============================================
-- 完成
-- ============================================
SELECT 'Test data inserted successfully!' as status;

