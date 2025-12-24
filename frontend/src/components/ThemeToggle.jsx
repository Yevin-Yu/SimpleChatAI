/**
 * 主题切换组件
 * @param {Object} props
 * @param {string} props.theme - 当前主题
 * @param {Function} props.onToggle - 切换主题回调
 */
export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="theme-toggle"
      aria-label="切换主题"
      title={`当前主题: ${theme === 'light' ? '亮色' : '暗色'}`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

