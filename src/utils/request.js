import axios from 'axios'

// 创建axios实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 动态设置Accept-Language头部（从localStorage读取语言设置）
    config.headers['Accept-Language'] = localStorage.getItem('locale') || 'pt'
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('请求错误:', error.message)
    return Promise.reject(error)
   }
)

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {Object} params - 查询参数
 * @param {Object} config - 其他配置
 * @returns {Promise} 响应数据
 */
export function get(url, params = {}, config = {}) {
  return http.get(url, {
    params,
    ...config
  })
}

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求体数据
 * @param {Object} config - 其他配置
 * @returns {Promise} 响应数据
 */
export function post(url, data = {}, config = {}) {
  return http.post(url, data, config)
}

export default http