package com.campus.trading.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductCreateRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String condition;
    private String category;
    private List<String> images; // 前端发送的是数组
    private String status;
    private String location; // 可能是数组字符串，需要处理
    private String campus;
    private List<String> tags; // 前端发送的是数组
}
