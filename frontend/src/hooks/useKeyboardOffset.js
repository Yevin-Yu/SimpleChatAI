import { useState, useEffect } from 'react';
import { isMobile } from '../utils/device';

/**
 * 移动端键盘偏移量 Hook
 */
export function useKeyboardOffset() {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    if (!isMobile() || !window.visualViewport) return;

    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      const offset = window.innerHeight - viewport.height;
      setBottomOffset(Math.max(0, offset));
    };

    const viewport = window.visualViewport;
    viewport.addEventListener('resize', handleViewportChange);
    viewport.addEventListener('scroll', handleViewportChange);
    handleViewportChange();

    return () => {
      viewport.removeEventListener('resize', handleViewportChange);
      viewport.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  return bottomOffset;
}

