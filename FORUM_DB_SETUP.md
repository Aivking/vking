# 论坛数据库设置指南

## 需要在 Supabase 中执行的 SQL

请在 Supabase Dashboard > SQL Editor 中执行以下 SQL 语句来创建论坛功能所需的数据表：

```sql
-- 创建 posts 表
CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  author_id uuid,
  likes integer DEFAULT 0,
  replies jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_author_idx ON posts(author);

-- 如果使用 RLS，可以禁用或配置策略
-- 当前应用使用 anon key，建议禁用 RLS
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- 或者如果要启用 RLS，可以添加以下策略：
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "允许所有人查看帖子" ON posts
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "允许认证用户创建帖子" ON posts
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "允许作者和管理员删除帖子" ON posts
--   FOR DELETE USING (true);
-- 
-- CREATE POLICY "允许作者编辑帖子" ON posts
--   FOR UPDATE USING (true);
```

## 数据表结构说明

### posts 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，自动生成 |
| title | text | 帖子标题 |
| content | text | 帖子内容 |
| author | text | 作者用户名 |
| author_id | uuid | 作者用户ID |
| likes | integer | 点赞数 |
| replies | jsonb | 回复列表（JSON数组） |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### replies 字段 JSON 结构示例

```json
[
  {
    "id": 1737388800000,
    "author": "username",
    "content": "回复内容",
    "timestamp": "2026-01-19T12:00:00.000Z"
  }
]
```

## 执行步骤

1. 登录 Supabase Dashboard: https://app.supabase.com
2. 选择你的项目 (pcdlexmdvqrkyjqbjzkl)
3. 点击左侧菜单的 "SQL Editor"
4. 点击 "New query"
5. 复制上面的 SQL 代码粘贴到编辑器
6. 点击 "Run" 执行
7. 确认表创建成功

## 验证

执行以下 SQL 验证表是否创建成功：

```sql
SELECT * FROM posts LIMIT 5;
```

如果没有报错，说明表创建成功！
