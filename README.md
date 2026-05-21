# 游戏平台

支持响应式设计（PC端/移动端）和多语言。网站按游戏提供商分类展示游戏目录，包含游戏卡片、分类筛选和轮播功能。

## 🚀 核心特性

### 1. Excel 数据管理
- **上传解析**：支持 .xlsx/.xls 格式文件上传
- **自动转换**：Excel 数据自动转换为 JSON 格式
- **实时统计**：显示处理结果（成功数、跳过数、无效数据等）
- **数据安全**：无有效数据时不覆盖现有游戏数据
- **拖拽上传**：支持拖拽文件到上传区域
- **双端同步**：同时更新开发环境和生产环境数据

### 2. 后端代理服务
- **安全架构**：敏感信息（token、secret）存储在后端
- **API 代理**：前端请求通过后端转发到第三方 API
- **签名处理**：MD5 签名逻辑完全隐藏在后端
- **代理配置**：支持 HTTP/HTTPS 代理（开发环境启用）
- **跨域解决**：CORS 配置，支持前后端分离部署

### 3. 动态数据加载
- **容错机制**：JSON 文件缺失时应用仍可正常启动
- **实时更新**：上传 Excel 后无需重新构建即可生效
- **状态管理**：Pinia store 支持运行时数据刷新
- **默认数据**：提供空数据结构作为后备方案

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3.5 + Vite 6
- **状态管理**: Pinia 2.3
- **路由**: Vue Router 4.5
- **国际化**: vue-i18n 10
- **HTTP 请求**: Axios 1.16
- **样式**: SCSS + CSS Grid/Flexbox

### 后端
- **服务器**: Node.js + Express 4.18
- **文件上传**: Multer 1.4
- **Excel 解析**: XLSX 0.18
- **HTTP 代理**: https-proxy-agent 7.0
- **签名工具**: MD5 2.3
- **环境变量**: dotenv 16.3

## 功能特性

### 已完成功能

#### 1. 响应式布局
- PC 端：侧边栏 + 主内容区布局
- 移动端：自适应响应式设计
- 固定侧边栏和顶部导航

#### 2. 轮播组件
- PC 端默认显示 3 张轮播图
- 手机端显示 1 张轮播图
- 支持鼠标拖动切换
- 支持触摸滑动切换
- 下方指示点点击切换
- 自动播放（5秒间隔）
- 循环播放

#### 3. 侧边栏导航
- 10 个游戏分类菜单项
- 图标 + 文字布局
- 悬停效果：边框高亮 + 阴影
- 选中状态：呼吸动画效果
- 图标颜色跟随激活状态

#### 4. 顶部导航
- Logo 显示
- 语言切换器
- 支持 8 种语言：中文、English、Español、Tiếng Việt、Italiano、Dansk、Français、Português
- 国旗图标 + 文字组合
- 下拉菜单选择
- 默认语言：葡萄牙语

#### 5. 游戏展示
- 游戏卡片组件
- 渐变背景设计
- 悬停效果
- 分类标签筛选
- 提供商筛选
- 搜索功能

#### 6. 用户系统
- **自动注册**：首次访问自动生成用户会话
- **UUID 标识**：基于浏览器指纹生成唯一 ID
- **Token 缓存**：用户信息 localStorage 持久化
- **过期处理**：24小时自动重新登录
- **错误提示**：友好的 Toast 通知组件

#### 7. 环境配置
- **前端配置**：.env.development / .env.production
- **后端配置**：server/.env（敏感信息隔离）
- **代理设置**：Vite 开发代理 + 后端 HTTP 代理
- **配置示例**：.env.example 模板文件

#### 8. 工具函数
- **HTTP 封装**：统一的 request.js 请求模块
- **语言头部**：自动携带 Accept-Language
- **Browser UUID**：浏览器唯一标识生成
- **Toast 提示**：成功/错误消息通知

## 项目结构

```
omg_vue/
├── public/                     # 静态资源
│   ├── data/
│   │   └── games.json          # 游戏数据（动态生成）
│   └── *.png                   # 图标和图片资源
├── server/                     # 后端服务器
│   ├── index.js                # Express 主文件
│   ├── .env                    # 后端环境变量
│   ├── package.json            # 后端依赖
│   └── README.md               # 后端文档
├── src/
│   ├── api/
│   │   └── game.js             # 游戏 API 接口
│   ├── assets/
│   │   └── styles/
│   │       └── main.scss       # 全局样式
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppHeader.vue   # 顶部导航
│   │   │   ├── AppSidebar.vue  # 侧边栏
│   │   │   ├── Carousel.vue    # 轮播组件
│   │   │   └── GameCard.vue    # 游戏卡片
│   │   └── layout/
│   │       └── MainLayout.vue  # 主布局
│   ├── router/
│   │   └── index.js            # 路由配置
│   ├── stores/
│   │   └── category.js         # 分类状态管理
│   ├── utils/
│   │   ├── request.js          # HTTP 请求封装
│   │   ├── browser_uuid.js     # 浏览器 UUID
│   │   └── toast.js            # Toast 提示
│   ├── views/
│   │   ├── Home.vue            # 首页
│   │   ├── Category.vue        # 分类页
│   │   └── Upload.vue          # Excel 上传页
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── .env.development            # 前端开发配置
├── .env.production             # 前端生产配置
├── .env.example                # 配置示例
├── index.html                  # HTML 模板
├── package.json                # 前端依赖
└── vite.config.js              # Vite 配置
```

## 🚀 快速开始

### 前置要求
- Node.js >= 16.x
- npm >= 8.x

### 安装依赖

#### 前端依赖
```bash
npm install
```

#### 后端依赖
```bash
cd server
npm install
cd ..
```

### 开发模式

需要同时启动前端和后端服务：

**终端 1 - 启动后端：**
```bash
npm run server
# 或
cd server && npm run dev
```

**终端 2 - 启动前端：**
```bash
npm run dev
```

访问 http://localhost:5173

### Excel 数据上传

1. 访问上传页面：http://localhost:5173/cj9txr9OZfriMEkA
2. 点击上传区域或拖拽 Excel 文件
3. 等待解析完成，查看统计信息
4. 成功后返回首页查看最新游戏数据

**支持的 Excel 格式：**
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- 最大文件大小：10MB

**必要字段：**
- `name`: 游戏名称
- `game_code`: 游戏代码
- `type`: 平台类型
- `category`: 分类名称
- `status`: 状态（过滤“验收中”的记录）

### 构建生产版本

```bash
npm run build
```

构建后的文件位于 `dist/` 目录，包括：
- 前端静态资源（HTML/CSS/JS）
- `data/games.json`（最新的游戏数据）

### 预览生产版本

```bash
npm run preview
```

## 开发规范

### 代码风格
- 遵循 Vue 3 Composition API 模式
- 使用 `<script setup>` 语法
- 组件命名：PascalCase
- 文件命名：kebab-case

### Git 工作流
- 功能分支：`feature/xxx`
- 修复分支：`fix/xxx`
- 提交信息：Conventional Commits 规范

## 🔒 安全架构

### 敏感信息保护
- **前端**：不包含任何 secret、token 等敏感信息
- **后端**：所有敏感信息存储在 `server/.env`（已加入 .gitignore）
- **通信**：前端 → 后端代理 → 第三方 API

### 环境变量配置

#### 前端 (.env.development)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_IMAGES_URL=https://uploads.wwapi.vip
```

#### 后端 (server/.env)
```env
PORT=3000
VITE_BASE_API_URL=https://api.wwapi.vip
VITE_OPERATOR_TOKEN=your_token_here
VITE_SECRET=your_secret_here
PROXY_ENABLED=true
PROXY_URL=http://127.0.0.1:7897
```

⚠️ **重要**：不要将 `server/.env` 提交到版本控制系统！

## 响应式断点

- **移动端**: ≤ 768px
- **平板端**: 769px - 991px
- **桌面端**: ≥ 992px

## 🚢 部署指南

### 生产环境部署

1. **构建前端**
```bash
npm run build
```

2. **配置后端**
```bash
cd server
# 创建 .env 文件并填写生产环境配置
nano .env
```

3. **启动服务**
```bash
# 使用 PM2 管理进程（推荐）
pm2 start server/index.js --name game-platform

# 或直接运行
node server/index.js
```

4. **配置 Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## ❓ 常见问题

### Q: 上传 Excel 后数据没有更新？
A: 检查后端日志，确认 `successCount > 0`。如果为 0，说明没有有效数据，不会覆盖现有数据。

### Q: 游戏图片无法加载？
A: 确保 `VITE_IMAGES_URL` 配置正确，且图片路径格式为 `{IMAGES_URL}/uploads/{platform}/{game_code}.png`。

### Q: 后端请求超时？
A: 检查 `PROXY_ENABLED` 配置，开发环境可能需要启用代理才能访问第三方 API。

### Q: localStorage 键名不一致？
A: 已统一使用 `'locale'` 作为语言设置键名，所有相关代码已修复。

## 主题配色

- **背景色**: #1b1c20
- **组件背景**: #25262b
- **边框色**: #2a2b30
- **激活色**: #90f462
- **文字色**: #939393