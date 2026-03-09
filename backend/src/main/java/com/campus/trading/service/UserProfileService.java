package com.campus.trading.service;

import com.campus.trading.dto.ProductResponse;
import com.campus.trading.entity.Product;
import com.campus.trading.entity.User;
import com.campus.trading.mapper.ProductMapper;
import com.campus.trading.mapper.UserMapper;
import com.campus.trading.mapper.OrderRatingMapper;
import com.campus.trading.mapper.FollowMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class UserProfileService {
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private OrderRatingMapper ratingMapper;
    
    @Autowired
    private FollowMapper followMapper;
    
    /**
     * 获取用户主页信息
     */
    public Map<String, Object> getUserProfile(String userId, String currentUserId) {
        Map<String, Object> profile = new HashMap<>();
        
        // 获取用户基本信息
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        profile.put("user", user);
        
        // 获取用户发布的商品（包括已发布和已售出的）
        List<Product> publishedProducts = productMapper.findBySellerId(userId, 0, 100, "published");
        List<Product> soldProducts = productMapper.findBySellerId(userId, 0, 100, "sold");
        
        // 转换为 ProductResponse 以正确解析 images
        List<ProductResponse> publishedResponses = publishedProducts.stream()
            .map(ProductResponse::fromProduct)
            .collect(Collectors.toList());
        List<ProductResponse> soldResponses = soldProducts.stream()
            .map(ProductResponse::fromProduct)
            .collect(Collectors.toList());
        
        // 合并列表：已售出的放在前面
        List<ProductResponse> allProducts = new ArrayList<>();
        allProducts.addAll(soldResponses);
        allProducts.addAll(publishedResponses);
        
        profile.put("products", allProducts);
        
        // 获取信用等级
        Double averageRating = ratingMapper.getAverageRatingByUserId(userId);
        if (averageRating == null) {
            averageRating = 5.0; // 默认5分
        }
        profile.put("creditScore", averageRating);
        profile.put("ratingCount", ratingMapper.countRatingsByUserId(userId));
        
        // 获取关注数和粉丝数
        Long followingCount = followMapper.countByFollowerId(userId);
        Long followerCount = followMapper.countByFollowingId(userId);
        profile.put("followingCount", followingCount);
        profile.put("followerCount", followerCount);
        
        // 如果当前用户已登录，检查是否已关注
        if (currentUserId != null && !currentUserId.equals(userId)) {
            boolean isFollowing = followMapper.findByFollowerIdAndFollowingId(currentUserId, userId) != null;
            profile.put("isFollowing", isFollowing);
        } else {
            profile.put("isFollowing", false);
        }
        
        return profile;
    }
}
