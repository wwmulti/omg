<template>
  <div class="upload-page">
    <div class="upload-container">
      <h1 class="page-title">Excel 游戏数据上传</h1>
      
      <!-- 上传区域 -->
      <div 
        class="upload-area"
        :class="{ 'drag-over': isDragOver, 'uploading': uploading }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <input 
          ref="fileInput"
          type="file" 
          accept=".xlsx,.xls"
          @change="handleFileSelect"
          style="display: none"
        />
        
        <div v-if="!uploading" class="upload-content">
          <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p class="upload-text">点击或拖拽 Excel 文件到此处</p>
          <p class="upload-hint">支持 .xlsx 和 .xls 格式，最大 10MB</p>
        </div>
        
        <div v-else class="upload-loading">
          <div class="loading-spinner"></div>
          <p>正在解析 Excel 文件...</p>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>{{ error }}</span>
        <button class="close-btn" @click="error = ''">×</button>
      </div>

      <!-- 成功结果 -->
      <div v-if="result" class="result-container">
        <div class="success-header">
          <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h2>解析成功！</h2>
        </div>

        <!-- 统计信息 -->
        <div class="statistics">
          <div class="stat-item">
            <div class="stat-value">{{ result.statistics.totalRecords }}</div>
            <div class="stat-label">总记录数</div>
          </div>
          <div class="stat-item success">
            <div class="stat-value">{{ result.statistics.successCount }}</div>
            <div class="stat-label">成功处理</div>
          </div>
          <div class="stat-item warning">
            <div class="stat-value">{{ result.statistics.skippedCount }}</div>
            <div class="stat-label">跳过记录</div>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">验收中跳过：</span>
            <span class="detail-value">{{ result.statistics.noCompletedCount }} 条</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">无效数据跳过：</span>
            <span class="detail-value">{{ result.statistics.invalidCount }} 条</span>
          </div>
        </div>

        <!-- 分类统计 -->
        <div v-if="Object.keys(result.statistics.categories).length > 0" class="category-stats">
          <h3>分类统计</h3>
          <div class="stats-grid">
            <div v-for="(count, category) in result.statistics.categories" :key="category" class="stat-card">
              <div class="stat-card-title">{{ category.toUpperCase() }}</div>
              <div class="stat-card-count">{{ count }} 个游戏</div>
            </div>
          </div>
        </div>

        <!-- 平台统计 -->
        <div v-if="Object.keys(result.statistics.platforms).length > 0" class="platform-stats">
          <h3>平台统计</h3>
          <div class="stats-grid">
            <div v-for="(count, platform) in result.statistics.platforms" :key="platform" class="stat-card">
              <div class="stat-card-title">{{ platform.toUpperCase() }}</div>
              <div class="stat-card-count">{{ count }} 个游戏</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn btn-primary" @click="downloadJson">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载 JSON 文件
          </button>
          <button class="btn btn-secondary" @click="resetUpload">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            重新上传
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { post } from '@/utils/request'
import { useCategoryStore } from '@/stores/category'

const router = useRouter()
const categoryStore = useCategoryStore()

const fileInput = ref(null)
const isDragOver = ref(false)
const uploading = ref(false)
const error = ref('')
const result = ref(null)

// 触发文件选择
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile(file)
  }
}

// 处理拖拽进入
const handleDragOver = () => {
  if (!uploading.value) {
    isDragOver.value = true
  }
}

// 处理拖拽离开
const handleDragLeave = () => {
  isDragOver.value = false
}

// 处理拖拽释放
const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    uploadFile(file)
  }
}

// 上传文件
const uploadFile = async (file) => {
  // 验证文件类型
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    error.value = '只支持 Excel 文件格式 (.xlsx, .xls)'
    return
  }

  // 验证文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    error.value = '文件大小不能超过 10MB'
    return
  }

  uploading.value = true
  error.value = ''
  result.value = null

  try {
    const formData = new FormData()
    formData.append('file', file)

    // 使用封装的 post 方法，需要设置 headers
    const response = await post('/api/upload/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // request 拦截器已经返回 response.data，所以直接访问
    if (response.code === 0) {
      result.value = response.data
      
      // 更新 store 中的游戏数据
      categoryStore.updateGamesData(response.data.games)
      
      console.log('✅ 游戏数据已更新，可以返回首页查看')
    } else {
      // 后端返回错误（如没有有效数据）
      error.value = response.message || '上传失败'
      console.warn('⚠️ 上传失败:', response.message)
    }
  } catch (err) {
    console.error('上传失败:', err)
    error.value = err.response?.data?.message || err.message || '网络请求失败，请稍后重试'
  } finally {
    uploading.value = false
  }
}

// 下载 JSON 文件
const downloadJson = () => {
  if (!result.value) return

  const jsonStr = JSON.stringify(result.value.games, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `games_${new Date().getTime()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 重置上传
const resetUpload = () => {
  result.value = null
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped lang="scss">
.upload-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-container {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.page-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
}

.upload-area {
  border: 3px dashed #ccc;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;

  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }

  &.drag-over {
    border-color: #667eea;
    background: #e8eeff;
    transform: scale(1.02);
  }

  &.uploading {
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.upload-content {
  .upload-icon {
    width: 64px;
    height: 64px;
    color: #667eea;
    margin-bottom: 16px;
  }

  .upload-text {
    font-size: 18px;
    color: #333;
    margin-bottom: 8px;
  }

  .upload-hint {
    font-size: 14px;
    color: #999;
  }
}

.upload-loading {
  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #f3f3f3;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  p {
    color: #666;
    font-size: 16px;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  margin-top: 20px;
  padding: 16px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  display: flex;
  align-items: center;
  gap: 12px;

  .error-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  span {
    flex: 1;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #c33;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 1;
  }
}

.result-container {
  margin-top: 30px;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  .success-icon {
    width: 48px;
    height: 48px;
    color: #52c41a;
  }

  h2 {
    margin: 0;
    color: #52c41a;
    font-size: 24px;
  }
}

.statistics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .stat-item {
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: center;

    &.success {
      background: #f6ffed;
      border: 1px solid #b7eb8f;

      .stat-value {
        color: #52c41a;
      }
    }

    &.warning {
      background: #fffbe6;
      border: 1px solid #ffe58f;

      .stat-value {
        color: #faad14;
      }
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }
  }
}

.details {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .detail-label {
      color: #666;
    }

    .detail-value {
      color: #333;
      font-weight: 500;
    }
  }
}

.category-stats,
.platform-stats {
  margin-bottom: 24px;

  h3 {
    color: #333;
    margin-bottom: 16px;
    font-size: 18px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.stat-card {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  text-align: center;

  .stat-card-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .stat-card-count {
    font-size: 24px;
    font-weight: bold;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;

  .btn {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;

    svg {
      width: 20px;
      height: 20px;
    }

    &.btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }

    &.btn-secondary {
      background: #f5f5f5;
      color: #333;

      &:hover {
        background: #e8e8e8;
      }
    }
  }
}

@media (max-width: 768px) {
  .upload-container {
    padding: 24px;
  }

  .statistics {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
