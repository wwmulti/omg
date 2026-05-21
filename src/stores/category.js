import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 图片基础URL
const IMAGES_URL = import.meta.env.VITE_IMAGES_URL || 'https://uploads.wwapi.vip'

// 默认空数据结构
const defaultGamesData = {}

export const useCategoryStore = defineStore('category', () => {
  const activeCategory = ref('')
  const activeProvider = ref(null)
  const categoryTabs = ref([])
  const loading = ref(true)  // 初始为loading状态
  const error = ref(null)
  
  // 平台列表（按分类存储）
  const providersByCategory = ref({})
  
  // 游戏列表（按分类和平台存储）
  const gamesByCategoryAndProvider = ref({})

  const currentProviders = computed(() => {
    return providersByCategory.value[activeCategory.value] || []
  })

  // 游戏数据（动态加载）
  const gamesData = ref({ ...defaultGamesData })
  
  // 从 JSON 文件加载分类列表
  async function fetchCategories() {
    loading.value = true
    error.value = null
    
    // 清空旧数据，确保重新加载
    categoryTabs.value = []
    providersByCategory.value = {}
    gamesByCategoryAndProvider.value = {}
    
    try {
      // 尝试动态加载 games.json
      const response = await fetch('/data/games.json')
      if (response.ok) {
        gamesData.value = await response.json()
        console.log('✅ 成功加载游戏数据')
      } else {
        console.warn('⚠️ 未找到 games.json，使用空数据。请上传 Excel 文件生成数据。')
        gamesData.value = { ...defaultGamesData }
      }
    } catch (err) {
      console.warn('⚠️ 加载 games.json 失败:', err.message)
      console.log('💡 提示：访问 /cj9txr9OZfriMEkA 上传 Excel 文件生成游戏数据')
      gamesData.value = { ...defaultGamesData }
    }
    activeCategory.value = ''
    activeProvider.value = null
    
    try {
      // 从 gamesData.value 中提取大分类
      const categories = Object.keys(gamesData.value)
      
      // 转换数据格式
      categoryTabs.value = categories.map((category, index) => ({
        id: category,
        label: category.charAt(0).toUpperCase() + category.slice(1), // 大写显示
        icon: `/icons/${category.charAt(0).toUpperCase() + category.slice(1)}.png`
      }))
      
      // 设置默认选中的分类
      if (categoryTabs.value.length > 0) {
        activeCategory.value = categoryTabs.value[0].id
        // 立即关闭loading，让页面先显示分类
        loading.value = false
        // 异步获取第一个分类的平台和游戏数据
        loadCategoryData(activeCategory.value)
      } else {
        loading.value = false
      }
    } catch (err) {
      error.value = err.message || '加载分类失败'
      console.error('加载分类异常:', err)
      loading.value = false
    }
  }
  
  /**
   * 更新游戏数据（上传后调用）
   * @param {Object} newGamesData - 新的游戏数据
   */
  function updateGamesData(newGamesData) {
    gamesData.value = newGamesData
    // 重新加载分类
    fetchCategories()
  }
  
  // 从 JSON 文件加载分类数据（平台和游戏）
  function loadCategoryData(categoryId) {
    error.value = null
    try {
      const categoryData = gamesData.value[categoryId]
      if (!categoryData) {
        console.warn(`未找到分类: ${categoryId}`)
        return
      }
      
      // 提取平台列表
      const platformNames = Object.keys(categoryData)
      const providers = platformNames.map(platformName => ({
        id: platformName,
        name: platformName.toUpperCase(),
        icon: `/icons/${platformName.toUpperCase()}.png`
      }))
      
      // 保存平台列表
      providersByCategory.value[categoryId] = providers
      
      // 按平台整理游戏列表，并拼接图片地址
      const gamesByProvider = {}
      platformNames.forEach(platformName => {
        const games = categoryData[platformName]
        gamesByProvider[platformName] = games.map(game => ({
          id: String(game.game_code),
          code: String(game.game_code),
          name: game.name,
          // 拼接图片地址: IMAGES_URL + uploads/平台名称/游戏game_code.png
          cover: `${IMAGES_URL}/uploads_002/images/${platformName}/${game.game_code}.png`,
          game_type_id: categoryId,
          platform_id: platformName
        }))
      })
      
      // 保存游戏列表
      gamesByCategoryAndProvider.value[categoryId] = gamesByProvider
    } catch (err) {
      error.value = err.message || '加载数据失败'
      console.error('加载数据异常:', err)
    }
  }

  function setActiveCategory(id) {
    activeCategory.value = id
    activeProvider.value = null
    // 切换分类时加载该分类的平台和游戏数据
    if (!providersByCategory.value[id]) {
      loadCategoryData(id)
    } else {
      // 如果数据已存在，立即关闭loading状态
      loading.value = false
    }
  }

  function setActiveProvider(id) {
    activeProvider.value = activeProvider.value === id ? null : id
  }

  return {
    activeCategory,
    activeProvider,
    categoryTabs,
    currentProviders,
    providersByCategory,
    gamesByCategoryAndProvider,
    loading,
    error,
    fetchCategories,
    loadCategoryData,
    updateGamesData,
    setActiveCategory,
    setActiveProvider
  }
})
