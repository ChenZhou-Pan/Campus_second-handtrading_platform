package com.campus.trading.service;

import com.campus.trading.entity.Product;
import com.campus.trading.entity.User;
import com.campus.trading.mapper.FavoriteMapper;
import com.campus.trading.mapper.ProductMapper;
import com.campus.trading.mapper.UserMapper;
import com.campus.trading.util.IdUtil;
import com.campus.trading.util.JsonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class ProductService {
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private FavoriteMapper favoriteMapper;
    
    @Autowired
    private UserMapper userMapper;

    public List<Product> getProducts(int page, int pageSize, String category, String keyword,
                                     String condition, Double minPrice, Double maxPrice, String location, String sortBy) {
        try {
            int offset = (page - 1) * pageSize;
            return productMapper.findAll(offset, pageSize, category, keyword, condition, minPrice, maxPrice, location, sortBy);
        } catch (Exception e) {
            // 如果数据库连接失败，返回空列表
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }

    public Long countProducts(String category, String keyword, String condition,
                              Double minPrice, Double maxPrice, String location) {
        try {
            return productMapper.count(category, keyword, condition, minPrice, maxPrice, location);
        } catch (Exception e) {
            // 如果数据库连接失败，返回0
            e.printStackTrace();
            return 0L;
        }
    }

    public Product getProductById(String id) {
        Product product = productMapper.findById(id);
        if (product != null) {
            productMapper.incrementViewCount(id);
        }
        return product;
    }

    public List<Product> getMyProducts(String sellerId, int page, int pageSize, String status) {
        int offset = (page - 1) * pageSize;
        return productMapper.findBySellerId(sellerId, offset, pageSize, status);
    }

    public Long countMyProducts(String sellerId, String status) {
        return productMapper.countBySellerId(sellerId, status);
    }

    @Transactional
    public Product createProduct(Product product) {
        product.setId(IdUtil.generateId());
        product.setViewCount(0);
        product.setFavoriteCount(0);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        
        // images 和 tags 应该在 Controller 层已经转换为 JSON 字符串
        // 这里只需要确保格式正确
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            // 如果已经是 JSON 字符串格式，直接使用；否则尝试转换
            String imagesStr = product.getImages();
            if (!imagesStr.startsWith("[")) {
                // 不是 JSON 数组格式，尝试转换
                try {
                    List<String> imageList = JsonUtil.fromJsonArray(imagesStr);
                    if (imageList == null || imageList.isEmpty()) {
                        product.setImages(JsonUtil.toJson(java.util.Arrays.asList(imagesStr)));
                    } else {
                        product.setImages(JsonUtil.toJson(imageList));
                    }
                } catch (Exception e) {
                    product.setImages(JsonUtil.toJson(java.util.Arrays.asList(imagesStr)));
                }
            }
        }
        
        if (product.getTags() != null && !product.getTags().isEmpty()) {
            String tagsStr = product.getTags();
            if (!tagsStr.startsWith("[")) {
                try {
                    List<String> tagList = JsonUtil.fromJsonArray(tagsStr);
                    if (tagList == null || tagList.isEmpty()) {
                        product.setTags(JsonUtil.toJson(java.util.Arrays.asList(tagsStr)));
                    } else {
                        product.setTags(JsonUtil.toJson(tagList));
                    }
                } catch (Exception e) {
                    product.setTags(JsonUtil.toJson(java.util.Arrays.asList(tagsStr)));
                }
            }
        }
        
        productMapper.insert(product);
        return product;
    }

    @Transactional
    public Product updateProduct(String id, Product product) {
        Product existingProduct = productMapper.findById(id);
        if (existingProduct == null) {
            throw new RuntimeException("商品不存在");
        }

        if (product.getTitle() != null) existingProduct.setTitle(product.getTitle());
        if (product.getDescription() != null) existingProduct.setDescription(product.getDescription());
        if (product.getPrice() != null) existingProduct.setPrice(product.getPrice());
        if (product.getOriginalPrice() != null) existingProduct.setOriginalPrice(product.getOriginalPrice());
        if (product.getCondition() != null) existingProduct.setCondition(product.getCondition());
        if (product.getCategory() != null) existingProduct.setCategory(product.getCategory());
        if (product.getImages() != null) existingProduct.setImages(product.getImages());
        if (product.getStatus() != null) existingProduct.setStatus(product.getStatus());
        if (product.getLocation() != null) existingProduct.setLocation(product.getLocation());
        if (product.getTags() != null) existingProduct.setTags(product.getTags());
        existingProduct.setUpdatedAt(LocalDateTime.now());

        productMapper.update(existingProduct);
        return existingProduct;
    }

    @Transactional
    public void deleteProduct(String id) {
        Product product = productMapper.findById(id);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        product.setStatus("deleted");
        productMapper.update(product);
    }

    @Transactional
    public void favoriteProduct(String userId, String productId) {
        // 获取商品信息
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        
        // 检查是否是自己的商品
        if (product.getSellerId().equals(userId)) {
            throw new RuntimeException("不能收藏自己发布的商品");
        }
        
        // 检查是否已收藏
        if (favoriteMapper.findByUserIdAndProductId(userId, productId) != null) {
            throw new RuntimeException("已经收藏过该商品");
        }
        
        // 添加收藏
        com.campus.trading.entity.Favorite favorite = new com.campus.trading.entity.Favorite();
        favorite.setId(IdUtil.generateId());
        favorite.setUserId(userId);
        favorite.setProductId(productId);
        favorite.setCreatedAt(LocalDateTime.now());
        favoriteMapper.insert(favorite);
        
        // 更新商品收藏数
        productMapper.updateFavoriteCount(productId, product.getFavoriteCount() + 1);
    }

    @Transactional
    public void unfavoriteProduct(String userId, String productId) {
        favoriteMapper.deleteByUserIdAndProductId(userId, productId);
        
        // 更新商品收藏数
        Product product = productMapper.findById(productId);
        if (product != null && product.getFavoriteCount() > 0) {
            productMapper.updateFavoriteCount(productId, product.getFavoriteCount() - 1);
        }
    }

    public List<Product> getFavoriteProducts(String userId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        List<com.campus.trading.entity.Favorite> favorites = favoriteMapper.findByUserId(userId, offset, pageSize);
        return favorites.stream()
                .map(fav -> productMapper.findById(fav.getProductId()))
                .filter(product -> product != null && !"deleted".equals(product.getStatus()))
                .collect(java.util.stream.Collectors.toList());
    }

    public Long countFavoriteProducts(String userId) {
        return favoriteMapper.countByUserId(userId);
    }

    public boolean isFavorite(String userId, String productId) {
        return favoriteMapper.findByUserIdAndProductId(userId, productId) != null;
    }

    /**
     * 根据卖家ID获取卖家信息
     */
    public User getSellerById(String sellerId) {
        try {
            return userMapper.findById(sellerId);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 批量获取卖家信息
     */
    public Map<String, User> getSellersByIds(List<String> sellerIds) {
        Map<String, User> sellerMap = new HashMap<>();
        if (sellerIds == null || sellerIds.isEmpty()) {
            return sellerMap;
        }
        
        try {
            for (String sellerId : sellerIds) {
                if (sellerId == null || sellerId.trim().isEmpty()) {
                    continue;
                }
                try {
                    User seller = userMapper.findById(sellerId);
                    if (seller != null) {
                        sellerMap.put(sellerId, seller);
                    }
                } catch (Exception e) {
                    // 忽略单个用户查询失败，继续处理其他用户
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            // 如果批量查询失败，返回空map，不影响主流程
            e.printStackTrace();
        }
        return sellerMap;
    }
}
