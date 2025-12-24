function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isDev = import.meta.env.DEV;
  
  if (isDev) {
    return '/api';
  }
  
  if (envUrl) {
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl.endsWith('/api') || envUrl.endsWith('/api/')
        ? envUrl.replace(/\/$/, '')
        : `${envUrl.replace(/\/$/, '')}/api`;
    }
    return envUrl;
  }
  
  return 'http://localhost:3001';
}

const API_BASE_URL = getApiBaseUrl();

function parseSSELine(line) {
  if (!line.startsWith('data: ')) {
    return null;
  }

  try {
    const data = JSON.parse(line.slice(6));
    if (data.error) return { error: data.error };
    if (data.content) return { content: data.content };
    if (data.done) return { done: true };
    return null;
  } catch {
    return null;
  }
}

export async function sendChatMessage(messages, onChunk, onError) {
  try {
    const apiUrl = API_BASE_URL.endsWith('/') 
      ? `${API_BASE_URL}chat` 
      : `${API_BASE_URL}/chat`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const parsed = parseSSELine(line);
        if (parsed?.error) {
          onError(parsed.error);
          return;
        }
        if (parsed?.content) {
          onChunk(parsed.content);
        }
        if (parsed?.done) {
          return;
        }
      }
    }
  } catch (error) {
    onError(error.message);
  }
}

