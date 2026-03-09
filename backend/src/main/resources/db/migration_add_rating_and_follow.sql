-- 添加用户信用等级字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_score DECIMAL(5,2) DEFAULT 5.00 COMMENT '信用等级（1-5分）';

-- 订单评分表
CREATE TABLE IF NOT EXISTS order_ratings (
    id VARCHAR(32) PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    rater_id VARCHAR(32) NOT NULL COMMENT '评分者ID（买家或卖家）',
    rated_id VARCHAR(32) NOT NULL COMMENT '被评分者ID（买家或卖家）',
    rating INT NOT NULL COMMENT '评分（1-5分）',
    comment TEXT COMMENT '评价内容',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_order_rater (order_id, rater_id) COMMENT '每个订单每个评分者只能评分一次',
    INDEX idx_order_id (order_id),
    INDEX idx_rater_id (rater_id),
    INDEX idx_rated_id (rated_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单评分表';

-- 关注表
CREATE TABLE IF NOT EXISTS follows (
    id VARCHAR(32) PRIMARY KEY,
    follower_id VARCHAR(32) NOT NULL COMMENT '关注者ID',
    following_id VARCHAR(32) NOT NULL COMMENT '被关注者ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follower_following (follower_id, following_id) COMMENT '防止重复关注',
    INDEX idx_follower_id (follower_id),
    INDEX idx_following_id (following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注关系表';
