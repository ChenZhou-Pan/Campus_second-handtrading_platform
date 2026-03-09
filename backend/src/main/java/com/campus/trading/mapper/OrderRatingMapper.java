package com.campus.trading.mapper;

import com.campus.trading.entity.OrderRating;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderRatingMapper {
    OrderRating findById(@Param("id") String id);
    OrderRating findByOrderIdAndRaterId(@Param("orderId") String orderId, @Param("raterId") String raterId);
    List<OrderRating> findByRatedId(@Param("ratedId") String ratedId);
    List<OrderRating> findByOrderId(@Param("orderId") String orderId);
    int insert(OrderRating rating);
    int update(OrderRating rating);
    Double getAverageRatingByUserId(@Param("userId") String userId);
    Long countRatingsByUserId(@Param("userId") String userId);
}
