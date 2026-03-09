package com.campus.trading.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Order {
    private String id;
    private String productId;
    private String buyerId;
    private String sellerId;
    private BigDecimal price;
    private String status; // pending, paid, shipped, delivered, completed, cancelled, refunded
    private String shippingAddress;
    private String contactPhone;
    private String note;
    private String tradeNo; // 支付宝交易号
    private String sellerAlipayAccount; // 卖家支付宝账号
    private String transferStatus; // 转账状态：pending(待转账), success(已转账), failed(转账失败)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
