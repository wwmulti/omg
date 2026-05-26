<template>
  <div class="game-card" @click="handleClick">
    <div class="game-image-wrapper">
      <div class="game-image" :style="game.cover ? {} : { background: game.gradient }">
        <img 
          v-if="game.cover" 
          :data-src="game.cover" 
          :alt="game.name" 
          class="game-img lazy-image"
          ref="imageRef"
        />
      </div>
      <div class="game-overlay">
        <img src="/3bce67a5.BIZ_5IJi.png" alt="play" class="play-icon-img" />
      </div>
      <!-- 加载遮罩 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>
    <div class="game-info">
      <h3 class="game-title">{{ game.name }}</h3>
      <p class="game-provider">{{ getProviderName(game.platform_id) }}</p>
    </div>
  </div>
  
  <!-- RTP选择弹窗 - 使用Teleport传送到body -->
  <Teleport to="body">
    <div v-if="showRtpModal" class="rtp-modal-overlay" @click="closeRtpModal">
      <div class="rtp-modal" @click.stop>
        <div class="rtp-modal-header">
          <span class="rtp-modal-title">选择RTP</span>
          <button class="rtp-modal-close" @click="closeRtpModal">×</button>
        </div>
        <div class="rtp-modal-content">
          <div 
            v-for="option in rtpOptions" 
            :key="option.value"
            class="rtp-option"
            @click="selectRtp(option)"
          >
            <span class="rtp-label">{{ option.label }}</span>
            <span class="rtp-value">{{ option.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { getGameUrl, setUserRtp } from '@/api/game'
import { showError, showSuccess } from '@/utils/toast'

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
})

const categoryStore = useCategoryStore()
const loading = ref(false)
const imageRef = ref(null)
const showRtpModal = ref(false)
let observer = null

// RTP选项配置
const rtpOptions = [
  { label: 'BIN WIN', value: 300 },
  { label: '150', value: 150 },
  { label: '120', value: 120 },
  { label: '100', value: 100 },
  { label: '97', value: 97 },
  { label: '95', value: 95 },
  { label: '90', value: 90 },
  { label: '85', value: 85 },
  { label: '80', value: 80 },
  { label: '75', value: 75 },
  { label: '70', value: 70 },
  { label: '60', value: 60 },
  { label: '50', value: 50 },
  { label: '40', value: 40 },
  { label: '20', value: 20 },
  { label: '0', value: 0 }
]

// 懒加载图片
const setupLazyLoad = () => {
  if (!imageRef.value) return
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.getAttribute('data-src')
        if (src) {
          img.src = src
          img.classList.add('loaded')
        }
        observer.unobserve(img)
      }
    })
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  })
  
  observer.observe(imageRef.value)
}

onMounted(() => {
  setupLazyLoad()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// 获取平台名称
const getProviderName = (platformId) => {
  const providers = categoryStore.currentProviders
  const provider = providers.find(p => p.id === platformId)
  return provider ? `${provider.name.toUpperCase()} Games` : ''
}

// 关闭RTP弹窗
const closeRtpModal = () => {
  showRtpModal.value = false
}

// 选择RTP
const selectRtp = async (option) => {
  try {
    loading.value = true
    closeRtpModal()
    
    // 调用API设置RTP
    await setUserRtp(option.value)
    showSuccess(`RTP设置为: ${option.label}`)
    
    // 设置成功后进入游戏
    await enterGame()
  } catch (error) {
    console.error('设置RTP失败:', error)
    showError('RTP设置失败')
    loading.value = false
  }
}

// 进入游戏
const enterGame = async () => {
  try {
    // 获取当前语言
    const language = localStorage.getItem('locale') || 'pt'
    
    // 调用API获取游戏URL
    const gameUrl = await getGameUrl(
      props.game.code,
      language,
      props.game.platform_id
    )
    
    // 判断是PC端还是移动端
    const isMobile = window.innerWidth <= 768
    
    if (isMobile) {
      window.location.href = gameUrl
    } else {
      window.open(gameUrl, '_blank')
    }
  } catch (error) {
    console.error('获取游戏地址异常:', error)
    showError(error.message || '游戏初始化失败')
  } finally {
    loading.value = false
  }
}

// 处理点击事件
const handleClick = () => {
  if (loading.value) return
  
  // 显示RTP选择弹窗
  showRtpModal.value = true
}
</script>

<style scoped lang="scss">
.game-card {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 12px;
  overflow: hidden;
  background-color: #25262b;
  width: 200px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    flex-shrink: initial;
  }

  .game-image-wrapper {
    width: 200px;
    height: 156px;
    position: relative;
    overflow: visible;
    border-radius: 12px;

    @media (max-width: 768px) {
      width: 100%;
      height: auto;
      aspect-ratio: 4/3;
    }

    .game-image {
      position: relative;
      width: 200px;
      height: 156px;

      @media (max-width: 768px) {
        width: 100%;
        height: 100%;
      }

      .game-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: 12px;
        opacity: 0;
        transition: opacity 0.3s ease;
        
        &.loaded {
          opacity: 1;
        }
      }
    }

    .game-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      border-radius: 12px;
      z-index: 100;

      .play-icon-img {
        width: 48px;
        height: 48px;
        object-fit: contain;
      }
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      border-radius: 12px;
      
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: #90f462;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }
  }

  &:hover {
    transform: translateY(-4px);
  }

  &:hover .game-image-wrapper .game-overlay {
    opacity: 1;
    visibility: visible;

    .play-icon-img {
      animation: breathe 1.5s ease-in-out infinite;
    }
  }

  .game-info {
    padding: 5px 5px 8px 5px;

    .game-title {
      color: #fff;
      font-size: 15px;
      font-weight: 500;
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .game-provider {
      color: #666;
      font-size: 12px;
      margin: 0;
    }
  }
}

// RTP弹窗样式 - 全局样式
.rtp-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  backdrop-filter: blur(4px);
  
  .rtp-modal {
    background: linear-gradient(135deg, #1e1f24 0%, #25262b 100%);
    border-radius: 16px;
    width: 85%;
    max-width: 320px;
    max-height: 70vh;
    overflow: hidden;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .rtp-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      
      .rtp-modal-title {
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      
      .rtp-modal-close {
        background: rgba(255, 255, 255, 0.05);
        border: none;
        color: #999;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
        line-height: 1;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          transform: rotate(90deg);
        }
      }
    }
    
    .rtp-modal-content {
      max-height: calc(70vh - 56px);
      overflow-y: auto;
      padding: 6px 0;
      
      &::-webkit-scrollbar {
        width: 4px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 2px;
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }
      }
      
      .rtp-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 18px;
        margin: 2px 8px;
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 8px;
        
        &:hover {
          background: rgba(144, 244, 98, 0.1);
          transform: translateX(4px);
        }
        
        &:active {
          transform: translateX(4px) scale(0.98);
        }
        
        .rtp-label {
          color: #e0e0e0;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .rtp-value {
          color: #90f462;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Courier New', monospace;
          transition: all 0.2s;
        }
        
        &:hover {
          .rtp-label {
            color: #fff;
          }
          
          .rtp-value {
            color: #a8ff78;
            text-shadow: 0 0 8px rgba(144, 244, 98, 0.4);
          }
        }
      }
    }
  }
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// 移动端隐藏遮罩效果
@media (max-width: 768px) {
  .game-card {
    &:hover {
      transform: none;

      .game-overlay {
        opacity: 0;
        visibility: hidden;
      }
    }
  }
}
</style>
