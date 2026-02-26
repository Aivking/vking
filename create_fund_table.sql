-- 创建基金账户表
CREATE TABLE IF NOT EXISTS fund_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  balance DECIMAL(20,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_fund_accounts_user_id ON fund_accounts(user_id);

-- 添加RLS策略（行级安全）
ALTER TABLE fund_accounts ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的基金账户（基于用户名）
CREATE POLICY "Users can view own fund account" ON fund_accounts
  FOR SELECT USING (user_id = current_setting('app.current_username', true));

CREATE POLICY "Users can insert own fund account" ON fund_accounts
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_username', true));

CREATE POLICY "Users can update own fund account" ON fund_accounts
  FOR UPDATE USING (user_id = current_setting('app.current_username', true));

-- 创建更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fund_accounts_updated_at 
  BEFORE UPDATE ON fund_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
