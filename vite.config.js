import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0', // 监听所有网络接口,允许局域网访问
    port: 5173,
    strictPort: false, // 如果端口被占用,自动尝试下一个可用端口
    proxy: {
      // 代理API请求到后端服务器
      '/api': {
        target: 'http://localhost:9500',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
