# 基金板块数据库设计

## 1. 基金账户表 (fund_accounts)
```sql
CREATE TABLE fund_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  balance DECIMAL(20,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

## 2. 基金交易记录 (使用现有 transactions 表)
在现有 transactions 表中添加基金相关记录：
- type: 'fund_transfer_in' (银行转基金)
- type: 'fund_transfer_out' (基金转银行)
- type: 'fund_profit' (基金收益)
- type: 'fund_loss' (基金损失)

## 3. 数据字段说明
- transactions 表现有字段：
  - type: 交易类型
  - amount: 金额
  - client: 客户/用户
  - created_by: 创建者
  - remark: 备注
  - status: 状态

## 4. 资金流转逻辑
1. 银行 → 基金：减少银行余额，增加基金余额
2. 基金 → 银行：减少基金余额，增加银行余额
3. 基金收益/损失：只影响基金余额
