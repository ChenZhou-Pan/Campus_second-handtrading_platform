# 校园二手交易平台 - 后端服务

基于 Spring Boot 3.2.0 + MyBatis 的后端服务。

## 技术栈

- **框架**: Spring Boot 3.2.0
- **ORM**: MyBatis 3.0.3
- **数据库**: MySQL 8.0+
- **认证**: JWT (jjwt 0.12.3)
- **构建工具**: Maven
- **Java版本**: 17

## 项目结构

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/campus/trading/
│   │   │   ├── common/          # 通用类（ApiResponse, PageResult）
│   │   │   ├── config/           # 配置类（WebConfig）
│   │   │   ├── controller/       # 控制器层
│   │   │   ├── entity/           # 实体类
│   │   │   ├── mapper/           # MyBatis Mapper接口
│   │   │   ├── service/          # 服务层
│   │   │   └── util/             # 工具类
│   │   └── resources/
│   │       ├── mapper/           # MyBatis XML映射文件
│   │       ├── db/               # 数据库脚本
│   │       └── application.yml   # 配置文件
│   └── test/
└── pom.xml
```

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库配置

1. 创建数据库：
```sql
CREATE DATABASE campus_trading DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 执行初始化脚本：
```bash
mysql -u root -p campus_trading < src/main/resources/db/schema.sql
```

3. 修改 `application.yml` 中的数据库连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/campus_trading?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
```

### 3. 运行项目

```bash
# 使用Maven运行
mvn spring-boot:run

# 或打包后运行
mvn clean package
java -jar target/second-hand-trading-platform-1.0.0.jar
```

服务将在 `http://localhost:8080/api` 启动。

## API接口

### 认证相关 (`/auth`)

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `GET /auth/me` - 获取当前用户信息
- `PUT /auth/profile` - 更新用户信息
- `PUT /auth/role` - 切换用户角色
- `GET /auth/stats` - 获取用户统计信息

### 商品相关 (`/products`)

- `GET /products` - 获取商品列表（支持分页、搜索、筛选）
- `GET /products/{id}` - 获取商品详情
- `POST /products` - 创建商品（需登录，卖家身份）
- `PUT /products/{id}` - 更新商品（需登录，卖家身份）
- `DELETE /products/{id}` - 删除商品（需登录，卖家身份）
- `GET /products/my` - 获取我的商品（需登录，卖家身份）
- `POST /products/{id}/favorite` - 收藏商品（需登录）
- `DELETE /products/{id}/favorite` - 取消收藏（需登录）
- `GET /products/favorites` - 获取收藏列表（需登录）
- `POST /products/price-suggestion` - 智能定价建议（需登录）

### 订单相关 (`/orders`)

- `POST /orders` - 创建订单（需登录）
- `GET /orders` - 获取订单列表（需登录，支持按角色筛选）
- `GET /orders/{id}` - 获取订单详情（需登录）
- `PUT /orders/{id}/status` - 更新订单状态（需登录，卖家）
- `PUT /orders/{id}/cancel` - 取消订单（需登录，买家）

### 消息相关 (`/messages`)

- `GET /messages/conversations` - 获取会话列表（需登录）
- `GET /messages/conversations/{id}` - 获取会话详情（需登录）
- `POST /messages/conversations` - 创建或获取会话（需登录）
- `GET /messages/conversations/{id}/messages` - 获取消息列表（需登录）
- `POST /messages/conversations/{id}/messages` - 发送消息（需登录）
- `PUT /messages/conversations/{id}/read` - 标记已读（需登录）

## 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 12,
    "totalPages": 9
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

## 认证

使用 JWT Token 进行认证。在请求头中添加：
```
Authorization: Bearer <token>
```

## 注意事项

1. 确保 MySQL 服务已启动
2. 修改 `application.yml` 中的数据库连接信息
3. JWT密钥在 `application.yml` 中配置，生产环境请修改
4. 文件上传功能需要配置上传路径

## 待实现功能

- [ ] MyBatis XML映射文件
- [ ] 消息服务完整实现
- [ ] 智能定价算法
- [ ] 文件上传功能
- [ ] 单元测试
- [ ] 接口文档（Swagger）

## 许可证

MIT
