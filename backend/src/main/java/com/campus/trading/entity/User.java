package com.campus.trading.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private String id;
    private String username;
    private String password;
    private String avatar;
    private String phone;
    private String email;
    private String role; // buyer, seller, both
    private String alipayAccount; // 支付宝账号
    private java.math.BigDecimal creditScore; // 信用等级（1-5分）
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
