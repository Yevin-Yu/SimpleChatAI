import { useState, useRef, useEffect } from 'react';
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
  role: 'assistant',
  content: '你好！我是你的智能聊天助手，有什么可以帮助你的吗？',
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

  useEffect(() => {
    const currentChat = getCurrentChat();
    if (currentChat) {
      setMessages(currentChat.messages);
    } else if (chats.length === 0) {
      const newChat = createNewChat();
      setMessages(newChat.messages);
    } else {
      setMessages([INITIAL_MESSAGE]);
    }
  }, [currentChatId, chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      updateChat(currentChatId, messages);
    }
  }, [messages, currentChatId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!currentChatId) {
      const newChat = createNewChat();
      setMessages(newChat.messages);
    }

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const aiMessageIndex = newMessages.length;
    setMessages([...newMessages, { role: 'assistant', content: '' }]);

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
  };

  const handleNewChat = () => {
    const newChat = createNewChat();
    setMessages(newChat.messages);
    if (window.innerWidth < 769) {
      setSidebarOpen(false);
    }
  };

  const handleSwitchChat = (chatId) => {
    switchChat(chatId);
    if (window.innerWidth < 769) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="app">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSwitchChat={handleSwitchChat}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="chat-container">
        <ChatHeader
          themeToggle={<ThemeToggle theme={theme} onToggle={toggleTheme} />}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="messages-container">
          {messages.map((message, index) => (
            <Message
              key={index}
              message={message}
              isTyping={loading && index === messages.length - 1 && message.role === 'assistant'}
            />
          ))}
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
