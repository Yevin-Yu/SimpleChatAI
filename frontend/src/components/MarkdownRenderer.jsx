import { useState, useEffect } from 'react';
import '../styles/code-highlight.css';

const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    return <code className={inline ? undefined : className} {...props}>{children}</code>;
  },
  pre({ children, ...props }) {
    return <pre {...props}>{children}</pre>;
  },
  p({ children, ...props }) {
    return <p {...props}>{children}</p>;
  },
};

/**
 * Markdown 渲染组件（懒加载）
 */
export default function MarkdownRenderer({ content }) {
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

  if (!MarkdownComponent) return null;
  return <MarkdownComponent>{content}</MarkdownComponent>;
}

