package com.campus.trading.controller;

import com.campus.trading.entity.Order;
import com.campus.trading.service.AlipayService;
import com.campus.trading.service.OrderService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    
    @Autowired
    private AlipayService alipayService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 创建支付宝支付
     */
    @PostMapping("/alipay/create")
    public void createAlipayPayment(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) throws IOException {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            String orderId = request.get("orderId");
            
            // 验证订单
            Order order = orderService.getOrderById(orderId);
            if (order == null) {
                httpResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                httpResponse.getWriter().write("订单不存在");
                return;
            }
            
            if (!order.getBuyerId().equals(userId)) {
                httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
                httpResponse.getWriter().write("无权限支付此订单");
                return;
            }
            
            if (!"pending".equals(order.getStatus())) {
                if ("paid".equals(order.getStatus())) {
                    httpResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    httpResponse.getWriter().write("订单已被他人抢先支付，无法继续支付");
                } else {
                    httpResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    httpResponse.getWriter().write("订单状态不允许支付");
                }
                return;
            }
            
            // 再次检查商品状态，防止商品已被其他人购买
            try {
                com.campus.trading.entity.Product product = orderService.getProductByOrderId(orderId);
                if (product != null && "sold".equals(product.getStatus())) {
                    httpResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    httpResponse.getWriter().write("商品已被他人购买，无法继续支付");
                    return;
                }
            } catch (Exception e) {
                // 商品检查失败不影响支付流程，但记录日志
                System.err.println("检查商品状态时发生错误: " + e.getMessage());
            }
            
            // 标记订单已发起支付请求（更新 updated_at 字段，用于后续验证）
            orderService.markPaymentInitiated(orderId);
            
            // 生成支付表单
            String orderTitle = "订单-" + orderId.substring(0, 8);
            String paymentForm = alipayService.createPayment(orderId, orderTitle, order.getPrice());
            
            // 返回支付表单HTML
            httpResponse.setContentType("text/html;charset=UTF-8");
            PrintWriter out = httpResponse.getWriter();
            out.println(paymentForm);
            out.flush();
            out.close();
            
        } catch (Exception e) {
            // 记录详细错误信息
            e.printStackTrace();
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = e.getClass().getSimpleName();
                if (e.getCause() != null) {
                    errorMsg += ": " + e.getCause().getMessage();
                }
            }
            httpResponse.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            httpResponse.setContentType("text/plain;charset=UTF-8");
            httpResponse.getWriter().write("创建支付失败: " + errorMsg);
        }
    }

    /**
     * 支付宝异步通知回调
     * ⚠️ 本地测试模式：已禁用
     * 注意：生产环境需要启用此接口，用于接收支付宝的异步支付通知
     */
    /*
    @PostMapping("/alipay/notify")
    public void alipayNotify(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            // 获取所有请求参数
            Map<String, String> params = new java.util.HashMap<>();
            Map<String, String[]> requestParams = request.getParameterMap();
            for (String name : requestParams.keySet()) {
                String[] values = requestParams.get(name);
                String valueStr = "";
                for (int i = 0; i < values.length; i++) {
                    valueStr = (i == values.length - 1) ? valueStr + values[i] : valueStr + values[i] + ",";
                }
                params.put(name, valueStr);
            }
            
            System.out.println("收到支付宝异步通知，参数数量: " + params.size());
            System.out.println("订单号: " + params.get("out_trade_no"));
            System.out.println("交易状态: " + params.get("trade_status"));
            
            // 验证签名
            boolean signVerified = alipayService.verifyNotify(params);
            System.out.println("签名验证结果: " + signVerified);
            
            if (signVerified) {
                String tradeStatus = params.get("trade_status");
                String outTradeNo = params.get("out_trade_no"); // 订单号
                String tradeNo = params.get("trade_no"); // 支付宝交易号
                
                if ("TRADE_SUCCESS".equals(tradeStatus) || "TRADE_FINISHED".equals(tradeStatus)) {
                    System.out.println("支付成功，更新订单状态: " + outTradeNo);
                    // 保存支付宝交易号
                    if (tradeNo != null) {
                        orderService.updateOrderTradeNo(outTradeNo, tradeNo);
                    }
                    // 更新订单状态为已付款
                    orderService.updateOrderStatus(outTradeNo, "paid");
                    System.out.println("订单状态已更新为已付款");
                } else {
                    System.out.println("交易状态不是成功状态: " + tradeStatus);
                }
                
                response.getWriter().write("success");
            } else {
                System.err.println("支付宝异步通知签名验证失败");
                response.getWriter().write("fail");
            }
        } catch (Exception e) {
            System.err.println("处理支付宝异步通知时发生错误: " + e.getMessage());
            e.printStackTrace();
            response.getWriter().write("fail");
        }
    }
    */

    /**
     * 支付宝同步跳转回调
     * ⚠️ 本地测试模式：已禁用（因为未设置return_url）
     * 注意：生产环境需要启用此接口，用于处理支付完成后的同步跳转
     */
    /*
    @GetMapping("/alipay/return")
    public void alipayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            System.out.println("\n" + "=".repeat(60));
            System.out.println("📥 收到支付宝同步跳转回调");
            System.out.println("=".repeat(60));
            
            // 获取所有请求参数
            Map<String, String> params = new java.util.HashMap<>();
            Map<String, String[]> requestParams = request.getParameterMap();
            for (String name : requestParams.keySet()) {
                String[] values = requestParams.get(name);
                String valueStr = "";
                for (int i = 0; i < values.length; i++) {
                    valueStr = (i == values.length - 1) ? valueStr + values[i] : valueStr + values[i] + ",";
                }
                params.put(name, valueStr);
            }
            
            System.out.println("参数数量: " + params.size());
            System.out.println("订单号: " + params.get("out_trade_no"));
            System.out.println("交易状态: " + params.get("trade_status"));
            System.out.println("支付宝交易号: " + params.get("trade_no"));
            
            // 验证签名
            boolean signVerified = alipayService.verifyNotify(params);
            System.out.println("签名验证结果: " + (signVerified ? "✅ 通过" : "❌ 失败"));
            
            if (signVerified) {
                String outTradeNo = params.get("out_trade_no");
                String tradeStatus = params.get("trade_status");
                String tradeNo = params.get("trade_no");
                
                // 如果支付成功，更新订单状态（同步回调也可以作为支付成功的依据）
                if ("TRADE_SUCCESS".equals(tradeStatus) || "TRADE_FINISHED".equals(tradeStatus)) {
                    System.out.println("\n✅ 支付成功，更新订单状态");
                    System.out.println("订单号: " + outTradeNo);
                    System.out.println("支付宝交易号: " + tradeNo);
                    
                    // 保存支付宝交易号
                    if (tradeNo != null) {
                        orderService.updateOrderTradeNo(outTradeNo, tradeNo);
                    }
                    // 更新订单状态为已付款
                    orderService.updateOrderStatus(outTradeNo, "paid");
                    System.out.println("✅ 订单状态已更新为已付款");
                } else {
                    System.out.println("⚠️  交易状态: " + tradeStatus + "（非成功状态）");
                }
                
                // 重定向到前端订单详情页
                String frontendUrl = "http://localhost:3000/orders/" + outTradeNo;
                System.out.println("\n🔄 重定向到前端: " + frontendUrl);
                response.sendRedirect(frontendUrl);
            } else {
                System.err.println("❌ 支付宝同步回调签名验证失败");
                response.sendRedirect("http://localhost:3000/orders?error=payment_failed");
            }
        } catch (Exception e) {
            System.err.println("❌ 处理支付宝同步回调时发生错误: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect("http://localhost:3000/orders?error=payment_failed");
        }
    }
    */

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("未找到token");
    }
}
