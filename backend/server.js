import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import chatRouter from './routes/chat.js';

const app = express();

app.use(cors(config.cors));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

app.use('/api/chat', chatRouter);

app.listen(config.port, () => {
  console.log(`🚀 服务器运行在 http://localhost:${config.port}`);
  console.log(`📝 健康检查: http://localhost:${config.port}/health`);
});
