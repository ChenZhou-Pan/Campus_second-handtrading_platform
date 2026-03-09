package com.campus.trading.service;

import com.campus.trading.entity.Follow;
import com.campus.trading.entity.User;
import com.campus.trading.mapper.FollowMapper;
import com.campus.trading.mapper.UserMapper;
import com.campus.trading.util.IdUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FollowService {
    @Autowired
    private FollowMapper followMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 关注用户
     */
    @Transactional
    public void followUser(String followerId, String followingId) {
        // 不能关注自己
        if (followerId.equals(followingId)) {
            throw new RuntimeException("不能关注自己");
        }
        
        // 检查被关注用户是否存在
        User following = userMapper.findById(followingId);
        if (following == null) {
            throw new RuntimeException("用户不存在");
        }
        
        // 检查是否已经关注
        Follow existing = followMapper.findByFollowerIdAndFollowingId(followerId, followingId);
        if (existing != null) {
            throw new RuntimeException("已经关注过该用户");
        }
        
        // 创建关注关系
        Follow follow = new Follow();
        follow.setId(IdUtil.generateId());
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);
        follow.setCreatedAt(LocalDateTime.now());
        
        followMapper.insert(follow);
    }
    
    /**
     * 取消关注
     */
    @Transactional
    public void unfollowUser(String followerId, String followingId) {
        Follow follow = followMapper.findByFollowerIdAndFollowingId(followerId, followingId);
        if (follow == null) {
            throw new RuntimeException("未关注该用户");
        }
        
        followMapper.delete(followerId, followingId);
    }
    
    /**
     * 检查是否已关注
     */
    public boolean isFollowing(String followerId, String followingId) {
        Follow follow = followMapper.findByFollowerIdAndFollowingId(followerId, followingId);
        return follow != null;
    }
    
    /**
     * 获取关注列表
     */
    public List<Follow> getFollowingList(String userId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return followMapper.findByFollowerId(userId, offset, pageSize);
    }
    
    /**
     * 获取粉丝列表
     */
    public List<Follow> getFollowerList(String userId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return followMapper.findByFollowingId(userId, offset, pageSize);
    }
    
    /**
     * 获取关注数
     */
    public Long getFollowingCount(String userId) {
        return followMapper.countByFollowerId(userId);
    }
    
    /**
     * 获取粉丝数
     */
    public Long getFollowerCount(String userId) {
        return followMapper.countByFollowingId(userId);
    }
}
