package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.service.FollowService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/follows")
public class FollowController {
    @Autowired
    private FollowService followService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 关注用户
     */
    @PostMapping("/{userId}")
    public ApiResponse<String> followUser(@PathVariable String userId, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String followerId = jwtUtil.getUserIdFromToken(token);
            
            followService.followUser(followerId, userId);
            return ApiResponse.success("关注成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("关注失败: " + e.getMessage());
        }
    }
    
    /**
     * 取消关注
     */
    @DeleteMapping("/{userId}")
    public ApiResponse<String> unfollowUser(@PathVariable String userId, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String followerId = jwtUtil.getUserIdFromToken(token);
            
            followService.unfollowUser(followerId, userId);
            return ApiResponse.success("取消关注成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("取消关注失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查是否已关注
     */
    @GetMapping("/{userId}/check")
    public ApiResponse<Boolean> checkFollowing(@PathVariable String userId, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String followerId = jwtUtil.getUserIdFromToken(token);
            boolean isFollowing = followService.isFollowing(followerId, userId);
            return ApiResponse.success(isFollowing);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("检查失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取关注列表
     */
    @GetMapping("/following")
    public ApiResponse<java.util.List<com.campus.trading.entity.Follow>> getFollowingList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            java.util.List<com.campus.trading.entity.Follow> follows = followService.getFollowingList(userId, page, pageSize);
            return ApiResponse.success(follows);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("获取关注列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取粉丝列表
     */
    @GetMapping("/followers")
    public ApiResponse<java.util.List<com.campus.trading.entity.Follow>> getFollowerList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            java.util.List<com.campus.trading.entity.Follow> follows = followService.getFollowerList(userId, page, pageSize);
            return ApiResponse.success(follows);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("获取粉丝列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取指定用户的关注列表
     */
    @GetMapping("/users/{userId}/following")
    public ApiResponse<java.util.List<com.campus.trading.entity.Follow>> getUserFollowingList(
            @PathVariable String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        try {
            java.util.List<com.campus.trading.entity.Follow> follows = followService.getFollowingList(userId, page, pageSize);
            return ApiResponse.success(follows);
        } catch (Exception e) {
            return ApiResponse.error("获取关注列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取指定用户的粉丝列表
     */
    @GetMapping("/users/{userId}/followers")
    public ApiResponse<java.util.List<com.campus.trading.entity.Follow>> getUserFollowerList(
            @PathVariable String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        try {
            java.util.List<com.campus.trading.entity.Follow> follows = followService.getFollowerList(userId, page, pageSize);
            return ApiResponse.success(follows);
        } catch (Exception e) {
            return ApiResponse.error("获取粉丝列表失败: " + e.getMessage());
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
