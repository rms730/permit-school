import { useCallback } from 'react';

import { scrollToAnchor } from './scrollToAnchor';

/**
 * Custom hook to handle anchor link clicks with proper scroll offset
 */
export function useAnchorScroll() {
  const handleAnchorClick = useCallback((href: string) => {
    if (href.startsWith('#')) {
      // Prevent default anchor behavior and use our custom scroll
      scrollToAnchor(href);
      return false; // Prevent default behavior
    }
    return true; // Allow default behavior for non-anchor links
  }, []);

  return handleAnchorClick;
}
