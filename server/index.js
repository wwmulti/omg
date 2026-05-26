const express = require('express');
const axios = require('axios');
const md5 = require('md5');
const cors = require('cors');
const { HttpsProxyAgent } = require('https-proxy-agent');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 配置文件上传
const storage = multer.memoryStorage(); // 使用内存存储
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许Excel文件
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('只支持Excel文件格式 (.xlsx, .xls)'), false);
    }
  }
});

// 从环境变量获取敏感信息
const OPERATOR_TOKEN = process.env.VITE_OPERATOR_TOKEN;
const SECRET = process.env.VITE_SECRET;
const API_BASE_URL = process.env.VITE_BASE_API_URL || 'https://api.wwapi.vip';

// 代理配置
const PROXY_ENABLED = process.env.PROXY_ENABLED === 'true';
const PROXY_URL = process.env.PROXY_URL || 'http://127.0.0.1:7897';

// 验证环境变量
if (!OPERATOR_TOKEN || !SECRET) {
  console.error('错误: 缺少必要的环境变量 VITE_OPERATOR_TOKEN 或 VITE_SECRET');
  process.exit(1);
}

// 创建axios实例，配置代理
const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 15000, // 15秒超时
  headers: {
    'Content-Type': 'application/json'
  }
};

// 如果启用代理，配置代理
if (PROXY_ENABLED) {
  const proxyAgent = new HttpsProxyAgent(PROXY_URL);
  axiosConfig.httpsAgent = proxyAgent;
  axiosConfig.httpAgent = proxyAgent;
  console.log(`🔧 代理已启用: ${PROXY_URL}`);
} else {
  console.log('🔧 代理未启用，直连模式');
}

const apiClient = axios.create(axiosConfig);

/**
 * 创建用户会话接口
 * POST /api/web/user_session
 */
app.post('/api/web/user_session', async (req, res) => {
  try {
    const { user_id, user_name, rtp } = req.body;
    
    const timestamp = Math.floor(Date.now() / 1000);
    const data = {
      operator_token: OPERATOR_TOKEN,
      rtp: rtp || 0,
      ts: timestamp,
      user_id: user_id,
      user_name: user_name,
      key: SECRET
    };
    
    // 生成签名
    const signParams = new URLSearchParams(data).toString();
    data.sign = md5(signParams);
    
    // 删除key字段
    delete data.key;
    
    // 请求第三方API
    const response = await apiClient.post('/api/web/user_session', data);
    
    // 返回响应
    res.json(response.data);
  } catch (error) {
    console.error('创建用户会话失败:', error.message);
    res.status(500).json({
      code: -1,
      message: error.response?.data?.message || '创建用户失败'
    });
  }
});

/**
 * 获取游戏URL接口
 * POST /api/web/game_url
 */
app.post('/api/web/game_url', async (req, res) => {
  try {
    const { game_code, language, type, user_id, user_token } = req.body;
    
    const timestamp = Math.floor(Date.now() / 1000);
    const data = {
      game_code: game_code,
      language: language,
      operator_token: OPERATOR_TOKEN,
      ts: timestamp,
      type: type,
      user_id: user_id,
      user_token: user_token,
      key: SECRET
    };
    
    // 生成签名
    const signParams = new URLSearchParams(data).toString();
    data.sign = md5(signParams);
    
    // 删除key字段
    delete data.key;
  
    // 请求第三方API
    const response = await apiClient.post('/api/web/game_url', data);
    
    // 返回响应
    res.json(response.data);
  } catch (error) {
    console.error('获取游戏URL失败:', error.message);
    res.status(500).json({
      code: -1,
      message: error.response?.data?.message || '获取游戏链接失败'
    });
  }
});

/**
 * 设置用户RTP接口
 * POST /api/web/set_user_rtp
 */
app.post('/api/web/set_user_rtp', async (req, res) => {
  try {
    const { rtp, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        code: -1,
        message: '缺少必要参数: user_id'
      });
    }

    // 验证RTP范围
    if (rtp > 300) {
      return res.status(400).json({
        code: -1,
        message: 'RTP不能大于300'
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const data = {
      operator_token: OPERATOR_TOKEN,
      rtp: Number(rtp),
      ts: timestamp,
      user_id: user_id,
      key: SECRET
    };

    // 生成签名
    const signParams = new URLSearchParams(data).toString();
    data.sign = md5(signParams);

    // 删除key字段
    delete data.key;

    // 请求第三方API
    const response = await apiClient.post('/api/web/set_user_rtp', data);

    // 返回响应
    res.json(response.data);
  } catch (error) {
    console.error('设置用户RTP失败:', error.message);
    res.status(500).json({
      code: -1,
      message: error.response?.data?.message || '设置用户RTP失败'
    });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Excel文件上传和解析接口
 * POST /api/upload/excel
 */
app.post('/api/upload/excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: -1,
        message: '未找到上传的文件'
      });
    }

    console.log('📄 接收到Excel文件:', req.file.originalname);

    // 从缓冲区读取Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    
    // 获取第一个工作表
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // 转换为JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ 读取到 ${rawData.length} 条记录`);
    
    // 处理数据
    const processedData = {};
    let noCompletedCount = 0;
    let jumpCount = 0;
    let successCount = 0;
    
    rawData.forEach(row => {
      const name = row.name;
      const gameCode = row.game_code;
      const type = row.type ? row.type.toString().toLowerCase() : '';
      const category = row.category ? row.category.toString().toLowerCase() : '';
      
      // 跳过开发状态为"验收中"的记录
      if (row['开发'] === '验收中') {
        noCompletedCount++;
        return;
      }
      
      // 验证必要字段
      if (!name || !gameCode || !type || !category) {
        jumpCount++;
        return;
      }
      
      // 组织数据结构
      if (!processedData[category]) {
        processedData[category] = {};
      }
      
      if (!processedData[category][type]) {
        processedData[category][type] = [];
      }
      
      processedData[category][type].push({
        name: name,
        game_code: gameCode
      });
      
      successCount++;
    });
    
    // 生成统计信息
    const statistics = {
      totalRecords: rawData.length,
      successCount: successCount,
      skippedCount: noCompletedCount + jumpCount,
      noCompletedCount: noCompletedCount,
      invalidCount: jumpCount,
      categories: {},
      platforms: {}
    };
    
    // 统计分类和平台
    Object.keys(processedData).forEach(category => {
      statistics.categories[category] = 0;
      Object.keys(processedData[category]).forEach(platform => {
        const count = processedData[category][platform].length;
        statistics.categories[category] += count;
        
        if (!statistics.platforms[platform]) {
          statistics.platforms[platform] = 0;
        }
        statistics.platforms[platform] += count;
      });
    });
    
    console.log('📊 处理结果:');
    console.log(`   总记录数: ${statistics.totalRecords}`);
    console.log(`   成功处理: ${statistics.successCount}`);
    console.log(`   跳过记录: ${statistics.skippedCount}`);
    console.log(`   - 验收中: ${statistics.noCompletedCount}`);
    console.log(`   - 无效数据: ${statistics.invalidCount}`);
    
    // 检查是否有有效数据
    if (statistics.successCount === 0) {
      console.warn('⚠️ 没有有效数据，不覆盖现有游戏数据');
      return res.json({
        code: -1,
        message: 'Excel中没有有效数据，请检查文件格式和内容',
        data: {
          games: null,
          statistics: statistics
        }
      });
    }
    
    // 保存JSON文件到public/data和dist/data目录（确保开发和生产环境都能访问）
    try {
      const publicDataDir = path.join(__dirname, '..', 'public', 'data');
      const distDataDir = path.join(__dirname, '..', 'dist', 'data');
      const jsonFileName = 'games.json';
      
      // 确保目录存在
      if (!fs.existsSync(publicDataDir)) {
        fs.mkdirSync(publicDataDir, { recursive: true });
        console.log('📁 创建目录:', publicDataDir);
      }
      
      if (!fs.existsSync(distDataDir)) {
        fs.mkdirSync(distDataDir, { recursive: true });
        console.log('📁 创建目录:', distDataDir);
      }
      
      // 生成JSON内容
      const jsonData = JSON.stringify(processedData, null, 2);
      
      // 写入public/data（开发环境）
      const publicJsonPath = path.join(publicDataDir, jsonFileName);
      fs.writeFileSync(publicJsonPath, jsonData, 'utf8');
      console.log('💾 JSON文件已保存到 public:', publicJsonPath);
      
      // 写入dist/data（生产环境）
      const distJsonPath = path.join(distDataDir, jsonFileName);
      fs.writeFileSync(distJsonPath, jsonData, 'utf8');
      console.log('💾 JSON文件已保存到 dist:', distJsonPath);
      
      console.log('📏 文件大小:', (jsonData.length / 1024).toFixed(2), 'KB');
    } catch (saveError) {
      console.error('❌ 保存JSON文件失败:', saveError.message);
      // 即使保存失败也返回成功，因为数据已经解析完成
    }
    
    // 返回处理结果
    res.json({
      code: 0,
      message: 'Excel解析成功',
      data: {
        games: processedData,
        statistics: statistics
      }
    });
    
  } catch (error) {
    console.error('❌ Excel解析失败:', error.message);
    res.status(500).json({
      code: -1,
      message: error.message || 'Excel解析失败'
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ 后端服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 API代理地址: ${API_BASE_URL}`);
});
