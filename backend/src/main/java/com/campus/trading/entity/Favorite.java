package com.campus.trading.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Favorite {
    private String id;
    private String userId;
    private String productId;
    private LocalDateTime createdAt;
}
