package com.campus.trading.service;

import com.campus.trading.entity.UserSession;
import com.campus.trading.mapper.SessionMapper;
import com.campus.trading.util.IdUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Service
public class SessionService {
    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);
    
    @Autowired
    private SessionMapper sessionMapper;
    
    /**
     * 生成token的哈希值（用于存储和查找）
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            logger.error("无法生成token哈希", e);
            throw new RuntimeException("无法生成token哈希", e);
        }
    }
    
    /**
     * 创建新会话（登录时调用）
     * 会将该用户的其他所有会话标记为失效
     */
    @Transactional
    public UserSession createSession(String userId, String token) {
        String tokenHash = hashToken(token);
        
        // 使该用户的其他所有会话失效
        int invalidatedCount = sessionMapper.invalidateAllSessionsExcept(userId, tokenHash);
        logger.info("使旧会话失效: userId={}, 失效会话数={}, 新tokenHash前8位={}", 
                userId, invalidatedCount, tokenHash.substring(0, Math.min(8, tokenHash.length())));
        
        // 创建新会话
        UserSession session = new UserSession();
        session.setId(IdUtil.generateId());
        session.setUserId(userId);
        session.setTokenHash(tokenHash);
        session.setIsActive(true);
        session.setCreatedAt(LocalDateTime.now());
        session.setLastActiveAt(LocalDateTime.now());
        
        sessionMapper.insert(session);
        logger.info("✓ 创建新会话成功: userId={}, sessionId={}, tokenHash前8位={}", 
                userId, session.getId(), tokenHash.substring(0, Math.min(8, tokenHash.length())));
        
        return session;
    }
    
    /**
     * 验证会话是否有效（是否为最新登录的会话）
     */
    public boolean isSessionValid(String token) {
        try {
            String tokenHash = hashToken(token);
            UserSession session = sessionMapper.findByTokenHash(tokenHash);
            
            if (session == null) {
                logger.warn("会话不存在: tokenHash前8位={}", 
                        tokenHash.substring(0, Math.min(8, tokenHash.length())));
                return false;
            }
            
            if (!session.getIsActive()) {
                logger.warn("会话已失效（被异地登录挤掉）: tokenHash前8位={}, userId={}", 
                        tokenHash.substring(0, Math.min(8, tokenHash.length())), session.getUserId());
                return false;
            }
            
            // 更新最后活跃时间
            sessionMapper.updateLastActiveAt(tokenHash);
            
            return true;
        } catch (Exception e) {
            logger.error("验证会话时发生错误", e);
            return false;
        }
    }
    
    /**
     * 使会话失效（登出时调用）
     */
    @Transactional
    public void invalidateSession(String token) {
        try {
            String tokenHash = hashToken(token);
            sessionMapper.invalidateSession(tokenHash);
            logger.info("会话已失效: tokenHash={}", tokenHash);
        } catch (Exception e) {
            logger.error("使会话失效时发生错误", e);
        }
    }
    
    /**
     * 获取用户的活跃会话
     */
    public UserSession getActiveSession(String userId) {
        return sessionMapper.findActiveSessionByUserId(userId);
    }
}
