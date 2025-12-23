import { useState } from 'react';

export default function ChatSidebar({ chats, currentChatId, onNewChat, onSwitchChat, onDeleteChat, isOpen, onToggle }) {
  const formatTime = (timestamp) => {
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
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 769;

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
      </div>
    </>
  );
}

