<template>
  <div class="carousel-wrapper">
    <div class="carousel-container" ref="carouselRef">
      <div 
        class="carousel-track" 
        :style="trackStyle"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- 复制一份用于无缝滚动 -->
        <div 
          v-for="(banner, index) in [...banners, ...banners]" 
          :key="index" 
          class="carousel-slide"
        >
          <div class="slide-card">
            <img :src="banner.image" :alt="'Banner ' + (index % banners.length + 1)" class="slide-image" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="carousel-dots">
      <span 
        v-for="(banner, index) in banners" 
        :key="index"
        class="dot"
        :class="{ active: currentIndex === index }"
        @click="goToSlide(index)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  banners: {
    type: Array,
    default: () => []
  }
})

const currentIndex = ref(0)
const carouselRef = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const currentTranslate = ref(0)
const prevTranslate = ref(0)
const animationOffset = ref(0)

const slidesPerView = ref(3)
const gap = 16

const updateSlidesPerView = () => {
  const width = window.innerWidth
  if (width <= 480) {
    slidesPerView.value = 1
  } else if (width <= 768) {
    slidesPerView.value = 2
  } else {
    slidesPerView.value = 3
  }
}

// 总幻灯片数（包括复制的一份）
const totalSlides = computed(() => props.banners.length * 2)
// 原始幻灯片数
const originalSlides = computed(() => props.banners.length)
// 最大索引（只显示原始部分）
const maxIndex = computed(() => Math.max(0, originalSlides.value - slidesPerView.value))

const trackStyle = computed(() => {
  const slideWidth = 100 / slidesPerView.value
  const translateX = -(currentIndex.value * slideWidth) + animationOffset.value
  return {
    transform: `translateX(${translateX}%)`,
    transition: isDragging.value ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
})

const goToSlide = (index) => {
  currentIndex.value = Math.min(index, maxIndex.value)
}

const nextSlide = () => {
  if (currentIndex.value < totalSlides.value - slidesPerView.value) {
    currentIndex.value++
    
    // 当滚动到复制的部分时，无缝跳回开头
    if (currentIndex.value >= originalSlides.value) {
      setTimeout(() => {
        isDragging.value = true // 禁用过渡动画
        currentIndex.value = currentIndex.value - originalSlides.value
        setTimeout(() => {
          isDragging.value = false // 恢复过渡动画
        }, 50)
      }, 400) // 等待过渡动画完成
    }
  } else {
    currentIndex.value = 0
  }
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    // 从开头向前滚动时，先跳到复制部分的对应位置
    setTimeout(() => {
      isDragging.value = true
      currentIndex.value = originalSlides.value - 1
      setTimeout(() => {
        isDragging.value = false
      }, 50)
    }, 400)
  }
}

const onMouseDown = (e) => {
  isDragging.value = true
  startX.value = e.pageX
  prevTranslate.value = -(currentIndex.value * (100 / slidesPerView.value))
}

const onMouseMove = (e) => {
  if (!isDragging.value) return
  const currentX = e.pageX
  const diff = currentX - startX.value
  const containerWidth = carouselRef.value?.offsetWidth || 0
  const diffPercent = (diff / containerWidth) * 100
  currentTranslate.value = prevTranslate.value + diffPercent
}

const onMouseUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  
  const containerWidth = carouselRef.value?.offsetWidth || 0
  const movedPercent = currentTranslate.value - prevTranslate.value
  const slideWidth = 100 / slidesPerView.value
  const threshold = slideWidth * 0.15
  
  if (movedPercent < -threshold) {
    nextSlide()
  } else if (movedPercent > threshold) {
    prevSlide()
  }
  
  currentTranslate.value = prevTranslate.value
}

const onTouchStart = (e) => {
  isDragging.value = true
  startX.value = e.touches[0].pageX
  prevTranslate.value = -(currentIndex.value * (100 / slidesPerView.value))
}

const onTouchMove = (e) => {
  if (!isDragging.value) return
  const currentX = e.touches[0].pageX
  const diff = currentX - startX.value
  const containerWidth = carouselRef.value?.offsetWidth || 0
  const diffPercent = (diff / containerWidth) * 100
  currentTranslate.value = prevTranslate.value + diffPercent
}

const onTouchEnd = () => {
  onMouseUp()
}

let autoPlayTimer = null

const startAutoPlay = () => {
  autoPlayTimer = setInterval(() => {
    if (!isDragging.value) {
      nextSlide()
    }
  }, 5000)
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
}

onMounted(() => {
  updateSlidesPerView()
  window.addEventListener('resize', updateSlidesPerView)
  startAutoPlay()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSlidesPerView)
  stopAutoPlay()
})
</script>

<style scoped lang="scss">
.carousel-wrapper {
  width: 100%;
  margin-bottom: 24px;
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  user-select: none;
}

.carousel-track {
  display: flex;
  width: 100%;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

.carousel-slide {
  flex: 0 0 calc(100% / 3);
  min-width: calc(100% / 3);
  padding: 0 8px;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    flex: 0 0 calc(100% / 2);
    min-width: calc(100% / 2);
    padding: 0 6px;
  }
  
  @media (max-width: 480px) {
    flex: 0 0 100%;
    min-width: 100%;
    padding: 0 4px;
  }
}

.slide-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #1a1a1a;
  
  &:hover {
  }
  
  .slide-image {
    width: 100%;
    height: 140px;
    object-fit: fill;
    display: block;

    @media (max-width: 768px) {
      height: 140px;
    }
  }
}

.carousel-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px 0 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
  
  &.active {
    width: 24px;
    border-radius: 4px;
    background-color: var(--color-select, #90f462);
  }
}
</style>
