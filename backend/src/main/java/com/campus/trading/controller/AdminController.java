package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.entity.Order;
import com.campus.trading.entity.Product;
import com.campus.trading.entity.User;
import com.campus.trading.service.AdminService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 检查是否为管理员
     */
    private void checkAdmin(HttpServletRequest request) {
        String token = extractToken(request);
        String userId = jwtUtil.getUserIdFromToken(token);
        if (!adminService.isAdmin(userId)) {
            throw new RuntimeException("无权限访问");
        }
    }
    
    /**
     * 获取统计数据
     */
    @GetMapping("/statistics")
    public ApiResponse<Map<String, Object>> getStatistics(HttpServletRequest request) {
        try {
            checkAdmin(request);
            Map<String, Object> stats = adminService.getStatistics();
            return ApiResponse.success(stats);
        } catch (RuntimeException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "获取统计数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有用户
     */
    @GetMapping("/users")
    public ApiResponse<List<User>> getAllUsers(HttpServletRequest request) {
        try {
            checkAdmin(request);
            List<User> users = adminService.getAllUsers();
            return ApiResponse.success(users);
        } catch (RuntimeException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "获取用户列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户详情
     */
    @GetMapping("/users/{id}")
    public ApiResponse<User> getUserById(@PathVariable String id, HttpServletRequest request) {
        try {
            checkAdmin(request);
            User user = adminService.getUserById(id);
            if (user == null) {
                return ApiResponse.error(404, "用户不存在");
            }
            return ApiResponse.success(user);
        } catch (RuntimeException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "获取用户详情失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新用户信息
     */
    @PutMapping("/users/{id}")
    public ApiResponse<User> updateUser(@PathVariable String id, @RequestBody User user, HttpServletRequest request) {
        try {
            checkAdmin(request);
            User updatedUser = adminService.updateUser(id, user);
            return ApiResponse.success("更新成功", updatedUser);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "更新用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/users/{id}")
    public ApiResponse<String> deleteUser(@PathVariable String id, HttpServletRequest request) {
        try {
            checkAdmin(request);
            adminService.deleteUser(id);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "删除用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有商品
     */
    @GetMapping("/products")
    public ApiResponse<List<Product>> getAllProducts(HttpServletRequest request) {
        try {
            checkAdmin(request);
            List<Product> products = adminService.getAllProducts();
            return ApiResponse.success(products);
        } catch (RuntimeException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "获取商品列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取商品详情
     */
    @GetMapping("/products/{id}")
    public ApiResponse<Product> getProductById(@PathVariable String id, HttpServletRequest request) {
        try {
            checkAdmin(request);
            Product product = adminService.getProductById(id);
            if (product == null) {
                return ApiResponse.error(404, "商品不存在");
            }
            return ApiResponse.success(product);
        } catch (RuntimeException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "获取商品详情失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新商品状态
     */
    @PutMapping("/products/{id}/status")
    public ApiResponse<Product> updateProductStatus(@PathVariable String id, @RequestBody Map<String, String> requestBody, HttpServletRequest request) {
        try {
            checkAdmin(request);
            String status = requestBody.get("status");
            if (status == null) {
                return ApiResponse.error(400, "状态不能为空");
            }
            Product product = adminService.updateProductStatus(id, status);
            return ApiResponse.success("更新成功", product);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "更新商品状态失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除商品
     */
    @DeleteMapping("/products/{id}")
    public ApiResponse<String> deleteProduct(@PathVariable String id, HttpServletRequest request) {
        try {
            checkAdmin(request);
            adminService.deleteProduct(id);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "删除商品失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有订单
     */
    @GetMapping("/orders")
    public ApiResponse<List<Map<String, Object>>> getAllOrders(HttpServletRequest request) {
        try {
            checkAdmin(request);
            List<Map<String, Object>> orders = adminService.getAllOrders();
            return ApiResponse.success(orders);
        } catch (RuntimeException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "获取订单列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取订单详情
     */
    @GetMapping("/orders/{id}")
    public ApiResponse<Order> getOrderById(@PathVariable String id, HttpServletRequest request) {
        try {
            checkAdmin(request);
            Order order = adminService.getOrderById(id);
            if (order == null) {
                return ApiResponse.error(404, "订单不存在");
            }
            return ApiResponse.success(order);
        } catch (RuntimeException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "获取订单详情失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有反馈
     */
    @GetMapping("/feedbacks")
    public ApiResponse<List<Map<String, Object>>> getAllFeedbacks(HttpServletRequest request) {
        try {
            checkAdmin(request);
            List<Map<String, Object>> feedbacks = adminService.getAllFeedbacks();
            return ApiResponse.success(feedbacks);
        } catch (RuntimeException e) {
            return ApiResponse.error(403, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "获取反馈列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除反馈
     */
    @DeleteMapping("/feedbacks/{id}")
    public ApiResponse<String> deleteFeedback(@PathVariable String id, HttpServletRequest request) {
        try {
            checkAdmin(request);
            adminService.deleteFeedback(id);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "删除反馈失败: " + e.getMessage());
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
