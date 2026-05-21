import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import { useCategoryStore } from './stores/category'
import { CreateUser, getUserInfo } from './api/game'
import { showError } from './utils/toast'
import './assets/styles/main.scss'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'pt',
  fallbackLocale: 'pt',
  messages: {}
})

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)

// 先挂载应用,然后异步加载数据
app.mount('#app')

// 检查并初始化用户信息
async function initUser() {
  try {
    // getUserInfo会自动检查是否过期，如果过期会自动重新登录
    const userInfo = await getUserInfo()
    console.log('用户信息已就绪:', userInfo)
  } catch (error) {
    console.error('用户初始化失败:', error)
    // 弹出错误提示
    showError(`初始化失败: ${error.message || '未知错误'}`)
  }
}

// 在后台预加载分类数据和初始化用户
const categoryStore = useCategoryStore()
categoryStore.fetchCategories()
initUser()
