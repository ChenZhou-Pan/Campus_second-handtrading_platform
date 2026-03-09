package com.campus.trading.service;

import com.campus.trading.entity.Order;
import com.campus.trading.entity.OrderRating;
import com.campus.trading.entity.User;
import com.campus.trading.mapper.OrderMapper;
import com.campus.trading.mapper.OrderRatingMapper;
import com.campus.trading.mapper.UserMapper;
import com.campus.trading.util.IdUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RatingService {
    @Autowired
    private OrderRatingMapper ratingMapper;
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 创建订单评分
     * @param orderId 订单ID
     * @param raterId 评分者ID
     * @param rating 评分（1-5分）
     * @param comment 评价内容
     * @return 评分对象
     */
    @Transactional
    public OrderRating createRating(String orderId, String raterId, Integer rating, String comment) {
        // 验证订单
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        
        // 验证订单状态（只有已完成的订单才能评分）
        if (!"completed".equals(order.getStatus())) {
            throw new RuntimeException("只有已完成的订单才能评分");
        }
        
        // 验证评分者身份（必须是买家或卖家）
        if (!order.getBuyerId().equals(raterId) && !order.getSellerId().equals(raterId)) {
            throw new RuntimeException("无权限对此订单进行评分");
        }
        
        // 检查是否已经评分过
        OrderRating existingRating = ratingMapper.findByOrderIdAndRaterId(orderId, raterId);
        if (existingRating != null) {
            throw new RuntimeException("您已经对此订单进行过评分");
        }
        
        // 确定被评分者ID
        String ratedId = order.getBuyerId().equals(raterId) ? order.getSellerId() : order.getBuyerId();
        
        // 验证评分范围
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("评分必须在1-5分之间");
        }
        
        // 创建评分
        OrderRating orderRating = new OrderRating();
        orderRating.setId(IdUtil.generateId());
        orderRating.setOrderId(orderId);
        orderRating.setRaterId(raterId);
        orderRating.setRatedId(ratedId);
        orderRating.setRating(rating);
        orderRating.setComment(comment);
        orderRating.setCreatedAt(LocalDateTime.now());
        orderRating.setUpdatedAt(LocalDateTime.now());
        
        ratingMapper.insert(orderRating);
        
        // 更新被评分者的信用等级
        updateUserCreditScore(ratedId);
        
        return orderRating;
    }
    
    /**
     * 更新用户信用等级（根据所有评分计算平均值）
     */
    @Transactional
    public void updateUserCreditScore(String userId) {
        Double averageRating = ratingMapper.getAverageRatingByUserId(userId);
        if (averageRating != null) {
            BigDecimal creditScore = BigDecimal.valueOf(averageRating)
                .setScale(2, RoundingMode.HALF_UP);
            userMapper.updateCreditScore(userId, creditScore);
            System.out.println("用户 " + userId + " 的信用等级已更新为: " + creditScore);
        }
    }
    
    /**
     * 获取用户的平均评分
     */
    public Double getAverageRating(String userId) {
        return ratingMapper.getAverageRatingByUserId(userId);
    }
    
    /**
     * 获取用户的评分数量
     */
    public Long getRatingCount(String userId) {
        return ratingMapper.countRatingsByUserId(userId);
    }
    
    /**
     * 获取订单的所有评分
     */
    public List<OrderRating> getOrderRatings(String orderId) {
        return ratingMapper.findByOrderId(orderId);
    }
    
    /**
     * 检查用户是否已对订单评分
     */
    public boolean hasRated(String orderId, String userId) {
        OrderRating rating = ratingMapper.findByOrderIdAndRaterId(orderId, userId);
        return rating != null;
    }
}
