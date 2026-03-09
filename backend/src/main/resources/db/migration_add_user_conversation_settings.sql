-- 用户会话设置表（用于记录每个用户对会话的删除状态等设置）
CREATE TABLE IF NOT EXISTS user_conversation_settings (
    id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    conversation_id VARCHAR(32) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '用户是否删除了此会话',
    deleted_at DATETIME COMMENT '删除时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_conversation (user_id, conversation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_is_deleted (is_deleted),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
