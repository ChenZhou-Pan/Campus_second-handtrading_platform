package com.campus.trading.dto;

import com.campus.trading.entity.Message;
import com.campus.trading.entity.User;
import com.campus.trading.mapper.UserMapper;
import lombok.Data;

@Data
public class MessageResponse {
    private String id;
    private String conversationId;
    private String senderId;
    private ConversationResponse.UserInfo sender;
    private String receiverId;
    private ConversationResponse.UserInfo receiver;
    private String content;
    private String type;
    private Boolean read;
    private String createdAt;
    
    public static MessageResponse fromMessage(Message message, UserMapper userMapper) {
        if (message == null) return null;
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setConversationId(message.getConversationId());
        response.setSenderId(message.getSenderId());
        response.setReceiverId(message.getReceiverId());
        response.setContent(message.getContent());
        response.setType(message.getType());
        response.setRead(message.getRead());
        response.setCreatedAt(message.getCreatedAt() != null ? message.getCreatedAt().toString() : null);
        
        // 获取发送者和接收者信息
        if (message.getSenderId() != null) {
            User sender = userMapper.findById(message.getSenderId());
            response.setSender(ConversationResponse.UserInfo.fromUser(sender));
        }
        if (message.getReceiverId() != null) {
            User receiver = userMapper.findById(message.getReceiverId());
            response.setReceiver(ConversationResponse.UserInfo.fromUser(receiver));
        }
        
        return response;
    }
}
