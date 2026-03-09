package com.campus.trading.service;

import com.campus.trading.entity.User;
import com.campus.trading.mapper.FavoriteMapper;
import com.campus.trading.mapper.OrderMapper;
import com.campus.trading.mapper.ProductMapper;
import com.campus.trading.mapper.UserMapper;
import com.campus.trading.util.IdUtil;
import com.campus.trading.util.JwtUtil;
import com.campus.trading.service.VerificationCodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private FavoriteMapper favoriteMapper;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private VerificationCodeService verificationCodeService;
    
    @Autowired
    private com.campus.trading.service.SessionService sessionService;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public Map<String, Object> register(String username, String password, String phone, String email) {
        // 如果用户名为空或只包含空格，使用手机号后四位作为默认用户名
        String finalUsername = username;
        if (username == null || username.trim().isEmpty()) {
            if (phone == null || phone.length() < 4) {
                throw new RuntimeException("手机号格式错误，无法生成默认用户名");
            }
            finalUsername = phone.substring(phone.length() - 4);
        } else {
            finalUsername = username.trim();
        }

        // 检查用户名是否已存在
        User existingUser = userMapper.findByUsername(finalUsername);
        if (existingUser != null) {
            // 如果用户名已存在且是自动生成的，尝试添加数字后缀
            if (finalUsername.length() == 4 && finalUsername.matches("\\d{4}")) {
                int suffix = 1;
                String newUsername;
                do {
                    newUsername = finalUsername + suffix;
                    existingUser = userMapper.findByUsername(newUsername);
                    suffix++;
                    if (suffix > 9999) {
                        throw new RuntimeException("无法生成唯一用户名，请手动指定用户名");
                    }
                } while (existingUser != null);
                finalUsername = newUsername;
            } else {
                throw new RuntimeException("用户名已存在");
            }
        }

        User user = new User();
        user.setId(IdUtil.generateId());
        user.setUsername(finalUsername);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setEmail(email);
        user.setRole("both"); // 默认同时为买家和卖家
        // 自动将手机号设置为支付宝账号
        if (phone != null && !phone.trim().isEmpty()) {
            user.setAlipayAccount(phone.trim());
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userMapper.insert(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        
        // 创建新会话，使旧会话失效（实现异地登录挤掉其他会话）
        sessionService.createSession(user.getId(), token);

        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        result.put("token", token);
        return result;
    }

    public Map<String, Object> login(String username, String password) {
        logger.info("尝试登录，用户名或手机号: {}", username);
        
        if (username == null || password == null) {
            logger.warn("登录失败：用户名或密码为空");
            throw new RuntimeException("用户名和密码不能为空");
        }
        
        try {
            User user = null;
            // 判断输入的是手机号还是用户名
            // 手机号格式：11位数字，以1开头
            if (username.matches("^1[3-9]\\d{9}$")) {
                logger.debug("检测到手机号格式，使用手机号查找用户: {}", username);
                user = userMapper.findByPhone(username);
            } else {
                logger.debug("使用用户名查找用户: {}", username);
                user = userMapper.findByUsername(username);
            }
            
            if (user == null) {
                logger.warn("登录失败：用户不存在，输入: {}", username);
                throw new RuntimeException("用户名或密码错误");
            }
            
            logger.debug("找到用户，ID: {}, 用户名: {}", user.getId(), user.getUsername());
            
            String storedPassword = user.getPassword();
            if (storedPassword == null) {
                logger.error("用户密码为空，用户ID: {}", user.getId());
                throw new RuntimeException("用户名或密码错误");
            }
            
            if (!passwordEncoder.matches(password, storedPassword)) {
                logger.warn("密码不匹配，输入: {}", username);
                throw new RuntimeException("用户名或密码错误");
            }

            logger.debug("密码验证成功，开始生成token，用户ID: {}", user.getId());
            
            if (user.getId() == null || user.getUsername() == null) {
                logger.error("用户ID或用户名为空，无法生成token，用户ID: {}, 用户名: {}", user.getId(), user.getUsername());
                throw new RuntimeException("用户数据异常，无法生成token");
            }
            
            // 如果支付宝账号为空，自动将手机号设置为支付宝账号
            if ((user.getAlipayAccount() == null || user.getAlipayAccount().trim().isEmpty()) 
                && user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
                user.setAlipayAccount(user.getPhone().trim());
                user.setUpdatedAt(LocalDateTime.now());
                userMapper.update(user);
                logger.info("自动将手机号 {} 设置为支付宝账号，用户ID: {}", user.getPhone(), user.getId());
            }
            
            String token = jwtUtil.generateToken(user.getId(), user.getUsername());
            
            // 创建新会话，使旧会话失效（实现异地登录挤掉其他会话）
            sessionService.createSession(user.getId(), token);
            
            logger.info("登录成功，用户ID: {}, 用户名: {}, 输入: {}", user.getId(), user.getUsername(), username);

            Map<String, Object> result = new HashMap<>();
            result.put("user", user);
            result.put("token", token);
            return result;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            logger.error("登录过程中发生异常，用户名: {}", username, e);
            throw new RuntimeException("登录失败: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> loginByPhone(String phone) {
        logger.info("尝试验证码登录，手机号: {}", phone);
        
        if (phone == null || phone.isEmpty()) {
            throw new RuntimeException("手机号不能为空");
        }
        
        try {
            User user = userMapper.findByPhone(phone);
            if (user == null) {
                logger.warn("登录失败：手机号未注册，手机号: {}", phone);
                throw new RuntimeException("该手机号未注册，请先注册");
            }
            
            logger.info("验证码登录成功，用户ID: {}, 手机号: {}", user.getId(), phone);
            
            if (user.getId() == null || user.getUsername() == null) {
                logger.error("用户ID或用户名为空，无法生成token");
                throw new RuntimeException("用户数据异常，无法生成token");
            }
            
            // 如果支付宝账号为空，自动将手机号设置为支付宝账号
            if ((user.getAlipayAccount() == null || user.getAlipayAccount().trim().isEmpty()) 
                && user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
                user.setAlipayAccount(user.getPhone().trim());
                user.setUpdatedAt(LocalDateTime.now());
                userMapper.update(user);
                logger.info("自动将手机号 {} 设置为支付宝账号，用户ID: {}", user.getPhone(), user.getId());
            }
            
            String token = jwtUtil.generateToken(user.getId(), user.getUsername());
            
            // 创建新会话，使旧会话失效（实现异地登录挤掉其他会话）
            sessionService.createSession(user.getId(), token);

            Map<String, Object> result = new HashMap<>();
            result.put("user", user);
            result.put("token", token);
            return result;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            logger.error("验证码登录过程中发生异常，手机号: {}", phone, e);
            throw new RuntimeException("登录失败: " + e.getMessage(), e);
        }
    }

    public User getCurrentUser(String userId) {
        return userMapper.findById(userId);
    }

    @Transactional
    public User updateProfile(String userId, User user) {
        User existingUser = userMapper.findById(userId);
        if (existingUser == null) {
            throw new RuntimeException("用户不存在");
        }
        
        // 如果更新了手机号，且支付宝账号为空或与旧手机号相同，自动更新为新手机号
        if (user.getPhone() != null && !user.getPhone().equals(existingUser.getPhone())) {
            if (existingUser.getAlipayAccount() == null || existingUser.getAlipayAccount().trim().isEmpty() 
                || existingUser.getAlipayAccount().equals(existingUser.getPhone())) {
                user.setAlipayAccount(user.getPhone().trim());
                logger.info("自动将新手机号 {} 设置为支付宝账号，用户ID: {}", user.getPhone(), userId);
            }
        }
        
        // 如果支付宝账号为空，且手机号存在，自动设置为手机号
        if ((user.getAlipayAccount() == null || user.getAlipayAccount().trim().isEmpty()) 
            && existingUser.getPhone() != null && !existingUser.getPhone().trim().isEmpty()) {
            user.setAlipayAccount(existingUser.getPhone().trim());
            logger.info("自动将手机号 {} 设置为支付宝账号，用户ID: {}", existingUser.getPhone(), userId);
        }
        
        // 更新用户信息
        if (user.getUsername() != null) {
            User userWithSameUsername = userMapper.findByUsername(user.getUsername());
            if (userWithSameUsername != null && !userWithSameUsername.getId().equals(userId)) {
                throw new RuntimeException("用户名已存在");
            }
            existingUser.setUsername(user.getUsername());
        }
        if (user.getPhone() != null) existingUser.setPhone(user.getPhone());
        if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
        if (user.getAvatar() != null) existingUser.setAvatar(user.getAvatar());
        if (user.getAlipayAccount() != null) existingUser.setAlipayAccount(user.getAlipayAccount());
        
        existingUser.setUpdatedAt(LocalDateTime.now());
        userMapper.update(existingUser);
        return existingUser;
    }
    
    /**
     * 更新支付宝账号
     */
    @Transactional
    public User updateAlipayAccount(String userId, String alipayAccount) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        if (alipayAccount == null || alipayAccount.trim().isEmpty()) {
            throw new RuntimeException("支付宝账号不能为空");
        }
        
        user.setAlipayAccount(alipayAccount.trim());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.update(user);
        
        logger.info("更新支付宝账号成功，用户ID: {}, 支付宝账号: {}", userId, alipayAccount);
        return user;
    }
    
    /**
     * 根据手机号自动绑定支付宝账号（如果支付宝账号为空）
     */
    @Transactional
    public User autoBindAlipayAccount(String userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        // 如果支付宝账号为空，且手机号存在，自动设置为手机号
        if ((user.getAlipayAccount() == null || user.getAlipayAccount().trim().isEmpty()) 
            && user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
            user.setAlipayAccount(user.getPhone().trim());
            user.setUpdatedAt(LocalDateTime.now());
            userMapper.update(user);
            logger.info("自动绑定支付宝账号成功，用户ID: {}, 手机号: {}", userId, user.getPhone());
        }
        
        return user;
    }

    @Transactional
    public User switchRole(String userId, String role) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        if (!role.equals("buyer") && !role.equals("seller") && !role.equals("both") && !role.equals("admin")) {
            throw new RuntimeException("无效的角色");
        }

        userMapper.updateRole(userId, role);
        user.setRole(role);
        return user;
    }

    public Map<String, Object> getUserStats(String userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        Map<String, Object> stats = new HashMap<>();
        
        // 买家统计
        Map<String, Object> buyerStats = new HashMap<>();
        Long totalOrders = orderMapper.countByBuyerId(userId, null);
        Long completedOrders = orderMapper.countByBuyerId(userId, "completed");
        Long favoriteCount = favoriteMapper.countByUserId(userId);
        java.math.BigDecimal totalSpent = orderMapper.sumPriceByBuyerId(userId, "completed");
        buyerStats.put("totalOrders", totalOrders != null ? totalOrders.intValue() : 0);
        buyerStats.put("completedOrders", completedOrders != null ? completedOrders.intValue() : 0);
        buyerStats.put("totalSpent", totalSpent != null ? totalSpent.doubleValue() : 0.0);
        buyerStats.put("favoriteCount", favoriteCount != null ? favoriteCount.intValue() : 0);
        
        // 卖家统计
        Map<String, Object> sellerStats = new HashMap<>();
        Long totalProducts = productMapper.countBySellerId(userId, null);
        Long publishedProducts = productMapper.countBySellerId(userId, "published");
        Long soldProducts = productMapper.countBySellerId(userId, "sold");
        Long sellerTotalOrders = orderMapper.countBySellerId(userId, null);
        Long sellerCompletedOrders = orderMapper.countBySellerId(userId, "completed");
        java.math.BigDecimal totalEarned = orderMapper.sumPriceBySellerId(userId, "completed");
        sellerStats.put("totalProducts", totalProducts != null ? totalProducts.intValue() : 0);
        sellerStats.put("publishedProducts", publishedProducts != null ? publishedProducts.intValue() : 0);
        sellerStats.put("soldProducts", soldProducts != null ? soldProducts.intValue() : 0);
        sellerStats.put("totalOrders", sellerTotalOrders != null ? sellerTotalOrders.intValue() : 0);
        sellerStats.put("completedOrders", sellerCompletedOrders != null ? sellerCompletedOrders.intValue() : 0);
        sellerStats.put("totalEarned", totalEarned != null ? totalEarned.doubleValue() : 0.0);
        
        stats.put("buyerStats", buyerStats);
        stats.put("sellerStats", sellerStats);
        
        return stats;
    }

    @Transactional
    public User updatePhone(String userId, String oldPhone, String oldCode, String newPhone, String newCode) {
        logger.info("开始更新手机号: userId={}, oldPhone={}, newPhone={}", userId, oldPhone, newPhone);
        
        User user = userMapper.findById(userId);
        if (user == null) {
            logger.error("用户不存在: userId={}", userId);
            throw new RuntimeException("用户不存在");
        }
        
        logger.info("找到用户: id={}, phone={}, username={}", user.getId(), user.getPhone(), user.getUsername());

        // 验证原手机号是否匹配
        if (!user.getPhone().equals(oldPhone)) {
            logger.error("原手机号不匹配: 期望={}, 实际={}", oldPhone, user.getPhone());
            throw new RuntimeException("原手机号不正确");
        }
        logger.info("原手机号验证通过");

        // 验证原手机号验证码
        if (!verificationCodeService.verifyCode(oldPhone, oldCode)) {
            logger.error("原手机号验证码验证失败: oldPhone={}", oldPhone);
            throw new RuntimeException("原手机号验证码错误或已过期");
        }
        logger.info("原手机号验证码验证通过");

        // 检查新手机号不能与原手机号相同
        if (oldPhone.equals(newPhone)) {
            logger.error("新手机号不能与原手机号相同: phone={}", newPhone);
            throw new RuntimeException("新手机号不能与原手机号相同");
        }
        logger.info("新手机号与原手机号不同，验证通过");

        // 检查新手机号是否已被使用
        User existingUser = userMapper.findByPhone(newPhone);
        if (existingUser != null && !existingUser.getId().equals(userId)) {
            logger.error("新手机号已被使用: newPhone={}, existingUserId={}", newPhone, existingUser.getId());
            throw new RuntimeException("新手机号已被使用");
        }
        logger.info("新手机号未被使用，验证通过");

        // 验证新手机号验证码
        if (!verificationCodeService.verifyCode(newPhone, newCode)) {
            logger.error("新手机号验证码验证失败: newPhone={}", newPhone);
            throw new RuntimeException("新手机号验证码错误或已过期");
        }
        logger.info("新手机号验证码验证通过，开始更新数据库");

        // 更新手机号
        logger.info("准备更新手机号: userId={}, oldPhone={}, newPhone={}", userId, user.getPhone(), newPhone);
        logger.info("更新前用户对象: id={}, phone={}, username={}, email={}, alipayAccount={}", 
            user.getId(), user.getPhone(), user.getUsername(), user.getEmail(), user.getAlipayAccount());
        
        user.setPhone(newPhone);
        
        // 如果支付宝账号为空或与旧手机号相同，自动更新为新手机号
        if (user.getAlipayAccount() == null || user.getAlipayAccount().trim().isEmpty() 
            || user.getAlipayAccount().equals(user.getPhone())) {
            user.setAlipayAccount(newPhone.trim());
            logger.info("自动将新手机号 {} 设置为支付宝账号", newPhone);
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        logger.info("更新后用户对象: id={}, phone={}, username={}, email={}, alipayAccount={}", 
            user.getId(), user.getPhone(), user.getUsername(), user.getEmail(), user.getAlipayAccount());
        
        int updateResult = userMapper.update(user);
        logger.info("UPDATE 执行结果，受影响行数: {}", updateResult);
        
        if (updateResult == 0) {
            logger.error("UPDATE 没有更新任何行！userId={}, newPhone={}", userId, newPhone);
            throw new RuntimeException("更新手机号失败：没有更新任何行");
        }
        
        // 重新从数据库查询以确保返回最新的数据
        User updatedUser = userMapper.findById(userId);
        if (updatedUser == null) {
            throw new RuntimeException("更新后无法找到用户");
        }
        logger.info("更新后从数据库查询到的手机号: {}", updatedUser.getPhone());
        
        if (!updatedUser.getPhone().equals(newPhone)) {
            logger.error("手机号更新失败！期望: {}, 实际: {}", newPhone, updatedUser.getPhone());
            throw new RuntimeException("手机号更新失败");
        }
        
        return updatedUser;
    }

    @Transactional
    /**
     * 通过手机号查找用户
     */
    public User findUserByPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException("手机号不能为空");
        }
        
        User user = userMapper.findByPhone(phone.trim());
        return user;
    }
    
    public User updatePassword(String userId, String phone, String code, String newPassword) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 验证手机号是否匹配
        if (!user.getPhone().equals(phone)) {
            throw new RuntimeException("手机号不正确");
        }

        // 验证验证码
        if (!verificationCodeService.verifyCode(phone, code)) {
            throw new RuntimeException("验证码错误或已过期");
        }

        // 验证新密码
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("密码长度至少6位");
        }

        // 检查新密码不能与原密码相同
        String storedPassword = user.getPassword();
        if (storedPassword != null && passwordEncoder.matches(newPassword, storedPassword)) {
            throw new RuntimeException("新密码不能与原密码相同");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.update(user);
        
        // 重新从数据库查询以确保返回最新的数据
        User updatedUser = userMapper.findById(userId);
        if (updatedUser == null) {
            throw new RuntimeException("更新后无法找到用户");
        }
        return updatedUser;
    }
}
