-- Migration script to add campus column to products table
-- Run this script if your products table doesn't have the campus column

USE campus_trading;

-- Check if column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'products';
SET @columnname = 'campus';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) AFTER location')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Alternative simpler version (if the above doesn't work, use this):
-- ALTER TABLE products ADD COLUMN campus VARCHAR(100) AFTER location;
