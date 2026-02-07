import { useMemo } from 'react';

/**
 * Returns true on touch-primary devices (phones/tablets).
 * Uses media query matching — no state, no effect, no re-renders.
 */
export function useIsTouchDevice(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }, []);
}
