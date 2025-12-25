import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 3001;
const DEFAULT_DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEEPSEEK_SYSTEM_PROMPT = '请用最少、最精准的文字回答。直接给出答案，不要多余的客套话和解释。';

/**
 * 获取允许的前端地址列表
 */
function getAllowedOrigins() {
  if (process.env.FRONTEND_URLS) {
    return process.env.FRONTEND_URLS.split(',').map(url => url.trim());
  }
  if (process.env.FRONTEND_URL) {
    return [process.env.FRONTEND_URL];
  }
  return [DEFAULT_FRONTEND_URL];
}

/**
 * CORS 源验证函数
 */
function corsOrigin(origin, callback) {
  const allowedOrigins = getAllowedOrigins();
  
  if (!origin) {
    return callback(null, true);
  }
  
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}

export const config = {
  port: process.env.PORT || DEFAULT_PORT,
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    apiUrl: process.env.DEEPSEEK_API_URL || DEFAULT_DEEPSEEK_API_URL,
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: process.env.DEEPSEEK_SYSTEM_PROMPT || DEEPSEEK_SYSTEM_PROMPT,
  },
  cors: {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type'],
  },
};

