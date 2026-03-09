package com.campus.trading.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserSession {
    private String id;
    private String userId;
    private String tokenHash; // JWT token的哈希值
    private Boolean isActive; // 是否为活跃会话（最新登录的会话）
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;
}
