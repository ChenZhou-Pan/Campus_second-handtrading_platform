package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.entity.Feedback;
import com.campus.trading.service.FeedbackService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ApiResponse<Feedback> createFeedback(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        try {
            String userId = null;
            // 尝试获取用户ID（如果已登录）
            try {
                String token = extractToken(httpRequest);
                if (token != null) {
                    userId = jwtUtil.getUserIdFromToken(token);
                }
            } catch (Exception e) {
                // 未登录用户也可以提交反馈
            }

            String type = (String) request.get("type");
            String content = (String) request.get("content");
            String contact = (String) request.get("contact");
            Integer rating = request.get("rating") != null ? 
                (request.get("rating") instanceof Integer ? (Integer) request.get("rating") : 
                 ((Number) request.get("rating")).intValue()) : 5;

            if (type == null || type.isEmpty()) {
                return ApiResponse.error(400, "反馈类型不能为空");
            }
            if (content == null || content.isEmpty()) {
                return ApiResponse.error(400, "反馈内容不能为空");
            }
            if (content.length() < 10) {
                return ApiResponse.error(400, "反馈内容至少10个字符");
            }
            if (content.length() > 500) {
                return ApiResponse.error(400, "反馈内容最多500个字符");
            }

            Feedback feedback = feedbackService.createFeedback(userId, type, content, contact, rating);
            return ApiResponse.success("反馈提交成功", feedback);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(500, "提交反馈失败: " + e.getMessage());
        }
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
