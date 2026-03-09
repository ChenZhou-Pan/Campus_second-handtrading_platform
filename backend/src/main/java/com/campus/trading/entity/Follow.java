package com.campus.trading.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Follow {
    private String id;
    private String followerId; // 关注者ID
    private String followingId; // 被关注者ID
    private LocalDateTime createdAt;
}
