import '@testing-library/jest-dom';
import { vi } from 'vitest';

// matchMedia polyfill (needed by some hooks/components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),    // deprecated but some libs still call it
    removeListener: vi.fn(), // deprecated but some libs still call it
    dispatchEvent: vi.fn()
  })
});

// requestAnimationFrame stubs (for animation-based utilities)
if (!('requestAnimationFrame' in window)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number;
}
if (!('cancelAnimationFrame' in window)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
}
