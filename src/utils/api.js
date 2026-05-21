import http from './http'

// 分类相关API
export const categoryApi = {
  // 获取游戏分类列表
  getGameTypeList() {
    return http.get('/api/platform/getGameTypeList')
  },
  
  // 获取平台列表和游戏列表
  getPlatformAndGames(gameTypeId, page = 1, pageSize = 10000) {
    return http.get('/api/platform/platformAndAllGames', {
      params: {
        game_type_id: gameTypeId,
        page,
        page_size: pageSize
      }
    })
  }
}

// 游戏相关API
export const gameApi = {
  // 获取真实游戏地址
  getGameUrl(gameId) {
    return http.get('/api/game/getGameUrl', {
      params: { game_id: gameId }
    })
  }
}

export default {
  categoryApi,
  gameApi
}