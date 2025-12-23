import { useState, useEffect } from 'react';

const CHAT_HISTORY_KEY = 'simplechat-history';
const CURRENT_CHAT_KEY = 'simplechat-current-chat';

const createInitialChat = () => ({
  id: crypto.randomUUID(),
  title: '新对话',
  messages: [
    {
      role: 'assistant',
      content: '你好！我是你的智能聊天助手，有什么可以帮助你的吗？',
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export function useChatHistory() {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore parse error, fall back to initial chat
    }
    return [createInitialChat()];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_CHAT_KEY);
      if (savedId) return savedId;
    } catch {
      // ignore
    }
    return chats[0]?.id || null;
  });

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
    } else if (chats[0]?.id) {
      setCurrentChatId(chats[0].id);
    }
  }, [currentChatId, chats]);

  const createNewChat = () => {
    const newChat = {
      id: crypto.randomUUID(),
      title: '新对话',
      messages: [
        {
          role: 'assistant',
          content: '你好！我是你的智能聊天助手，有什么可以帮助你的吗？',
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat;
  };

  const updateChat = (chatId, messages) => {
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
  };

  const deleteChat = (chatId) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remaining = chats.filter((chat) => chat.id !== chatId);
      setCurrentChatId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const getCurrentChat = () => {
    return chats.find((chat) => chat.id === currentChatId);
  };

  const switchChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  return {
    chats,
    currentChatId,
    createNewChat,
    updateChat,
    deleteChat,
    getCurrentChat,
    switchChat,
  };
}

