-- 管理员账户创建脚本
-- 用户名: admin
-- 密码: 123456
-- 角色: admin

USE campus_trading;

-- 插入管理员账户（如果不存在则插入，存在则更新为管理员角色）
INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES
('admin001', 'admin', '$2a$10$3OxpT9HnNt7puU/2xkutpeb6lFXlw76jdXpCmAXqngXG0l0VqCUbK', 'admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    username='admin',
    password='$2a$10$3OxpT9HnNt7puU/2xkutpeb6lFXlw76jdXpCmAXqngXG0l0VqCUbK',
    role='admin',
    updated_at=NOW();

-- 或者如果admin用户已存在但角色不是admin，更新角色
UPDATE users SET role='admin', updated_at=NOW() WHERE username='admin' AND role != 'admin';
