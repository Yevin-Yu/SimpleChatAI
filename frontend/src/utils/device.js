import { MOBILE_BREAKPOINT } from '../constants';

export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

