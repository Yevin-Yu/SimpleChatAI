import { useMemo, memo, useCallback } from 'react';

function ChatInput({ value, onChange, onSend, disabled, loading }) {
  const isMobile = useMemo(() => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
           (typeof window !== 'undefined' && window.innerWidth < 768);
  }, []);
  
  const placeholder = isMobile 
    ? '输入消息...' 
    : '输入消息... (按 Enter 发送，Shift+Enter 换行)';

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  return (
    <div className="input-container">
      <div className="input-wrapper">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          rows={2}
          disabled={disabled}
          className="message-input"
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="send-button"
          aria-label="发送消息"
        >
          {loading ? (
            <span className="loading-dots">...</span>
          ) : (
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
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;

