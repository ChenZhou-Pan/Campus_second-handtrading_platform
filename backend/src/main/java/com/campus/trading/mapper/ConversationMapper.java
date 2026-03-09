package com.campus.trading.mapper;

import com.campus.trading.entity.Conversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConversationMapper {
    Conversation findById(@Param("id") String id);
    Conversation findByParticipants(@Param("participantIds") String participantIds);
    List<Conversation> findByUserId(@Param("userId") String userId, @Param("offset") int offset, @Param("limit") int limit);
    Long countByUserId(@Param("userId") String userId);
    int insert(Conversation conversation);
    int update(@Param("id") String id);
    int delete(@Param("id") String id);
}
