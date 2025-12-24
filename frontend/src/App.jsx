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

const MOBILE_BREAKPOINT = 769;

/**
 * 主应用组件
 */
export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    chats,
    currentChatId,
    currentChat,
    createNewChat,
    updateChat,
    deleteChat,
    switchChat,
  } = useChatHistory();

  const messages = useMemo(() => currentChat?.messages || [], [currentChat?.messages]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth >= MOBILE_BREAKPOINT;
  });
  
  const messagesEndRef = useRef(null);
  const prevChatIdRef = useRef(currentChatId);
  const prevMessagesLengthRef = useRef(messages.length);
  const shouldScrollRef = useRef(false);

  // 切换聊天时重置滚动状态
  useEffect(() => {
    if (prevChatIdRef.current !== currentChatId) {
      prevChatIdRef.current = currentChatId;
      prevMessagesLengthRef.current = messages.length;
      shouldScrollRef.current = true;
    }
  }, [currentChatId, messages.length]);

  // 智能滚动：只在需要时滚动
  useEffect(() => {
    const shouldScroll = shouldScrollRef.current || 
                        messages.length > prevMessagesLengthRef.current ||
                        (loading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant');
    
    if (shouldScroll) {
      prevMessagesLengthRef.current = messages.length;
      shouldScrollRef.current = false;
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    let chatId = currentChatId;
    if (!chatId) {
      const newChat = createNewChat();
      chatId = newChat.id;
    }

    const userMessage = { 
      id: crypto.randomUUID(),
      role: 'user', 
      content: input.trim(),
      timestamp: Date.now()
    };
    
    const newMessages = [...messages, userMessage];
    const aiMessageIndex = newMessages.length;
    const messagesWithAI = [...newMessages, { 
      id: crypto.randomUUID(),
      role: 'assistant', 
      content: '',
      timestamp: Date.now()
    }];

    updateChat(chatId, messagesWithAI);
    setInput('');
    setLoading(true);
    shouldScrollRef.current = true;

    let accumulatedContent = '';

    try {
      await sendChatMessage(
        newMessages.map((msg) => ({ role: msg.role, content: msg.content })),
        (content) => {
          accumulatedContent += content;
          const updatedMessages = [...messagesWithAI];
          updatedMessages[aiMessageIndex] = {
            ...updatedMessages[aiMessageIndex],
            content: accumulatedContent,
          };
          updateChat(chatId, updatedMessages);
        },
        (error) => {
          const updatedMessages = [...messagesWithAI];
          updatedMessages[aiMessageIndex] = {
            ...updatedMessages[aiMessageIndex],
            content: `抱歉，发生了错误：${error}`,
          };
          updateChat(chatId, updatedMessages);
          setLoading(false);
        }
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [input, loading, currentChatId, messages, createNewChat, updateChat]);

  const handleNewChat = useCallback(() => {
    createNewChat();
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      setSidebarOpen(false);
    }
  }, [createNewChat]);

  const handleSwitchChat = useCallback((chatId) => {
    switchChat(chatId);
    if (window.innerWidth < MOBILE_BREAKPOINT) {
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
        <ChatHeader onMenuClick={handleToggleSidebar} />
        <div className="messages-container">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isTypingMessage = loading && isLastMessage && message.role === 'assistant';
            return (
              <Message
                key={message.id || `msg-${index}`}
                message={message}
                isTyping={isTypingMessage}
              />
            );
          })}
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
