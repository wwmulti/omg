/**
 * 浏览器唯一标识工具
 * 基于浏览器特征生成稳定的UUID，同一浏览器每次访问都返回相同的ID
 */

import md5 from 'md5'

/**
 * 获取或生成浏览器唯一标识（MD5格式，32位）
 * @returns {string} 32位MD5字符串
 */
export function getBrowserUUID() {
  const STORAGE_KEY = 'browser_uuid_md5'
  
  // 先从localStorage读取已存在的UUID
  try {
    const existingUUID = localStorage.getItem(STORAGE_KEY)
    if (existingUUID && isValidMD5(existingUUID)) {
      return existingUUID
    }
  } catch (e) {
    console.warn('无法访问localStorage:', e)
  }
  
  // 生成新的UUID并MD5加密后保存
  const newUUID = generateStableUUID()
  const md5UUID = md5(newUUID)
  
  try {
    localStorage.setItem(STORAGE_KEY, md5UUID)
  } catch (e) {
    console.warn('无法保存UUID到localStorage:', e)
  }
  
  return md5UUID
}

/**
 * 生成基于浏览器特征的稳定UUID
 * 结合多个浏览器特征以确保唯一性和稳定性
 * @returns {string} UUID字符串
 */
function generateStableUUID() {
  // 收集浏览器特征信息
  const features = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown'
  ]
  
  // 将特征信息组合成字符串
  const featureString = features.join('|')
  
  // 使用简单的哈希算法生成UUID
  const hash = simpleHash(featureString)
  
  // 格式化为UUID v4格式
  return formatAsUUID(hash)
}

/**
 * 简单的字符串哈希函数
 * @param {string} str - 输入字符串
 * @returns {number} 哈希值
 */
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * 将哈希值格式化为UUID格式
 * @param {number} hash - 哈希值
 * @returns {string} UUID格式的字符串
 */
function formatAsUUID(hash) {
  // 将哈希值转换为16进制字符串，并确保足够长
  let hex = Math.abs(hash).toString(16).padStart(8, '0')
  
  // 基于哈希值生成UUID的各个部分，确保稳定性
  // 构造UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuid = [
    hex.substring(0, 8),                                    // 8位
    hex.substring(4, 8) + hex.substring(0, 4),             // 4位 + 4位
    '4' + hex.substring(1, 4),                              // 版本4 + 3位
    ((parseInt(hex.substring(4, 5), 16) & 0x3) | 0x8).toString(16) + hex.substring(5, 8), // yxxx
    hex.substring(0, 4) + hex.substring(4, 8) + hex.substring(0, 4) // 12位
  ].join('-')
  
  return uuid
}

/**
 * 验证是否为有效的32位MD5格式
 * @param {string} str - 待验证的字符串
 * @returns {boolean} 是否为有效的MD5格式
 */
function isValidMD5(str) {
  const md5Regex = /^[0-9a-f]{32}$/i
  return md5Regex.test(str)
}

/**
 * 清除浏览器UUID（用于测试或重置）
 */
export function clearBrowserUUID() {
  try {
    localStorage.removeItem('browser_uuid_md5')
  } catch (e) {
    console.warn('无法清除localStorage中的UUID:', e)
  }
}

// 导出默认方法
export default getBrowserUUID