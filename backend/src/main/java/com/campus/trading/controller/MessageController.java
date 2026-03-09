package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.common.PageResult;
import com.campus.trading.dto.ConversationResponse;
import com.campus.trading.dto.MessageResponse;
import com.campus.trading.entity.Conversation;
import com.campus.trading.entity.Message;
import com.campus.trading.mapper.MessageMapper;
import com.campus.trading.mapper.UserMapper;
import com.campus.trading.service.MessageService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private MessageMapper messageMapper;
    
    /**
     * 获取会话列表
     */
    @GetMapping("/conversations")
    public ApiResponse<PageResult<ConversationResponse>> getConversations(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            List<Conversation> conversations = messageService.getConversationsByUserId(userId, page, pageSize);
            Long total = messageService.countConversationsByUserId(userId);
            
            List<ConversationResponse> responses = conversations.stream()
                .map(conv -> ConversationResponse.fromConversation(conv, userId, userMapper, messageMapper))
                .collect(Collectors.toList());
            
            PageResult<ConversationResponse> result = PageResult.of(responses, total, page, pageSize);
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("获取会话列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取会话详情
     */
    @GetMapping("/conversations/{id}")
    public ApiResponse<ConversationResponse> getConversationById(
            @PathVariable String id,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            Conversation conversation = messageService.getConversationById(id, userId);
            ConversationResponse response = ConversationResponse.fromConversation(conversation, userId, userMapper, messageMapper);
            return ApiResponse.success(response);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("获取会话详情失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建或获取会话
     */
    @PostMapping("/conversations")
    public ApiResponse<ConversationResponse> getOrCreateConversation(
            @RequestBody Map<String, Object> requestData,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String currentUserId = jwtUtil.getUserIdFromToken(token);
            
            String userId = (String) requestData.get("userId");
            if (userId == null || userId.isEmpty()) {
                return ApiResponse.error(400, "用户ID不能为空");
            }
            
            String productId = (String) requestData.get("productId");
            
            Conversation conversation = messageService.getOrCreateConversation(currentUserId, userId, productId);
            ConversationResponse response = ConversationResponse.fromConversation(conversation, currentUserId, userMapper, messageMapper);
            return ApiResponse.success(response);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("创建会话失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取消息列表
     */
    @GetMapping("/conversations/{id}/messages")
    public ApiResponse<PageResult<MessageResponse>> getMessages(
            @PathVariable String id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            List<Message> messages = messageService.getMessagesByConversationId(id, userId, page, pageSize);
            Long total = messageMapper.countByConversationId(id);
            
            List<MessageResponse> responses = messages.stream()
                .map(msg -> MessageResponse.fromMessage(msg, userMapper))
                .collect(Collectors.toList());
            
            PageResult<MessageResponse> result = PageResult.of(responses, total, page, pageSize);
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("获取消息列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 发送消息
     */
    @PostMapping("/conversations/{id}/messages")
    public ApiResponse<MessageResponse> sendMessage(
            @PathVariable String id,
            @RequestBody Map<String, Object> requestData,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String senderId = jwtUtil.getUserIdFromToken(token);
            
            String content = (String) requestData.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ApiResponse.error(400, "消息内容不能为空");
            }
            
            String type = (String) requestData.get("type");
            if (type == null) {
                type = "text";
            }
            
            Message message = messageService.sendMessage(id, senderId, content.trim(), type);
            MessageResponse response = MessageResponse.fromMessage(message, userMapper);
            return ApiResponse.success(response);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("发送消息失败: " + e.getMessage());
        }
    }
    
    /**
     * 标记消息为已读
     */
    @PutMapping("/conversations/{id}/read")
    public ApiResponse<String> markAsRead(
            @PathVariable String id,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            messageService.markAsRead(id, userId);
            return ApiResponse.success("标记成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("标记失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除会话
     */
    @DeleteMapping("/conversations/{id}")
    public ApiResponse<String> deleteConversation(
            @PathVariable String id,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            // 验证用户是否参与此会话
            Conversation conversation = messageService.getConversationById(id, userId);
            if (conversation == null) {
                return ApiResponse.error(404, "会话不存在");
            }
            
            messageService.deleteConversation(id, userId);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("删除失败: " + e.getMessage());
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
