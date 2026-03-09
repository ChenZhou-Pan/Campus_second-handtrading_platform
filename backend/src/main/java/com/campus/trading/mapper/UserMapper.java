package com.campus.trading.mapper;

import com.campus.trading.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User findByUsername(@Param("username") String username);
    User findById(@Param("id") String id);
    User findByPhone(@Param("phone") String phone);
    java.util.List<User> findAll();
    int insert(User user);
    int update(User user);
    int updateRole(@Param("id") String id, @Param("role") String role);
    int updateCreditScore(@Param("id") String id, @Param("creditScore") java.math.BigDecimal creditScore);
    int delete(@Param("id") String id);
}
