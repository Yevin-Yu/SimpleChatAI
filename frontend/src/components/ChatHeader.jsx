import { memo } from 'react';

function ChatHeader({ onMenuClick }) {
  return (
    <div className="chat-header">
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick} aria-label="打开侧边栏">
          ☰
        </button>
        <h1>
          <span>SimpleChat</span>
          <span className="header-subtitle">使用 Deepseek API</span>
        </h1>
      </div>
    </div>
  );
}

export default memo(ChatHeader);

