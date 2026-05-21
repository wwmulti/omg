#  游戏平台

## 项目概述
游戏平台，支持响应式设计（PC端/移动端）和多语言。网站按游戏提供商分类展示游戏目录，包含游戏卡片、分类筛选和分页功能。

## 技术栈
- **前端框架**: Vue 3 + Vite
- **UI 组件库**: Element Plus / Vuetify（响应式组件）
- **状态管理**: Pinia
- **路由**: Vue Router
- **国际化**: vue-i18n（多语言）
- **样式**: SCSS + CSS Grid/Flexbox
- **构建工具**: Vite

## 核心功能

### 1. 响应式布局
- 桌面端：多列网格布局（4-6列）
- 平板端：3列
- 移动端：1-2列
- 自适应导航（移动端汉堡菜单）
- 触摸友好交互

### 2. 游戏展示系统
- 游戏卡片包含：
  - 游戏缩略图
  - 游戏标题
  - 提供商标签（如"PG Games"）
  - 悬停效果
- 网格布局配合图片懒加载
- 分页/无限滚动
- "显示 X/Y 个游戏"计数器

### 3. 游戏分类
- 按提供商筛选（PG Games 等）
- 分类标签/筛选器
- 激活状态指示器
- 平滑过渡动画

### 4. 多语言支持（i18n）
- 支持语言：
  - 英语（en）
  - 简体中文（zh-CN）
  - 繁体中文（zh-TW）
  - 泰语（th）
  - 越南语（vi）
  - 日语（ja）
- 头部语言切换器
- 语言偏好持久化（localStorage）
- 按需支持 RTL 布局

### 5. 头部组件
- Logo/品牌标识
- 导航菜单
- 语言选择下拉框
- 搜索功能（可选）
- 用户认证（可选）

### 6. 底部组件
- 快速链接
- 提供商链接
- 社交媒体链接
- 版权信息
- 条款与条件链接

## 项目结构

```
omg_vue/
├── public/
│   ├── images/           # 静态图片
│   └── locales/          # i18n JSON 文件
├── src/
│   ├── assets/           # SCSS、字体、图标
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   ├── LanguageSwitcher.vue
│   │   │   └── GameCard.vue
│   │   └── layout/
│   │       ├── MainLayout.vue
│   │       └── ResponsiveGrid.vue
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Category.vue
│   │   └── GameDetail.vue
│   ├── composables/
│   │   ├── useGames.js
│   │   ├── useCategories.js
│   │   └── useResponsive.js
│   ├── stores/
│   │   ├── game.js
│   │   └── locale.js
│   ├── router/
│   │   └── index.js
│   ├── i18n/
│   │   ├── index.js
│   │   └── locales/
│   │       ├── en.json
│   │       ├── zh-CN.json
│   │       ├── zh-TW.json
│   │       ├── th.json
│   │       ├── vi.json
│   │       └── ja.json
│   ├── utils/
│   │   ├── api.js
│   │   └── helpers.js
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
├── package.json
└── AGENTS.md
```

## 实施阶段

### 第1阶段：项目初始化
- [ ] 初始化 Vue 3 + Vite 项目
- [ ] 安装依赖（vue-router、pinia、vue-i18n、element-plus）
- [ ] 配置项目目录结构
- [ ] 设置 SCSS 和基础样式
- [ ] 配置响应式断点

### 第2阶段：核心布局
- [ ] 创建 MainLayout 组件
- [ ] 构建响应式 Header（含导航）
- [ ] 实现 LanguageSwitcher 组件
- [ ] 创建 Footer 组件
- [ ] 搭建响应式网格系统

### 第3阶段：游戏展示
- [ ] 创建 GameCard 组件
- [ ] 实现响应式游戏网格布局
- [ ] 添加图片懒加载功能
- [ ] 创建分页组件
- [ ] 实现悬停效果和动画

### 第4阶段：多语言集成
- [ ] 配置 vue-i18n
- [ ] 创建所有语言的翻译文件
- [ ] 实现语言切换逻辑
- [ ] 添加语言偏好持久化
- [ ] 测试所有翻译

### 第5阶段：数据与状态管理
- [ ] 设置 Pinia stores
- [ ] 创建游戏数据 API 集成
- [ ] 实现分类筛选功能
- [ ] 添加搜索功能（可选）
- [ ] 优化状态管理

### 第6阶段：优化打磨
- [ ] 添加加载状态
- [ ] 实现错误处理
- [ ] 优化图片和资源
- [ ] 添加平滑过渡动画
- [ ] 跨浏览器测试
- [ ] 多设备移动端测试
- [ ] 性能优化（Lighthouse）

### 第7阶段：部署上线
- [ ] 构建优化
- [ ] 环境配置
- [ ] 部署到托管平台
- [ ] 配置资源 CDN
- [ ] 配置域名

## 关键技术要点

### 响应式设计
```css
/* 断点 */
--breakpoint-sm: 576px   /* 手机横屏 */
--breakpoint-md: 768px   /* 平板 */
--breakpoint-lg: 992px   /* 桌面 */
--breakpoint-xl: 1200px  /* 大桌面 */
```

### 游戏卡片组件
- 宽高比：3:4 或 4:5
- 圆角设计
- 悬停时显示阴影
- 提供商标签覆盖层
- 平滑缩放动画

### 性能优化
- 使用 Intersection Observer 实现图片懒加载
- 大型游戏列表使用虚拟滚动
- 图片优化（WebP 格式）
- 按路由代码分割
- 预加载关键资源

### 无障碍访问
- ARIA 标签
- 键盘导航支持
- 焦点管理
- 颜色对比度合规
- 屏幕阅读器支持

## API 集成（模拟数据结构）

```javascript
// 游戏对象结构
{
  id: "game_001",
  title: "Fortune Tiger",
  provider: "PG Games",
  thumbnail: "https://...",
  category: "slots",
  isPopular: true,
  description: "...",
  features: ["Free Spins", "Multiplier"]
}

// API 端点（模拟）
GET /api/games?page=1&limit=12&provider=pg
GET /api/categories
GET /api/providers
```

## 开发规范

### 代码风格
- 遵循 Vue 3 Composition API 模式
- 使用 `<script setup>` 语法
- 实现适当的 TypeScript 类型（可选）
- 遵循 ESLint + Prettier 配置
- 组件命名：PascalCase
- 文件命名：kebab-case

### Git 工作流
- 功能分支：`feature/xxx`
- 修复分支：`fix/xxx`
- 提交信息：Conventional Commits 规范
- 定期提交，提交信息要有意义

### 测试策略
- 组件单元测试（Vitest）
- 响应式布局测试
- i18n 翻译验证
- 跨浏览器兼容性测试

## 注意事项
- 所有游戏图片应优化并缓存
- 实现适当的错误边界
- 添加骨架屏加载器以提升用户体验
- 按需考虑 SEO 优化
- 可选集成统计分析工具
