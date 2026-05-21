<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">
        <img src="/b1fdfdfb.DczOQaec.png" alt="TTMG Logo" class="logo-image" />
      </div>
    </div>
    <div class="header-right">
      <div class="language-selector" @click="toggleDropdown" ref="languageSelector">
        <img :src="currentLang.icon" :alt="currentLang.name" class="lang-icon" />
        <span class="lang-name">{{ currentLang.name }}</span>
        <span class="globe-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </span>
        <div v-if="showDropdown" class="language-dropdown">
          <div class="dropdown-item" v-for="lang in languages" :key="lang.code" @click="selectLanguage(lang)">
            <img :src="lang.icon" :alt="lang.name" class="dropdown-icon" />
            <span class="lang-name">{{ lang.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCategoryStore } from '@/stores/category'

const { locale } = useI18n()
const categoryStore = useCategoryStore()
const showDropdown = ref(false)
const languageSelector = ref(null)

// 默认语言为葡萄牙语
const DEFAULT_LANG = 'pt'

const languages = [
  // { code: 'zh', name: '中文', icon: '/51d16119.Z72PyPOO.png' },
  { code: 'en', name: 'English', icon: '/lang_en.png' },
 /*  { code: 'es', name: 'Español', icon: '/placeholder_flag.png' },
  { code: 'vi', name: 'Tiếng Việt', icon: '/placeholder_flag.png' },
  { code: 'it', name: 'Italiano', icon: '/placeholder_flag.png' },
  { code: 'da', name: 'Dansk', icon: '/placeholder_flag.png' },
  { code: 'fr', name: 'Français', icon: '/placeholder_flag.png' }, */
  { code: 'pt', name: 'Português', icon: '/d3d759ff.B0ZKLRtf.png' }
]

const currentLang = computed(() => {
  return languages.find(lang => lang.code === locale.value) || languages.find(lang => lang.code === DEFAULT_LANG)
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectLanguage = async (lang) => {
  // 更新i18n locale
  locale.value = lang.code
  // 存储到localStorage
  localStorage.setItem('locale', lang.code)
  console.log('Selected language:', lang)
  
  // 重新请求接口获取最新数据
  await categoryStore.fetchCategories()
  
  showDropdown.value = false
}

const handleClickOutside = (event) => {
  if (languageSelector.value && !languageSelector.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // 从localStorage读取语言设置，如果没有则使用默认值
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && languages.find(lang => lang.code === savedLocale)) {
    locale.value = savedLocale
  } else {
    locale.value = DEFAULT_LANG
    localStorage.setItem('locale', DEFAULT_LANG)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: #1b1c20;
  border-bottom: 2px solid #2a2b30;
  position: fixed;
  top: 0;
  left: 130px;
  right: 0;
  z-index: 999;
}

.header-left {
  display: none;
  align-items: center;
}

@media (min-width: 769px) {
  .app-header {
    justify-content: flex-end;
    left: 130px;
  }
  
  .header-left {
    display: none;
  }
}

@media (max-width: 768px) {
  .app-header {
    justify-content: space-between;
    left: 0;
    
    .header-left {
      display: flex;
    }
  }
}

.logo {
  .logo-image {
    height: 40px;
    width: auto;
    display: block;
  }
}

@media (max-width: 768px) {
  .logo {
    .logo-image {
      height: auto;
      width: 70px;
      display: block;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.language-selector {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background-color: #25262b;
  border: 1px solid #2a2a3e;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #2a2a3e;
    border-color: #3a3a4e;
  }
  
  .flag-icon {
    font-size: 18px;
  }
  
  .lang-icon {
    width: 24px;
    height: 16px;
    object-fit: contain;
    border-radius: 2px;
  }
  
  .lang-name {
    color: #ccc;
    font-size: 14px;
  }
  
  .globe-icon {
    color: #888;
    display: flex;
    align-items: center;
  }
  
  .language-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 180px;
    background-color: #25262b;
    border: 1px solid #2a2b30;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #3a3b40;
      border-radius: 3px;
    }
    
    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background-color: #2c2d32;
        }
        
        .dropdown-icon {
          width: 24px;
          height: 16px;
          object-fit: contain;
          border-radius: 2px;
        }
        
        .lang-name {
          color: #fff;
          font-size: 14px;
        }
    }
  }
}
</style>
