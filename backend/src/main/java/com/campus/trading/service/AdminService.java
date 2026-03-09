package com.campus.trading.service;

import com.campus.trading.entity.Order;
import com.campus.trading.entity.Product;
import com.campus.trading.entity.User;
import com.campus.trading.mapper.OrderMapper;
import com.campus.trading.mapper.ProductMapper;
import com.campus.trading.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private com.campus.trading.mapper.FeedbackMapper feedbackMapper;
    
    /**
     * 检查用户是否为管理员
     */
    public boolean isAdmin(String userId) {
        User user = userMapper.findById(userId);
        return user != null && "admin".equals(user.getRole());
    }
    
    /**
     * 获取所有用户列表
     */
    public List<User> getAllUsers() {
        try {
            return userMapper.findAll();
        } catch (Exception e) {
            logger.error("获取用户列表失败", e);
            throw new RuntimeException("获取用户列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户详情
     */
    public User getUserById(String userId) {
        return userMapper.findById(userId);
    }
    
    /**
     * 更新用户信息（管理员）
     */
    public User updateUser(String userId, User user) {
        User existingUser = userMapper.findById(userId);
        if (existingUser == null) {
            throw new RuntimeException("用户不存在");
        }
        
        if (user.getUsername() != null) {
            User userWithSameUsername = userMapper.findByUsername(user.getUsername());
            if (userWithSameUsername != null && !userWithSameUsername.getId().equals(userId)) {
                throw new RuntimeException("用户名已存在");
            }
            existingUser.setUsername(user.getUsername());
        }
        if (user.getPhone() != null) existingUser.setPhone(user.getPhone());
        if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
        if (user.getAvatar() != null) existingUser.setAvatar(user.getAvatar());
        if (user.getRole() != null) existingUser.setRole(user.getRole());
        
        userMapper.update(existingUser);
        return existingUser;
    }
    
    /**
     * 删除用户
     */
    public void deleteUser(String userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if ("admin".equals(user.getRole())) {
            throw new RuntimeException("不能删除管理员账户");
        }
        userMapper.delete(userId);
    }
    
    /**
     * 获取所有商品列表（包括所有状态）
     */
    public List<Product> getAllProducts() {
        try {
            // 使用管理员专用方法查询所有商品（包括所有状态，除了deleted）
            return productMapper.findAllForAdmin();
        } catch (Exception e) {
            logger.error("获取商品列表失败", e);
            throw new RuntimeException("获取商品列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取商品详情
     */
    public Product getProductById(String productId) {
        return productMapper.findById(productId);
    }
    
    /**
     * 更新商品状态（管理员）
     */
    public Product updateProductStatus(String productId, String status) {
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        product.setStatus(status);
        productMapper.update(product);
        return product;
    }
    
    /**
     * 删除商品
     */
    public void deleteProduct(String productId) {
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        productMapper.delete(productId);
    }
    
    /**
     * 获取所有订单列表（包含用户信息）
     */
    public List<Map<String, Object>> getAllOrders() {
        try {
            List<Order> orders = orderMapper.findAll();
            
            // 批量获取用户信息
            List<String> userIds = orders.stream()
                .flatMap(order -> java.util.stream.Stream.of(order.getBuyerId(), order.getSellerId()))
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
            
            Map<String, User> userMap = new HashMap<>();
            for (String uid : userIds) {
                try {
                    User user = userMapper.findById(uid);
                    if (user != null) {
                        userMap.put(uid, user);
                    }
                } catch (Exception e) {
                    logger.warn("获取用户信息失败: " + uid, e);
                }
            }
            
            // 构建包含用户信息的订单列表
            return orders.stream().map(order -> {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("id", order.getId());
                orderMap.put("productId", order.getProductId());
                orderMap.put("buyerId", order.getBuyerId());
                orderMap.put("sellerId", order.getSellerId());
                orderMap.put("price", order.getPrice());
                orderMap.put("status", order.getStatus());
                orderMap.put("shippingAddress", order.getShippingAddress());
                orderMap.put("contactPhone", order.getContactPhone());
                orderMap.put("note", order.getNote());
                orderMap.put("createdAt", order.getCreatedAt());
                orderMap.put("updatedAt", order.getUpdatedAt());
                
                // 添加买家信息
                User buyer = userMap.get(order.getBuyerId());
                if (buyer != null) {
                    orderMap.put("buyerPhone", buyer.getPhone());
                    orderMap.put("buyerUsername", buyer.getUsername());
                }
                
                // 添加卖家信息
                User seller = userMap.get(order.getSellerId());
                if (seller != null) {
                    orderMap.put("sellerPhone", seller.getPhone());
                    orderMap.put("sellerUsername", seller.getUsername());
                }
                
                return orderMap;
            }).collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            logger.error("获取订单列表失败", e);
            throw new RuntimeException("获取订单列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取订单详情
     */
    public Order getOrderById(String orderId) {
        return orderMapper.findById(orderId);
    }
    
    /**
     * 获取所有反馈列表（包含用户信息）
     */
    public List<Map<String, Object>> getAllFeedbacks() {
        try {
            List<com.campus.trading.entity.Feedback> feedbacks = feedbackMapper.findAll();
            
            // 批量获取用户信息
            List<String> userIds = feedbacks.stream()
                .map(com.campus.trading.entity.Feedback::getUserId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
            
            Map<String, User> userMap = new HashMap<>();
            for (String uid : userIds) {
                try {
                    User user = userMapper.findById(uid);
                    if (user != null) {
                        userMap.put(uid, user);
                    }
                } catch (Exception e) {
                    logger.warn("获取用户信息失败: " + uid, e);
                }
            }
            
            // 构建包含用户信息的反馈列表
            return feedbacks.stream().map(feedback -> {
                Map<String, Object> feedbackMap = new HashMap<>();
                feedbackMap.put("id", feedback.getId());
                feedbackMap.put("userId", feedback.getUserId());
                feedbackMap.put("type", feedback.getType());
                feedbackMap.put("content", feedback.getContent());
                feedbackMap.put("contact", feedback.getContact());
                feedbackMap.put("rating", feedback.getRating());
                feedbackMap.put("createdAt", feedback.getCreatedAt());
                feedbackMap.put("updatedAt", feedback.getUpdatedAt());
                
                // 添加用户信息
                if (feedback.getUserId() != null) {
                    User user = userMap.get(feedback.getUserId());
                    if (user != null) {
                        feedbackMap.put("userPhone", user.getPhone());
                        feedbackMap.put("userUsername", user.getUsername());
                    }
                }
                
                return feedbackMap;
            }).collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            logger.error("获取反馈列表失败", e);
            throw new RuntimeException("获取反馈列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除反馈
     */
    public void deleteFeedback(String feedbackId) {
        com.campus.trading.entity.Feedback feedback = feedbackMapper.findById(feedbackId);
        if (feedback == null) {
            throw new RuntimeException("反馈不存在");
        }
        feedbackMapper.delete(feedbackId);
    }
    
    /**
     * 获取统计数据
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // 用户统计
        List<User> allUsers = userMapper.findAll();
        long totalUsers = allUsers.size();
        long adminUsers = allUsers.stream().filter(u -> "admin".equals(u.getRole())).count();
        long buyerUsers = allUsers.stream().filter(u -> "buyer".equals(u.getRole())).count();
        long sellerUsers = allUsers.stream().filter(u -> "seller".equals(u.getRole())).count();
        long bothUsers = allUsers.stream().filter(u -> "both".equals(u.getRole())).count();
        
        stats.put("totalUsers", totalUsers);
        stats.put("adminUsers", adminUsers);
        stats.put("buyerUsers", buyerUsers);
        stats.put("sellerUsers", sellerUsers);
        stats.put("bothUsers", bothUsers);
        
        // 商品统计
        List<Product> allProducts = productMapper.findAll(0, 10000, null, null, null, null, null, null, null);
        long totalProducts = allProducts.size();
        long publishedProducts = allProducts.stream().filter(p -> "published".equals(p.getStatus())).count();
        long soldProducts = allProducts.stream().filter(p -> "sold".equals(p.getStatus())).count();
        long draftProducts = allProducts.stream().filter(p -> "draft".equals(p.getStatus())).count();
        
        stats.put("totalProducts", totalProducts);
        stats.put("publishedProducts", publishedProducts);
        stats.put("soldProducts", soldProducts);
        stats.put("draftProducts", draftProducts);
        
        // 订单统计
        List<Order> allOrders = orderMapper.findAll();
        long totalOrders = allOrders.size();
        long pendingOrders = allOrders.stream().filter(o -> "pending".equals(o.getStatus())).count();
        long completedOrders = allOrders.stream().filter(o -> "completed".equals(o.getStatus())).count();
        double totalRevenue = allOrders.stream()
                .filter(o -> "completed".equals(o.getStatus()))
                .mapToDouble(o -> o.getPrice().doubleValue())
                .sum();
        
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("totalRevenue", totalRevenue);
        
        return stats;
    }
}
