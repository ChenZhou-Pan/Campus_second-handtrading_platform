package com.campus.trading.config;

import com.campus.trading.service.SessionService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtAuthenticationInterceptor implements HandlerInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationInterceptor.class);
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private SessionService sessionService;
    
    // 不需要认证的路径
    private static final String[] EXCLUDE_PATHS = {
        "/auth/register",
        "/auth/login",
        "/auth/login-by-code",
        "/auth/send-code",
        "/auth/verify-code",
        "/products",
        "/uploads"
    };
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // 移除 /api 前缀（如果存在）
        String originalPath = path;
        if (path.startsWith("/api")) {
            path = path.substring(4);
        }
        
        // 检查是否为排除路径
        boolean isExcluded = false;
        for (String excludePath : EXCLUDE_PATHS) {
            if (path.startsWith(excludePath)) {
                // 对于 /products 路径，只有 GET 请求不需要认证
                if (excludePath.equals("/products")) {
                    if ("GET".equals(method)) {
                        isExcluded = true;
                        logger.debug("跳过认证（公开接口）: {} {}", method, originalPath);
                        return true;
                    }
                } else {
                    isExcluded = true;
                    logger.debug("跳过认证（公开接口）: {} {}", method, originalPath);
                    return true;
                }
            }
        }
        
        logger.debug("拦截请求进行认证检查: {} {}", method, originalPath);
        
        // 提取token
        String token = extractToken(request);
        if (token == null) {
            logger.debug("未找到token: path={}", path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未授权，请先登录\",\"data\":null}");
            return false;
        }
        
        // 验证token格式和有效性
        if (!jwtUtil.validateToken(token)) {
            logger.debug("token无效或已过期: path={}", path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"token无效或已过期\",\"data\":null}");
            return false;
        }
        
        // 验证会话是否有效（是否为最新登录的会话）
        if (!sessionService.isSessionValid(token)) {
            logger.warn("会话验证失败，请求被拒绝: path={}, method={}", path, method);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"您的账号在其他地方登录，当前会话已失效\",\"data\":null}");
            return false;
        }
        
        logger.debug("会话验证通过: path={}, method={}", path, method);
        return true;
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
