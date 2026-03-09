package com.campus.trading.mapper;

import com.campus.trading.entity.Favorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FavoriteMapper {
    Favorite findByUserIdAndProductId(@Param("userId") String userId, @Param("productId") String productId);
    List<Favorite> findByUserId(@Param("userId") String userId, @Param("offset") int offset, @Param("limit") int limit);
    Long countByUserId(@Param("userId") String userId);
    int insert(Favorite favorite);
    int delete(@Param("id") String id);
    int deleteByUserIdAndProductId(@Param("userId") String userId, @Param("productId") String productId);
}
