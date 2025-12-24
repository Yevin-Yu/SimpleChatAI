import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000,
  },
  cors: {
    origin: process.env.FRONTEND_URLS 
      ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
      : (process.env.FRONTEND_URL || 'http://localhost:5173'),
    credentials: true,
  },
};

