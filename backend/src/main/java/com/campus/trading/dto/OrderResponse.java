package com.campus.trading.dto;

import com.campus.trading.entity.Order;
import com.campus.trading.entity.Product;
import com.campus.trading.entity.User;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderResponse {
    private String id;
    private String productId;
    private ProductResponse product; // 商品信息
    private String buyerId;
    private UserInfo buyer; // 买家信息
    private String sellerId;
    private UserInfo seller; // 卖家信息
    private BigDecimal price;
    private String status;
    private String shippingAddress;
    private String contactPhone;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class UserInfo {
        private String id;
        private String username;
        private String avatar;

        public static UserInfo fromUser(User user) {
            if (user == null) {
                return null;
            }
            UserInfo info = new UserInfo();
            info.setId(user.getId());
            info.setUsername(user.getUsername());
            info.setAvatar(user.getAvatar());
            return info;
        }
    }

    public static OrderResponse fromOrder(Order order, Product product, User buyer, User seller) {
        if (order == null) {
            return null;
        }
        
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setProductId(order.getProductId());
        response.setProduct(product != null ? ProductResponse.fromProduct(product) : null);
        response.setBuyerId(order.getBuyerId());
        response.setBuyer(UserInfo.fromUser(buyer));
        response.setSellerId(order.getSellerId());
        response.setSeller(UserInfo.fromUser(seller));
        response.setPrice(order.getPrice());
        response.setStatus(order.getStatus());
        response.setShippingAddress(order.getShippingAddress());
        response.setContactPhone(order.getContactPhone());
        response.setNote(order.getNote());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        
        return response;
    }
}
