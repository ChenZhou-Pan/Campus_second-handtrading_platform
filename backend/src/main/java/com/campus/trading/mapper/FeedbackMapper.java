package com.campus.trading.mapper;

import com.campus.trading.entity.Feedback;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedbackMapper {
    int insert(Feedback feedback);
    List<Feedback> findAll();
    Feedback findById(@Param("id") String id);
    int delete(@Param("id") String id);
}
