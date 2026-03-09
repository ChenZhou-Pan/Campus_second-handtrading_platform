package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.entity.User;
import com.campus.trading.service.AuthService;
import com.campus.trading.service.FileService;
import com.campus.trading.service.VerificationCodeService;
import com.campus.trading.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private VerificationCodeService verificationCodeService;
    
    @Autowired
    private FileService fileService;
    
    @Autowired
    private com.campus.trading.service.SessionService sessionService;

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            String code = request.get("code");
            
            System.out.println("收到注册请求: phone=" + phone + ", code=" + code);
            
            // 验证验证码（注册时必须提供验证码）
            if (code == null || code.isEmpty()) {
                System.out.println("注册失败: 验证码为空");
                return ApiResponse.error(400, "验证码不能为空");
            }
            
            if (phone == null || phone.isEmpty()) {
                System.out.println("注册失败: 手机号为空");
                return ApiResponse.error(400, "手机号不能为空");
            }
            
            System.out.println("开始验证验证码: phone=" + phone + ", code=" + code);
            boolean isValid = verificationCodeService.verifyCode(phone, code);
            System.out.println("验证码验证结果: " + isValid);
            
            if (!isValid) {
                System.out.println("注册失败: 验证码错误或已过期");
                return ApiResponse.error(400, "验证码错误或已过期");
            }
            
            System.out.println("验证码验证通过，开始注册用户");
            Map<String, Object> result = authService.register(
                request.get("username"),
                request.get("password"),
                phone,
                request.get("email")
            );
            System.out.println("注册成功");
            return ApiResponse.success("注册成功", result);
        } catch (RuntimeException e) {
            System.out.println("注册失败 (RuntimeException): " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            System.out.println("注册失败 (Exception): " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error(500, "注册失败: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            if (username == null || password == null) {
                return ApiResponse.error(400, "用户名和密码不能为空");
            }
            
            Map<String, Object> result = authService.login(username, password);
            return ApiResponse.success("登录成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // 打印堆栈跟踪以便调试
            return ApiResponse.error(500, "登录失败: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ApiResponse<User> getCurrentUser(HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            User user = authService.getCurrentUser(userId);
            return ApiResponse.success(user);
        } catch (Exception e) {
            return ApiResponse.error(401, "未授权");
        }
    }

    @PutMapping("/profile")
    public ApiResponse<User> updateProfile(@RequestBody User user, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            User updatedUser = authService.updateProfile(userId, user);
            return ApiResponse.success("更新成功", updatedUser);
        } catch (Exception e) {
            return ApiResponse.error("更新失败: " + e.getMessage());
        }
    }
    
    @PostMapping("/avatar")
    public ApiResponse<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            // 上传文件
            String avatarUrl = fileService.uploadAvatar(file);
            
            // 更新用户头像
            User user = new User();
            user.setAvatar(avatarUrl);
            authService.updateProfile(userId, user);
            
            Map<String, String> result = Map.of("avatar", avatarUrl);
            return ApiResponse.success("头像上传成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(500, "头像上传失败: " + e.getMessage());
        }
    }

    @PutMapping("/role")
    public ApiResponse<User> switchRole(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            String role = request.get("role");
            User user = authService.switchRole(userId, role);
            return ApiResponse.success("身份切换成功", user);
        } catch (Exception e) {
            return ApiResponse.error("身份切换失败: " + e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getUserStats(HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            Map<String, Object> stats = authService.getUserStats(userId);
            return ApiResponse.success(stats);
        } catch (Exception e) {
            return ApiResponse.error("获取统计信息失败: " + e.getMessage());
        }
    }

    @PostMapping("/send-code")
    public ApiResponse<String> sendVerificationCode(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            if (phone == null || phone.isEmpty()) {
                return ApiResponse.error(400, "手机号不能为空");
            }
            
            String code = verificationCodeService.sendCode(phone);
            // 实际项目中不应该返回验证码，这里仅用于测试
            // 生产环境应该返回成功消息，验证码通过短信发送
            return ApiResponse.success("验证码已发送", "验证码已发送到手机（测试模式：验证码为 " + code + "）");
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "发送验证码失败: " + e.getMessage());
        }
    }

    @PostMapping("/verify-code")
    public ApiResponse<Boolean> verifyCode(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            String code = request.get("code");
            Boolean removeAfterVerify = request.get("removeAfterVerify") != null ? 
                Boolean.parseBoolean(request.get("removeAfterVerify")) : true;
            
            System.out.println("收到验证码验证请求: phone=" + phone + ", code=" + code + ", removeAfterVerify=" + removeAfterVerify);
            
            if (phone == null || code == null) {
                System.out.println("验证失败: 手机号或验证码为空");
                return ApiResponse.error(400, "手机号和验证码不能为空");
            }
            
            boolean isValid = verificationCodeService.verifyCode(phone, code, removeAfterVerify);
            System.out.println("验证结果: " + isValid);
            
            if (isValid) {
                return ApiResponse.success("验证成功", true);
            } else {
                return ApiResponse.error(400, "验证码错误或已过期");
            }
        } catch (Exception e) {
            System.out.println("验证异常: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error(500, "验证失败: " + e.getMessage());
        }
    }

    @PostMapping("/login-by-code")
    public ApiResponse<Map<String, Object>> loginByCode(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            String code = request.get("code");
            
            if (phone == null || code == null) {
                return ApiResponse.error(400, "手机号和验证码不能为空");
            }
            
            // 验证验证码
            if (!verificationCodeService.verifyCode(phone, code)) {
                return ApiResponse.error(400, "验证码错误或已过期");
            }
            
            Map<String, Object> result = authService.loginByPhone(phone);
            return ApiResponse.success("登录成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "登录失败: " + e.getMessage());
        }
    }

    @PutMapping("/phone")
    public ApiResponse<User> updatePhone(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            String oldPhone = request.get("oldPhone");
            String oldCode = request.get("oldCode");
            String newPhone = request.get("newPhone");
            String newCode = request.get("newCode");
            
            System.out.println("收到更新手机号请求: userId=" + userId + ", oldPhone=" + oldPhone + ", newPhone=" + newPhone);
            
            if (oldPhone == null || oldCode == null || newPhone == null || newCode == null) {
                System.out.println("参数不完整");
                return ApiResponse.error(400, "参数不完整");
            }
            
            System.out.println("调用 authService.updatePhone");
            User updatedUser = authService.updatePhone(userId, oldPhone, oldCode, newPhone, newCode);
            System.out.println("更新成功，返回用户: phone=" + updatedUser.getPhone());
            return ApiResponse.success("手机号更新成功", updatedUser);
        } catch (RuntimeException e) {
            System.out.println("更新失败 (RuntimeException): " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            System.out.println("更新失败 (Exception): " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error(500, "更新手机号失败: " + e.getMessage());
        }
    }

    /**
     * 通过手机号搜索用户
     */
    @GetMapping("/search")
    public ApiResponse<User> searchUserByPhone(@RequestParam String phone, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String currentUserId = jwtUtil.getUserIdFromToken(token);
            
            if (phone == null || phone.trim().isEmpty()) {
                return ApiResponse.error(400, "手机号不能为空");
            }
            
            // 验证手机号格式
            if (!phone.matches("^1[3-9]\\d{9}$")) {
                return ApiResponse.error(400, "手机号格式不正确");
            }
            
            User foundUser = authService.findUserByPhone(phone);
            if (foundUser == null) {
                return ApiResponse.error(404, "未找到该用户");
            }
            
            // 不能搜索自己
            if (foundUser.getId().equals(currentUserId)) {
                return ApiResponse.error(400, "不能搜索自己");
            }
            
            return ApiResponse.success(foundUser);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("搜索失败: " + e.getMessage());
        }
    }
    
    @PutMapping("/password")
    public ApiResponse<User> updatePassword(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            String phone = request.get("phone");
            String code = request.get("code");
            String newPassword = request.get("newPassword");
            
            if (phone == null || code == null || newPassword == null) {
                return ApiResponse.error(400, "参数不完整");
            }
            
            User updatedUser = authService.updatePassword(userId, phone, code, newPassword);
            return ApiResponse.success("密码更新成功", updatedUser);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "更新密码失败: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout(HttpServletRequest request) {
        try {
            String token = extractToken(request);
            // 使会话失效
            sessionService.invalidateSession(token);
            return ApiResponse.success("登出成功", null);
        } catch (Exception e) {
            // 即使token无效，也返回成功（前端已经清除token）
            return ApiResponse.success("登出成功", null);
        }
    }

    /**
     * 更新支付宝账号
     */
    @PutMapping("/alipay-account")
    public ApiResponse<User> updateAlipayAccount(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            String alipayAccount = request.get("alipayAccount");
            
            if (alipayAccount == null || alipayAccount.trim().isEmpty()) {
                return ApiResponse.error(400, "支付宝账号不能为空");
            }
            
            User updatedUser = authService.updateAlipayAccount(userId, alipayAccount);
            return ApiResponse.success("支付宝账号更新成功", updatedUser);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "更新支付宝账号失败: " + e.getMessage());
        }
    }

    /**
     * 根据手机号自动绑定支付宝账号
     */
    @PostMapping("/alipay-account/auto-bind")
    public ApiResponse<User> autoBindAlipayAccount(HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            User updatedUser = authService.autoBindAlipayAccount(userId);
            return ApiResponse.success("支付宝账号自动绑定成功", updatedUser);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "自动绑定失败: " + e.getMessage());
        }
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("未找到token");
    }
}
