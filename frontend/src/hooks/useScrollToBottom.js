import { useRef, useCallback, useEffect } from 'react';

/**
 * 自动滚动到底部的 Hook
 */
export function useScrollToBottom(endRef, dependencies = []) {
  const shouldScrollRef = useRef(false);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (!endRef.current) return;
    
    const scroll = () => {
      if (!endRef.current) return;
      
      // 初始挂载或切换聊天时使用 immediate 滚动
      if (isInitialMountRef.current) {
        endRef.current.scrollIntoView({ behavior: 'auto' });
        isInitialMountRef.current = false;
      } else if (shouldScrollRef.current) {
        endRef.current.scrollIntoView({ behavior: 'smooth' });
        shouldScrollRef.current = false;
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scroll);
    });
  }, dependencies);

  const requestScroll = useCallback((immediate = false) => {
    if (immediate) {
      isInitialMountRef.current = true;
    }
    shouldScrollRef.current = true;
  }, []);

  return { requestScroll };
}

