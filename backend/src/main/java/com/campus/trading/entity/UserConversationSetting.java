package com.campus.trading.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserConversationSetting {
    private String id;
    private String userId;
    private String conversationId;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
