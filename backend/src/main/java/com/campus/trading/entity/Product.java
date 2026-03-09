package com.campus.trading.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Product {
    private String id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String condition; // new, like_new, good, fair, poor
    private String category;
    private String images; // JSON字符串存储图片数组
    private String sellerId;
    private String status; // draft, published, sold, deleted
    private Integer viewCount;
    private Integer favoriteCount;
    private String location;
    private String campus; // 备注校区
    private String tags; // JSON字符串存储标签数组
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
