export default function ChatHeader({ themeToggle, onMenuClick }) {
  return (
    <div className="chat-header">
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick} aria-label="打开侧边栏">
          ☰
        </button>
        <h1>
          <span>SimpleChat</span>
          <span className="header-subtitle">基于 Deepseek 的智能聊天助手</span>
        </h1>
      </div>
      {themeToggle}
    </div>
  );
}

