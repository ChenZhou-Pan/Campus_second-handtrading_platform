package com.campus.trading;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.campus.trading.mapper")
public class SecondHandTradingApplication {
    public static void main(String[] args) {
        SpringApplication.run(SecondHandTradingApplication.class, args);
    }
}
