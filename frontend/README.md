# 象牙市集 - 前端项目

象牙市集是一个综合性的校园二手商品交易平台前端应用，支持移动端和Web端响应式设计。

## 功能特性

### 用户功能
- ✅ 用户注册/登录
- ✅ 个人中心管理
- ✅ 双重身份（买家/卖家）

### 买家功能
- ✅ 商品浏览和搜索
- ✅ 商品收藏
- ✅ 下单购买
- ✅ 订单管理
- ✅ 与卖家沟通
    智能推荐助手（与买家对话，根据买家需求推荐平台上的商品），与下面的智能定价助手为同一个助手，一个助手根据相应的需求提供对应的服务

### 卖家功能
- ✅ 商品发布
- ✅ 商品管理
- ✅ 订单管理
- ✅ 与买家沟通
- ✅ **智能定价助手**（基于历史数据的回归模型）

### 核心亮点
- 🎯 **智能定价助手**：通过分析历史成交数据，为新商品提供合理的参考价格区间
- 📱 响应式设计，完美支持移动端和Web端
- 🔒 安全的C2C交易闭环
- 💬 实时消息沟通系统

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Zustand + Context API
- **UI组件库**: Ant Design + Ant Design Mobile
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios
- **代码规范**: ESLint

## 项目结构

```
frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Layout/          # 布局组件
│   │   ├── ProductCard/     # 商品卡片
│   │   └── PriceAssistant/  # 智能定价助手
│   ├── pages/               # 页面组件
│   │   ├── Home/            # 首页
│   │   ├── ProductList/     # 商品列表
│   │   ├── ProductDetail/   # 商品详情
│   │   ├── PublishProduct/  # 发布商品
│   │   ├── PriceAssistant/ # 定价助手页面
│   │   ├── MyProducts/      # 我的商品
│   │   ├── MyOrders/        # 我的订单
│   │   ├── Messages/        # 消息列表
│   │   ├── Chat/            # 聊天页面
│   │   ├── Favorites/       # 收藏列表
│   │   ├── Profile/         # 个人中心
│   │   ├── Login/           # 登录
│   │   └── Register/        # 注册
│   ├── services/            # API服务
│   │   ├── api.ts           # API基础配置
│   │   ├── authService.ts   # 认证服务
│   │   ├── productService.ts # 商品服务
│   │   ├── orderService.ts  # 订单服务
│   │   └── messageService.ts # 消息服务
│   ├── contexts/            # Context上下文
│   │   └── AuthContext.tsx  # 认证上下文
│   ├── router/              # 路由配置
│   │   └── index.tsx        # 路由定义
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
cd frontend
npm install
# 或
yarn install
```

### 环境配置

创建 `.env` 文件（可选，默认使用 `/api` 作为后端地址）：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
# 或
yarn preview
```

## 开发指南

### 代码规范

项目使用 ESLint 进行代码检查：

```bash
npm run lint
```

### 路由说明

- `/` - 首页
- `/products` - 商品列表
- `/products/:id` - 商品详情
- `/publish` - 发布商品（需登录）
- `/price-assistant` - 智能定价助手（需登录）
- `/my-products` - 我的商品（需登录）
- `/my-orders` - 我的订单（需登录）
- `/orders/:id` - 订单详情（需登录）
- `/messages` - 消息列表（需登录）
- `/messages/:conversationId` - 聊天页面（需登录）
- `/favorites` - 收藏列表（需登录）
- `/profile` - 个人中心（需登录）
- `/login` - 登录
- `/register` - 注册

### API接口

所有API请求通过 `src/services/api.ts` 统一管理，支持：

- 自动添加认证Token
- 请求/响应拦截
- 错误处理

### 智能定价助手

智能定价助手组件位于 `src/components/PriceAssistant`，通过调用后端API获取基于历史数据的价格建议。

功能特点：
- 分析商品类别、成色、原价等因素
- 提供最低价、推荐价、最高价区间
- 显示置信度和影响因素
- 可一键应用推荐价格

## 响应式设计

项目采用移动优先的响应式设计策略：

- **移动端** (< 768px): 单列布局，触摸优化
- **平板端** (768px - 1024px): 两列布局
- **桌面端** (> 1024px): 多列布局，完整功能

使用 Tailwind CSS 的响应式工具类实现断点切换。

## 待实现功能

- [ ] 图片上传功能
- [ ] WebSocket实时消息
- [ ] 商品评价系统
- [ ] 支付集成
- [ ] 商品分享功能
- [ ] 消息推送通知

## 注意事项

1. 确保后端API服务已启动并运行在 `http://localhost:8080`
2. 所有需要认证的接口会自动添加Token到请求头
3. Token存储在localStorage中，刷新页面不会丢失登录状态
4. 图片上传功能需要后端支持，目前为占位实现

## 许可证

MIT
