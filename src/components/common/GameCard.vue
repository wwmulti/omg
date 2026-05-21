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
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { getGameUrl } from '@/api/game'
import { showError } from '@/utils/toast'

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
})

const categoryStore = useCategoryStore()
const loading = ref(false)
const imageRef = ref(null)
let observer = null

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

// 处理点击事件
const handleClick = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    // 获取当前语言
    const language = localStorage.getItem('locale') || 'pt'
    
    // 调用API获取游戏URL
    const gameUrl = await getGameUrl(
      props.game.code,      // game_code
      language,             // language
      props.game.platform_id // type (平台小写)
    )
    
    // 判断是PC端还是移动端
    const isMobile = window.innerWidth <= 768
    
    if (isMobile) {
      // 移动端：当前页面打开
      window.location.href = gameUrl
    } else {
      // PC端：新窗口打开
      window.open(gameUrl, '_blank')
    }
  } catch (error) {
    console.error('获取游戏地址异常:', error)
    showError(error.message || '游戏初始化失败')
  } finally {
    loading.value = false
  }
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
