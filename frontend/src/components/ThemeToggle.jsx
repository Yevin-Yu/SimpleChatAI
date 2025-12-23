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

