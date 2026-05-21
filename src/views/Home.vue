<template>
  <div class="home-page">
    <div v-if="!isDataReady" class="page-loading">
      <div class="loading-spinner"></div>
    </div>
    <div v-else class="home-content">
      <Carousel :banners="banners" />

      <div class="category-tabs">
        <div 
          v-for="tab in categoryStore.categoryTabs" 
          :key="tab.id"
          class="category-tab"
          :class="{ active: categoryStore.activeCategory === tab.id }"
          @click="categoryStore.setActiveCategory(tab.id)"
        >
          <div class="tab-icon-wrapper" :style="{ '--icon-url': `url(${tab.icon})` }">
            <img :src="tab.icon" :alt="tab.label" class="tab-icon-image" />
          </div>
          <span class="tab-label">{{ tab.label }}</span>
        </div>
      </div>

      <div class="provider-filter">
        <div 
          v-for="provider in categoryStore.currentProviders" 
          :key="provider.id"
          class="provider-btn"
          :class="{ active: categoryStore.activeProvider === provider.id }"
          @click="categoryStore.setActiveProvider(provider.id)"
          :style="{ '--provider-icon-url': `url(${provider.icon})` }"
        >
          <img :src="provider.icon" :alt="provider.id" class="provider-icon" />
        </div>
      </div>

      <div class="search-section">
        <div class="search-bar">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="Search game" 
            class="search-input" 
          />
          <button 
            v-if="searchKeyword" 
            class="clear-search"
            @click="searchKeyword = ''"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <button class="filter-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M4 6h16M6 12h12M8 18h8"/>
          </svg>
        </button>
      </div>

      <div class="game-sections">
        <div 
          v-for="provider in categoryStore.currentProviders" 
          :key="provider.id"
          :id="`provider-${provider.id}`"
          class="game-section"
          v-show="shouldShowProvider(provider.id)"
        >
          <div class="section-header">
            <h2 class="section-title">{{ getProviderName(provider.id) }}</h2>
            <span class="game-count">{{ getGamesByProvider(categoryStore.activeCategory, provider.id).length }} Games</span>
          </div>
          
          <div class="game-grid">
            <GameCard 
              v-for="game in getDisplayGames(categoryStore.activeCategory, provider.id)" 
              :key="game.id"
              :game="game"
            />
          </div>

          <!-- 移动端分页按钮 -->
          <div v-if="isMobile && hasMoreGames(categoryStore.activeCategory, provider.id)" class="load-more-wrapper">
            <div class="games-count-info">
              Displaying <span class="current-count">{{ getDisplayCount(categoryStore.activeCategory, provider.id) }}</span> of <span class="total-count">{{ getGamesByProvider(categoryStore.activeCategory, provider.id).length }}</span> games
            </div>
            <div 
              class="load-more-trigger"
              @click="loadMoreGames(categoryStore.activeCategory, provider.id)"
            >
              <p class="load-more-text" style="display: flex; align-items: center;gap: 8px"> Load More <img src="/load_more_icon.png" alt="↓" class="load-more-icon" /></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <transition name="fade">
      <div 
        v-show="showBackToTop" 
        class="back-to-top"
        @click="scrollToTop"
      >
       <!-- <p class="top-text">∧</p> -->
        <img src="/top_icon.png" alt="Top" class="top-icon" />
        <!-- <p class="top-text" style="color:#fff">Top</p> -->
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import GameCard from '@/components/common/GameCard.vue'
import Carousel from '@/components/common/Carousel.vue'

const categoryStore = useCategoryStore()

// 数据是否已就绪（只需要分类数据加载完成）
const isDataReady = computed(() => {
  return categoryStore.categoryTabs.length > 0
})

// 返回顶部按钮显示状态
const showBackToTop = ref(false)

// 移动端检测
const isMobile = ref(window.innerWidth <= 768)

// 搜索关键词
const searchKeyword = ref('')

// 分页状态：记录每个分类+平台的已加载数量
const loadedGamesCount = ref({})
const GAMES_PER_PAGE = 12

// 监听搜索关键词变化，重置分页
watch(searchKeyword, () => {
  // 清空所有平台的加载计数，重新开始分页
  loadedGamesCount.value = {}
  categoryStore.currentProviders.forEach(provider => {
    const key = `${categoryStore.activeCategory}-${provider.id}`
    loadedGamesCount.value[key] = GAMES_PER_PAGE
  })
})

// 获取指定分类和平台的游戏列表
function getGamesByProvider(category, providerId) {
  const categoryGames = categoryStore.gamesByCategoryAndProvider[category]
  if (categoryGames && categoryGames[providerId]) {
    let games = categoryGames[providerId]
    
    // 如果有搜索关键词，过滤游戏列表
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase().trim()
      games = games.filter(game => 
        game.name.toLowerCase().includes(keyword)
      )
    }
    
    return games
  }
  return []
}

// 判断是否应该显示该平台（搜索时有匹配才显示）
function shouldShowProvider(providerId) {
  const games = getGamesByProvider(categoryStore.activeCategory, providerId)
  return games.length > 0
}

// 获取显示的游戏列表（移动端分页，PC端全显示）
function getDisplayGames(category, providerId) {
  const allGames = getGamesByProvider(category, providerId)
  
  // PC端显示全部
  if (!isMobile.value) {
    return allGames
  }
  
  // 移动端分页显示
  const key = `${category}-${providerId}`
  const loadedCount = loadedGamesCount.value[key] || GAMES_PER_PAGE
  return allGames.slice(0, loadedCount)
}

// 检查是否还有更多游戏
function hasMoreGames(category, providerId) {
  const allGames = getGamesByProvider(category, providerId)
  const key = `${category}-${providerId}`
  const loadedCount = loadedGamesCount.value[key] || GAMES_PER_PAGE
  return loadedCount < allGames.length
}

// 获取已加载的游戏数量
function getDisplayCount(category, providerId) {
  const allGames = getGamesByProvider(category, providerId)
  const key = `${category}-${providerId}`
  const loadedCount = loadedGamesCount.value[key] || Math.min(GAMES_PER_PAGE, allGames.length)
  return loadedCount
}

// 加载更多游戏
function loadMoreGames(category, providerId) {
  const allGames = getGamesByProvider(category, providerId)
  const key = `${category}-${providerId}`
  const currentLoaded = loadedGamesCount.value[key] || GAMES_PER_PAGE
  
  // 每次增加12个，但不超过总数
  loadedGamesCount.value[key] = Math.min(currentLoaded + GAMES_PER_PAGE, allGames.length)
}

// 监听窗口大小变化，更新移动端状态
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

// 滚动事件处理：控制返回顶部按钮显示
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// 返回顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 监听分类切换，重置分页状态
watch(() => categoryStore.activeCategory, (newCategory) => {
  // 重置搜索关键词
  searchKeyword.value = ''
  // 重置所有平台的加载数量
  loadedGamesCount.value = {}
  categoryStore.currentProviders.forEach(provider => {
    const key = `${newCategory}-${provider.id}`
    const allGames = getGamesByProvider(newCategory, provider.id)
    loadedGamesCount.value[key] = Math.min(GAMES_PER_PAGE, allGames.length)
  })
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
  
  // 初始化每个分类的加载数量
  categoryStore.currentProviders.forEach(provider => {
    const key = `${categoryStore.activeCategory}-${provider.id}`
    loadedGamesCount.value[key] = GAMES_PER_PAGE
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

const banners = [
  { image: '/banner1.jpg' },
  { image: '/banner2.jpg' },
  { image: '/banner3.jpg' },
  { image: '/banner4.jpg' }
]

function getProviderName(providerId) {
  // 从 store 中查找平台名称
  const providers = categoryStore.currentProviders
  const provider = providers.find(p => p.id === providerId)
  return provider ? provider.name : providerId
}

// 监听平台选择变化，实现平滑滚动
watch(() => categoryStore.activeProvider, async (newProvider) => {
  if (newProvider) {
    await nextTick()
    const element = document.getElementById(`provider-${newProvider}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
})
</script>

<style scoped lang="scss">
.home-page {
  width: 90%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .home-page {
    width: 100%;
  }
}

// 页面加载状态
.page-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #90f462;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .category-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    background-color: #25262b;
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 100px;
    max-width: 130px;
    height: 85px;
    color: #939393;
    font-family: Graphik, sans-serif;
    font-size: 14px;
    letter-spacing: 1px;
    font-weight: 700;
    flex: 1;
    
    &:hover {
      color: var(--color-select, #90f462);
      border: 2px solid var(--color-select, #90f462);
      
      .tab-icon-wrapper {
        border-color: transparent;
        box-shadow: none;
      }
      
      .tab-icon-image {
        opacity: 0;
      }
      
      .tab-icon-wrapper::after {
        opacity: 1;
      }
    }
    
    &.active {
      color: var(--color-select, #90f462);
      border: 2px solid var(--color-select, #90f462);
      
      .tab-icon-wrapper {
        border-color: transparent;
        box-shadow: none;
      }
      
      .tab-icon-image {
        opacity: 0;
      }
      
      .tab-icon-wrapper::after {
        opacity: 1;
      }
    }
    
    .tab-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 35px;
      border-radius: 35px;
      transition: all 0.2s;
      padding: 6px 10px;
      background-color: transparent;
      position: relative;
      border: 2px solid transparent;
      
      .tab-icon-image {
        width: 30px;
        height: 30px;
        object-fit: contain;
        transition: opacity 0.2s;
      }
      
      &::after {
        content: '';
        position: absolute;
        width: 30px;
        height: 30px;
        background-color: var(--color-select, #90f462);
        mask-image: var(--icon-url);
        -webkit-mask-image: var(--icon-url);
        mask-size: contain;
        -webkit-mask-size: contain;
        mask-repeat: no-repeat;
        -webkit-mask-repeat: no-repeat;
        mask-position: center;
        -webkit-mask-position: center;
        opacity: 0;
        transition: opacity 0.2s;
      }
    }
    
    .tab-label {
      font-size: 15px;
      font-weight: 600;
      white-space: nowrap;
      transition: color 0.2s;
    }
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    
    .category-tab {
      padding: 11px 14px;
      min-width: 70px;
      border-radius: 8px;
      min-width: 100px;
      flex: 0;
      
      .tab-icon-wrapper {
        width: 40px;
        height: 30px;
        
        .tab-icon-image,
        &::after {
          width: 30px;
          height: 30px;
        }
      }
      
      .tab-label {
        font-size: 14px;
      }
    }
  }
}

.provider-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  
  .provider-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 110px;
    height: 40px;
    background-color: #25262b;
    border: 2px solid var(--color-index, #2a3139);
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.2s;
    padding: 8px;
    line-height: 40px;
    color: #939393;
    position: relative;
    
    &:hover {
      color: var(--color-select, #90f462);
      border: 2px solid var(--color-select, #90f462) !important;
      background-color: #90f46233 !important;
      box-shadow: .5px .5px 10px var(--color-select, #90f462);
      
      .provider-icon {
        opacity: 0;
      }
      
      &::after {
        opacity: 1;
      }
    }
    
    &.active {
      color: var(--color-select, #90f462);
      border: 2px solid var(--color-select, #90f462) !important;
      background-color: #90f46233 !important;
      box-shadow: .5px .5px 10px var(--color-select, #90f462);
      
      .provider-icon {
        opacity: 0;
      }
      
      &::after {
        opacity: 1;
      }
    }
    
    .provider-icon {
      width: 60px;
      height: 30px;
      object-fit: contain;
      transition: opacity 0.2s;
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 60px;
      height: 30px;
      background-color: var(--color-select, #90f462);
      mask-image: var(--provider-icon-url);
      -webkit-mask-image: var(--provider-icon-url);
      mask-size: contain;
      -webkit-mask-size: contain;
      mask-repeat: no-repeat;
      -webkit-mask-repeat: no-repeat;
      mask-position: center;
      -webkit-mask-position: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
  }
  
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  
  .search-bar {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    background-color: #25262b;
    border: 1px solid #2a2b30;
    border-radius: 8px;
    transition: border-color 0.2s;
    
    &:focus-within {
      border-color:  #90f462;
    }
    
    .search-icon {
      color: #666;
      flex-shrink: 0;
    }
    
    .search-input {
      flex: 1;
      padding: 12px 0;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 14px;
      
      &::placeholder {
        color: #666;
      }
      
      &:focus {
        outline: none;
      }
    }
    
    .clear-search {
      padding: 4px;
      background: transparent;
      border: none;
      color: #666;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
      
      &:hover {
        color: #fff;
      }
      
      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
  
  .filter-btn {
    padding: 12px 16px;
    background-color: #25262b;
    border: 1px solid #2a2b30;
    border-radius: 8px;
    color: #888;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background-color: #2c2d32;
      color: #fff;
      border-color: #3a3b40;
    }
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 16px;
    
    .search-bar {
      padding: 0 12px;
      
      .search-input {
        padding: 10px 0;
        font-size: 13px;
      }
    }
    
    .filter-btn {
      padding: 10px 12px;
    }
  }
}

.game-sections {
  .game-section {
    margin-bottom: 20px;
    scroll-margin-top: 80px; // 为锚点滚动留出顶部空间
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  @media (max-width: 768px) {
    .game-section {
      background-color: #2e2f35;
      padding: 15px 8px;
      border-radius: 10px;
    }
  }
}

.game-section {
  .section-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 20px;
    
    .section-title {
      color: #fff;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }
    
    .game-count {
      color:  #90f462;
      font-size: 15px;
      font-weight: 500;
    }
  }
  
  .game-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: flex-start;

    @media (max-width: 768px) {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 2%;
    }
  }
}

.home-content {
  margin-top: 60px;
  // margin-left: 130px;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
}

// 返回顶部按钮样式
.back-to-top {
  position: fixed;
  right: 30px;
  bottom: 130px;
  width: 50px;
  height: 50px;
  background-color: #25262b;
  border: 2px solid  #90f462;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: breathe 2s ease-in-out infinite;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    border-color: #90f462;
    box-shadow: 0 0 15px rgba(74, 222, 128, 0.5);
  }

  .top-icon {
    width: 100%;
    object-fit: contain;
    // margin-bottom: 2px;
  }

  .top-text {
    color:  #90f462;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
}

// 淡入淡出过渡效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// 移动端适配
@media (max-width: 768px) {
  .back-to-top {
    right: 20px;
    bottom: 120px;
    width: 45px;
    height: 45px;

    .top-icon {
      width: 100%;
    }

    .top-text {
      font-size: 9px;
    }
  }

  // 分页按钮移动端样式
  .load-more-wrapper {
    margin-top: 20px;

    .games-count-info {
      font-size: 12px;
    }

    .load-more-btn {
      font-size: 13px;
    }
  }

  // 平台分类移动端横向滚动
  .provider-filter {
    overflow-x: auto;
    flex-wrap: nowrap;
    gap: 10px;
    padding-bottom: 10px;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    .provider-btn {
      flex-shrink: 0;
      width: 85px;
      height: 36px;
      
      .provider-icon {
        width: 50px;
        height: 25px;
      }
      
      &::after {
        width: 50px;
        height: 25px;
      }
    }
  }

  // 分页加载按钮移动端样式（呼吸动画效果）
  .load-more-wrapper {
    margin-top: 20px;

    .games-count-info {
      font-size: 12px;
    }

    .load-more-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      color: #90f462;
      font-weight: 600;
      cursor: pointer;
      
      .load-more-text,
      .load-more-icon {
        animation: breathe 2s ease-in-out infinite;
      }
      
      .load-more-icon {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

// 分页加载按钮样式
.load-more-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 30px;

  .games-count-info {
    color: #888;
    font-size: 14px;
    font-weight: 500;

    .current-count {
      color:  #90f462;
      font-weight: 600;
    }

    .total-count {
      color:  #90f462;
      font-weight: 600;
    }
  }

  .load-more-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #90f462;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s ease;
  
    .load-more-text,
    .load-more-icon {
      animation: breathe 2s ease-in-out infinite;
    }
  
    .load-more-icon {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
  
    &:hover {
      opacity: 0.8;
    }
  }
}

</style>
