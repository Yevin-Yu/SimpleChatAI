/**
 * 解析 SSE 流式数据行
 * @param {string} line - SSE 数据行
 * @returns {Object|null} 解析后的数据对象
 */
export function parseSSELine(line) {
  if (!line.trim() || !line.startsWith('data: ')) {
    return null;
  }

  const data = line.slice(6);
  if (data === '[DONE]') {
    return { done: true };
  }

  try {
    const parsed = JSON.parse(data);
    const content = parsed.choices?.[0]?.delta?.content || '';
    return content ? { content, done: false } : null;
  } catch {
    return null;
  }
}

/**
 * 处理流式响应数据块
 * @param {Buffer} chunk - 数据块
 * @param {string} buffer - 缓冲区
 * @returns {Object} 处理结果和新的缓冲区
 */
export function processStreamChunk(chunk, buffer) {
  const newBuffer = buffer + chunk.toString();
  const lines = newBuffer.split('\n');
  const remainingBuffer = lines.pop() || '';

  const results = [];
  for (const line of lines) {
    const parsed = parseSSELine(line);
    if (parsed) {
      results.push(parsed);
    }
  }

  return { results, buffer: remainingBuffer };
}

