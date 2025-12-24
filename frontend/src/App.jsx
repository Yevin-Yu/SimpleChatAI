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
  const [messagesVisible, setMessagesVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile());
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevChatIdRef = useRef(currentChatId);
  const prevMessagesLengthRef = useRef(messages.length);
  const shouldScrollRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const justSwitchedChatRef = useRef(false);

  const scrollToBottom = useCallback((immediate = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scroll = (retryCount = 0) => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      
      if (maxScroll > 0) {
        container.scrollTop = maxScroll;
        
        requestAnimationFrame(() => {
          const currentMaxScroll = container.scrollHeight - container.clientHeight;
          const distanceFromBottom = Math.abs(container.scrollTop - currentMaxScroll);
          
          if (distanceFromBottom > 5 && currentMaxScroll > 0 && retryCount < 2) {
            container.scrollTop = currentMaxScroll;
            scroll(retryCount + 1);
          }
        });
      }
    };

    if (immediate) {
      scroll();
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scroll();
        });
      });
    }
  }, []);

  useEffect(() => {
    if (isInitialMountRef.current && messages.length > 0) {
      isInitialMountRef.current = false;
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (prevChatIdRef.current !== currentChatId) {
      prevChatIdRef.current = currentChatId;
      prevMessagesLengthRef.current = messages.length;
      shouldScrollRef.current = true;
      justSwitchedChatRef.current = true;
      setMessagesVisible(false);
      
      if (messages.length > 0) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToBottom(true);
            requestAnimationFrame(() => {
              setMessagesVisible(true);
              justSwitchedChatRef.current = false;
            });
          });
        });
      } else {
        requestAnimationFrame(() => {
          setMessagesVisible(true);
          justSwitchedChatRef.current = false;
        });
      }
    } else if (justSwitchedChatRef.current && messages.length > 0) {
      prevMessagesLengthRef.current = messages.length;
      shouldScrollRef.current = true;
      setMessagesVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom(true);
          requestAnimationFrame(() => {
            setMessagesVisible(true);
            justSwitchedChatRef.current = false;
          });
        });
      });
    }
  }, [currentChatId, messages.length, scrollToBottom]);

  useEffect(() => {
    if (justSwitchedChatRef.current) return;

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
          <div 
            className="messages-content"
            style={{ 
              opacity: messagesVisible ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out'
            }}
          >
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
          disabled={loading}
          loading={loading}
        />
      </div>
    </div>
  );
}
