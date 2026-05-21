# 后端代理服务器

这个后端服务器用于保护敏感的 API 密钥（operator_token 和 secret），避免暴露在前端代码中。

## 架构说明

```
前端 (Vue) → 后端代理 (Express) → 第三方游戏API
             (持有secret)         (验证签名)
```

## 安装依赖

```bash
cd server
npm install
```

## 配置环境变量

编辑 `server/.env` 文件，确保包含以下配置：

```env
PORT=3000
VITE_BASE_API_URL=https://api.wwapi.vip

# 代理配置（开发环境启用，生产环境关闭）
PROXY_ENABLED=true
PROXY_URL=http://127.0.0.1:7897

VITE_OPERATOR_TOKEN=your_operator_token
VITE_SECRET=your_secret
```

### 代理配置说明

- **PROXY_ENABLED**: 是否启用代理 (`true` 或 `false`)
  - 开发环境：设置为 `true` 使用代理
  - 生产环境：设置为 `false` 直连
  
- **PROXY_URL**: 代理服务器地址
  - 默认：`http://127.0.0.1:7897`
  - 可根据实际情况修改

⚠️ **重要**：`.env` 文件已添加到 `.gitignore`，不会被提交到版本控制系统。

## 启动服务器

### 开发模式（自动重启）

```bash
cd server
npm run dev
```

### 生产模式

```bash
cd server
npm start
```

服务器将在 `http://localhost:3000` 启动。

## API 接口

### 1. 创建用户会话

**请求：**
```
POST http://localhost:3000/api/web/user_session
Content-Type: application/json

{
  "user_id": "browser_uuid",
  "user_name": "browser_uuid",
  "rtp": 0
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "user_id": "...",
    "token": "...",
    "rtp": 0
  }
}
```

### 2. 获取游戏URL

**请求：**
```
POST http://localhost:3000/api/web/game_url
Content-Type: application/json

{
  "game_code": "126",
  "language": "pt",
  "type": "pg",
  "user_id": "...",
  "user_token": "..."
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "url": "https://game-url..."
  }
}
```

### 3. 健康检查

**请求：**
```
GET http://localhost:3000/health
```

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 前端配置

前端通过 Vite 代理将 `/api` 请求转发到后端服务器：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

前端代码无需修改，仍然使用相对路径 `/api/web/...` 发起请求。

## 安全优势

✅ **敏感信息保护**：operator_token 和 secret 只保存在后端  
✅ **前端不可见**：打包后的代码不包含任何敏感信息  
✅ **集中管理**：所有 API 签名逻辑在后端统一处理  
✅ **易于维护**：更换密钥只需修改后端配置  

## 部署建议

### 生产环境部署

1. **设置环境变量**（不要使用 .env 文件）
   ```bash
   export VITE_OPERATOR_TOKEN=your_token
   export VITE_SECRET=your_secret
   export PORT=3000
   ```

2. **使用进程管理器**
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name omg-api-proxy
   ```

3. **配置反向代理**（Nginx 示例）
   ```nginx
   location /api/ {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

## 故障排查

### 问题：无法连接到后端服务器

**解决方案：**
1. 确认后端服务器已启动：`npm run dev`
2. 检查端口是否被占用
3. 查看控制台错误信息

### 问题：API 请求失败

**解决方案：**
1. 检查 `.env` 文件中的配置是否正确
2. 确认第三方 API 地址可访问
3. 查看后端服务器日志

### 问题：CORS 错误

**解决方案：**
后端已配置 CORS 中间件，如果出现 CORS 错误，请检查：
1. 后端服务器是否正常启动
2. 前端代理配置是否正确
