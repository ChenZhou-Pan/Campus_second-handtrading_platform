package com.campus.trading.dto;

import com.campus.trading.entity.Conversation;
import com.campus.trading.entity.Message;
import com.campus.trading.entity.User;
import com.campus.trading.mapper.MessageMapper;
import com.campus.trading.mapper.UserMapper;
import com.campus.trading.util.JsonUtil;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ConversationResponse {
    private String id;
    private List<String> participantIds;
    private List<UserInfo> participants;
    private MessageResponse lastMessage;
    private Integer unreadCount;
    private String updatedAt;
    
    @Data
    public static class UserInfo {
        private String id;
        private String username;
        private String avatar;
        
        public static UserInfo fromUser(User user) {
            if (user == null) return null;
            UserInfo info = new UserInfo();
            info.setId(user.getId());
            info.setUsername(user.getUsername());
            info.setAvatar(user.getAvatar());
            return info;
        }
    }
    
    @Data
    public static class MessageResponse {
        private String id;
        private String conversationId;
        private String senderId;
        private UserInfo sender;
        private String receiverId;
        private UserInfo receiver;
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
                response.setSender(UserInfo.fromUser(sender));
            }
            if (message.getReceiverId() != null) {
                User receiver = userMapper.findById(message.getReceiverId());
                response.setReceiver(UserInfo.fromUser(receiver));
            }
            
            return response;
        }
    }
    
    public static ConversationResponse fromConversation(
            Conversation conversation, 
            String currentUserId,
            UserMapper userMapper,
            MessageMapper messageMapper) {
        if (conversation == null) return null;
        
        ConversationResponse response = new ConversationResponse();
        response.setId(conversation.getId());
        response.setUpdatedAt(conversation.getUpdatedAt() != null ? conversation.getUpdatedAt().toString() : null);
        
        // 解析参与者ID
        List<String> participantIds = JsonUtil.fromJsonArray(conversation.getParticipantIds());
        response.setParticipantIds(participantIds);
        
        // 获取参与者用户信息
        List<UserInfo> participants = new ArrayList<>();
        for (String userId : participantIds) {
            User user = userMapper.findById(userId);
            if (user != null) {
                participants.add(UserInfo.fromUser(user));
            }
        }
        response.setParticipants(participants);
        
        // 获取最后一条消息
        Message lastMessage = messageMapper.findLastMessage(conversation.getId());
        if (lastMessage != null) {
            response.setLastMessage(MessageResponse.fromMessage(lastMessage, userMapper));
        }
        
        // 获取未读消息数
        if (currentUserId != null) {
            Integer unreadCount = messageMapper.countUnread(conversation.getId(), currentUserId);
            response.setUnreadCount(unreadCount != null ? unreadCount : 0);
        } else {
            response.setUnreadCount(0);
        }
        
        return response;
    }
}
