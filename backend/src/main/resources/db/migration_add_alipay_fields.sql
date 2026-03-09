-- 为订单表添加支付宝相关字段
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS trade_no VARCHAR(64) COMMENT '支付宝交易号',
ADD COLUMN IF NOT EXISTS seller_alipay_account VARCHAR(100) COMMENT '卖家支付宝账号',
ADD COLUMN IF NOT EXISTS transfer_status VARCHAR(20) DEFAULT 'pending' COMMENT '转账状态：pending(待转账), success(已转账), failed(转账失败)';

-- 为用户表添加支付宝账号字段
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS alipay_account VARCHAR(100) COMMENT '支付宝账号';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_trade_no ON orders(trade_no);
CREATE INDEX IF NOT EXISTS idx_transfer_status ON orders(transfer_status);
