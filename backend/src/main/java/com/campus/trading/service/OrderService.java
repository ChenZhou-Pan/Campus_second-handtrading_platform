package com.campus.trading.service;

import com.campus.trading.dto.OrderResponse;
import com.campus.trading.entity.Order;
import com.campus.trading.entity.Product;
import com.campus.trading.entity.User;
import com.campus.trading.mapper.OrderMapper;
import com.campus.trading.mapper.ProductMapper;
import com.campus.trading.mapper.UserMapper;
import com.campus.trading.service.AlipayService;
import com.campus.trading.util.IdUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private AlipayService alipayService;

    @Transactional
    public Order createOrder(String buyerId, String productId, String shippingAddress,
                             String contactPhone, String note) {
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        if (product.getSellerId().equals(buyerId)) {
            throw new RuntimeException("不能购买自己的商品");
        }
        if (!"published".equals(product.getStatus())) {
            if ("sold".equals(product.getStatus())) {
                throw new RuntimeException("商品已被他人购买，无法创建订单");
            }
            throw new RuntimeException("商品不可购买");
        }

        // 检查该商品是否已有已付款的订单（防止重复购买）
        List<Order> existingOrders = orderMapper.findByProductId(productId);
        boolean hasPaidOrder = existingOrders.stream()
            .anyMatch(order -> "paid".equals(order.getStatus()) || 
                             "shipped".equals(order.getStatus()) || 
                             "delivered".equals(order.getStatus()) || 
                             "completed".equals(order.getStatus()));
        if (hasPaidOrder) {
            throw new RuntimeException("商品已被他人购买，无法创建订单");
        }

        // 检查是否有未取消的待付款订单
        List<Order> pendingOrders = orderMapper.findByBuyerId(buyerId, 0, 100, "pending");
        boolean hasUncancelledPendingOrder = pendingOrders.stream()
            .anyMatch(order -> order.getProductId().equals(productId) && "pending".equals(order.getStatus()));
        if (hasUncancelledPendingOrder) {
            throw new RuntimeException("该商品已有待付款订单，请先取消或完成之前的订单");
        }

        // 获取卖家信息，包括支付宝账号
        User seller = userMapper.findById(product.getSellerId());
        String sellerAlipayAccount = seller != null ? seller.getAlipayAccount() : null;
        
        // 如果卖家没有设置支付宝账号，给出警告但不阻止订单创建
        // 转账时再检查
        if (sellerAlipayAccount == null || sellerAlipayAccount.trim().isEmpty()) {
            System.out.println("警告: 卖家 " + product.getSellerId() + " 未设置支付宝账号，确认收货后无法自动转账");
        }
        
        Order order = new Order();
        order.setId(IdUtil.generateId());
        order.setProductId(productId);
        order.setBuyerId(buyerId);
        order.setSellerId(product.getSellerId());
        order.setPrice(product.getPrice());
        order.setStatus("pending");
        order.setShippingAddress(shippingAddress);
        order.setContactPhone(contactPhone);
        order.setNote(note);
        order.setSellerAlipayAccount(sellerAlipayAccount);
        order.setTransferStatus("pending"); // 初始状态为待转账
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        orderMapper.insert(order);
        return order;
    }

    public List<Order> getOrders(String userId, String role, int page, int pageSize, String status) {
        int offset = (page - 1) * pageSize;
        if ("buyer".equals(role)) {
            return orderMapper.findByBuyerId(userId, offset, pageSize, status);
        } else {
            return orderMapper.findBySellerId(userId, offset, pageSize, status);
        }
    }

    /**
     * 获取订单列表并填充商品和用户信息
     */
    public List<OrderResponse> getOrdersWithDetails(String userId, String role, int page, int pageSize, String status) {
        List<Order> orders = getOrders(userId, role, page, pageSize, status);
        
        // 批量获取商品信息（包括已删除的商品，用于订单显示）
        List<String> productIds = orders.stream()
            .map(Order::getProductId)
            .filter(java.util.Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
        Map<String, Product> productMap = new HashMap<>();
        for (String productId : productIds) {
            try {
                // 使用直接查询，不排除已删除的商品，因为订单需要显示历史商品信息
                Product product = productMapper.findByIdForOrder(productId);
                if (product != null) {
                    productMap.put(productId, product);
                }
            } catch (Exception e) {
                // 如果查询失败，尝试使用普通查询
                try {
                    Product product = productMapper.findById(productId);
                    if (product != null) {
                        productMap.put(productId, product);
                    }
                } catch (Exception e2) {
                    e2.printStackTrace();
                }
            }
        }
        
        // 批量获取用户信息
        List<String> userIds = orders.stream()
            .flatMap(order -> java.util.stream.Stream.of(order.getBuyerId(), order.getSellerId()))
            .filter(java.util.Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
        Map<String, User> userMap = new HashMap<>();
        for (String uid : userIds) {
            try {
                User user = userMapper.findById(uid);
                if (user != null) {
                    userMap.put(uid, user);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        // 构建 OrderResponse 列表
        return orders.stream()
            .map(order -> {
                Product product = productMap.get(order.getProductId());
                User buyer = userMap.get(order.getBuyerId());
                User seller = userMap.get(order.getSellerId());
                return OrderResponse.fromOrder(order, product, buyer, seller);
            })
            .collect(Collectors.toList());
    }

    public Long countOrders(String userId, String role, String status) {
        if ("buyer".equals(role)) {
            return orderMapper.countByBuyerId(userId, status);
        } else {
            return orderMapper.countBySellerId(userId, status);
        }
    }

    public Order getOrderById(String id) {
        return orderMapper.findById(id);
    }
    
    /**
     * 根据订单ID获取商品信息
     */
    public Product getProductByOrderId(String orderId) {
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            return null;
        }
        return productMapper.findByIdForOrder(order.getProductId());
    }

    /**
     * 获取订单详情并填充商品和用户信息
     */
    public OrderResponse getOrderByIdWithDetails(String id) {
        Order order = orderMapper.findById(id);
        if (order == null) {
            return null;
        }
        
        Product product = null;
        try {
            // 使用 findByIdForOrder 以包含已删除的商品
            product = productMapper.findByIdForOrder(order.getProductId());
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        User buyer = null;
        User seller = null;
        try {
            buyer = userMapper.findById(order.getBuyerId());
            seller = userMapper.findById(order.getSellerId());
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return OrderResponse.fromOrder(order, product, buyer, seller);
    }

    @Transactional
    public Order updateOrderStatus(String id, String status) {
        Order order = orderMapper.findById(id);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        
        // 如果状态从 pending 更新为 paid（支付完成），更新商品状态为已售出
        if ("paid".equals(status) && "pending".equals(order.getStatus())) {
            try {
                Product product = productMapper.findByIdForOrder(order.getProductId());
                if (product != null && !"sold".equals(product.getStatus())) {
                    product.setStatus("sold");
                    product.setUpdatedAt(LocalDateTime.now());
                    productMapper.update(product);
                    System.out.println("订单 " + id + " 支付完成，商品 " + order.getProductId() + " 状态已更新为已售出");
                }
            } catch (Exception e) {
                // 商品状态更新失败不影响订单状态更新
                System.err.println("更新商品状态失败: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        // 如果状态变更为已完成（确认收货），则自动转账给卖家
        if ("completed".equals(status) && "delivered".equals(order.getStatus())) {
            // 检查是否已经转账
            if (!"success".equals(order.getTransferStatus())) {
                if (order.getSellerAlipayAccount() == null || order.getSellerAlipayAccount().trim().isEmpty()) {
                    // 卖家未设置支付宝账号，标记为失败但不阻止订单完成
                    orderMapper.updateTransferStatus(id, "failed");
                    order.setTransferStatus("failed");
                    System.err.println("订单 " + id + " 转账失败: 卖家未设置支付宝账号");
                } else {
                    try {
                        // 获取商品信息用于生成转账标题
                        Product product = productMapper.findByIdForOrder(order.getProductId());
                        String transferTitle = product != null ? "订单-" + product.getTitle() : "订单-" + id.substring(0, 8);
                        
                        // 调用支付宝转账接口
                        boolean transferSuccess = alipayService.transferToSeller(
                            id,
                            order.getSellerAlipayAccount(),
                            order.getPrice(),
                            transferTitle
                        );
                        
                        if (transferSuccess) {
                            // 更新转账状态为成功
                            orderMapper.updateTransferStatus(id, "success");
                            order.setTransferStatus("success");
                            System.out.println("订单 " + id + " 转账成功: 已转账 " + order.getPrice() + " 元到卖家支付宝账号");
                        } else {
                            // 转账失败，记录状态但不阻止订单完成
                            orderMapper.updateTransferStatus(id, "failed");
                            order.setTransferStatus("failed");
                            System.err.println("订单 " + id + " 转账失败: 支付宝接口返回失败");
                        }
                    } catch (Exception e) {
                        // 转账失败，记录状态但不阻止订单完成
                        orderMapper.updateTransferStatus(id, "failed");
                        order.setTransferStatus("failed");
                        // 记录错误日志，但不抛出异常，允许订单完成
                        System.err.println("订单 " + id + " 转账失败: " + e.getMessage());
                    }
                }
            }
        }
        
        orderMapper.updateStatus(id, status);
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return order;
    }
    
    /**
     * 更新订单的支付宝交易号
     */
    @Transactional
    public void updateOrderTradeNo(String orderId, String tradeNo) {
        orderMapper.updateTradeNo(orderId, tradeNo);
    }
    
    /**
     * 标记订单已发起支付请求（用于验证手动确认支付时是否真正发起过支付）
     */
    @Transactional
    public void markPaymentInitiated(String orderId) {
        orderMapper.updateUpdatedAt(orderId, LocalDateTime.now());
    }

    @Transactional
    public Order cancelOrder(String id) {
        Order order = orderMapper.findById(id);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (!"pending".equals(order.getStatus()) && !"paid".equals(order.getStatus())) {
            throw new RuntimeException("订单状态不允许取消");
        }
        
        // 如果订单已付款，取消时需要恢复商品状态
        boolean wasPaid = "paid".equals(order.getStatus());
        
        orderMapper.cancel(id);
        order.setStatus("cancelled");
        order.setUpdatedAt(LocalDateTime.now());
        
        // 如果订单已付款，取消后恢复商品状态为已发布
        if (wasPaid) {
            try {
                Product product = productMapper.findByIdForOrder(order.getProductId());
                if (product != null && "sold".equals(product.getStatus())) {
                    product.setStatus("published");
                    product.setUpdatedAt(LocalDateTime.now());
                    productMapper.update(product);
                    System.out.println("订单 " + id + " 已付款后取消，商品 " + order.getProductId() + " 状态已恢复为已发布");
                }
            } catch (Exception e) {
                // 商品状态更新失败不影响订单取消
                System.err.println("更新商品状态失败: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return order;
    }

    /**
     * 自动取消超过15分钟未付款的订单
     */
    @Transactional
    public int autoCancelExpiredOrders() {
        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
        List<Order> expiredOrders = orderMapper.findExpiredPendingOrders(fifteenMinutesAgo);
        
        int cancelledCount = 0;
        for (Order order : expiredOrders) {
            try {
                orderMapper.cancel(order.getId());
                cancelledCount++;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        return cancelledCount;
    }
    
    /**
     * 删除订单（仅允许删除已取消的订单）
     */
    @Transactional
    public void deleteOrder(String id, String userId) {
        Order order = orderMapper.findById(id);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        
        // 验证权限：只有买家或卖家可以删除自己的订单
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new RuntimeException("无权限删除此订单");
        }
        
        // 只允许删除已取消的订单
        if (!"cancelled".equals(order.getStatus())) {
            throw new RuntimeException("只能删除已取消的订单");
        }
        
        orderMapper.delete(id);
    }
    
    /**
     * 退款（仅允许买家对已付款的订单申请退款）
     * 调用支付宝退款接口，将钱退回买家账户
     */
    @Transactional
    public Order refundOrder(String id, String userId) {
        Order order = orderMapper.findById(id);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        
        // 验证权限：买家或卖家都可以申请退款
        // 买家申请退款：用户主动退款
        // 卖家申请退款：卖家选择不卖了
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new RuntimeException("无权限申请退款");
        }
        
        // 只允许对已付款的订单申请退款
        if (!"paid".equals(order.getStatus())) {
            throw new RuntimeException("只能对已付款的订单申请退款");
        }
        
        // 获取支付宝交易号（可选，如果没有则使用商户订单号）
        String tradeNo = order.getTradeNo();
        if (tradeNo != null && tradeNo.trim().isEmpty()) {
            tradeNo = null; // 空字符串视为null
        }
        
        // 调用支付宝退款接口（如果没有trade_no，会使用商户订单号）
        try {
            // 根据操作者确定退款原因
            String refundReason;
            if (order.getBuyerId().equals(userId)) {
                refundReason = "买家申请退款";
            } else {
                refundReason = "卖家选择不卖，退款给买家";
            }
            
            boolean refundSuccess = alipayService.refund(
                id,                    // 商户订单号
                tradeNo,               // 支付宝交易号（可选，如果没有则使用商户订单号）
                order.getPrice(),      // 退款金额（全额退款）
                refundReason           // 退款原因
            );
            
            if (!refundSuccess) {
                throw new RuntimeException("支付宝退款失败");
            }
            
            System.out.println("✅ 支付宝退款成功，订单ID: " + id);
        } catch (Exception e) {
            // 支付宝退款失败，抛出异常，不更新订单状态
            System.err.println("❌ 支付宝退款失败: " + e.getMessage());
            throw new RuntimeException("退款失败: " + e.getMessage(), e);
        }
        
        // 支付宝退款成功后，更新订单状态为已退款
        orderMapper.updateStatus(id, "refunded");
        order.setStatus("refunded");
        order.setUpdatedAt(LocalDateTime.now());
        
        // 如果商品状态是已售出，恢复为已发布状态
        try {
            Product product = productMapper.findByIdForOrder(order.getProductId());
            if (product != null && "sold".equals(product.getStatus())) {
                product.setStatus("published");
                product.setUpdatedAt(LocalDateTime.now());
                productMapper.update(product);
                System.out.println("订单 " + id + " 退款成功，商品 " + order.getProductId() + " 状态已恢复为已发布");
            }
        } catch (Exception e) {
            // 商品状态更新失败不影响退款
            System.err.println("更新商品状态失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        return order;
    }
}
