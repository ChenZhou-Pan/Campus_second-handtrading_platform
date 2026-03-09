-- 添加用户会话表的迁移脚本
-- 用于实现单点登录功能：异地登录会挤掉其他会话

USE campus_trading;

-- 用户会话表（用于实现单点登录，异地登录挤掉其他会话）
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    token_hash VARCHAR(255) NOT NULL COMMENT 'JWT token的哈希值，用于快速查找',
    is_active BOOLEAN DEFAULT TRUE COMMENT '会话是否活跃（最新登录的会话）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_is_active (is_active),
    INDEX idx_last_active_at (last_active_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
