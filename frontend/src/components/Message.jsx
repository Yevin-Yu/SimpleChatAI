import { memo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

function Message({ message, isTyping }) {
  const isUser = message.role === 'user';
  const isEmpty = !message.content || message.content.trim() === '';
  const showThinking = !isUser && isTyping && isEmpty;

  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        <div className={`message-text ${isTyping ? 'has-typing' : ''} ${showThinking ? 'thinking' : ''}`}>
          {isUser ? (
            <>
              {message.content}
              {isTyping && <span className="typing-indicator">|</span>}
            </>
          ) : (
            <>
              {showThinking ? (
                <span className="thinking-text">
                  正在思考
                  <span className="thinking-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </span>
              ) : (
                <MarkdownRenderer content={message.content} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Message);

