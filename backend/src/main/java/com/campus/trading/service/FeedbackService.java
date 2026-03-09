package com.campus.trading.service;

import com.campus.trading.entity.Feedback;
import com.campus.trading.mapper.FeedbackMapper;
import com.campus.trading.util.IdUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class FeedbackService {
    @Autowired
    private FeedbackMapper feedbackMapper;

    @Transactional
    public Feedback createFeedback(String userId, String type, String content, String contact, Integer rating) {
        Feedback feedback = new Feedback();
        feedback.setId(IdUtil.generateId());
        feedback.setUserId(userId); // 可以为null（未登录用户）
        feedback.setType(type);
        feedback.setContent(content);
        feedback.setContact(contact);
        feedback.setRating(rating != null ? rating : 5);
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());

        feedbackMapper.insert(feedback);
        return feedback;
    }
}
