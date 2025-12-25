import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { sendChatMessage } from './utils/api';
import { useTheme } from './hooks/useTheme';
import { useChatHistory } from './hooks/useChatHistory';
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
  const messagesContainerRef = useRef(null);
  const prevChatIdRef = useRef(currentChatId);
  const lastMessageContentRef = useRef('');
  
  // 切换聊天时滚动到底部
  useEffect(() => {
    if (prevChatIdRef.current !== currentChatId) {
      prevChatIdRef.current = currentChatId;
      lastMessageContentRef.current = ''; // 重置内容引用
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        lastMessageContentRef.current = lastMessage?.content || '';
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);
      }
    }
  }, [currentChatId, messages.length]);

  // AI 输出内容时自动滚动
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const currentContent = lastMessage?.content || '';
    
    // 检测内容变化（AI 正在输出）
    if (currentContent !== lastMessageContentRef.current) {
      lastMessageContentRef.current = currentContent;
      
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }
  }, [messages]);

  // 加载状态变化时也滚动
  useEffect(() => {
    if (loading && messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [loading, messages.length]);

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
    
    // 发送消息后立即滚动
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

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
        <div 
          ref={messagesContainerRef}
          className="messages-container"
        >
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
