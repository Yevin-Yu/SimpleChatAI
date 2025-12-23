/**
 * 获取友好的错误消息
 */
export function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return 'API Key 无效，请检查配置';
  }
  if (error.response?.status === 429) {
    return '请求过于频繁，请稍后再试';
  }
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  return '服务器错误，请稍后再试';
}

/**
 * 设置 SSE 响应头
 */
export function setSSEHeaders(res) {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
  }
}

/**
 * 发送 SSE 数据
 */
export function sendSSEData(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

