package com.campus.trading.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationCodeService {
    // 存储验证码：key为手机号，value为验证码和过期时间
    private static final Map<String, CodeInfo> codeCache = new ConcurrentHashMap<>();
    
    // 验证码有效期：5分钟
    private static final long CODE_EXPIRE_TIME = 5 * 60 * 1000;
    
    // 发送间隔：60秒
    private static final long SEND_INTERVAL = 60 * 1000;
    
    private static class CodeInfo {
        String code;
        long createTime;
        long lastSendTime;
        
        CodeInfo(String code, long createTime, long lastSendTime) {
            this.code = code;
            this.createTime = createTime;
            this.lastSendTime = lastSendTime;
        }
    }
    
    /**
     * 生成6位数字验证码
     */
    private String generateCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
    
    /**
     * 发送验证码
     * @param phone 手机号
     * @return 验证码（实际项目中应该通过短信发送，这里直接返回用于测试）
     */
    public String sendCode(String phone) {
        if (phone == null || !phone.matches("^1[3-9]\\d{9}$")) {
            throw new RuntimeException("手机号格式不正确");
        }
        
        long currentTime = System.currentTimeMillis();
        CodeInfo existingCode = codeCache.get(phone);
        
        // 检查发送间隔
        if (existingCode != null) {
            long timeSinceLastSend = currentTime - existingCode.lastSendTime;
            if (timeSinceLastSend < SEND_INTERVAL) {
                long remainingSeconds = (SEND_INTERVAL - timeSinceLastSend) / 1000;
                throw new RuntimeException("请" + remainingSeconds + "秒后再试");
            }
        }
        
        // 生成新验证码
        String code = generateCode();
        codeCache.put(phone, new CodeInfo(code, currentTime, currentTime));
        
        // 清理过期验证码（简单实现，实际项目中可以使用定时任务）
        cleanupExpiredCodes();
        
        // 实际项目中这里应该调用短信服务发送验证码
        // 为了测试，这里打印到控制台
        System.out.println("验证码发送到 " + phone + ": " + code);
        
        return code;
    }
    
    /**
     * 验证验证码
     * @param phone 手机号
     * @param code 验证码
     * @param removeAfterVerify 验证成功后是否删除验证码，默认为true
     * @return 是否验证成功
     */
    public boolean verifyCode(String phone, String code, boolean removeAfterVerify) {
        System.out.println("VerificationCodeService.verifyCode: phone=" + phone + ", code=" + code + ", removeAfterVerify=" + removeAfterVerify);
        
        if (phone == null || code == null) {
            System.out.println("验证失败: phone或code为null");
            return false;
        }
        
        CodeInfo codeInfo = codeCache.get(phone);
        if (codeInfo == null) {
            System.out.println("验证失败: 未找到该手机号的验证码");
            return false;
        }
        
        System.out.println("找到验证码信息: code=" + codeInfo.code + ", createTime=" + codeInfo.createTime);
        
        // 检查是否过期
        long currentTime = System.currentTimeMillis();
        if (currentTime - codeInfo.createTime > CODE_EXPIRE_TIME) {
            System.out.println("验证失败: 验证码已过期");
            codeCache.remove(phone);
            return false;
        }
        
        // 验证码匹配
        System.out.println("比较验证码: 期望=" + codeInfo.code + ", 实际=" + code);
        if (codeInfo.code.equals(code)) {
            System.out.println("验证成功");
            // 根据参数决定是否删除验证码
            if (removeAfterVerify) {
                codeCache.remove(phone);
                System.out.println("验证码已删除");
            }
            return true;
        }
        
        System.out.println("验证失败: 验证码不匹配");
        return false;
    }
    
    /**
     * 验证验证码（默认验证成功后删除）
     * @param phone 手机号
     * @param code 验证码
     * @return 是否验证成功
     */
    public boolean verifyCode(String phone, String code) {
        return verifyCode(phone, code, true);
    }
    
    /**
     * 清理过期验证码
     */
    private void cleanupExpiredCodes() {
        long currentTime = System.currentTimeMillis();
        codeCache.entrySet().removeIf(entry -> 
            currentTime - entry.getValue().createTime > CODE_EXPIRE_TIME
        );
    }
    
    /**
     * 获取剩余发送时间（秒）
     * @param phone 手机号
     * @return 剩余秒数，如果为0表示可以发送
     */
    public long getRemainingSendTime(String phone) {
        CodeInfo codeInfo = codeCache.get(phone);
        if (codeInfo == null) {
            return 0;
        }
        
        long currentTime = System.currentTimeMillis();
        long timeSinceLastSend = currentTime - codeInfo.lastSendTime;
        
        if (timeSinceLastSend >= SEND_INTERVAL) {
            return 0;
        }
        
        return (SEND_INTERVAL - timeSinceLastSend) / 1000;
    }
}
