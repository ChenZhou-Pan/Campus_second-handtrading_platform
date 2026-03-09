package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.service.UserProfileService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserProfileController {
    @Autowired
    private UserProfileService userProfileService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 获取用户主页信息
     */
    @GetMapping("/{userId}/profile")
    public ApiResponse<Map<String, Object>> getUserProfile(
            @PathVariable String userId,
            HttpServletRequest request) {
        try {
            // 尝试获取当前用户ID（如果已登录）
            String currentUserId = null;
            try {
                String token = extractToken(request);
                currentUserId = jwtUtil.getUserIdFromToken(token);
            } catch (Exception e) {
                // 未登录，currentUserId 为 null
            }
            
            Map<String, Object> profile = userProfileService.getUserProfile(userId, currentUserId);
            return ApiResponse.success(profile);
        } catch (RuntimeException e) {
            return ApiResponse.error(404, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("获取用户信息失败: " + e.getMessage());
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
