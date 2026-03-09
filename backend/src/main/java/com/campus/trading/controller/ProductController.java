package com.campus.trading.controller;

import com.campus.trading.common.ApiResponse;
import com.campus.trading.common.PageResult;
import com.campus.trading.dto.ProductResponse;
import com.campus.trading.entity.Product;
import com.campus.trading.service.FileService;
import com.campus.trading.service.ProductService;
import com.campus.trading.util.JsonUtil;
import com.campus.trading.util.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products")
public class ProductController {
    @Autowired
    private ProductService productService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private FileService fileService;
    
    @Value("${ai.api.url:}")
    private String aiApiUrl;
    
    @Value("${ai.api.key:}")
    private String aiApiKey;
    
    @Value("${ai.api.model:deepseek-chat}")
    private String aiModel;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ApiResponse<PageResult<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int pageSize,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String location,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy) {
        try {
            List<Product> products = productService.getProducts(page, pageSize, category, keyword,
                    condition, minPrice, maxPrice, location, sortBy);
            if (products == null) {
                products = new java.util.ArrayList<>();
            }
            Long total = productService.countProducts(category, keyword, condition, minPrice, maxPrice, location);
            if (total == null) {
                total = 0L;
            }
            
            // 批量获取卖家信息
            java.util.Map<String, com.campus.trading.entity.User> sellerMap = productService.getSellersByIds(
                products.stream()
                    .map(Product::getSellerId)
                    .filter(java.util.Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList())
            );
            
            List<ProductResponse> productResponses = products.stream()
                    .map(product -> {
                        try {
                            ProductResponse response = ProductResponse.fromProduct(product);
                            // 填充卖家信息
                            if (product != null && product.getSellerId() != null) {
                                com.campus.trading.entity.User seller = sellerMap.get(product.getSellerId());
                                if (seller != null) {
                                    response.setSellerUsername(seller.getUsername() != null ? seller.getUsername() : "");
                                    response.setSellerAvatar(seller.getAvatar() != null ? seller.getAvatar() : "");
                                }
                            }
                            return response;
                        } catch (Exception e) {
                            // 如果单个商品转换失败，记录错误但继续处理其他商品
                            e.printStackTrace();
                            // 返回一个基本的响应对象
                            ProductResponse response = ProductResponse.fromProduct(product);
                            return response;
                        }
                    })
                    .filter(response -> response != null) // 过滤掉 null 响应
                    .collect(Collectors.toList());
            PageResult<ProductResponse> result = PageResult.of(productResponses, total, page, pageSize);
            return ApiResponse.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = e.getClass().getSimpleName() + ": " + (e.getCause() != null ? e.getCause().getMessage() : "未知错误");
            }
            return ApiResponse.error(500, "获取商品列表失败: " + errorMsg);
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable String id) {
        try {
            Product product = productService.getProductById(id);
            if (product == null) {
                return ApiResponse.error(404, "商品不存在");
            }
            ProductResponse response = ProductResponse.fromProduct(product);
            // 填充卖家信息
            if (product.getSellerId() != null) {
                com.campus.trading.entity.User seller = productService.getSellerById(product.getSellerId());
                if (seller != null) {
                    response.setSellerUsername(seller.getUsername());
                    response.setSellerAvatar(seller.getAvatar());
                }
            }
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.error("获取商品详情失败: " + e.getMessage());
        }
    }
    
    @PostMapping("/upload-image")
    public ApiResponse<Map<String, String>> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            if (token == null || token.isEmpty()) {
                return ApiResponse.error(401, "未授权，请先登录");
            }
            String userId = jwtUtil.getUserIdFromToken(token);
            
            // 上传文件
            String imageUrl = fileService.uploadProductImage(file);
            
            Map<String, String> result = Map.of("url", imageUrl);
            return ApiResponse.success("图片上传成功", result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "图片上传失败: " + e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<ProductResponse> createProduct(@RequestBody Map<String, Object> requestData, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            // 创建 Product 对象
            Product product = new Product();
            product.setTitle((String) requestData.get("title"));
            product.setDescription((String) requestData.get("description"));
            
            // 处理价格
            Object priceObj = requestData.get("price");
            if (priceObj != null) {
                if (priceObj instanceof Number) {
                    product.setPrice(new java.math.BigDecimal(priceObj.toString()));
                } else {
                    product.setPrice(new java.math.BigDecimal(priceObj.toString()));
                }
            }
            
            Object originalPriceObj = requestData.get("originalPrice");
            if (originalPriceObj != null) {
                if (originalPriceObj instanceof Number) {
                    product.setOriginalPrice(new java.math.BigDecimal(originalPriceObj.toString()));
                } else {
                    product.setOriginalPrice(new java.math.BigDecimal(originalPriceObj.toString()));
                }
            }
            
            product.setCondition((String) requestData.get("condition"));
            product.setCategory((String) requestData.get("category"));
            
            // 处理 images 数组，转换为 JSON 字符串
            Object imagesObj = requestData.get("images");
            if (imagesObj != null) {
                if (imagesObj instanceof List) {
                    product.setImages(JsonUtil.toJson(imagesObj));
                } else if (imagesObj instanceof String) {
                    // 如果已经是字符串，检查是否是 JSON 格式
                    String imagesStr = (String) imagesObj;
                    if (imagesStr.startsWith("[") && imagesStr.endsWith("]")) {
                        product.setImages(imagesStr);
                    } else {
                        // 单个字符串，包装成数组
                        product.setImages(JsonUtil.toJson(java.util.Arrays.asList(imagesStr)));
                    }
                }
            }
            
            // 处理 location（可能是数组，需要转换为字符串）
            Object locationObj = requestData.get("location");
            if (locationObj != null) {
                if (locationObj instanceof List) {
                    List<?> locationList = (List<?>) locationObj;
                    product.setLocation(String.join(" / ", locationList.stream()
                        .map(Object::toString)
                        .collect(java.util.stream.Collectors.toList())));
                } else {
                    product.setLocation(locationObj.toString());
                }
            }
            
            product.setCampus((String) requestData.get("campus"));
            
            // 处理 tags 数组
            Object tagsObj = requestData.get("tags");
            if (tagsObj != null) {
                if (tagsObj instanceof List) {
                    product.setTags(JsonUtil.toJson(tagsObj));
                } else if (tagsObj instanceof String) {
                    String tagsStr = (String) tagsObj;
                    if (tagsStr.startsWith("[") && tagsStr.endsWith("]")) {
                        product.setTags(tagsStr);
                    } else {
                        product.setTags(JsonUtil.toJson(java.util.Arrays.asList(tagsStr)));
                    }
                }
            }
            
            product.setSellerId(userId);
            product.setStatus("published");
            
            Product created = productService.createProduct(product);
            ProductResponse response = ProductResponse.fromProduct(created);
            return ApiResponse.success("发布成功", response);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ApiResponse.error(401, "未授权: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("发布失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable String id, @RequestBody Map<String, Object> requestData,
                                               HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            Product existing = productService.getProductById(id);
            if (existing == null) {
                return ApiResponse.error(404, "商品不存在");
            }
            if (!existing.getSellerId().equals(userId)) {
                return ApiResponse.error(403, "无权限修改此商品");
            }
            
            // 创建 Product 对象用于更新
            Product product = new Product();
            if (requestData.containsKey("title")) product.setTitle((String) requestData.get("title"));
            if (requestData.containsKey("description")) product.setDescription((String) requestData.get("description"));
            if (requestData.containsKey("price")) {
                Object priceObj = requestData.get("price");
                if (priceObj != null) {
                    product.setPrice(new java.math.BigDecimal(priceObj.toString()));
                }
            }
            if (requestData.containsKey("originalPrice")) {
                Object originalPriceObj = requestData.get("originalPrice");
                if (originalPriceObj != null) {
                    product.setOriginalPrice(new java.math.BigDecimal(originalPriceObj.toString()));
                }
            }
            if (requestData.containsKey("condition")) product.setCondition((String) requestData.get("condition"));
            if (requestData.containsKey("category")) product.setCategory((String) requestData.get("category"));
            
            // 处理 images
            if (requestData.containsKey("images")) {
                Object imagesObj = requestData.get("images");
                if (imagesObj instanceof List) {
                    product.setImages(JsonUtil.toJson(imagesObj));
                } else if (imagesObj instanceof String) {
                    String imagesStr = (String) imagesObj;
                    if (imagesStr.startsWith("[") && imagesStr.endsWith("]")) {
                        product.setImages(imagesStr);
                    } else {
                        product.setImages(JsonUtil.toJson(java.util.Arrays.asList(imagesStr)));
                    }
                }
            }
            
            // 处理 location
            if (requestData.containsKey("location")) {
                Object locationObj = requestData.get("location");
                if (locationObj instanceof List) {
                    List<?> locationList = (List<?>) locationObj;
                    product.setLocation(String.join(" / ", locationList.stream()
                        .map(Object::toString)
                        .collect(java.util.stream.Collectors.toList())));
                } else {
                    product.setLocation(locationObj.toString());
                }
            }
            
            if (requestData.containsKey("campus")) product.setCampus((String) requestData.get("campus"));
            if (requestData.containsKey("status")) product.setStatus((String) requestData.get("status"));
            
            // 处理 tags
            if (requestData.containsKey("tags")) {
                Object tagsObj = requestData.get("tags");
                if (tagsObj instanceof List) {
                    product.setTags(JsonUtil.toJson(tagsObj));
                } else if (tagsObj instanceof String) {
                    String tagsStr = (String) tagsObj;
                    if (tagsStr.startsWith("[") && tagsStr.endsWith("]")) {
                        product.setTags(tagsStr);
                    } else {
                        product.setTags(JsonUtil.toJson(java.util.Arrays.asList(tagsStr)));
                    }
                }
            }
            
            Product updated = productService.updateProduct(id, product);
            ProductResponse response = ProductResponse.fromProduct(updated);
            return ApiResponse.success("更新成功", response);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("更新失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            Product product = productService.getProductById(id);
            if (product == null) {
                return ApiResponse.error(404, "商品不存在");
            }
            if (!product.getSellerId().equals(userId)) {
                return ApiResponse.error(403, "无权限删除此商品");
            }
            productService.deleteProduct(id);
            return ApiResponse.success("删除成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }

    @GetMapping("/my")
    public ApiResponse<PageResult<ProductResponse>> getMyProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int pageSize,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            List<Product> products = productService.getMyProducts(userId, page, pageSize, status);
            Long total = productService.countMyProducts(userId, status);
            List<ProductResponse> productResponses = products.stream()
                    .map(ProductResponse::fromProduct)
                    .collect(Collectors.toList());
            PageResult<ProductResponse> result = PageResult.of(productResponses, total, page, pageSize);
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("获取商品列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/favorite")
    public ApiResponse<Void> favoriteProduct(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            productService.favoriteProduct(userId, id);
            return ApiResponse.success("收藏成功", null);
        } catch (RuntimeException e) {
            // 检查是否是授权错误
            if (e.getMessage() != null && e.getMessage().contains("未授权")) {
                return ApiResponse.error(401, "未授权");
            }
            // 其他业务异常（如不能收藏自己的商品、已收藏等）
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("收藏失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}/favorite")
    public ApiResponse<Void> unfavoriteProduct(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            productService.unfavoriteProduct(userId, id);
            return ApiResponse.success("取消收藏成功", null);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("取消收藏失败: " + e.getMessage());
        }
    }

    @GetMapping("/favorites")
    public ApiResponse<PageResult<ProductResponse>> getFavorites(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int pageSize,
            HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            List<Product> products = productService.getFavoriteProducts(userId, page, pageSize);
            Long total = productService.countFavoriteProducts(userId);
            List<ProductResponse> productResponses = products.stream()
                    .map(ProductResponse::fromProduct)
                    .collect(Collectors.toList());
            PageResult<ProductResponse> result = PageResult.of(productResponses, total, page, pageSize);
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("获取收藏列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/favorite/check")
    public ApiResponse<Boolean> checkFavorite(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            boolean isFavorite = productService.isFavorite(userId, id);
            return ApiResponse.success(isFavorite);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, "未授权");
        } catch (Exception e) {
            return ApiResponse.error("检查收藏状态失败: " + e.getMessage());
        }
    }

    @PostMapping("/price-suggestion")
    public ApiResponse<Map<String, Object>> getPriceSuggestion(@RequestBody Map<String, Object> request) {
        try {
            String category = (String) request.get("category");
            String condition = (String) request.get("condition");
            Double originalPrice = request.get("originalPrice") != null ? 
                Double.parseDouble(request.get("originalPrice").toString()) : null;

            // 策略1：搜索完全匹配的商品（相同类别和成色）
            List<Product> similarProducts = productService.getProducts(
                1, 20, category, null, condition, null, null, null, "createdAt"
            );

            // 过滤掉已删除的商品
            similarProducts = similarProducts.stream()
                .filter(p -> p != null && "published".equals(p.getStatus()))
                .collect(Collectors.toList());

            // 策略2：如果没有完全匹配的商品，放宽条件 - 只匹配类别（不限制成色）
            if (similarProducts.isEmpty() && category != null) {
                similarProducts = productService.getProducts(
                    1, 20, category, null, null, null, null, null, "createdAt"
                );
                similarProducts = similarProducts.stream()
                    .filter(p -> p != null && "published".equals(p.getStatus()))
                    .collect(Collectors.toList());
            }

            // 策略3：如果还是没有，尝试只匹配主类别
            if (similarProducts.isEmpty() && category != null && category.contains("/")) {
                String mainCategory = category.split("/")[0];
                similarProducts = productService.getProducts(
                    1, 20, mainCategory, null, null, null, null, null, "createdAt"
                );
                similarProducts = similarProducts.stream()
                    .filter(p -> p != null && "published".equals(p.getStatus()))
                    .collect(Collectors.toList());
            }

            if (similarProducts.isEmpty()) {
                // 如果完全没有相似商品，基于原价和成色给出建议
                double recommendedPrice = calculatePriceByCondition(originalPrice, condition);
                Map<String, Object> suggestion = Map.of(
                    "minPrice", recommendedPrice * 0.7,
                    "maxPrice", recommendedPrice * 1.3,
                    "recommendedPrice", recommendedPrice,
                    "confidence", 0.2,
                    "factors", Map.of("condition", 1.0, "category", 0.0, "marketTrend", 0.0),
                    "similarProducts", List.of()
                );
                return ApiResponse.success(suggestion);
            }

            // 计算价格统计
            List<Double> prices = similarProducts.stream()
                .map(Product::getPrice)
                .filter(p -> p != null && p.compareTo(java.math.BigDecimal.ZERO) > 0)
                .map(p -> p.doubleValue())
                .collect(Collectors.toList());

            if (prices.isEmpty()) {
                double recommendedPrice = calculatePriceByCondition(originalPrice, condition);
                Map<String, Object> suggestion = Map.of(
                    "minPrice", recommendedPrice * 0.7,
                    "maxPrice", recommendedPrice * 1.3,
                    "recommendedPrice", recommendedPrice,
                    "confidence", 0.3,
                    "factors", Map.of("condition", 1.0, "category", 0.0, "marketTrend", 0.0),
                    "similarProducts", List.of()
                );
                return ApiResponse.success(suggestion);
            }

            // 调用DeepSeek AI进行智能定价
            String title = request.get("title") != null ? request.get("title").toString() : "";
            String description = request.get("description") != null ? request.get("description").toString() : "";
            
            Double recommendedPrice = null;
            double confidence = 0.5;
            
            try {
                recommendedPrice = callDeepSeekForPricing(title, description, category, condition, originalPrice, prices, similarProducts);
            } catch (Exception e) {
                e.printStackTrace();
                // AI调用失败，使用传统算法作为兜底
            }
            
            // 如果AI返回无效值，使用传统算法作为兜底
            if (recommendedPrice == null || recommendedPrice <= 0) {
                // 计算价格统计值
                double avgPrice = prices.stream().mapToDouble(Double::doubleValue).average().orElse(0);
                
                // 计算中位数
                List<Double> sortedPrices = prices.stream().sorted().collect(Collectors.toList());
                double medianPrice = sortedPrices.size() % 2 == 0
                    ? (sortedPrices.get(sortedPrices.size() / 2 - 1) + sortedPrices.get(sortedPrices.size() / 2)) / 2.0
                    : sortedPrices.get(sortedPrices.size() / 2);

                // 推荐价格：使用中位数和平均价的加权平均
                recommendedPrice = (medianPrice * 0.6 + avgPrice * 0.4);
                
                // 如果提供了原价，考虑原价因素
                if (originalPrice != null && originalPrice > 0) {
                    double conditionBasedPrice = calculatePriceByCondition(originalPrice, condition);
                    recommendedPrice = (recommendedPrice * 0.7 + conditionBasedPrice * 0.3);
                }
                confidence = 0.6; // 传统算法置信度
            } else {
                confidence = 0.85; // AI定价置信度更高
            }

            // 计算置信度：基于相似商品数量
            confidence = Math.min(0.95, confidence + similarProducts.size() * 0.02);

            // 计算影响因素权重
            double conditionWeight = condition != null ? 0.3 : 0.0;
            double categoryWeight = category != null ? 0.3 : 0.0;
            double marketTrendWeight = 0.2;
            double aiAnalysisWeight = 0.2; // AI分析权重

            // 选择最相似的5个商品
            List<ProductResponse> similarProductResponses = similarProducts.stream()
                .limit(5)
                .map(ProductResponse::fromProduct)
                .filter(pr -> pr != null)
                .collect(Collectors.toList());

            Map<String, Object> factors = new HashMap<>();
            factors.put("condition", conditionWeight);
            factors.put("category", categoryWeight);
            factors.put("marketTrend", marketTrendWeight);
            factors.put("aiAnalysis", aiAnalysisWeight);
            
            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("minPrice", Math.max(0, recommendedPrice * 0.8));
            suggestion.put("maxPrice", recommendedPrice * 1.2);
            suggestion.put("recommendedPrice", Math.round(recommendedPrice * 100.0) / 100.0);
            suggestion.put("confidence", Math.round(confidence * 100.0) / 100.0);
            suggestion.put("factors", factors);
            suggestion.put("similarProducts", similarProductResponses);
            suggestion.put("algorithm", "deepseek_ai"); // 使用的算法

            return ApiResponse.success(suggestion);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("获取价格建议失败: " + e.getMessage());
        }
    }

    /**
     * 调用DeepSeek AI进行智能定价
     */
    private Double callDeepSeekForPricing(
            String title, String description, String category, String condition,
            Double originalPrice, List<Double> similarPrices, List<Product> similarProducts) {
        
        if (aiApiUrl == null || aiApiUrl.isEmpty() || aiApiKey == null || aiApiKey.isEmpty()) {
            return null;
        }
        
        try {
            // 构建提示词
            StringBuilder prompt = new StringBuilder();
            prompt.append("请根据以下商品信息，给出合理的二手商品定价建议（只需返回一个数字，单位：元）：\n\n");
            prompt.append("商品标题：").append(title != null ? title : "未提供").append("\n");
            prompt.append("商品描述：").append(description != null ? description : "未提供").append("\n");
            prompt.append("商品类别：").append(category != null ? category : "未提供").append("\n");
            prompt.append("商品成色：").append(condition != null ? condition : "未提供").append("\n");
            if (originalPrice != null && originalPrice > 0) {
                prompt.append("原价：").append(originalPrice).append("元\n");
            }
            
            if (!similarPrices.isEmpty()) {
                prompt.append("\n平台内相似商品价格参考：\n");
                for (int i = 0; i < Math.min(5, similarPrices.size()); i++) {
                    prompt.append("- ").append(similarPrices.get(i)).append("元\n");
                }
                double avgPrice = similarPrices.stream().mapToDouble(Double::doubleValue).average().orElse(0);
                prompt.append("平均价格：").append(String.format("%.2f", avgPrice)).append("元\n");
            }
            
            prompt.append("\n请综合考虑商品的新旧程度、市场行情、平台内相似商品价格等因素，给出一个合理的定价建议。");
            prompt.append("只返回数字，不要包含任何其他文字或符号。");
            
            // 调用DeepSeek API
            String url = aiApiUrl.endsWith("/") ? aiApiUrl + "chat/completions" : aiApiUrl + "/chat/completions";
            
            Map<String, Object> request = new HashMap<>();
            request.put("model", aiModel);
            request.put("messages", Arrays.asList(
                Map.of("role", "system", "content", "你是一个专业的二手商品定价专家。请根据用户提供的商品信息，给出合理的定价建议。只返回数字，不要包含任何其他文字。"),
                Map.of("role", "user", "content", prompt.toString())
            ));
            request.put("temperature", 0.3); // 降低温度以获得更稳定的结果
            request.put("max_tokens", 100);
            request.put("stream", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(aiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String content = jsonNode.path("choices").get(0).path("message").path("content").asText();
                
                // 从回复中提取数字
                String priceStr = content.replaceAll("[^0-9.]", "").trim();
                if (!priceStr.isEmpty()) {
                    double price = Double.parseDouble(priceStr);
                    if (price > 0) {
                        return price;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return null;
    }

    /**
     * 根据成色计算价格
     */
    private double calculatePriceByCondition(Double originalPrice, String condition) {
        if (originalPrice == null || originalPrice <= 0) {
            return 0;
        }

        if (condition == null) {
            return originalPrice * 0.5; // 默认50%
        }

        switch (condition.toLowerCase()) {
            case "new":
                return originalPrice * 0.8; // 全新80%
            case "like_new":
                return originalPrice * 0.7; // 近新70%
            case "good":
                return originalPrice * 0.5; // 良好50%
            case "fair":
                return originalPrice * 0.3; // 一般30%
            case "poor":
                return originalPrice * 0.2; // 较差20%
            default:
                return originalPrice * 0.5;
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
