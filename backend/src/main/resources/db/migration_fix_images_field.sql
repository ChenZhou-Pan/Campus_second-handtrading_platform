-- 修复 products 表的 images 字段类型
-- 将 TEXT 改为 MEDIUMTEXT 以支持更长的图片 URL 列表

USE campus_trading;

-- 修改 images 字段为 MEDIUMTEXT（最大 16MB，足够存储大量图片 URL）
ALTER TABLE products MODIFY COLUMN images MEDIUMTEXT;

-- 同时检查 tags 字段，如果也是 TEXT，也改为 MEDIUMTEXT
ALTER TABLE products MODIFY COLUMN tags MEDIUMTEXT;
