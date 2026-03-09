-- 测试数据脚本
USE campus_trading;

-- 插入管理员账户
INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES
('admin001', 'admin', '$2a$10$3OxpT9HnNt7puU/2xkutpeb6lFXlw76jdXpCmAXqngXG0l0VqCUbK', 'admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE username=username, role='admin';

-- 插入测试用户
INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES
('testuser001', 'testuser', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwy8pL5O', 'both', NOW(), NOW())
ON DUPLICATE KEY UPDATE username=username;

-- 插入测试商品（如果products表存在）
INSERT INTO products (id, title, description, price, condition, category, seller_id, status, view_count, favorite_count, created_at, updated_at) VALUES
('prod001', '测试商品1', '这是一个测试商品描述', 99.99, 'good', 'electronics', 'testuser001', 'published', 0, 0, NOW(), NOW()),
('prod002', '测试商品2', '这是另一个测试商品', 199.99, 'like_new', 'books', 'testuser001', 'published', 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE title=title;
