package com.campus.trading.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Feedback {
    private String id;
    private String userId; // 可选，未登录用户可以为空
    private String type; // suggestion, bug, question, praise
    private String content;
    private String contact; // 联系方式（手机号或邮箱）
    private Integer rating; // 满意度评分 1-5
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
