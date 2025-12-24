import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'simplechat-theme';
const DEFAULT_THEME = 'light';

/**
 * 主题管理 Hook
 * @returns {Object} 主题相关状态和方法
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('设置主题失败:', error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, setTheme, toggleTheme };
}

