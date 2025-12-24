import { useState, useEffect, useMemo, useCallback } from 'react';

const CHAT_HISTORY_KEY = 'simplechat-history';
const CURRENT_CHAT_KEY = 'simplechat-current-chat';

const INITIAL_ASSISTANT_MESSAGE = {
  id: crypto.randomUUID(),
  role: 'assistant',
  content: '你好！我是你的智能聊天助手，有什么可以帮助你的吗？',
  timestamp: Date.now(),
};

/**
 * 创建初始聊天对象
 */
function createInitialChat() {
  return {
    id: crypto.randomUUID(),
    title: '新对话',
    messages: [INITIAL_ASSISTANT_MESSAGE],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 聊天历史管理 Hook
 * @returns {Object} 聊天历史相关状态和方法
 */
export function useChatHistory() {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // 忽略解析错误，使用默认值
    }
    return [createInitialChat()];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_CHAT_KEY);
      if (savedId) return savedId;
    } catch {
      // 忽略错误
    }
    return chats[0]?.id || null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('保存聊天历史失败:', error);
    }
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      try {
        localStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
      } catch (error) {
        console.error('保存当前聊天ID失败:', error);
      }
    } else if (chats[0]?.id) {
      setCurrentChatId(chats[0].id);
    }
  }, [currentChatId, chats]);

  const currentChat = useMemo(() => {
    return chats.find((chat) => chat.id === currentChatId);
  }, [chats, currentChatId]);

  const createNewChat = useCallback(() => {
    const newChat = {
      id: crypto.randomUUID(),
      title: '新对话',
      messages: [{
        ...INITIAL_ASSISTANT_MESSAGE,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat;
  }, []);

  const updateChat = useCallback((chatId, messages) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          const title = messages.find((m) => m.role === 'user')?.content?.slice(0, 20) || '新对话';
          return {
            ...chat,
            messages,
            title,
            updatedAt: Date.now(),
          };
        }
        return chat;
      })
    );
  }, []);

  const deleteChat = useCallback((chatId) => {
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== chatId);
      if (currentChatId === chatId) {
        setCurrentChatId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [currentChatId]);

  const switchChat = useCallback((chatId) => {
    setCurrentChatId(chatId);
  }, []);

  return {
    chats,
    currentChatId,
    currentChat,
    createNewChat,
    updateChat,
    deleteChat,
    switchChat,
  };
}

