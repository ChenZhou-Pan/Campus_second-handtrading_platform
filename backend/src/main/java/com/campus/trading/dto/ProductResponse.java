package com.campus.trading.dto;

import com.campus.trading.entity.Product;
import com.campus.trading.util.JsonUtil;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductResponse {
    private String id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String condition;
    private String category;
    private List<String> images; // 返回数组格式
    private String sellerId;
    private String sellerUsername; // 卖家用户名
    private String sellerAvatar; // 卖家头像
    private String status;
    private Integer viewCount;
    private Integer favoriteCount;
    private String location;
    private String campus;
    private List<String> tags; // 返回数组格式
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ProductResponse fromProduct(Product product) {
        if (product == null) {
            return null;
        }
        
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setTitle(product.getTitle());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setOriginalPrice(product.getOriginalPrice());
        response.setCondition(product.getCondition());
        response.setCategory(product.getCategory());
        
        // 将 images JSON 字符串转换为数组
        if (product.getImages() != null && !product.getImages().trim().isEmpty()) {
            try {
                List<String> imageList = JsonUtil.fromJsonArray(product.getImages());
                response.setImages(imageList != null ? imageList : java.util.Collections.emptyList());
            } catch (Exception e) {
                // 如果解析失败，尝试作为单个字符串处理
                response.setImages(java.util.Arrays.asList(product.getImages()));
            }
        } else {
            response.setImages(java.util.Collections.emptyList());
        }
        
        response.setSellerId(product.getSellerId());
        response.setStatus(product.getStatus());
        response.setViewCount(product.getViewCount());
        response.setFavoriteCount(product.getFavoriteCount());
        response.setLocation(product.getLocation());
        response.setCampus(product.getCampus());
        
        // 将 tags JSON 字符串转换为数组
        if (product.getTags() != null && !product.getTags().trim().isEmpty()) {
            try {
                List<String> tagList = JsonUtil.fromJsonArray(product.getTags());
                response.setTags(tagList != null ? tagList : java.util.Collections.emptyList());
            } catch (Exception e) {
                response.setTags(java.util.Collections.emptyList());
            }
        } else {
            response.setTags(java.util.Collections.emptyList());
        }
        
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        
        return response;
    }
}
