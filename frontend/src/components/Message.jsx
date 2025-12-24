import { memo, useState, useEffect } from 'react';
import '../styles/code-highlight.css';

/**
 * Markdown 组件配置
 */
const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    if (inline) {
      return <code {...props}>{children}</code>;
    }
    return <code className={className} {...props}>{children}</code>;
  },
  pre({ children, ...props }) {
    return <pre {...props}>{children}</pre>;
  },
  p({ children, ...props }) {
    return <p {...props}>{children}</p>;
  },
};

/**
 * Markdown 渲染器组件（懒加载）
 */
function MarkdownRenderer({ content }) {
  const [MarkdownComponent, setMarkdownComponent] = useState(null);

  useEffect(() => {
    Promise.all([
      import('react-markdown'),
      import('remark-gfm'),
      import('rehype-highlight'),
    ]).then(([ReactMarkdown, remarkGfm, rehypeHighlight]) => {
      setMarkdownComponent(() => (props) => (
        <ReactMarkdown.default
          remarkPlugins={[remarkGfm.default]}
          rehypePlugins={[rehypeHighlight.default]}
          components={markdownComponents}
          {...props}
        />
      ));
    });
  }, []);

  if (!MarkdownComponent) {
    return <div>加载中...</div>;
  }

  return <MarkdownComponent>{content}</MarkdownComponent>;
}

/**
 * 消息组件
 * @param {Object} props
 * @param {Object} props.message - 消息对象
 * @param {boolean} props.isTyping - 是否正在输入
 */
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

