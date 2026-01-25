-- 修复基金账户RLS策略
-- 删除现有的策略
DROP POLICY IF EXISTS "Users can view own fund account" ON fund_accounts;
DROP POLICY IF EXISTS "Users can insert own fund account" ON fund_accounts;
DROP POLICY IF EXISTS "Users can update own fund account" ON fund_accounts;

-- 创建新的策略（基于用户名）
CREATE POLICY "Users can view own fund account" ON fund_accounts
  FOR SELECT USING (user_id = current_setting('app.current_username', true));

CREATE POLICY "Users can insert own fund account" ON fund_accounts
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_username', true));

CREATE POLICY "Users can update own fund account" ON fund_accounts
  FOR UPDATE USING (user_id = current_setting('app.current_username', true));

-- 创建设置用户名的函数（如果不存在）
CREATE OR REPLACE FUNCTION set_app_username(username text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_username', username, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
