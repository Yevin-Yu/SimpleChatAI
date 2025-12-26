import { useState, useEffect, useCallback } from 'react';
import { THEME_KEY, DEFAULT_THEME } from '../constants';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // 静默处理
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}

