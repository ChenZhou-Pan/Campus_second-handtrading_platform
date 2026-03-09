package com.campus.trading.mapper;

import com.campus.trading.entity.Follow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FollowMapper {
    Follow findByFollowerIdAndFollowingId(@Param("followerId") String followerId, @Param("followingId") String followingId);
    List<Follow> findByFollowerId(@Param("followerId") String followerId, @Param("offset") int offset, @Param("limit") int limit);
    List<Follow> findByFollowingId(@Param("followingId") String followingId, @Param("offset") int offset, @Param("limit") int limit);
    Long countByFollowerId(@Param("followerId") String followerId);
    Long countByFollowingId(@Param("followingId") String followingId);
    int insert(Follow follow);
    int delete(@Param("followerId") String followerId, @Param("followingId") String followingId);
}
