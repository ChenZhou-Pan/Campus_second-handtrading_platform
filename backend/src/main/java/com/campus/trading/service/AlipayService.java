package com.campus.trading.service;

import com.alipay.api.AlipayApiException;
import com.alipay.api.AlipayClient;
import com.alipay.api.DefaultAlipayClient;
import com.alipay.api.domain.AlipayTradePagePayModel;
import com.alipay.api.domain.AlipayTradeRefundModel;
import com.alipay.api.internal.util.AlipaySignature;
import com.alipay.api.request.AlipayTradePagePayRequest;
import com.alipay.api.request.AlipayTradeRefundRequest;
import com.alipay.api.response.AlipayTradePagePayResponse;
import com.alipay.api.response.AlipayTradeRefundResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AlipayService {
    
    // 支付宝网关地址（沙箱环境）
    // 注意：2024年推荐使用新地址 https://openapi-sandbox.dl.alipaydev.com/gateway.do
    @Value("${alipay.gateway:https://openapi-sandbox.dl.alipaydev.com/gateway.do}")
    private String gatewayUrl;
    
    // 应用ID（需要替换为实际的APPID）
    @Value("${alipay.appId:}")
    private String appId;
    
    // 应用私钥（需要替换为实际的私钥）
    @Value("${alipay.privateKey:}")
    private String privateKey;
    
    // 支付宝公钥（需要替换为实际的公钥）
    @Value("${alipay.publicKey:}")
    private String publicKey;
    
    // 签名算法类型
    @Value("${alipay.signType:RSA2}")
    private String signType;
    
    // 字符编码格式
    @Value("${alipay.charset:UTF-8}")
    private String charset;
    
    // 返回格式
    @Value("${alipay.format:JSON}")
    private String format;
    
    // 异步通知地址
    @Value("${alipay.notifyUrl:http://localhost:8080/api/payments/alipay/notify}")
    private String notifyUrl;
    
    // 同步跳转地址
    @Value("${alipay.returnUrl:http://localhost:3000/orders}")
    private String returnUrl;

    /**
     * 创建支付宝支付链接
     * @param orderId 订单ID
     * @param orderTitle 订单标题
     * @param totalAmount 订单总金额
     * @return 支付页面的HTML表单字符串
     */
    public String createPayment(String orderId, String orderTitle, BigDecimal totalAmount) {
        // 检查配置是否完整
        if (appId == null || appId.trim().isEmpty()) {
            throw new RuntimeException("支付宝APPID未配置，请在 application.yml 中配置 alipay.appId");
        }
        if (privateKey == null || privateKey.trim().isEmpty()) {
            throw new RuntimeException("支付宝应用私钥未配置，请在 application.yml 中配置 alipay.privateKey");
        }
        if (publicKey == null || publicKey.trim().isEmpty()) {
            throw new RuntimeException("支付宝公钥未配置，请在 application.yml 中配置 alipay.publicKey");
        }
        
        try {
            // ==================== 配置信息 ====================
            System.out.println("\n" + "=".repeat(60));
            System.out.println("📋 支付宝支付请求 - 配置信息");
            System.out.println("=".repeat(60));
            System.out.println("订单ID: " + orderId);
            System.out.println("订单标题: " + orderTitle);
            System.out.println("订单金额: ¥" + totalAmount);
            System.out.println("网关地址: " + gatewayUrl);
            System.out.println("应用ID: " + appId);
            System.out.println("签名类型: " + signType);
            System.out.println("字符编码: " + charset);
            System.out.println("返回格式: " + format);
            
            // 清理私钥格式：去除首尾空格和换行，确保格式正确
            // 支付宝SDK要求私钥是纯Base64字符串（一行，不包含BEGIN/END标记）
            String cleanedPrivateKey = extractBase64Key(privateKey);
            String cleanedPublicKey = extractBase64Key(publicKey);
            
            // 验证私钥是否可以正确解析（在传递给支付宝SDK之前）
            try {
                validatePrivateKeyBase64(cleanedPrivateKey);
                System.out.println("✓ 私钥格式验证通过");
            } catch (Exception e) {
                System.err.println("❌ 私钥格式验证失败: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("私钥格式无效，无法解析: " + e.getMessage(), e);
            }
            
            // 初始化AlipayClient（支付宝SDK要求私钥是纯Base64字符串）
            AlipayClient alipayClient = new DefaultAlipayClient(
                gatewayUrl,
                appId,
                cleanedPrivateKey,
                format,
                charset,
                cleanedPublicKey,
                signType
            );

            // ==================== 请求参数 ====================
            System.out.println("\n" + "-".repeat(60));
            System.out.println("📤 支付宝支付请求 - 请求参数");
            System.out.println("-".repeat(60));
            
            // 创建API请求
            AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
            
            // ⚠️ 本地测试模式：不使用 notify_url 和 return_url
            // 支付完成后需要用户手动确认支付状态
            // 注意：生产环境必须设置这两个地址才能实现自动更新订单状态
            
            // 设置 notify_url（支付宝服务器异步回调，本地测试不使用）
            // request.setNotifyUrl(notifyUrl);
            
            // 设置 return_url（支付完成后同步跳转地址，本地测试不使用）
            // request.setReturnUrl(returnUrl);
            
            System.out.println("⚠️  本地测试模式：不使用 notify_url 和 return_url");
            System.out.println("⚠️  支付完成后，请在订单页面手动确认支付状态");

            // 设置业务参数
            AlipayTradePagePayModel model = new AlipayTradePagePayModel();
            model.setOutTradeNo(orderId); // 商户订单号
            model.setProductCode("FAST_INSTANT_TRADE_PAY"); // 产品码
            model.setTotalAmount(totalAmount.toString()); // 订单总金额
            model.setSubject(orderTitle); // 订单标题
            
            request.setBizModel(model);
            
            System.out.println("商户订单号: " + orderId);
            System.out.println("产品码: FAST_INSTANT_TRADE_PAY");
            System.out.println("订单金额: " + totalAmount.toString());
            System.out.println("订单标题: " + orderTitle);

            // ==================== 发起请求 ====================
            System.out.println("\n" + "-".repeat(60));
            System.out.println("🚀 正在发起支付宝支付请求...");
            System.out.println("-".repeat(60));
            
            // 发起请求
            AlipayTradePagePayResponse response = alipayClient.pageExecute(request);
            
            // ==================== 响应信息 ====================
            System.out.println("\n" + "-".repeat(60));
            System.out.println("📥 支付宝支付请求 - 响应信息");
            System.out.println("-".repeat(60));
            System.out.println("响应状态: " + (response.isSuccess() ? "✅ 成功" : "❌ 失败"));
            System.out.println("响应码: " + (response.getCode() != null ? response.getCode() : "null"));
            System.out.println("响应消息: " + (response.getMsg() != null ? response.getMsg() : "null"));
            if (response.getSubMsg() != null) {
                System.out.println("子消息: " + response.getSubMsg());
            }
            
            if (response.isSuccess()) {
                String body = response.getBody();
                System.out.println("HTML长度: " + (body != null ? body.length() + " 字符" : "null"));
                
                if (body != null) {
                    // 检查HTML内容
                    boolean hasForm = body.contains("punchout_form");
                    boolean hasSubmit = body.contains("document.forms[0].submit()");
                    boolean hasError = body.contains("error") || body.contains("错误") || body.contains("失败") || 
                                     body.toLowerCase().contains("fail") || body.contains("拒绝") || 
                                     body.contains("denied") || body.contains("reject");
                    boolean hasRedirect = body.contains("window.location") || body.contains("location.href");
                    boolean hasIllegal = body.contains("illegal_request") || body.contains("ILLEGAL_REQUEST") || 
                                       body.contains("invalid_request") || body.contains("INVALID_REQUEST");
                    
                    System.out.println("\nHTML内容检查:");
                    System.out.println("  " + (hasForm ? "✓" : "✗") + " 包含支付表单 (punchout_form)");
                    System.out.println("  " + (hasSubmit ? "✓" : "✗") + " 包含自动提交脚本");
                    System.out.println("  " + (hasError ? "⚠️" : "✓") + " 错误信息检查");
                    System.out.println("  " + (hasRedirect ? "⚠️" : "✓") + " 重定向脚本检查");
                    System.out.println("  " + (hasIllegal ? "⚠️" : "✓") + " 非法请求检查");
                    
                    // 如果有错误，提取详细信息
                    if (hasError || hasIllegal || hasRedirect) {
                        System.out.println("\n⚠️  警告：检测到可能的问题");
                        if (body.contains("<title>")) {
                            int titleStart = body.indexOf("<title>");
                            int titleEnd = body.indexOf("</title>", titleStart);
                            if (titleStart >= 0 && titleEnd > titleStart) {
                                String title = body.substring(titleStart + 7, titleEnd);
                                System.out.println("  页面标题: " + title);
                            }
                        }
                        if (hasIllegal) {
                            System.err.println("  ❌ 检测到支付宝请求错误：可能是参数或地址问题");
                        }
                        if (hasRedirect) {
                            System.err.println("  ⚠️  HTML包含重定向脚本，可能表示支付宝拒绝了请求");
                        }
                    }
                    
                    // 提取表单action地址（用于调试）
                    if (hasForm && body.contains("action=\"")) {
                        int actionStart = body.indexOf("action=\"") + 8;
                        int actionEnd = body.indexOf("\"", actionStart);
                        if (actionStart >= 8 && actionEnd > actionStart) {
                            String actionUrl = body.substring(actionStart, actionEnd);
                            System.out.println("\n表单提交地址: " + actionUrl);
                        }
                    }
                    
                    // 打印完整HTML（仅在调试时有用）
                    System.out.println("\n" + "=".repeat(60));
                    System.out.println("📄 支付宝返回的完整HTML");
                    System.out.println("=".repeat(60));
                    System.out.println(body);
                    System.out.println("=".repeat(60));
                    System.out.println("HTML总长度: " + body.length() + " 字符\n");
                } else {
                    System.err.println("❌ 警告：支付宝返回的HTML为空");
                }
                return body;
            } else {
                String errorMsg = "支付宝支付请求失败: " + response.getMsg();
                if (response.getSubMsg() != null) {
                    errorMsg += " (" + response.getSubMsg() + ")";
                }
                System.err.println("\n❌ 错误详情:");
                System.err.println("  " + errorMsg);
                throw new RuntimeException(errorMsg);
            }
        } catch (AlipayApiException e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ 支付宝API异常");
            System.err.println("=".repeat(60));
            System.err.println("错误代码: " + (e.getErrCode() != null ? e.getErrCode() : "null"));
            System.err.println("错误信息: " + (e.getErrMsg() != null ? e.getErrMsg() : "null"));
            System.err.println("异常消息: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("根本原因: " + e.getCause().getMessage());
            }
            String errorMsg = "创建支付宝支付链接失败: " + e.getMessage();
            throw new RuntimeException(errorMsg, e);
        } catch (Exception e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ 未知异常");
            System.err.println("=".repeat(60));
            System.err.println("异常类型: " + e.getClass().getSimpleName());
            System.err.println("异常消息: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("创建支付宝支付链接失败: " + e.getMessage(), e);
        }
    }

    /**
     * 验证支付宝回调签名
     * @param params 回调参数
     * @return 是否验证通过
     */
    public boolean verifyNotify(java.util.Map<String, String> params) {
        try {
            // 获取签名
            String sign = params.get("sign");
            if (sign == null || sign.isEmpty()) {
                System.err.println("支付宝回调缺少签名参数");
                return false;
            }
            
            // 获取签名类型
            String signType = params.get("sign_type");
            if (signType == null || signType.isEmpty()) {
                signType = this.signType; // 使用配置的签名类型
            }
            
            // 移除签名和签名类型参数（不参与验签）
            java.util.Map<String, String> paramsToVerify = new java.util.HashMap<>(params);
            paramsToVerify.remove("sign");
            paramsToVerify.remove("sign_type");
            
            // 提取支付宝公钥
            String cleanedPublicKey = extractBase64Key(publicKey);
            
            System.out.println("开始验证支付宝回调签名...");
            System.out.println("签名类型: " + signType);
            System.out.println("参数数量: " + paramsToVerify.size());
            
            // 使用支付宝SDK的签名验证方法
            boolean verified = AlipaySignature.rsaCheckV1(
                paramsToVerify,
                cleanedPublicKey,
                charset,
                signType
            );
            
            if (verified) {
                System.out.println("✓ 支付宝回调签名验证通过");
            } else {
                System.err.println("❌ 支付宝回调签名验证失败");
            }
            
            return verified;
        } catch (AlipayApiException e) {
            System.err.println("支付宝签名验证异常: " + e.getMessage());
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("签名验证时发生未知错误: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 退款（调用支付宝退款接口）
     * @param orderId 订单ID（商户订单号）
     * @param tradeNo 支付宝交易号（可选，如果有则优先使用）
     * @param refundAmount 退款金额
     * @param refundReason 退款原因（可选）
     * @return 退款结果，成功返回true
     */
    public boolean refund(String orderId, String tradeNo, BigDecimal refundAmount, String refundReason) {
        try {
            // 检查配置是否完整
            if (appId == null || appId.trim().isEmpty()) {
                throw new RuntimeException("支付宝APPID未配置，无法退款");
            }
            if (privateKey == null || privateKey.trim().isEmpty()) {
                throw new RuntimeException("支付宝应用私钥未配置，无法退款");
            }
            if (publicKey == null || publicKey.trim().isEmpty()) {
                throw new RuntimeException("支付宝公钥未配置，无法退款");
            }
            
            // 清理密钥格式
            String cleanedPrivateKey = extractBase64Key(privateKey);
            String cleanedPublicKey = extractBase64Key(publicKey);
            
            // 初始化AlipayClient
            AlipayClient alipayClient = new DefaultAlipayClient(
                gatewayUrl,
                appId,
                cleanedPrivateKey,
                format,
                charset,
                cleanedPublicKey,
                signType
            );
            
            // 创建退款请求
            AlipayTradeRefundRequest request = new AlipayTradeRefundRequest();
            AlipayTradeRefundModel model = new AlipayTradeRefundModel();
            
            // 设置订单号（优先使用支付宝交易号）
            if (tradeNo != null && !tradeNo.trim().isEmpty()) {
                model.setTradeNo(tradeNo);
                System.out.println("使用支付宝交易号退款: " + tradeNo);
            } else {
                model.setOutTradeNo(orderId);
                System.out.println("使用商户订单号退款: " + orderId);
            }
            
            // 设置退款金额
            model.setRefundAmount(refundAmount.toString());
            
            // 设置退款请求号（用于防止重复退款，使用订单ID+时间戳）
            String outRequestNo = orderId + "_REFUND_" + System.currentTimeMillis();
            model.setOutRequestNo(outRequestNo);
            
            // 设置退款原因（可选）
            if (refundReason != null && !refundReason.trim().isEmpty()) {
                model.setRefundReason(refundReason);
            } else {
                model.setRefundReason("用户申请退款");
            }
            
            request.setBizModel(model);
            
            System.out.println("\n" + "=".repeat(60));
            System.out.println("💰 支付宝退款请求");
            System.out.println("=".repeat(60));
            System.out.println("订单ID: " + orderId);
            if (tradeNo != null) {
                System.out.println("支付宝交易号: " + tradeNo);
            }
            System.out.println("退款金额: ¥" + refundAmount);
            System.out.println("退款请求号: " + outRequestNo);
            System.out.println("退款原因: " + model.getRefundReason());
            
            // 发起退款请求
            AlipayTradeRefundResponse response = alipayClient.execute(request);
            
            System.out.println("\n" + "-".repeat(60));
            System.out.println("📥 支付宝退款响应");
            System.out.println("-".repeat(60));
            System.out.println("响应状态: " + (response.isSuccess() ? "✅ 成功" : "❌ 失败"));
            System.out.println("响应码: " + (response.getCode() != null ? response.getCode() : "null"));
            System.out.println("响应消息: " + (response.getMsg() != null ? response.getMsg() : "null"));
            
            if (response.getSubCode() != null) {
                System.out.println("子错误码: " + response.getSubCode());
            }
            if (response.getSubMsg() != null) {
                System.out.println("子错误消息: " + response.getSubMsg());
            }
            
            if (response.isSuccess()) {
                System.out.println("✅ 退款成功");
                System.out.println("支付宝交易号: " + (response.getTradeNo() != null ? response.getTradeNo() : "null"));
                System.out.println("商户订单号: " + (response.getOutTradeNo() != null ? response.getOutTradeNo() : "null"));
                System.out.println("退款金额: " + (response.getRefundFee() != null ? response.getRefundFee() : "null"));
                System.out.println("退款时间: " + (response.getGmtRefundPay() != null ? response.getGmtRefundPay() : "null"));
                return true;
            } else {
                String errorMsg = "支付宝退款失败: " + response.getMsg();
                if (response.getSubMsg() != null) {
                    errorMsg += " (" + response.getSubMsg() + ")";
                }
                System.err.println("❌ " + errorMsg);
                throw new RuntimeException(errorMsg);
            }
        } catch (AlipayApiException e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ 支付宝退款API异常");
            System.err.println("=".repeat(60));
            System.err.println("错误代码: " + (e.getErrCode() != null ? e.getErrCode() : "null"));
            System.err.println("错误信息: " + (e.getErrMsg() != null ? e.getErrMsg() : "null"));
            System.err.println("异常消息: " + e.getMessage());
            throw new RuntimeException("支付宝退款失败: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("\n" + "=".repeat(60));
            System.err.println("❌ 退款时发生未知异常");
            System.err.println("=".repeat(60));
            System.err.println("异常类型: " + e.getClass().getSimpleName());
            System.err.println("异常消息: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("退款失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 转账给卖家（确认收货后）
     * @param orderId 订单ID
     * @param sellerAlipayAccount 卖家支付宝账号
     * @param amount 转账金额
     * @param orderTitle 订单标题
     * @return 转账结果，成功返回true
     */
    public boolean transferToSeller(String orderId, String sellerAlipayAccount, BigDecimal amount, String orderTitle) {
        try {
            if (sellerAlipayAccount == null || sellerAlipayAccount.trim().isEmpty()) {
                throw new RuntimeException("卖家未设置支付宝账号，无法转账");
            }
            
            // 检查配置是否完整
            if (appId == null || appId.trim().isEmpty()) {
                throw new RuntimeException("支付宝APPID未配置，无法转账");
            }
            if (privateKey == null || privateKey.trim().isEmpty()) {
                throw new RuntimeException("支付宝应用私钥未配置，无法转账");
            }
            if (publicKey == null || publicKey.trim().isEmpty()) {
                throw new RuntimeException("支付宝公钥未配置，无法转账");
            }
            
            // 注意：支付宝单笔转账接口需要企业认证，个人开发者可能无法使用
            // 这里提供一个基础实现框架，实际使用时需要根据支付宝开放平台的接口文档进行调整
            
            AlipayClient alipayClient = new DefaultAlipayClient(
                gatewayUrl,
                appId,
                privateKey,
                format,
                charset,
                publicKey,
                signType
            );
            
            // 使用支付宝单笔转账接口 alipay.fund.trans.uni.transfer
            // 注意：此接口需要企业认证，个人开发者可能无法使用
            // 如果无法使用，可以考虑使用其他方式，如：平台代收代付、分账等
            
            // 这里提供一个简化的实现，实际生产环境需要根据支付宝接口文档完整实现
            // 由于转账接口比较复杂，建议先实现支付功能，转账功能可以后续完善
            
            // 暂时返回成功，实际需要调用支付宝转账接口
            // 生产环境需要实现完整的转账逻辑
            System.out.println("转账请求: 订单ID=" + orderId + ", 收款账号=" + sellerAlipayAccount + ", 金额=" + amount);
            System.out.println("注意: 转账功能需要企业认证，当前为简化实现");
            
            // TODO: 实现完整的支付宝转账接口调用
            // 参考: https://opendocs.alipay.com/open/309/106236
            
            return true; // 暂时返回成功，实际需要根据支付宝接口返回结果判断
        } catch (RuntimeException e) {
            throw e; // 重新抛出RuntimeException
        } catch (Exception e) {
            throw new RuntimeException("转账失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 清理密钥格式，确保符合支付宝SDK的要求
     * 支付宝SDK要求：PKCS#8格式，每行64字符（除了最后一行）
     * @param key 原始密钥
     * @return 清理后的密钥
     */
    private String cleanKey(String key) {
        if (key == null) {
            return null;
        }
        // 去除首尾空白字符
        String cleaned = key.trim();
        
        // 如果包含字面量的 \n 字符串（未转义的），先转换为实际换行符
        cleaned = cleaned.replace("\\n", "\n");
        
        // 统一换行符为 \n
        cleaned = cleaned.replaceAll("\\r\\n", "\n").replaceAll("\\r", "\n");
        
        // 提取BEGIN和END标记
        String beginMarker = null;
        String endMarker = null;
        StringBuilder keyContent = new StringBuilder();
        
        String[] lines = cleaned.split("\n");
        for (String line : lines) {
            String trimmedLine = line.trim();
            if (trimmedLine.isEmpty()) {
                continue;
            }
            if (trimmedLine.startsWith("-----BEGIN")) {
                beginMarker = trimmedLine;
            } else if (trimmedLine.startsWith("-----END")) {
                endMarker = trimmedLine;
            } else {
                // 这是密钥内容，去除所有空格和换行，只保留Base64字符
                // 去除所有非Base64字符（只保留A-Z, a-z, 0-9, +, /, =）
                String base64Line = trimmedLine.replaceAll("[^A-Za-z0-9+/=]", "");
                keyContent.append(base64Line);
            }
        }
        
        // 验证标记
        if (beginMarker == null || endMarker == null) {
            throw new RuntimeException("密钥格式错误：缺少 BEGIN 或 END 标记");
        }
        
        // 验证密钥内容不为空
        String keyContentStr = keyContent.toString();
        if (keyContentStr.isEmpty()) {
            throw new RuntimeException("密钥格式错误：密钥内容为空");
        }
        
        // 验证Base64格式（长度应该是4的倍数，或者末尾有=填充）
        int base64Length = keyContentStr.length();
        if (base64Length % 4 != 0 && !keyContentStr.endsWith("=")) {
            System.out.println("警告: Base64内容长度不是4的倍数: " + base64Length);
        }
        
        // 调试：输出Base64内容的前100和后100字符
        System.out.println("Base64内容长度: " + keyContentStr.length());
        System.out.println("Base64前100字符: " + keyContentStr.substring(0, Math.min(100, keyContentStr.length())));
        System.out.println("Base64后100字符: " + keyContentStr.substring(Math.max(0, keyContentStr.length() - 100)));
        
        // 将密钥内容按64字符分割成多行（RSA密钥标准格式）
        StringBuilder formattedKey = new StringBuilder();
        formattedKey.append(beginMarker).append("\n");
        
        // 按64字符分割
        for (int i = 0; i < keyContentStr.length(); i += 64) {
            int end = Math.min(i + 64, keyContentStr.length());
            formattedKey.append(keyContentStr.substring(i, end));
            if (end < keyContentStr.length()) {
                formattedKey.append("\n");
            }
        }
        
        formattedKey.append("\n").append(endMarker);
        cleaned = formattedKey.toString();
        
        // 调试输出
        System.out.println("清理后的密钥长度: " + cleaned.length());
        String preview = cleaned.substring(0, Math.min(200, cleaned.length())).replace("\n", "\\n");
        System.out.println("密钥前200字符(换行符显示为\\n): " + preview);
        int lineCount = cleaned.split("\n").length;
        System.out.println("密钥行数: " + lineCount);
        if (cleaned.contains("BEGIN PRIVATE KEY")) {
            System.out.println("这是私钥 (PKCS#8格式)");
        } else if (cleaned.contains("BEGIN PUBLIC KEY")) {
            System.out.println("这是公钥");
        }
        
        return cleaned;
    }
    
    /**
     * 从PEM格式密钥中提取纯Base64内容（支付宝SDK要求）
     * @param key PEM格式的密钥字符串
     * @return 纯Base64字符串（一行，无标记，无换行）
     */
    private String extractBase64Key(String key) {
        if (key == null) {
            return null;
        }
        // 去除首尾空白字符
        String cleaned = key.trim();
        
        // 如果包含字面量的 \n 字符串（未转义的），先转换为实际换行符
        cleaned = cleaned.replace("\\n", "\n");
        
        // 统一换行符为 \n
        cleaned = cleaned.replaceAll("\\r\\n", "\n").replaceAll("\\r", "\n");
        
        // 提取Base64内容：去除BEGIN和END标记，去除所有空白字符
        String base64Content = cleaned
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replaceAll("\\s", ""); // 去除所有空白字符（包括换行、空格等）
        
        if (base64Content.isEmpty()) {
            throw new RuntimeException("密钥格式错误：无法提取Base64内容");
        }
        
        return base64Content;
    }
    
    /**
     * 验证私钥Base64内容是否可以正确解析
     * @param base64Key 纯Base64字符串（不包含PEM标记）
     */
    private void validatePrivateKeyBase64(String base64Key) throws Exception {
        try {
            // 解码Base64
            byte[] keyBytes = java.util.Base64.getDecoder().decode(base64Key);
            
            // 尝试解析为PKCS#8格式
            java.security.spec.PKCS8EncodedKeySpec keySpec = new java.security.spec.PKCS8EncodedKeySpec(keyBytes);
            java.security.KeyFactory keyFactory = java.security.KeyFactory.getInstance("RSA");
            java.security.PrivateKey pk = keyFactory.generatePrivate(keySpec);
            
            // 验证成功，不输出详细信息（已在主方法中输出）
        } catch (java.security.spec.InvalidKeySpecException e) {
            throw new Exception("私钥不是有效的PKCS#8格式: " + e.getMessage(), e);
        } catch (java.lang.IllegalArgumentException e) {
            throw new Exception("Base64解码失败: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new Exception("私钥验证失败: " + e.getMessage(), e);
        }
    }
}
