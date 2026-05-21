import { post } from '@/utils/request'
import { getBrowserUUID } from '@/utils/browser_uuid'

/**
 * 创建用户会话
 * @returns {Promise<Object>} 包含user_id, token, rtp的用户信息
 */
export async function CreateUser() {
  // 使用浏览器UUID作为user_id和user_name
  const browserUUID = getBrowserUUID()
  
  // 构造请求数据（不再包含secret）
  const data = {
    user_id: browserUUID,
    user_name: browserUUID,
    rtp: 0 // 默认rtp值为0
  }
  
  try {
    // 发送到后端代理服务器
    const response = await post('/api/web/user_session', data)
    
    if (response.code !== 0) {
      throw new Error(response.message || '创建用户失败')
    }
    
    // 保存获取到的用户信息和过期时间（1天）
    const userData = {
      user_id: response.data.user_id,
      token: response.data.token,
      rtp: response.data.rtp,
      expire_time: Date.now() + 1 * 24 * 60 * 60 * 1000 // 1天后过期
    }
    
    // 将用户信息保存到localStorage
    localStorage.setItem('user_info', JSON.stringify(userData))
    
    return userData
  } catch (error) {
    console.error('创建用户请求失败:', error)
    throw error
  }
}

/**
 * 获取已保存的用户信息
 * 如果用户信息不存在或已过期，自动重新创建用户
 * @returns {Promise<Object|null>} 用户信息对象或null
 */
export async function getUserInfo() {
  try {
    const userInfoStr = localStorage.getItem('user_info')
    
    // 检查是否有用户信息
    if (!userInfoStr) {
      console.log('未找到用户信息，开始创建新用户...')
      return await CreateUser()
    }
    
    const userInfo = JSON.parse(userInfoStr)
    
    // 检查是否过期
    if (userInfo.expire_time && Date.now() > userInfo.expire_time) {
      console.log('用户信息已过期，开始重新登录...')
      // 过期了，清除旧的用户信息并重新创建
      localStorage.removeItem('user_info')
      return await CreateUser()
    }
    
    return userInfo
  } catch (e) {
    console.warn('获取用户信息失败:', e)
    // 如果出错，尝试重新创建用户
    try {
      localStorage.removeItem('user_info')
      return await CreateUser()
    } catch (createError) {
      console.error('重新创建用户失败:', createError)
      throw createError
    }
  }
}

/**
 * 获取游戏URL
 * @param {string} gameCode - 游戏代码
 * @param {string} language - 语言代码
 * @param {string} platformType - 游戏平台类型（小写）
 * @returns {Promise<string>} 游戏URL
 */
export async function getGameUrl(gameCode, language, platformType) {
  try {
    // 获取用户信息，如果不存在或过期会自动重新创建
    const userInfo = await getUserInfo()
    
    if (!userInfo || !userInfo.user_id || !userInfo.token) {
      throw new Error('用户初始化失败')
    }
    
    // 构造请求数据（不再包含secret和operator_token）
    const data = {
      game_code: gameCode,
      language: language,
      type: platformType,
      user_id: userInfo.user_id,
      user_token: userInfo.token
    }
    
    // 发送到后端代理服务器
    const response = await post('/api/web/game_url', data)
    
    if (response.code !== 0) {
      throw new Error(response.message || '获取游戏链接失败')
    }
    
    // 返回游戏URL
    return response.data.url
  } catch (error) {
    console.error('获取游戏URL失败:', error)
    throw error
  }
}

/**
 * 清除用户信息
 */
export function clearUserInfo() {
  try {
    localStorage.removeItem('user_info')
  } catch (e) {
    console.warn('无法清除用户信息:', e)
  }
}

export default {
  CreateUser,
  getUserInfo,
  getGameUrl,
  clearUserInfo
}