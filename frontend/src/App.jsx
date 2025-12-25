import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { sendChatMessage } from './utils/api';
import { useTheme } from './hooks/useTheme';
import { useChatHistory } from './hooks/useChatHistory';
import { useScrollToBottom } from './hooks/useScrollToBottom';
import { isMobile } from './utils/device';
import ChatHeader from './components/ChatHeader';
import ChatSidebar from './components/ChatSidebar';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

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
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile());
  const abortControllerRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const prevChatIdRef = useRef(currentChatId);
  const { requestScroll } = useScrollToBottom(messagesEndRef, [messages, loading, currentChatId]);

  // 切换聊天时滚动到底部
  useEffect(() => {
    if (prevChatIdRef.current !== currentChatId) {
      prevChatIdRef.current = currentChatId;
      if (messages.length > 0) {
        requestScroll(true);
      }
    }
  }, [currentChatId, messages.length, requestScroll]);

  // 消息更新时滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      requestScroll();
    }
  }, [messages.length, requestScroll]);

  // 加载状态变化时也滚动
  useEffect(() => {
    if (loading && messages.length > 0) {
      requestScroll();
    }
  }, [loading, messages.length, requestScroll]);

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
    requestScroll();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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
            content: `错误：${error}`,
          };
          updateChat(chatId, updatedMessages);
          setLoading(false);
          abortControllerRef.current = null;
        },
        abortController.signal
      );
      setLoading(false);
      abortControllerRef.current = null;
    } catch (error) {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, loading, currentChatId, messages, createNewChat, updateChat]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  const handleNewChat = useCallback(() => {
    createNewChat();
    if (isMobile()) {
      setSidebarOpen(false);
    }
  }, [createNewChat]);

  const handleSwitchChat = useCallback((chatId) => {
    switchChat(chatId);
    if (isMobile()) {
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
          <div className="messages-content">
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
            <div ref={messagesEndRef} className="messages-end-spacer" />
          </div>
        </div>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStop={handleStop}
          disabled={loading}
          loading={loading}
        />
      </div>
    </div>
  );
}
