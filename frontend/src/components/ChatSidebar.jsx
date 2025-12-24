import { useMemo } from 'react';

const MOBILE_BREAKPOINT = 769;

/**
 * 格式化时间戳为相对时间
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

/**
 * 聊天侧边栏组件
 * @param {Object} props
 * @param {Array} props.chats - 聊天列表
 * @param {string} props.currentChatId - 当前聊天ID
 * @param {Function} props.onNewChat - 新建聊天回调
 * @param {Function} props.onSwitchChat - 切换聊天回调
 * @param {Function} props.onDeleteChat - 删除聊天回调
 * @param {boolean} props.isOpen - 是否打开
 * @param {Function} props.onToggle - 切换打开状态回调
 * @param {React.ReactNode} props.themeToggle - 主题切换组件
 */
export default function ChatSidebar({ chats, currentChatId, onNewChat, onSwitchChat, onDeleteChat, isOpen, onToggle, themeToggle }) {
  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
  }, []);

  return (
    <>
      <div className={`chat-sidebar ${isMobile ? (isOpen ? 'open' : '') : 'open'}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="sidebar-title-icon">💬</span>
            <span className="sidebar-title-text">对话列表</span>
          </div>
          <div className="sidebar-header-actions">
            <button className="new-chat-button" onClick={onNewChat} title="新对话">
              +
            </button>
            {isMobile && (
              <button className="sidebar-close" onClick={onToggle}>
                ×
              </button>
            )}
          </div>
        </div>
        <div className="sidebar-content">
          {chats.length === 0 ? (
            <div className="empty-chats">
              <p>暂无聊天记录</p>
              <p className="hint">点击"新对话"开始聊天</p>
            </div>
          ) : (
            <div className="chat-list">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                  onClick={() => onSwitchChat(chat.id)}
                >
                  <div className="chat-item-content">
                    <div className="chat-item-title">{chat.title}</div>
                    <div className="chat-item-time">{formatTime(chat.updatedAt)}</div>
                  </div>
                  <button
                    className="chat-item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    title="删除对话"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sidebar-footer">
          {themeToggle && (
            <div className="sidebar-footer-item">
              {themeToggle}
            </div>
          )}
          <a
            href="https://github.com/Yevin-Yu/SimpleChatAI"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-github-link"
            title="GitHub 仓库"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}

