package com.campus.trading.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Autowired
    private JwtAuthenticationInterceptor jwtAuthenticationInterceptor;
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")  // 允许所有来源（开发环境）
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);  // 预检请求缓存时间
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源访问，允许访问上传的文件
        // 获取项目根目录
        String projectRoot = System.getProperty("user.dir");
        String uploadDir = projectRoot + "/uploads";
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册JWT认证拦截器，拦截所有 /api 路径下的请求
        // 注意：商品相关的 GET 请求在拦截器内部处理，这里不排除 /api/products
        // 因为 POST /api/products 需要登录，而 GET /api/products 和 GET /api/products/{id} 不需要
        registry.addInterceptor(jwtAuthenticationInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/login-by-code",
                    "/api/auth/send-code",
                    "/api/auth/verify-code",
                    "/api/uploads/**"    // 静态资源不需要登录
                );
    }
}
