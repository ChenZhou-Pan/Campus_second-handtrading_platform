package com.campus.trading.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(2) // 在 DataSourceConfig 之后执行
public class DatabaseInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public void run(String... args) throws Exception {
        // 1. 检查并创建 user_sessions 表
        initializeUserSessionsTable();
        
        // 2. 检查并修复 products 表的字段类型
        fixProductsTableFields();
        
        // 3. 检查并添加支付宝相关字段
        addAlipayFields();
        
        // 4. 检查并添加评分和关注相关表
        addRatingAndFollowTables();
        
        // 5. 检查并创建用户会话设置表
        initializeUserConversationSettingsTable();
    }
    
    private void initializeUserSessionsTable() {
        try {
            // 尝试查询表，如果不存在会抛出异常
            jdbcTemplate.queryForObject("SELECT COUNT(*) FROM user_sessions", Integer.class);
            logger.info("user_sessions 表已存在，跳过创建");
        } catch (Exception e) {
            // 表不存在，开始创建
            logger.info("user_sessions 表不存在，开始创建...");
            
            try {
                // 创建 user_sessions 表
                String createTableSql = "CREATE TABLE user_sessions (" +
                        "id VARCHAR(32) PRIMARY KEY, " +
                        "user_id VARCHAR(32) NOT NULL, " +
                        "token_hash VARCHAR(255) NOT NULL COMMENT 'JWT token的哈希值，用于快速查找', " +
                        "is_active BOOLEAN DEFAULT TRUE COMMENT '会话是否活跃（最新登录的会话）', " +
                        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                        "last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                        "INDEX idx_user_id (user_id), " +
                        "INDEX idx_token_hash (token_hash), " +
                        "INDEX idx_is_active (is_active), " +
                        "INDEX idx_last_active_at (last_active_at), " +
                        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
                
                jdbcTemplate.execute(createTableSql);
                logger.info("✓ user_sessions 表创建成功！");
            } catch (Exception createException) {
                logger.error("✗ 创建 user_sessions 表失败: ", createException);
                logger.error("请手动执行以下 SQL 创建表:");
                logger.error("CREATE TABLE user_sessions (");
                logger.error("    id VARCHAR(32) PRIMARY KEY,");
                logger.error("    user_id VARCHAR(32) NOT NULL,");
                logger.error("    token_hash VARCHAR(255) NOT NULL,");
                logger.error("    is_active BOOLEAN DEFAULT TRUE,");
                logger.error("    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,");
                logger.error("    last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,");
                logger.error("    INDEX idx_user_id (user_id),");
                logger.error("    INDEX idx_token_hash (token_hash),");
                logger.error("    INDEX idx_is_active (is_active),");
                logger.error("    INDEX idx_last_active_at (last_active_at),");
                logger.error("    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
                logger.error(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                // 不抛出异常，允许应用继续启动
            }
        }
    }
    
    private void fixProductsTableFields() {
        try {
            // 检查 products 表是否存在
            jdbcTemplate.queryForObject("SELECT COUNT(*) FROM products", Integer.class);
            
            // 检查 images 字段类型
            String checkImagesSql = "SELECT DATA_TYPE FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'images'";
            
            try {
                String dataType = jdbcTemplate.queryForObject(checkImagesSql, String.class);
                
                if (dataType != null && !dataType.equalsIgnoreCase("mediumtext") && !dataType.equalsIgnoreCase("longtext")) {
                    logger.info("检测到 products.images 字段类型为 {}，开始修复为 MEDIUMTEXT...", dataType);
                    
                    jdbcTemplate.execute("ALTER TABLE products MODIFY COLUMN images MEDIUMTEXT COMMENT 'JSON字符串存储图片URL数组'");
                    logger.info("✓ products.images 字段已修复为 MEDIUMTEXT");
                } else {
                    logger.debug("products.images 字段类型已经是 MEDIUMTEXT 或 LONGTEXT，无需修复");
                }
            } catch (Exception e) {
                logger.warn("检查 images 字段类型时出错，尝试直接修复: {}", e.getMessage());
                // 尝试直接修复
                try {
                    jdbcTemplate.execute("ALTER TABLE products MODIFY COLUMN images MEDIUMTEXT COMMENT 'JSON字符串存储图片URL数组'");
                    logger.info("✓ products.images 字段已修复为 MEDIUMTEXT");
                } catch (Exception fixException) {
                    logger.error("修复 images 字段失败: ", fixException);
                }
            }
            
            // 检查 tags 字段类型
            try {
                String checkTagsSql = "SELECT DATA_TYPE FROM information_schema.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'tags'";
                String tagsDataType = jdbcTemplate.queryForObject(checkTagsSql, String.class);
                
                if (tagsDataType != null && !tagsDataType.equalsIgnoreCase("mediumtext") && !tagsDataType.equalsIgnoreCase("longtext")) {
                    logger.info("检测到 products.tags 字段类型为 {}，开始修复为 MEDIUMTEXT...", tagsDataType);
                    
                    jdbcTemplate.execute("ALTER TABLE products MODIFY COLUMN tags MEDIUMTEXT COMMENT 'JSON字符串存储标签数组'");
                    logger.info("✓ products.tags 字段已修复为 MEDIUMTEXT");
                } else {
                    logger.debug("products.tags 字段类型已经是 MEDIUMTEXT 或 LONGTEXT，无需修复");
                }
            } catch (Exception e) {
                logger.warn("检查 tags 字段类型时出错，尝试直接修复: {}", e.getMessage());
                try {
                    jdbcTemplate.execute("ALTER TABLE products MODIFY COLUMN tags MEDIUMTEXT COMMENT 'JSON字符串存储标签数组'");
                    logger.info("✓ products.tags 字段已修复为 MEDIUMTEXT");
                } catch (Exception fixException) {
                    logger.error("修复 tags 字段失败: ", fixException);
                }
            }
            
        } catch (Exception e) {
            logger.warn("products 表不存在或无法访问，跳过字段修复: {}", e.getMessage());
        }
    }
    
    private void addAlipayFields() {
        try {
            // 检查 orders 表是否存在
            jdbcTemplate.queryForObject("SELECT COUNT(*) FROM orders", Integer.class);
            
            // 检查并添加 orders 表的支付宝相关字段
            addColumnIfNotExists("orders", "trade_no", "VARCHAR(64) COMMENT '支付宝交易号'");
            addColumnIfNotExists("orders", "seller_alipay_account", "VARCHAR(100) COMMENT '卖家支付宝账号'");
            addColumnIfNotExists("orders", "transfer_status", "VARCHAR(20) DEFAULT 'pending' COMMENT '转账状态：pending(待转账), success(已转账), failed(转账失败)'");
            
            // 检查并添加 users 表的支付宝账号字段
            addColumnIfNotExists("users", "alipay_account", "VARCHAR(100) COMMENT '支付宝账号'");
            
            // 添加索引
            addIndexIfNotExists("orders", "idx_trade_no", "trade_no");
            addIndexIfNotExists("orders", "idx_transfer_status", "transfer_status");
            
        } catch (Exception e) {
            logger.warn("orders 或 users 表不存在或无法访问，跳过支付宝字段添加: {}", e.getMessage());
        }
    }
    
    private void addColumnIfNotExists(String tableName, String columnName, String columnDefinition) {
        try {
            String checkSql = "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, tableName, columnName);
            
            if (count == null || count == 0) {
                logger.info("检测到 {}.{} 字段不存在，开始添加...", tableName, columnName);
                String alterSql = String.format("ALTER TABLE %s ADD COLUMN %s %s", tableName, columnName, columnDefinition);
                jdbcTemplate.execute(alterSql);
                logger.info("✓ {}.{} 字段添加成功", tableName, columnName);
            } else {
                logger.debug("{}.{} 字段已存在，跳过添加", tableName, columnName);
            }
        } catch (Exception e) {
            logger.warn("添加 {}.{} 字段时出错: {}", tableName, columnName, e.getMessage());
        }
    }
    
    private void addIndexIfNotExists(String tableName, String indexName, String columnName) {
        try {
            String checkSql = "SELECT COUNT(*) FROM information_schema.STATISTICS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, tableName, indexName);
            
            if (count == null || count == 0) {
                logger.info("检测到 {}.{} 索引不存在，开始添加...", tableName, indexName);
                String createIndexSql = String.format("CREATE INDEX %s ON %s(%s)", indexName, tableName, columnName);
                jdbcTemplate.execute(createIndexSql);
                logger.info("✓ {}.{} 索引添加成功", tableName, indexName);
            } else {
                logger.debug("{}.{} 索引已存在，跳过添加", tableName, indexName);
            }
        } catch (Exception e) {
            logger.warn("添加 {}.{} 索引时出错: {}", tableName, indexName, e.getMessage());
        }
    }
    
    private void addRatingAndFollowTables() {
        // 添加用户信用等级字段
        addColumnIfNotExists("users", "credit_score", "DECIMAL(5,2) DEFAULT 5.00 COMMENT '信用等级（1-5分）'");
        
        // 创建订单评分表
        try {
            jdbcTemplate.queryForObject("SELECT COUNT(*) FROM order_ratings", Integer.class);
            logger.info("order_ratings 表已存在，跳过创建");
        } catch (Exception e) {
            logger.info("order_ratings 表不存在，开始创建...");
            try {
                String createTableSql = "CREATE TABLE order_ratings (" +
                        "id VARCHAR(32) PRIMARY KEY, " +
                        "order_id VARCHAR(32) NOT NULL COMMENT '订单ID', " +
                        "rater_id VARCHAR(32) NOT NULL COMMENT '评分者ID（买家或卖家）', " +
                        "rated_id VARCHAR(32) NOT NULL COMMENT '被评分者ID（买家或卖家）', " +
                        "rating INT NOT NULL COMMENT '评分（1-5分）', " +
                        "comment TEXT COMMENT '评价内容', " +
                        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                        "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                        "UNIQUE KEY uk_order_rater (order_id, rater_id), " +
                        "INDEX idx_order_id (order_id), " +
                        "INDEX idx_rater_id (rater_id), " +
                        "INDEX idx_rated_id (rated_id), " +
                        "FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, " +
                        "FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE, " +
                        "FOREIGN KEY (rated_id) REFERENCES users(id) ON DELETE CASCADE" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单评分表'";
                jdbcTemplate.execute(createTableSql);
                logger.info("✓ order_ratings 表创建成功！");
            } catch (Exception createException) {
                logger.error("✗ 创建 order_ratings 表失败: ", createException);
            }
        }
        
        // 创建关注表
        try {
            jdbcTemplate.queryForObject("SELECT COUNT(*) FROM follows", Integer.class);
            logger.info("follows 表已存在，跳过创建");
        } catch (Exception e) {
            logger.info("follows 表不存在，开始创建...");
            try {
                String createTableSql = "CREATE TABLE follows (" +
                        "id VARCHAR(32) PRIMARY KEY, " +
                        "follower_id VARCHAR(32) NOT NULL COMMENT '关注者ID', " +
                        "following_id VARCHAR(32) NOT NULL COMMENT '被关注者ID', " +
                        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                        "UNIQUE KEY uk_follower_following (follower_id, following_id), " +
                        "INDEX idx_follower_id (follower_id), " +
                        "INDEX idx_following_id (following_id), " +
                        "FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE, " +
                        "FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注关系表'";
                jdbcTemplate.execute(createTableSql);
                logger.info("✓ follows 表创建成功！");
            } catch (Exception createException) {
                logger.error("✗ 创建 follows 表失败: ", createException);
            }
        }
    }
    
    private void initializeUserConversationSettingsTable() {
        try {
            jdbcTemplate.queryForObject("SELECT COUNT(*) FROM user_conversation_settings", Integer.class);
            logger.info("user_conversation_settings 表已存在，跳过创建");
        } catch (Exception e) {
            logger.info("user_conversation_settings 表不存在，开始创建...");
            try {
                String createTableSql = "CREATE TABLE user_conversation_settings (" +
                        "id VARCHAR(32) PRIMARY KEY, " +
                        "user_id VARCHAR(32) NOT NULL, " +
                        "conversation_id VARCHAR(32) NOT NULL, " +
                        "is_deleted BOOLEAN DEFAULT FALSE COMMENT '用户是否删除了此会话', " +
                        "deleted_at DATETIME COMMENT '删除时间', " +
                        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                        "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                        "UNIQUE KEY uk_user_conversation (user_id, conversation_id), " +
                        "INDEX idx_user_id (user_id), " +
                        "INDEX idx_conversation_id (conversation_id), " +
                        "INDEX idx_is_deleted (is_deleted), " +
                        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, " +
                        "FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
                jdbcTemplate.execute(createTableSql);
                logger.info("✓ user_conversation_settings 表创建成功！");
            } catch (Exception createException) {
                logger.error("✗ 创建 user_conversation_settings 表失败: ", createException);
            }
        }
    }
}
