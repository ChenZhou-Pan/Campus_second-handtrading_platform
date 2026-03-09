# 后端项目启动指南

## 快速启动

### 前置条件检查

1. **确保 MySQL 服务已启动**
```bash
# 检查 MySQL 是否运行
lsof -i :3306

# 如果未运行，启动 MySQL
brew services start mysql
# 或
mysql.server start
```

2. **确保数据库已创建**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS campus_trading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 方法一：使用 Maven 直接运行（推荐）

```bash
# 1. 进入后端目录
cd backend
export AI_API_KEY=sk-91d34e88a70743c8a263b56e198c0a56
# 2. 设置 Java 17 环境（如果系统默认不是 Java 17）
export JAVA_HOME=/Users/chenzhou/Library/Java/JavaVirtualMachines/ms-17.0.15/Contents/Home

# 3. 启动服务
mvn spring-boot:run
```

### 方法二：打包后运行

```bash
# 1. 进入后端目录
cd backend

# 2. 设置 Java 17 环境
export JAVA_HOME=/Users/chenzhou/Library/Java/JavaVirtualMachines/ms-17.0.15/Contents/Home

# 3. 清理并打包
mvn clean package

# 4. 运行 jar 文件
java -jar target/second-hand-trading-platform-1.0.0.jar
```

## 完整启动命令（一行）

```bash
cd backend && export JAVA_HOME=/Users/chenzhou/Library/Java/JavaVirtualMachines/ms-17.0.15/Contents/Home && mvn spring-boot:run
```

## 检查 Java 版本

```bash
# 查看当前 Java 版本
java -version

# 查看系统可用的 Java 版本
/usr/libexec/java_home -V

# 如果当前不是 Java 17，需要设置 JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

## 验证服务是否启动

```bash
# 检查端口是否被占用
lsof -ti:8080

# 测试 API 接口
curl http://localhost:8080/api/auth/me
```

## 停止服务

```bash
# 方法一：找到进程并停止
lsof -ti:8080 | xargs kill

# 方法二：如果在前台运行，按 Ctrl+C
```

## 常见问题

### 1. 编译错误：java.lang.ExceptionInInitializerError
**原因**：Java 版本不匹配，项目需要 Java 17
**解决**：设置 `JAVA_HOME` 为 Java 17

### 2. 端口被占用
**解决**：
```bash
# 查看占用 8080 端口的进程
lsof -ti:8080

# 停止进程
kill <进程ID>
```

### 3. 数据库连接失败（Connection refused）

**错误信息**：
```
Caused by: java.net.ConnectException: Connection refused
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

**原因**：MySQL 服务未启动

**解决方法**：

#### 方法一：使用 Homebrew 启动 MySQL
```bash
# 启动 MySQL 服务
brew services start mysql

# 或使用 mysql.server
mysql.server start

# 检查 MySQL 是否运行
brew services list | grep mysql
# 应该显示：mysql started
```

#### 方法二：手动启动 MySQL
```bash
# 如果 MySQL 安装在标准位置
sudo /usr/local/mysql/support-files/mysql.server start

# 或
sudo launchctl load -w /Library/LaunchDaemons/com.oracle.oss.mysql.mysqld.plist
```

#### 方法三：检查 MySQL 安装
```bash
# 检查 MySQL 是否已安装
which mysql

# 如果未安装，使用 Homebrew 安装
brew install mysql

# 安装后启动
brew services start mysql
```

#### 验证 MySQL 运行状态
```bash
# 检查 3306 端口是否被占用
lsof -i :3306

# 尝试连接 MySQL
mysql -u root -p

# 如果连接成功，说明 MySQL 已启动
```

#### 创建数据库（如果未创建）
```bash
# 连接 MySQL
mysql -u root -p

# 在 MySQL 命令行中执行
CREATE DATABASE campus_trading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

#### 检查数据库配置
确认 `application.yml` 中的配置：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/campus_trading?...
    username: root        # 你的 MySQL 用户名
    password: 123456      # 你的 MySQL 密码
```

## 永久设置 Java 17（可选）

在 `~/.zshrc` 或 `~/.bashrc` 中添加：

```bash
export JAVA_HOME=/Users/chenzhou/Library/Java/JavaVirtualMachines/ms-17.0.15/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

然后执行：
```bash
source ~/.zshrc  # 或 source ~/.bashrc
```
