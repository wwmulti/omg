import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllGames } from '@/api/game'

// 默认空数据结构
const defaultGamesData = {}

export const useCategoryStore = defineStore('category', () => {
  const activeCategory = ref('')
  const activeProvider = ref(null)
  const categoryTabs = ref([])
  const loading = ref(true)  // 初始为loading状态
  const error = ref(null)
  const customerServiceLink = ref('')

  // 平台列表（按分类存储）
  const providersByCategory = ref({})

  // 游戏列表（按分类和平台存储）
  const gamesByCategoryAndProvider = ref({})

  const currentProviders = computed(() => {
    return providersByCategory.value[activeCategory.value] || []
  })

  // 游戏数据
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
      // 从API获取游戏数据
      gamesData.value = await getAllGames()
      console.log('✅ 成功加载游戏数据')
    } catch (err) {
      console.warn('⚠️ 获取游戏数据失败:', err.message)
      gamesData.value = { ...defaultGamesData }
    }
    activeCategory.value = ''
    activeProvider.value = null
    
    try {
      // 从 gamesData.value.games 中提取大分类
      const gamesList = gamesData.value.games || []
      customerServiceLink.value = gamesData.value.customer_service || ''

      // 转换数据格式
      categoryTabs.value = gamesList.map((item) => ({
        id: item.name,
        label: item.name.charAt(0).toUpperCase() + item.name.slice(1), // 大写显示
        icon: item.icon || `/icons/${item.name.charAt(0).toUpperCase() + item.name.slice(1)}.png`
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
  
  // 从 API 数据加载分类数据（平台和游戏）
  function loadCategoryData(categoryId) {
    error.value = null
    try {
      // 从 gamesData.value.games 中找到对应分类
      const gamesList = gamesData.value.games || []
      const categoryData = gamesList.find(item => item.name === categoryId)

      if (!categoryData) {
        console.warn(`未找到分类: ${categoryId}`)
        return
      }

      // 提取平台列表
      const platforms = categoryData.platforms || []
      const providers = platforms.map(platform => ({
        id: platform.name,
        name: platform.name.toUpperCase(),
        icon: platform.icon || `/icons/${platform.name.toUpperCase()}.png`
      }))

      // 保存平台列表
      providersByCategory.value[categoryId] = providers

      // 按平台整理游戏列表
      const gamesByProvider = {}
      platforms.forEach(platform => {
        gamesByProvider[platform.name] = platform.games.map(game => ({
          id: String(game.game_code),
          code: String(game.game_code),
          name: game.name,
          cover: game.icon,
          game_type_id: categoryId,
          platform_id: platform.name
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
    setActiveProvider,
    customerServiceLink
  }
})
