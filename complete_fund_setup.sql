-- 完整的基金系统设置SQL
-- 请按顺序执行以下SQL

-- 1. 创建基金账户表
CREATE TABLE IF NOT EXISTS fund_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  balance DECIMAL(20,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_fund_accounts_user_id ON fund_accounts(user_id);

-- 3. 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. 创建触发器
CREATE TRIGGER update_fund_accounts_updated_at 
  BEFORE UPDATE ON fund_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. 启用RLS
ALTER TABLE fund_accounts ENABLE ROW LEVEL SECURITY;

-- 6. 创建设置用户名的函数
CREATE OR REPLACE FUNCTION set_app_username(username text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_username', username, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建RLS策略
CREATE POLICY "Users can view own fund account" ON fund_accounts
  FOR SELECT USING (user_id = current_setting('app.current_username', true));

CREATE POLICY "Users can insert own fund account" ON fund_accounts
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_username', true));

CREATE POLICY "Users can update own fund account" ON fund_accounts
  FOR UPDATE USING (user_id = current_setting('app.current_username', true));

-- 8. 给public角色执行函数的权限
GRANT EXECUTE ON FUNCTION set_app_username(text) TO public;

-- 9. 验证表是否创建成功
SELECT 'fund_accounts table created successfully' as status;
