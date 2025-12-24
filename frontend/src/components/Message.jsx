import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import '../styles/code-highlight.css';

// 缓存 ReactMarkdown 组件配置，避免每次渲染都重新创建
const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    if (inline) {
      return (
        <code {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre({ children, ...props }) {
    return <pre {...props}>{children}</pre>;
  },
  p({ children, ...props }) {
    return <p {...props}>{children}</p>;
  },
};

function Message({ message, isTyping }) {
  const isUser = useMemo(() => message.role === 'user', [message.role]);
  const isEmpty = useMemo(() => !message.content || message.content.trim() === '', [message.content]);
  const showThinking = useMemo(() => !isUser && isTyping && isEmpty, [isUser, isTyping, isEmpty]);

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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Message, (prevProps, nextProps) => {
  // 自定义比较函数：只有 message 或 isTyping 真正改变时才重新渲染
  // 返回 true 表示 props 相同，不需要重新渲染（React.memo 的行为）
  // 返回 false 表示 props 不同，需要重新渲染
  const messageChanged = (
    prevProps.message.id !== nextProps.message.id ||
    prevProps.message.content !== nextProps.message.content ||
    prevProps.message.role !== nextProps.message.role
  );
  const typingChanged = prevProps.isTyping !== nextProps.isTyping;
  
  // 如果消息或 typing 状态都没改变，返回 true（不重新渲染）
  return !messageChanged && !typingChanged;
});

