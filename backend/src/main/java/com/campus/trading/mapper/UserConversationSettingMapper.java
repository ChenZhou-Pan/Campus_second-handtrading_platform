package com.campus.trading.mapper;

import com.campus.trading.entity.UserConversationSetting;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserConversationSettingMapper {
    UserConversationSetting findByUserIdAndConversationId(@Param("userId") String userId, @Param("conversationId") String conversationId);
    int insert(UserConversationSetting setting);
    int update(UserConversationSetting setting);
    int markAsDeleted(@Param("userId") String userId, @Param("conversationId") String conversationId);
    int markAsNotDeleted(@Param("userId") String userId, @Param("conversationId") String conversationId);
}
