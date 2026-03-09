package com.campus.trading.config;

import com.campus.trading.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OrderAutoCancelScheduler {
    private static final Logger logger = LoggerFactory.getLogger(OrderAutoCancelScheduler.class);
    
    @Autowired
    private OrderService orderService;

    /**
     * 每5分钟检查一次，自动取消超过15分钟未付款的订单
     */
    @Scheduled(fixedRate = 300000) // 5分钟 = 300000毫秒
    public void autoCancelExpiredOrders() {
        try {
            int cancelledCount = orderService.autoCancelExpiredOrders();
            if (cancelledCount > 0) {
                logger.info("自动取消了 {} 个过期未付款订单", cancelledCount);
            }
        } catch (Exception e) {
            logger.error("自动取消过期订单失败", e);
        }
    }
}
