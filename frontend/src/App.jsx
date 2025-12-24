import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { sendChatMessage } from './utils/api';
import { useTheme } from './hooks/useTheme';
import { useChatHistory } from './hooks/useChatHistory';
import ChatHeader from './components/ChatHeader';
import ChatSidebar from './components/ChatSidebar';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const INITIAL_MESSAGE = {
  id: crypto.randomUUID(),
  role: 'assistant',
  content: '你好！我是你的智能聊天助手，有什么可以帮助你的吗？',
  timestamp: Date.now(),
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    chats,
    currentChatId,
    createNewChat,
    updateChat,
    deleteChat,
    getCurrentChat,
    switchChat,
  } = useChatHistory();

  const [messages, setMessages] = useState(() => {
    const currentChat = getCurrentChat();
    return currentChat?.messages || [INITIAL_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 769;
  });
  const messagesEndRef = useRef(null);
  const isUpdatingFromChatRef = useRef(false);
  const prevChatIdRef = useRef(currentChatId);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevLastMessageContentRef = useRef('');

  // 当切换聊天时，从 chat 中加载消息
  useEffect(() => {
    // 只有当 currentChatId 改变时才从 chat 加载消息
    if (prevChatIdRef.current !== currentChatId) {
      prevChatIdRef.current = currentChatId;
      const currentChat = getCurrentChat();
      if (currentChat) {
        isUpdatingFromChatRef.current = true;
        setMessages(currentChat.messages);
      } else if (chats.length === 0) {
        const newChat = createNewChat();
        isUpdatingFromChatRef.current = true;
        setMessages(newChat.messages);
      } else {
        isUpdatingFromChatRef.current = true;
        setMessages([INITIAL_MESSAGE]);
      }
    }
  }, [currentChatId]);

  // 只在消息数量增加或 AI 回复内容更新时滚动（避免输入时闪烁）
  useEffect(() => {
    const currentLength = messages.length;
    const lastMessage = messages[messages.length - 1];
    const lastMessageContent = lastMessage?.content || '';
    const isNewMessage = currentLength > prevMessagesLengthRef.current;
    const isAIMessageUpdate = loading && 
                              lastMessage?.role === 'assistant' && 
                              lastMessageContent !== prevLastMessageContentRef.current;

    // 只在以下情况滚动：
    // 1. 新消息添加（消息数量增加）
    // 2. AI 正在回复且内容更新
    // 3. 切换聊天时（消息从 0 变为有消息）
    if (isNewMessage || isAIMessageUpdate || (currentLength > 0 && prevMessagesLengthRef.current === 0)) {
      prevMessagesLengthRef.current = currentLength;
      prevLastMessageContentRef.current = lastMessageContent;
      
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      prevMessagesLengthRef.current = currentLength;
      if (lastMessage) {
        prevLastMessageContentRef.current = lastMessageContent;
      }
    }
  }, [messages, loading]);

  // 将 messages 同步到 chat，但避免循环更新
  useEffect(() => {
    // 如果是从 chat 加载的消息，不需要同步回去
    if (isUpdatingFromChatRef.current) {
      isUpdatingFromChatRef.current = false;
      return;
    }

    if (currentChatId && messages.length > 0) {
      const currentChat = getCurrentChat();
      const chatMessages = currentChat?.messages || [];
      
      // 优化：先比较长度，再比较最后一条消息（避免频繁的 JSON.stringify）
      if (chatMessages.length !== messages.length) {
        updateChat(currentChatId, messages);
      } else if (chatMessages.length > 0) {
        // 只比较最后一条消息（最常变化的部分）
        const lastChatMsg = chatMessages[chatMessages.length - 1];
        const lastMsg = messages[messages.length - 1];
        if (!lastChatMsg || !lastMsg || 
            lastChatMsg.content !== lastMsg.content || 
            lastChatMsg.role !== lastMsg.role ||
            lastChatMsg.id !== lastMsg.id) {
          updateChat(currentChatId, messages);
        }
      }
    }
  }, [messages, currentChatId]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    if (!currentChatId) {
      const newChat = createNewChat();
      setMessages(newChat.messages);
    }

    const userMessage = { 
      id: crypto.randomUUID(),
      role: 'user', 
      content: input.trim(),
      timestamp: Date.now()
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const aiMessageIndex = newMessages.length;
    setMessages([...newMessages, { 
      id: crypto.randomUUID(),
      role: 'assistant', 
      content: '',
      timestamp: Date.now()
    }]);

    let accumulatedContent = '';

    await sendChatMessage(
      newMessages.map((msg) => ({ role: msg.role, content: msg.content })),
      (content) => {
        accumulatedContent += content;
        setMessages((prev) => {
          const updated = [...prev];
          updated[aiMessageIndex] = {
            role: 'assistant',
            content: accumulatedContent,
          };
          return updated;
        });
      },
      (error) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[aiMessageIndex] = {
            role: 'assistant',
            content: `抱歉，发生了错误：${error}`,
          };
          return updated;
        });
        setLoading(false);
      }
    );

    setLoading(false);
  }, [input, loading, messages, currentChatId, createNewChat]);

  const handleNewChat = useCallback(() => {
    const newChat = createNewChat();
    setMessages(newChat.messages);
    if (window.innerWidth < 769) {
      setSidebarOpen(false);
    }
  }, [createNewChat]);

  const handleSwitchChat = useCallback((chatId) => {
    switchChat(chatId);
    if (window.innerWidth < 769) {
      setSidebarOpen(false);
    }
  }, [switchChat]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="app">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSwitchChat={handleSwitchChat}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        themeToggle={<ThemeToggle theme={theme} onToggle={toggleTheme} />}
      />
      <div className="chat-container">
        <ChatHeader
          onMenuClick={handleToggleSidebar}
        />
        <div className="messages-container">
          {useMemo(() => messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isTypingMessage = loading && isLastMessage && message.role === 'assistant';
            return (
              <Message
                key={message.id || `msg-${index}-${message.timestamp || Date.now()}`}
                message={message}
                isTyping={isTypingMessage}
              />
            );
          }), [messages, loading])}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={loading}
          loading={loading}
        />
      </div>
    </div>
  );
}
