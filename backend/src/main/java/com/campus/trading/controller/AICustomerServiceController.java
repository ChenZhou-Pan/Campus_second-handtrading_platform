package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.service.AICustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai-customer-service")
public class AICustomerServiceController {
    @Autowired
    private AICustomerService aiCustomerService;

    @PostMapping("/chat")
    public ApiResponse<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ApiResponse.error(400, "消息内容不能为空");
            }

            String reply = aiCustomerService.chat(message.trim());
            
            return ApiResponse.success(Map.of("reply", reply));
        } catch (Exception e) {
            return ApiResponse.error("AI客服服务暂时不可用: " + e.getMessage());
        }
    }
}
