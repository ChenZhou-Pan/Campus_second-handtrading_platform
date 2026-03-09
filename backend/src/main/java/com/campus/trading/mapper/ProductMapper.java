package com.campus.trading.mapper;

import com.campus.trading.entity.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProductMapper {
    Product findById(@Param("id") String id);
    Product findByIdForOrder(@Param("id") String id); // 用于订单，包括已删除的商品
    List<Product> findAll(@Param("offset") int offset, @Param("limit") int limit,
                          @Param("category") String category, @Param("keyword") String keyword,
                          @Param("condition") String condition, @Param("minPrice") Double minPrice,
                          @Param("maxPrice") Double maxPrice, @Param("location") String location,
                          @Param("sortBy") String sortBy);
    Long count(@Param("category") String category, @Param("keyword") String keyword,
               @Param("condition") String condition, @Param("minPrice") Double minPrice,
               @Param("maxPrice") Double maxPrice, @Param("location") String location);
    List<Product> findBySellerId(@Param("sellerId") String sellerId, @Param("offset") int offset,
                                 @Param("limit") int limit, @Param("status") String status);
    Long countBySellerId(@Param("sellerId") String sellerId, @Param("status") String status);
    List<Product> findAllForAdmin(); // 管理员获取所有商品（包括所有状态，除了deleted）
    int insert(Product product);
    int update(Product product);
    int delete(@Param("id") String id);
    int incrementViewCount(@Param("id") String id);
    int updateFavoriteCount(@Param("id") String id, @Param("count") int count);
}
