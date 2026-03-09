package com.campus.trading.service;

import com.campus.trading.entity.Product;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AICustomerService {
    private static final Logger logger = LoggerFactory.getLogger(AICustomerService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @org.springframework.beans.factory.annotation.Autowired
    private ProductService productService;

    @Value("${ai.api.url:}")
    private String aiApiUrl;

    @Value("${ai.api.key:}")
    private String aiApiKey;

    @Value("${ai.api.type:deepseek}")
    private String aiApiType; // deepseek, openai, qwen, custom

    @Value("${ai.api.model:deepseek-chat}")
    private String aiModel; // 模型名称

    // 平台项目信息
    private static final String PLATFORM_CONTEXT = """
        你是"小象"，一个专业的AI客服助手，为"象牙市集"校园二手交易平台提供服务。
        
        重要：你的名字是"小象"，在介绍自己时，请说"我是AI客服小象"或"我是小象，象牙市集的AI客服"，不要只说"我是象牙市集的AI客服"。
        
        平台信息：
        - 平台名称：象牙市集
        - 平台类型：校园二手交易平台
        - 主要功能：
          1. 商品发布：用户可以发布二手商品（包括商品标题、描述、价格、图片、成色、类别、位置等）
          2. 商品浏览：用户可以浏览、搜索、筛选商品
          3. 商品收藏：用户可以收藏喜欢的商品
          4. 订单管理：支持创建订单、支付、发货、确认收货、退款、取消订单等流程
          5. 用户评价：订单完成后，买卖双方可以互相评价，形成信用等级
          6. 用户关注：用户可以关注其他用户，查看关注和粉丝
          7. 消息聊天：用户可以与其他用户进行实时聊天
          8. 用户主页：可以查看其他用户发布的商品、信用等级、关注和粉丝
          9. 智能定价：发布商品时可以使用智能定价助手，根据商品类别、成色、原价等因素获得价格建议
        
        链接格式说明（重要）：
        当需要提供商品链接或功能链接时，请使用以下格式：
        - 商品链接：[商品名称](product:/products/{商品ID})，例如：[iPhone 13](product:/products/123456)
        - 商品列表链接：[搜索关键词](search:/products?keyword={关键词})，例如：[搜索手机](search:/products?keyword=手机)
        - 智能定价链接：[智能定价助手](action:/price-assistant)
        - 发布商品链接：[发布商品](action:/publish)
        - 我的订单链接：[我的订单](action:/my-orders)
        - 我的商品链接：[我的商品](action:/my-products)
        - 收藏列表链接：[我的收藏](action:/favorites)
        - 消息中心链接：[消息中心](action:/messages)
        
        智能推荐功能：
        当用户询问想要购买或寻找某类商品时，你应该：
        1. 识别用户需求中的关键词（如"手机"、"笔记本电脑"、"教材"等）
        2. 如果系统提供了相关商品列表，请选择最相关的3-5个商品
        3. 为每个商品创建一个链接，格式为：[商品标题](product:/products/{商品ID})
        4. 在回复中说明："我为您找到了以下相关商品："然后列出商品链接
        
        智能定价功能：
        当用户询问如何定价、价格建议、定价助手等问题时，你应该：
        1. 说明智能定价助手可以根据商品类别、成色、原价等因素提供价格建议
        2. 提供智能定价链接：[智能定价助手](action:/price-assistant)
        3. 说明使用方法：在发布商品页面可以使用智能定价助手
        
        常见问题：
        - 如何发布商品：登录后点击"发闲置"按钮，或使用链接 [发布商品](action:/publish)，填写商品信息并上传图片即可发布
        - 如何购买商品：在商品详情页点击"立即购买"按钮，创建订单后完成支付
        - 如何联系卖家：在商品详情页点击"联系卖家"按钮，可以打开聊天窗口与卖家沟通
        - 如何查看订单：登录后点击右上角"订单"按钮，或使用链接 [我的订单](action:/my-orders)，可以查看所有订单
        - 如何评价：订单完成后，在订单详情页可以点击"评价"按钮给对方评分
        - 如何查看用户主页：点击商品详情页或聊天中的用户头像，可以查看该用户的主页
        - 如何智能定价：在发布商品页面可以使用 [智能定价助手](action:/price-assistant) 获得价格建议
        
        回答原则：
        1. 优先回答与象牙市集平台相关的问题（商品、订单、支付、用户功能等）
        2. 如果用户询问生活、学习、校园生活等非平台问题，你也可以友好地回答，帮助用户解决问题
        3. 如果用户询问的问题与平台无关，但可以在平台上找到相关商品或服务，可以引导用户使用平台功能
        4. 保持友好、专业、简洁的语言风格
        5. 当提供链接时，请确保链接格式正确，这样前端才能正确解析和跳转
        
        示例：
        - 用户问"如何学习编程"：你可以提供学习建议，同时可以建议用户在平台上搜索相关教材或课程资料
        - 用户问"校园生活建议"：你可以提供建议，也可以推荐平台上可能有用的商品（如生活用品、学习用品等）
        - 用户问"如何省钱"：你可以提供建议，同时可以推荐使用二手交易平台购买商品来节省开支
        
        记住：你是小象，一个友好、乐于助人的AI助手，不仅要帮助用户使用平台，也要在力所能及的范围内帮助用户解决其他问题。
        """;

    public String chat(String userMessage) {
        try {
            // 先尝试搜索相关商品
            List<Product> recommendedProducts = searchRecommendedProducts(userMessage);
            
            // 构建包含商品信息的上下文
            String enhancedMessage = userMessage;
            if (!recommendedProducts.isEmpty()) {
                StringBuilder productInfo = new StringBuilder("\n\n相关商品信息：\n");
                for (Product product : recommendedProducts) {
                    productInfo.append(String.format("- 商品ID: %s, 标题: %s, 价格: %.2f元, 类别: %s\n", 
                        product.getId(), product.getTitle(), product.getPrice(), product.getCategory()));
                }
                enhancedMessage = userMessage + productInfo.toString();
            }

            // 调试日志：检查配置
            logger.info("AI配置检查 - URL: {}, Key: {}, Type: {}, Model: {}", 
                aiApiUrl != null && !aiApiUrl.isEmpty() ? "已设置" : "未设置",
                aiApiKey != null && !aiApiKey.isEmpty() ? "已设置" : "未设置",
                aiApiType, aiModel);

            if (aiApiUrl == null || aiApiUrl.isEmpty()) {
                // 如果没有配置AI API，使用简单的规则回复
                logger.warn("AI API URL未配置，使用fallback响应");
                return getFallbackResponse(userMessage, recommendedProducts);
            }
            
            if (aiApiKey == null || aiApiKey.isEmpty()) {
                logger.warn("AI API Key未配置，使用fallback响应");
                return getFallbackResponse(userMessage, recommendedProducts);
            }

            // 根据配置的API类型调用不同的服务
            String aiReply;
            switch (aiApiType.toLowerCase()) {
                case "deepseek":
                    aiReply = callDeepSeek(enhancedMessage);
                    break;
                case "openai":
                    aiReply = callOpenAI(enhancedMessage);
                    break;
                case "qwen":
                    aiReply = callQwen(enhancedMessage);
                    break;
                default:
                    aiReply = callCustomAPI(enhancedMessage);
            }
            
            // 如果AI回复中没有商品链接，但找到了相关商品，则添加商品链接
            if (!recommendedProducts.isEmpty() && !aiReply.contains("product:/products/")) {
                aiReply = enhanceReplyWithProductLinks(aiReply, recommendedProducts);
            }
            
            return aiReply;
        } catch (Exception e) {
            logger.error("AI客服调用失败", e);
            return "抱歉，AI服务暂时不可用，请稍后再试。";
        }
    }

    /**
     * 根据用户消息搜索推荐商品
     */
    private List<Product> searchRecommendedProducts(String userMessage) {
        try {
            // 提取关键词（简单实现，可以后续优化）
            String keyword = extractKeyword(userMessage);
            if (keyword == null || keyword.trim().isEmpty()) {
                return new ArrayList<>();
            }

            // 搜索商品（最多返回5个）
            List<Product> products = productService.getProducts(1, 5, null, keyword, null, null, null, null, "createdAt");
            return products != null ? products : new ArrayList<>();
        } catch (Exception e) {
            logger.error("搜索推荐商品失败", e);
            return new ArrayList<>();
        }
    }

    /**
     * 从用户消息中提取关键词
     */
    private String extractKeyword(String userMessage) {
        // 移除常见的问题词
        String message = userMessage.toLowerCase()
            .replace("我想", "").replace("我要", "").replace("帮我", "")
            .replace("找", "").replace("买", "").replace("购买", "")
            .replace("看看", "").replace("看看", "").replace("查看", "")
            .replace("有没有", "").replace("有", "").replace("吗", "")
            .replace("什么", "").replace("哪些", "").replace("怎么", "")
            .replace("？", "").replace("?", "").trim();
        
        // 如果消息太短或为空，返回null
        if (message.length() < 2) {
            return null;
        }
        
        // 如果消息长度在2-20之间，直接作为关键词
        if (message.length() <= 20) {
            return message;
        }
        
        // 如果消息较长，尝试提取前几个词
        String[] words = message.split("\\s+");
        if (words.length > 0) {
            return words[0];
        }
        
        return message.substring(0, Math.min(20, message.length()));
    }

    /**
     * 在回复中添加商品链接
     */
    private String enhanceReplyWithProductLinks(String reply, List<Product> products) {
        if (products.isEmpty()) {
            return reply;
        }
        
        StringBuilder enhancedReply = new StringBuilder(reply);
        enhancedReply.append("\n\n我为您找到了以下相关商品：\n");
        
        int count = Math.min(5, products.size());
        for (int i = 0; i < count; i++) {
            Product product = products.get(i);
            enhancedReply.append(String.format("%d. [%s](product:/products/%s) - ¥%.2f\n", 
                i + 1, product.getTitle(), product.getId(), product.getPrice()));
        }
        
        return enhancedReply.toString();
    }

    private String callDeepSeek(String userMessage) {
        try {
            String url = aiApiUrl.endsWith("/") ? aiApiUrl + "chat/completions" : aiApiUrl + "/chat/completions";
            logger.info("调用DeepSeek API - URL: {}, Model: {}", url, aiModel);
            
            Map<String, Object> request = new HashMap<>();
            request.put("model", aiModel); // 使用配置的模型：deepseek-chat 或 deepseek-reasoner
            request.put("messages", Arrays.asList(
                Map.of("role", "system", "content", PLATFORM_CONTEXT),
                Map.of("role", "user", "content", userMessage)
            ));
            request.put("temperature", 0.7);
            request.put("max_tokens", 1024);
            request.put("stream", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(aiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String reply = jsonNode.path("choices").get(0).path("message").path("content").asText();
                logger.info("DeepSeek API调用成功，回复长度: {}", reply.length());
                return reply;
            } else {
                logger.error("DeepSeek API调用失败: {}, 响应体: {}", response.getStatusCode(), response.getBody());
                return getFallbackResponse(userMessage, new ArrayList<>());
            }
        } catch (Exception e) {
            logger.error("调用DeepSeek API失败，异常信息: {}", e.getMessage(), e);
            return getFallbackResponse(userMessage, new ArrayList<>());
        }
    }

    private String callOpenAI(String userMessage) {
        try {
            String url = aiApiUrl.endsWith("/") ? aiApiUrl + "v1/chat/completions" : aiApiUrl + "/v1/chat/completions";
            
            Map<String, Object> request = new HashMap<>();
            request.put("model", aiModel.isEmpty() ? "gpt-3.5-turbo" : aiModel);
            request.put("messages", Arrays.asList(
                Map.of("role", "system", "content", PLATFORM_CONTEXT),
                Map.of("role", "user", "content", userMessage)
            ));
            request.put("temperature", 0.7);
            request.put("max_tokens", 500);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(aiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.path("choices").get(0).path("message").path("content").asText();
            } else {
                logger.error("OpenAI API调用失败: {}", response.getStatusCode());
                return getFallbackResponse(userMessage, new ArrayList<>());
            }
        } catch (Exception e) {
            logger.error("调用OpenAI API失败", e);
            return getFallbackResponse(userMessage, new ArrayList<>());
        }
    }

    private String callQwen(String userMessage) {
        try {
            // 通义千问API调用（示例，需要根据实际API文档调整）
            String url = aiApiUrl;
            
            Map<String, Object> request = new HashMap<>();
            request.put("model", "qwen-turbo");
            request.put("input", Map.of(
                "messages", Arrays.asList(
                    Map.of("role", "system", "content", PLATFORM_CONTEXT),
                    Map.of("role", "user", "content", userMessage)
                )
            ));
            request.put("parameters", Map.of("temperature", 0.7));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + aiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.path("output").path("choices").get(0).path("message").path("content").asText();
            } else {
                logger.error("通义千问API调用失败: {}", response.getStatusCode());
                return getFallbackResponse(userMessage, new ArrayList<>());
            }
        } catch (Exception e) {
            logger.error("调用通义千问API失败", e);
            return getFallbackResponse(userMessage, new ArrayList<>());
        }
    }

    private String callCustomAPI(String userMessage) {
        // 自定义API调用（可以根据实际需求实现）
        return getFallbackResponse(userMessage, new ArrayList<>());
    }

    private String getFallbackResponse(String userMessage, List<Product> recommendedProducts) {
        // 简单的规则回复（当没有配置AI API时使用）
        String lowerMessage = userMessage.toLowerCase();
        
        // 如果找到了推荐商品，优先返回商品推荐
        if (!recommendedProducts.isEmpty()) {
            StringBuilder reply = new StringBuilder("我为您找到了以下相关商品：\n");
            int count = Math.min(5, recommendedProducts.size());
            for (int i = 0; i < count; i++) {
                Product product = recommendedProducts.get(i);
                reply.append(String.format("%d. [%s](product:/products/%s) - ¥%.2f\n", 
                    i + 1, product.getTitle(), product.getId(), product.getPrice()));
            }
            reply.append("\n点击商品名称可以查看详情。");
            return reply.toString();
        }
        
        if (lowerMessage.contains("发布") || lowerMessage.contains("上架") || lowerMessage.contains("卖")) {
            return "您可以通过以下步骤发布商品：\n1. 登录账号\n2. 点击右侧浮动按钮栏的\"发闲置\"按钮，或使用链接 [发布商品](action:/publish)\n3. 填写商品信息（标题、描述、价格、图片等）\n4. 选择商品类别、成色、位置等信息\n5. 点击发布即可\n\n发布后，其他用户就可以看到您的商品了。";
        }
        
        if (lowerMessage.contains("购买") || lowerMessage.contains("买") || lowerMessage.contains("下单")) {
            return "购买商品的步骤：\n1. 浏览商品，找到您想要的商品\n2. 点击商品进入详情页\n3. 点击\"立即购买\"按钮\n4. 确认订单信息后完成支付\n5. 等待卖家发货\n6. 收到商品后确认收货\n\n如有问题，可以点击\"联系卖家\"与卖家沟通。";
        }
        
        if (lowerMessage.contains("订单") || lowerMessage.contains("查看订单")) {
            return "查看订单的方法：\n1. 登录后，点击页面右上角的\"订单\"按钮，或使用链接 [我的订单](action:/my-orders)\n2. 可以查看所有订单（包括我买到的、我卖出的）\n3. 点击订单可以查看详情\n4. 在订单详情页可以进行支付、确认收货、评价等操作";
        }
        
        if (lowerMessage.contains("聊天") || lowerMessage.contains("消息") || lowerMessage.contains("联系")) {
            return "与卖家/买家聊天的方法：\n1. 在商品详情页点击\"联系卖家\"按钮\n2. 或者点击右侧浮动按钮栏的\"消息\"按钮，或使用链接 [消息中心](action:/messages)\n3. 在聊天窗口中可以发送消息\n4. 对方发送消息后会自动显示\n\n注意：对方未回复之前，最多只能连续发送3条消息。";
        }
        
        if (lowerMessage.contains("评价") || lowerMessage.contains("评分") || lowerMessage.contains("信用")) {
            return "评价功能说明：\n1. 订单完成后，在订单详情页可以点击\"评价\"按钮\n2. 选择1-5星评分\n3. 评价后会影响对方的信用等级\n4. 信用等级会显示在用户主页上";
        }
        
        if (lowerMessage.contains("收藏") || lowerMessage.contains("喜欢")) {
            return "收藏商品的方法：\n1. 在商品详情页点击\"收藏\"按钮\n2. 收藏的商品可以在 [我的收藏](action:/favorites) 查看\n3. 再次点击可以取消收藏";
        }
        
        if (lowerMessage.contains("主页") || lowerMessage.contains("个人主页") || lowerMessage.contains("用户主页")) {
            return "查看用户主页的方法：\n1. 点击商品详情页的卖家头像\n2. 或者点击聊天中的用户头像\n3. 可以查看该用户发布的商品、信用等级、关注和粉丝等信息";
        }
        
        if (lowerMessage.contains("支付") || lowerMessage.contains("付款")) {
            return "支付方式：\n1. 目前支持支付宝支付\n2. 创建订单后，点击\"立即支付\"按钮\n3. 跳转到支付宝完成支付\n4. 支付完成后，订单状态会更新为\"已支付\"";
        }
        
        if (lowerMessage.contains("退款") || lowerMessage.contains("取消")) {
            return "退款/取消订单：\n1. 在订单详情页可以申请退款或取消订单\n2. 退款会原路返回到您的支付账户\n3. 取消订单后，商品会重新上架";
        }
        
        if (lowerMessage.contains("定价") || lowerMessage.contains("价格建议") || lowerMessage.contains("价格助手") || 
            (lowerMessage.contains("价格") && (lowerMessage.contains("怎么") || lowerMessage.contains("如何") || lowerMessage.contains("多少")))) {
            return "智能定价功能说明：\n\n您可以使用 [智能定价助手](action:/price-assistant) 来获得价格建议。\n\n智能定价助手会根据以下因素为您提供价格建议：\n1. 商品类别\n2. 商品成色（全新、近新、良好、一般、较差）\n3. 商品原价\n4. 平台相似商品的价格\n\n使用方法：\n1. 点击 [智能定价助手](action:/price-assistant) 进入定价页面\n2. 填写商品信息（类别、成色、原价等）\n3. 系统会自动分析并给出推荐价格区间\n4. 您也可以查看相似商品的价格作为参考\n\n在发布商品页面也可以直接使用智能定价助手。";
        }
        
        // 默认回复
        return "感谢您的咨询！我是AI客服小象，很高兴为您服务。\n\n我可以帮您解答以下问题：\n- [如何发布商品](action:/publish)\n- 如何购买商品\n- [如何查看订单](action:/my-orders)\n- [如何与卖家聊天](action:/messages)\n- 如何评价\n- [如何收藏商品](action:/favorites)\n- 如何查看用户主页\n- 支付相关问题\n- 退款/取消订单\n- [如何智能定价](action:/price-assistant)\n\n请告诉我您想了解哪方面的问题？";
    }
}
