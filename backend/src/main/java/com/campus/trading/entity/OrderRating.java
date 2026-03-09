package com.campus.trading.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderRating {
    private String id;
    private String orderId;
    private String raterId; // 评分者ID（买家或卖家）
    private String ratedId; // 被评分者ID（买家或卖家）
    private Integer rating; // 评分（1-5分）
    private String comment; // 评价内容
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
