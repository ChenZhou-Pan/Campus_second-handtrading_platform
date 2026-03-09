package com.campus.trading.mapper;

import com.campus.trading.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface OrderMapper {
    Order findById(@Param("id") String id);
    List<Order> findAll();
    List<Order> findByBuyerId(@Param("buyerId") String buyerId, @Param("offset") int offset,
                              @Param("limit") int limit, @Param("status") String status);
    List<Order> findBySellerId(@Param("sellerId") String sellerId, @Param("offset") int offset,
                                @Param("limit") int limit, @Param("status") String status);
    Long countByBuyerId(@Param("buyerId") String buyerId, @Param("status") String status);
    Long countBySellerId(@Param("sellerId") String sellerId, @Param("status") String status);
    java.math.BigDecimal sumPriceByBuyerId(@Param("buyerId") String buyerId, @Param("status") String status);
    java.math.BigDecimal sumPriceBySellerId(@Param("sellerId") String sellerId, @Param("status") String status);
    int insert(Order order);
    int updateStatus(@Param("id") String id, @Param("status") String status);
    int cancel(@Param("id") String id);
    int updateTradeNo(@Param("id") String id, @Param("tradeNo") String tradeNo);
    int updateTransferStatus(@Param("id") String id, @Param("transferStatus") String transferStatus);
    List<Order> findExpiredPendingOrders(@Param("beforeTime") LocalDateTime beforeTime);
    int updateUpdatedAt(@Param("id") String id, @Param("updatedAt") LocalDateTime updatedAt);
    int delete(@Param("id") String id);
    List<Order> findByProductId(@Param("productId") String productId);
}
