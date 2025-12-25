import express from 'express';
import axios from 'axios';
import { config } from '../config.js';
import { processStreamChunk, parseSSELine } from '../utils/streamParser.js';
import { setSSEHeaders, sendSSEData, getErrorMessage } from '../utils/errorHandler.js';

const router = express.Router();

/**
 * 准备发送给 API 的消息列表，确保包含系统提示
 */
function prepareMessages(userMessages) {
  const hasSystemMessage = userMessages.length > 0 && userMessages[0]?.role === 'system';
  
  if (hasSystemMessage) {
    return userMessages;
  }
  
  // 在消息列表开头插入系统提示
  const systemMessage = {
    role: 'system',
    content: config.deepseek.systemPrompt,
  };
  
  return [systemMessage, ...userMessages];
}

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '消息格式错误，请提供有效的消息数组' });
    }

    if (!config.deepseek.apiKey) {
      return res.status(500).json({ error: '服务器配置错误：未设置 Deepseek API Key' });
    }

    setSSEHeaders(res);

    // 准备消息，自动注入系统提示
    const preparedMessages = prepareMessages(messages);

    const response = await axios.post(
      config.deepseek.apiUrl,
      {
        model: config.deepseek.model,
        messages: preparedMessages,
        temperature: config.deepseek.temperature,
        max_tokens: config.deepseek.maxTokens,
        stream: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.deepseek.apiKey}`,
        },
        responseType: 'stream',
      }
    );

    let buffer = '';

    response.data.on('data', (chunk) => {
      const { results, buffer: newBuffer } = processStreamChunk(chunk, buffer);
      buffer = newBuffer;

      for (const result of results) {
        if (result.done) {
          sendSSEData(res, { done: true });
          res.end();
          return;
        }
        if (result.content) {
          sendSSEData(res, result);
        }
      }
    });

    response.data.on('end', () => {
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          const parsed = parseSSELine(line);
          if (parsed?.content) {
            sendSSEData(res, parsed);
          }
        }
      }
      sendSSEData(res, { done: true });
      res.end();
    });

    response.data.on('error', (error) => {
      console.error('流式响应错误:', error);
      sendSSEData(res, { error: '流式响应中断', done: true });
      res.end();
    });
  } catch (error) {
    console.error('Deepseek API 调用错误:', error.response?.data || error.message);
    setSSEHeaders(res);
    sendSSEData(res, { error: getErrorMessage(error), done: true });
    res.end();
  }
});

export default router;

