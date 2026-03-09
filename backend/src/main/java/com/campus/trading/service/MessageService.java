package com.campus.trading.service;

import com.campus.trading.entity.Conversation;
import com.campus.trading.entity.Message;
import com.campus.trading.entity.User;
import com.campus.trading.entity.UserConversationSetting;
import com.campus.trading.mapper.ConversationMapper;
import com.campus.trading.mapper.MessageMapper;
import com.campus.trading.mapper.UserConversationSettingMapper;
import com.campus.trading.mapper.UserMapper;
import com.campus.trading.util.IdUtil;
import com.campus.trading.util.JsonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {
    @Autowired
    private ConversationMapper conversationMapper;
    
    @Autowired
    private MessageMapper messageMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private UserConversationSettingMapper userConversationSettingMapper;
    
    /**
     * 获取或创建会话
     */
    @Transactional
    public Conversation getOrCreateConversation(String currentUserId, String otherUserId, String productId) {
        // 不能和自己聊天
        if (currentUserId.equals(otherUserId)) {
            throw new RuntimeException("不能和自己聊天");
        }
        
        // 生成参与者ID数组（排序以确保唯一性）
        List<String> participantIds = Arrays.asList(currentUserId, otherUserId);
        participantIds = participantIds.stream().sorted().collect(Collectors.toList());
        String participantIdsJson = JsonUtil.toJson(participantIds);
        
        // 查找是否已存在会话
        Conversation existing = conversationMapper.findByParticipants(participantIdsJson);
        if (existing != null) {
            // 检查当前用户是否删除了此会话，如果删除了，恢复它
            UserConversationSetting setting = userConversationSettingMapper.findByUserIdAndConversationId(currentUserId, existing.getId());
            if (setting != null && Boolean.TRUE.equals(setting.getIsDeleted())) {
                // 恢复会话（取消删除标记）
                userConversationSettingMapper.markAsNotDeleted(currentUserId, existing.getId());
            }
            return enrichConversation(existing);
        }
        
        // 创建新会话
        Conversation conversation = new Conversation();
        conversation.setId(IdUtil.generateId());
        conversation.setParticipantIds(participantIdsJson);
        conversation.setUpdatedAt(LocalDateTime.now());
        
        conversationMapper.insert(conversation);
        return enrichConversation(conversation);
    }
    
    /**
     * 获取用户的会话列表（排除已删除的会话，但如果会话有新消息则自动恢复）
     */
    public List<Conversation> getConversationsByUserId(String userId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        List<Conversation> conversations = conversationMapper.findByUserId(userId, offset, pageSize);
        
        // 处理每个会话：如果被删除但有新消息，则自动恢复
        return conversations.stream()
            .map(conv -> {
                UserConversationSetting setting = userConversationSettingMapper.findByUserIdAndConversationId(userId, conv.getId());
                
                // 如果会话被删除，检查是否有未读消息
                if (setting != null && Boolean.TRUE.equals(setting.getIsDeleted())) {
                    // 检查是否有未读消息
                    Integer unreadCount = messageMapper.countUnread(conv.getId(), userId);
                    if (unreadCount != null && unreadCount > 0) {
                        // 有新消息，自动恢复会话
                        userConversationSettingMapper.markAsNotDeleted(userId, conv.getId());
                        return conv; // 返回会话（已恢复）
                    }
                    return null; // 没有新消息，过滤掉
                }
                return conv; // 未删除，正常返回
            })
            .filter(conv -> conv != null) // 过滤掉null（已删除且无新消息的会话）
            .map(this::enrichConversation)
            .collect(Collectors.toList());
    }
    
    /**
     * 获取会话总数（排除已删除的会话）
     */
    public Long countConversationsByUserId(String userId) {
        List<Conversation> allConversations = conversationMapper.findByUserId(userId, 0, Integer.MAX_VALUE);
        // 过滤掉当前用户已删除的会话
        long count = allConversations.stream()
            .filter(conv -> {
                UserConversationSetting setting = userConversationSettingMapper.findByUserIdAndConversationId(userId, conv.getId());
                return setting == null || !Boolean.TRUE.equals(setting.getIsDeleted());
            })
            .count();
        return count;
    }
    
    /**
     * 获取会话详情
     */
    public Conversation getConversationById(String conversationId, String userId) {
        Conversation conversation = conversationMapper.findById(conversationId);
        if (conversation == null) {
            throw new RuntimeException("会话不存在");
        }
        
        // 验证用户是否参与此会话
        List<String> participantIds = JsonUtil.fromJsonArray(conversation.getParticipantIds());
        if (!participantIds.contains(userId)) {
            throw new RuntimeException("无权限访问此会话");
        }
        
        return enrichConversation(conversation);
    }
    
    /**
     * 获取会话的消息列表
     */
    public List<Message> getMessagesByConversationId(String conversationId, String userId, int page, int pageSize) {
        // 验证用户权限
        Conversation conversation = conversationMapper.findById(conversationId);
        if (conversation == null) {
            throw new RuntimeException("会话不存在");
        }
        List<String> participantIds = JsonUtil.fromJsonArray(conversation.getParticipantIds());
        if (!participantIds.contains(userId)) {
            throw new RuntimeException("无权限访问此会话");
        }
        
        int offset = (page - 1) * pageSize;
        List<Message> messages = messageMapper.findByConversationId(conversationId, offset, pageSize);
        // 反转列表，使最新的消息在最后
        List<Message> reversed = new ArrayList<>();
        for (int i = messages.size() - 1; i >= 0; i--) {
            reversed.add(messages.get(i));
        }
        return reversed;
    }
    
    /**
     * 发送消息
     */
    @Transactional
    public Message sendMessage(String conversationId, String senderId, String content, String type) {
        // 验证会话
        Conversation conversation = conversationMapper.findById(conversationId);
        if (conversation == null) {
            throw new RuntimeException("会话不存在");
        }
        
        // 验证发送者是否参与此会话
        List<String> participantIds = JsonUtil.fromJsonArray(conversation.getParticipantIds());
        if (!participantIds.contains(senderId)) {
            throw new RuntimeException("无权限在此会话中发送消息");
        }
        
        // 确定接收者
        String receiverId = participantIds.stream()
            .filter(id -> !id.equals(senderId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("无法确定接收者"));
        
        // 检查连续发送消息限制：对方未回复之前，最多只能发三条消息
        // 查找对方（receiverId）发送给当前用户（senderId）的最后一条消息
        Message lastMessageFromReceiver = messageMapper.findLastMessageByReceiver(conversationId, receiverId);
        
        LocalDateTime checkStartTime;
        if (lastMessageFromReceiver != null) {
            // 如果对方有发送过消息，从对方最后一条消息的时间开始检查
            checkStartTime = lastMessageFromReceiver.getCreatedAt();
        } else {
            // 如果对方从未发送过消息，从会话创建时间开始检查（或从很久以前开始）
            checkStartTime = conversation.getUpdatedAt() != null ? 
                conversation.getUpdatedAt().minusDays(1) : LocalDateTime.now().minusDays(1);
        }
        
        // 统计从检查起始时间之后，当前用户发送的消息数量
        Integer consecutiveCount = messageMapper.countConsecutiveMessagesBySender(
            conversationId, senderId, checkStartTime);
        
        if (consecutiveCount != null && consecutiveCount >= 3) {
            throw new RuntimeException("对方未回复之前，最多只能发三条消息，请等待对方回复后再发送");
        }
        
        // 创建消息
        Message message = new Message();
        message.setId(IdUtil.generateId());
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setType(type != null ? type : "text");
        message.setRead(false);
        message.setCreatedAt(LocalDateTime.now());
        
        messageMapper.insert(message);
        
        // 更新会话时间
        conversationMapper.update(conversationId);
        
        // 如果接收者之前删除了此会话，有新消息时自动恢复（取消删除标记）
        UserConversationSetting receiverSetting = userConversationSettingMapper.findByUserIdAndConversationId(receiverId, conversationId);
        if (receiverSetting != null && Boolean.TRUE.equals(receiverSetting.getIsDeleted())) {
            userConversationSettingMapper.markAsNotDeleted(receiverId, conversationId);
        }
        
        return message;
    }
    
    /**
     * 标记消息为已读
     */
    @Transactional
    public void markAsRead(String conversationId, String userId) {
        messageMapper.markAsRead(conversationId, userId);
    }
    
    /**
     * 删除会话（软删除，只对当前用户生效）
     */
    @Transactional
    public void deleteConversation(String conversationId, String userId) {
        // 验证会话是否存在且用户参与
        Conversation conversation = conversationMapper.findById(conversationId);
        if (conversation == null) {
            throw new RuntimeException("会话不存在");
        }
        
        List<String> participantIds = JsonUtil.fromJsonArray(conversation.getParticipantIds());
        if (!participantIds.contains(userId)) {
            throw new RuntimeException("无权限删除此会话");
        }
        
        // 查找或创建用户会话设置
        UserConversationSetting setting = userConversationSettingMapper.findByUserIdAndConversationId(userId, conversationId);
        
        if (setting == null) {
            // 创建新的设置记录
            setting = new UserConversationSetting();
            setting.setId(IdUtil.generateId());
            setting.setUserId(userId);
            setting.setConversationId(conversationId);
            setting.setIsDeleted(true);
            setting.setDeletedAt(LocalDateTime.now());
            setting.setCreatedAt(LocalDateTime.now());
            setting.setUpdatedAt(LocalDateTime.now());
            userConversationSettingMapper.insert(setting);
        } else {
            // 更新现有设置
            setting.setIsDeleted(true);
            setting.setDeletedAt(LocalDateTime.now());
            setting.setUpdatedAt(LocalDateTime.now());
            userConversationSettingMapper.update(setting);
        }
    }
    
    /**
     * 丰富会话信息（添加参与者信息、最后一条消息、未读数等）
     */
    private Conversation enrichConversation(Conversation conversation) {
        if (conversation == null) return null;
        
        // 解析参与者ID
        List<String> participantIds = JsonUtil.fromJsonArray(conversation.getParticipantIds());
        conversation.setParticipantIdList(participantIds);
        
        // 获取最后一条消息
        Message lastMessage = messageMapper.findLastMessage(conversation.getId());
        conversation.setLastMessage(lastMessage);
        
        return conversation;
    }
}
