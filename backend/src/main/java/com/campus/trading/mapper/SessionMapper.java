package com.campus.trading.mapper;

import com.campus.trading.entity.UserSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SessionMapper {
    // 根据token哈希查找会话
    UserSession findByTokenHash(@Param("tokenHash") String tokenHash);
    
    // 根据用户ID查找活跃会话
    UserSession findActiveSessionByUserId(@Param("userId") String userId);
    
    // 插入新会话
    int insert(UserSession session);
    
    // 使指定用户的所有会话失效（除了指定的token哈希）
    int invalidateAllSessionsExcept(@Param("userId") String userId, @Param("tokenHash") String tokenHash);
    
    // 使指定token哈希的会话失效
    int invalidateSession(@Param("tokenHash") String tokenHash);
    
    // 更新会话的最后活跃时间
    int updateLastActiveAt(@Param("tokenHash") String tokenHash);
    
    // 删除过期会话（可选，用于清理）
    int deleteExpiredSessions(@Param("expiredBefore") java.time.LocalDateTime expiredBefore);
}
