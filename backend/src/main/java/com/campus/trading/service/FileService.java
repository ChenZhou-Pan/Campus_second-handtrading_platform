package com.campus.trading.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileService.class);
    
    @Value("${file.upload.path:uploads}")
    private String uploadPath;
    
    @Value("${server.servlet.context-path:/api}")
    private String contextPath;
    
    /**
     * 上传头像文件
     * @param file 上传的文件
     * @return 文件的访问URL
     * @throws RuntimeException 文件操作异常
     */
    public String uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("文件不能为空");
        }
        
        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("只能上传图片文件");
        }
        
        // 验证文件大小（5MB）
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("图片大小不能超过5MB");
        }
        
        // 创建上传目录（使用项目根目录下的相对路径）
        String projectRoot = System.getProperty("user.dir");
        Path dirPath = Paths.get(projectRoot, uploadPath, "avatars");
        logger.info("上传目录路径: {}", dirPath.toAbsolutePath());
        try {
            // 使用 Files.createDirectories 确保目录存在，如果不存在则创建（包括所有父目录）
            Files.createDirectories(dirPath);
            logger.info("目录创建成功: {}", dirPath.toAbsolutePath());
        } catch (IOException e) {
            logger.error("创建上传目录失败: {}", dirPath.toAbsolutePath(), e);
            throw new RuntimeException("创建上传目录失败: " + e.getMessage(), e);
        }
        
        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;
        
        // 保存文件
        Path filePath = dirPath.resolve(filename);
        logger.info("保存文件到: {}", filePath.toAbsolutePath());
        try {
            Files.write(filePath, file.getBytes());
            logger.info("文件保存成功: {}", filePath.toAbsolutePath());
        } catch (IOException e) {
            logger.error("保存文件失败: {}", filePath.toAbsolutePath(), e);
            throw new RuntimeException("保存文件失败: " + e.getMessage(), e);
        }
        
        // 返回访问URL（包含contextPath）
        return contextPath + "/uploads/avatars/" + filename;
    }
    
    /**
     * 上传商品图片文件
     * @param file 上传的文件
     * @return 文件的访问URL
     * @throws RuntimeException 文件操作异常
     */
    public String uploadProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("文件不能为空");
        }
        
        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("只能上传图片文件");
        }
        
        // 验证文件大小（5MB）
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("图片大小不能超过5MB");
        }
        
        // 创建上传目录（使用项目根目录下的相对路径）
        String projectRoot = System.getProperty("user.dir");
        Path dirPath = Paths.get(projectRoot, uploadPath, "products");
        logger.info("上传目录路径: {}", dirPath.toAbsolutePath());
        try {
            // 使用 Files.createDirectories 确保目录存在，如果不存在则创建（包括所有父目录）
            Files.createDirectories(dirPath);
            logger.info("目录创建成功: {}", dirPath.toAbsolutePath());
        } catch (IOException e) {
            logger.error("创建上传目录失败: {}", dirPath.toAbsolutePath(), e);
            throw new RuntimeException("创建上传目录失败: " + e.getMessage(), e);
        }
        
        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;
        
        // 保存文件
        Path filePath = dirPath.resolve(filename);
        logger.info("保存文件到: {}", filePath.toAbsolutePath());
        try {
            Files.write(filePath, file.getBytes());
            logger.info("文件保存成功: {}", filePath.toAbsolutePath());
        } catch (IOException e) {
            logger.error("保存文件失败: {}", filePath.toAbsolutePath(), e);
            throw new RuntimeException("保存文件失败: " + e.getMessage(), e);
        }
        
        // 返回访问URL（包含contextPath）
        return contextPath + "/uploads/products/" + filename;
    }
}
