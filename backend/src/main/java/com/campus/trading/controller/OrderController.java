package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.common.PageResult;
import com.campus.trading.dto.OrderResponse;
import com.campus.trading.entity.Order;
import com.campus.trading.entity.Product;
import com.campus.trading.service.OrderService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ApiResponse<Order> createOrder(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            Order order = orderService.createOrder(
                userId,
                request.get("productId"),
                request.get("shippingAddress"),
                request.get("contactPhone"),
                request.get("note")
            );
            return ApiResponse.success("订单创建成功", order);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("创建订单失败: " + e.getMessage());
        }
    }

    @GetMapping
    public ApiResponse<PageResult<OrderResponse>> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "buyer") String role,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            List<OrderResponse> orders = orderService.getOrdersWithDetails(userId, role, page, pageSize, status);
            Long total = orderService.countOrders(userId, role, status);
            PageResult<OrderResponse> result = PageResult.of(orders, total, page, pageSize);
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("获取订单列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            OrderResponse order = orderService.getOrderByIdWithDetails(id);
            if (order == null) {
                return ApiResponse.error(404, "订单不存在");
            }
            if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
                return ApiResponse.error(403, "无权限查看此订单");
            }
            return ApiResponse.success(order);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("获取订单详情失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Order> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> request,
                                                 HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            Order order = orderService.getOrderById(id);
            if (order == null) {
                return ApiResponse.error(404, "订单不存在");
            }
            
            String newStatus = request.get("status");
            
            // 权限检查：根据订单状态和操作者角色进行不同的权限验证
            boolean hasPermission = false;
            
            if ("paid".equals(newStatus) && "pending".equals(order.getStatus())) {
                // 买家可以将订单从 pending 更新为 paid（手动确认支付完成）
                // 验证：必须真正发起过支付请求才能手动确认
                hasPermission = order.getBuyerId().equals(userId);
                if (hasPermission) {
                    // 再次检查订单状态，防止订单已被他人支付
                    Order currentOrder = orderService.getOrderById(id);
                    if (currentOrder == null) {
                        return ApiResponse.error(404, "订单不存在");
                    }
                    if (!"pending".equals(currentOrder.getStatus())) {
                        if ("paid".equals(currentOrder.getStatus())) {
                            return ApiResponse.error(400, "订单已被他人抢先支付，无法继续支付");
                        } else {
                            return ApiResponse.error(400, "订单状态不允许支付");
                        }
                    }
                    
                    // 检查商品是否已被他人购买
                    try {
                        Product product = orderService.getProductByOrderId(id);
                        if (product != null && "sold".equals(product.getStatus())) {
                            return ApiResponse.error(400, "商品已被他人购买，无法继续支付");
                        }
                    } catch (Exception e) {
                        System.err.println("检查商品状态时发生错误: " + e.getMessage());
                    }
                    
                    // 检查订单是否在创建后30分钟内，并且 updated_at 在创建后更新过（说明发起过支付请求）
                    LocalDateTime now = java.time.LocalDateTime.now();
                    LocalDateTime createdAt = currentOrder.getCreatedAt();
                    LocalDateTime updatedAt = currentOrder.getUpdatedAt();
                    
                    // 订单创建时间超过30分钟，不允许手动确认
                    if (createdAt != null && createdAt.plusMinutes(30).isBefore(now)) {
                        return ApiResponse.error(400, "订单创建时间过长，无法手动确认支付。请重新创建订单并完成支付。");
                    }
                    
                    // 检查是否发起过支付请求（updated_at 应该在创建后更新过）
                    // 如果 updated_at 和 createdAt 相同或非常接近（小于5秒），说明没有发起过支付请求
                    if (createdAt != null && updatedAt != null) {
                        long secondsBetween = java.time.Duration.between(createdAt, updatedAt).getSeconds();
                        if (secondsBetween < 5) {
                            return ApiResponse.error(400, "请先点击\"确认付款\"按钮发起支付请求，完成支付后再手动确认。");
                        }
                    }
                }
            } else if ("completed".equals(newStatus) && ("delivered".equals(order.getStatus()) || "paid".equals(order.getStatus()))) {
                // 买家可以将订单从 delivered 或 paid 更新为 completed（确认收货）
                // 允许从 paid 状态直接确认收货（跳过发货流程）
                hasPermission = order.getBuyerId().equals(userId);
            } else if ("shipped".equals(newStatus) && "paid".equals(order.getStatus())) {
                // 卖家可以将订单从 paid 更新为 shipped（确认发货）
                hasPermission = order.getSellerId().equals(userId);
            } else if ("delivered".equals(newStatus) && "shipped".equals(order.getStatus())) {
                // 卖家可以将订单从 shipped 更新为 delivered（确认送达）
                hasPermission = order.getSellerId().equals(userId);
            }
            
            if (!hasPermission) {
                return ApiResponse.error(403, "无权限执行此操作");
            }
            
            Order updated = orderService.updateOrderStatus(id, newStatus);
            return ApiResponse.success("操作成功", updated);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("操作失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<Order> cancelOrder(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            Order order = orderService.getOrderById(id);
            if (order == null) {
                return ApiResponse.error(404, "订单不存在");
            }
            if (!order.getBuyerId().equals(userId)) {
                return ApiResponse.error(403, "无权限取消此订单");
            }
            Order cancelled = orderService.cancelOrder(id);
            return ApiResponse.success("订单已取消", cancelled);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("取消失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteOrder(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            orderService.deleteOrder(id, userId);
            return ApiResponse.success("订单已删除", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/refund")
    public ApiResponse<Order> refundOrder(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            Order refunded = orderService.refundOrder(id, userId);
            return ApiResponse.success("退款申请成功", refunded);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("退款失败: " + e.getMessage());
        }
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("未找到token");
    }
}
