import { useRef } from 'react';
import { isMobile } from '../utils/device';
import { useKeyboardOffset } from '../hooks/useKeyboardOffset';

const PLACEHOLDER = {
  mobile: '输入消息...',
  desktop: '输入消息... (按 Enter 发送，Shift+Enter 换行)',
};

export default function ChatInput({ value, onChange, onSend, onStop, disabled, loading }) {
  const containerRef = useRef(null);
  const bottomOffset = useKeyboardOffset();
  
  const placeholder = isMobile() ? PLACEHOLDER.mobile : PLACEHOLDER.desktop;
  const containerStyle = isMobile() ? { bottom: `${bottomOffset}px` } : {};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="input-container"
      style={containerStyle}
    >
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
          onClick={loading ? onStop : onSend}
          disabled={!loading && (!value.trim() || disabled)}
          className="send-button"
          aria-label={loading ? '暂停回答' : '发送消息'}
        >
          {loading ? (
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
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
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

