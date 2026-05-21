<template>
  <nav class="app-sidebar">
    <div class="sidebar-logo">
      <img src="/b1fdfdfb.DczOQaec.png" alt="OMG Logo" class="logo-image" />
    </div>
    <div 
      v-for="item in categoryStore.categoryTabs" 
      :key="item.id"
      class="menu-item"
      :class="{ active: categoryStore.activeCategory === item.id }"
      @click="categoryStore.setActiveCategory(item.id)"
    >
      <div class="menu-icon" :style="{ '--icon-url': `url(${item.icon})` }">
        <img :src="item.icon" :alt="item.label" class="menu-icon-image" />
      </div>
      <span class="menu-label">{{ item.label }}</span>
    </div>
  </nav>
</template>

<script setup>
import { useCategoryStore } from '@/stores/category'

const categoryStore = useCategoryStore()
</script>

<style scoped lang="scss">
.app-sidebar {
  background-color: #1b1c20;
  padding: 0;
  border-right: 2px solid #373c41;
  width: 130px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  font-family: Graphik, sans-serif;
  font-size: 14px;
  letter-spacing: 1px;
  font-weight: 700;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  padding: 30px 20px 16px 20px;
  margin-bottom: 12px;
  
  .logo-image {
    height: 32px;
    width: auto;
    display: block;
  }
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: #939393;
  border: none;
  
  &:hover {
    color: var(--color-select, #90f462);
    
    .menu-icon {
      border: 2px solid var(--color-select, #90f462) !important;
      box-shadow: 0 0 10px var(--color-select, #90f462);
    }
    
    .menu-icon-image {
      opacity: 0;
    }
    
    .menu-icon::after {
      opacity: 1;
    }
  }
  
  &.active {
    color: var(--color-select, #90f462);
    
    .menu-icon {
      border: 2px solid var(--color-select, #90f462) !important;
      animation: breathe 2s ease-in-out infinite;
    }
    
    .menu-icon-image {
      opacity: 0;
    }
    
    .menu-icon::after {
      opacity: 1;
    }
    
    .menu-label {
      animation: breathe-text 2s ease-in-out infinite;
    }
  }
  
  .menu-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 70px;
    height: 45px;
    border-radius: 35px;
    transition: all 0.2s;
    padding: 6px 20px 3px;
    background-color: transparent;
    position: relative;
    
    .menu-icon-image {
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
  
  .menu-label {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    text-align: center;
  }
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px var(--color-select, #90f462);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 15px var(--color-select, #90f462), 0 0 25px rgba(144, 244, 98, 0.4);
  }
}

@keyframes breathe-text {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
