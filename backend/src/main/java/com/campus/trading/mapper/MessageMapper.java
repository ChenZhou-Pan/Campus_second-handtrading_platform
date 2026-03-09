package com.campus.trading.mapper;

import com.campus.trading.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface MessageMapper {
    Message findById(@Param("id") String id);
    List<Message> findByConversationId(@Param("conversationId") String conversationId,
                                        @Param("offset") int offset, @Param("limit") int limit);
    Long countByConversationId(@Param("conversationId") String conversationId);
    int insert(Message message);
    int markAsRead(@Param("conversationId") String conversationId, @Param("receiverId") String receiverId);
    int countUnread(@Param("conversationId") String conversationId, @Param("receiverId") String receiverId);
    Message findLastMessage(@Param("conversationId") String conversationId);
    
    /**
     * 查找对方最后一条消息（接收者为senderId的消息）
     */
    Message findLastMessageByReceiver(@Param("conversationId") String conversationId, @Param("receiverId") String receiverId);
    
    /**
     * 统计从指定时间之后，发送者连续发送的消息数量
     */
    Integer countConsecutiveMessagesBySender(@Param("conversationId") String conversationId, 
                                             @Param("senderId") String senderId, 
                                             @Param("afterTime") LocalDateTime afterTime);
}
