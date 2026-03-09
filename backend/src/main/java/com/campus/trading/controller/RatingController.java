package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.entity.OrderRating;
import com.campus.trading.service.RatingService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ratings")
public class RatingController {
    @Autowired
    private RatingService ratingService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 创建订单评分
     */
    @PostMapping("/orders/{orderId}")
    public ApiResponse<OrderRating> createRating(
            @PathVariable String orderId,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            Integer rating = (Integer) request.get("rating");
            String comment = (String) request.get("comment");
            
            if (rating == null || rating < 1 || rating > 5) {
                return ApiResponse.error(400, "评分必须在1-5分之间");
            }
            
            OrderRating orderRating = ratingService.createRating(orderId, userId, rating, comment);
            return ApiResponse.success("评分成功", orderRating);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("评分失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取订单的所有评分
     */
    @GetMapping("/orders/{orderId}")
    public ApiResponse<java.util.List<OrderRating>> getOrderRatings(@PathVariable String orderId) {
        try {
            java.util.List<OrderRating> ratings = ratingService.getOrderRatings(orderId);
            return ApiResponse.success(ratings);
        } catch (Exception e) {
            return ApiResponse.error("获取评分失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查是否已评分
     */
    @GetMapping("/orders/{orderId}/check")
    public ApiResponse<Boolean> checkRated(@PathVariable String orderId, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            boolean hasRated = ratingService.hasRated(orderId, userId);
            return ApiResponse.success(hasRated);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("检查失败: " + e.getMessage());
        }
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("未找到token");
    }
}
