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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const abortControllerRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevChatIdRef = useRef(currentChatId);
  const lastMessageContentRef = useRef('');
  const shouldAutoScrollRef = useRef(true);
  const scrollTimeoutRef = useRef(null);

  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < 50;
  }, []);

  const scrollToBottom = useCallback((immediate = false, force = false) => {
    if (!force && !shouldAutoScrollRef.current) return;
    if (!messagesEndRef.current) return;
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: immediate ? 'auto' : 'smooth' 
        });
      });
    });
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const nearBottom = isNearBottom();
      setShowScrollButton(!nearBottom);
      shouldAutoScrollRef.current = nearBottom;

      scrollTimeoutRef.current = setTimeout(() => {
        scrollTimeoutRef.current = null;
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isNearBottom]);

  useEffect(() => {
    if (prevChatIdRef.current !== currentChatId) {
      prevChatIdRef.current = currentChatId;
      lastMessageContentRef.current = '';
      shouldAutoScrollRef.current = true;
      setShowScrollButton(false);
      
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        lastMessageContentRef.current = lastMessage?.content || '';
        setTimeout(() => scrollToBottom(true), 100);
      }
    }
  }, [currentChatId, messages.length, scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0 || !shouldAutoScrollRef.current) return;
    
    const lastMessage = messages[messages.length - 1];
    const currentContent = lastMessage?.content || '';
    
    if (currentContent !== lastMessageContentRef.current) {
      lastMessageContentRef.current = currentContent;
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (loading && messages.length > 0 && shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [loading, messages.length, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const chatId = currentChatId || createNewChat().id;
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
    shouldAutoScrollRef.current = true;
    setShowScrollButton(false);
    scrollToBottom(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let accumulatedContent = '';

    try {
      await sendChatMessage(
        newMessages.map(({ role, content }) => ({ role, content })),
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
    } catch {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, loading, currentChatId, messages, createNewChat, updateChat, scrollToBottom]);

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

  const handleScrollToBottom = useCallback(() => {
    shouldAutoScrollRef.current = true;
    scrollToBottom(true, true);
    setShowScrollButton(false);
  }, [scrollToBottom]);

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
        <div className="input-wrapper-container">
          {showScrollButton && (
            <button
              className="scroll-to-bottom-button"
              onClick={handleScrollToBottom}
              aria-label="滚动到底部"
              title="滚动到底部"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </button>
          )}
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
    </div>
  );
}
