package com.campus.trading.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Message {
    private String id;
    private String conversationId;
    private String senderId;
    private String receiverId;
    private String content;
    private String type; // text, image, system
    private Boolean read;
    private LocalDateTime createdAt;
}
