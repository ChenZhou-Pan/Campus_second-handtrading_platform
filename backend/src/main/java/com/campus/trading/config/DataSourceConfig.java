package com.campus.trading.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@Component
@Order(1)
public class DataSourceConfig implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);
    
    private final DataSource dataSource;
    
    public DataSourceConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    @Override
    public void run(String... args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            logger.info("数据库连接成功!");
            logger.info("数据库URL: {}", metaData.getURL());
            logger.info("数据库驱动: {}", metaData.getDriverName());
            logger.info("数据库版本: {}", metaData.getDatabaseProductVersion());
        } catch (Exception e) {
            logger.error("数据库连接失败: ", e);
        }
    }
}
