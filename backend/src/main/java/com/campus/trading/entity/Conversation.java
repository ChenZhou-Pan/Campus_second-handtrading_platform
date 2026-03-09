package com.campus.trading.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Conversation {
    private String id;
    private String participantIds; // JSON字符串存储参与者ID数组
    private LocalDateTime updatedAt;
    // 关联查询字段
    private Message lastMessage;
    private Integer unreadCount;
    private List<String> participantIdList;
}
