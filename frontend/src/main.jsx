import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const THEME_KEY = 'simplechat-theme';
const DEFAULT_THEME = 'dark';

// 初始化主题
try {
  const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', savedTheme);
} catch (error) {
  console.error('初始化主题失败:', error);
  document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

