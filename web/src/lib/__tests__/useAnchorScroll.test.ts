import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnchorScroll } from '../useAnchorScroll';
import { scrollToAnchor } from '../scrollToAnchor';

// Mock the scrollToAnchor function
vi.mock('../scrollToAnchor', () => ({
  scrollToAnchor: vi.fn(),
}));

describe('useAnchorScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a function', () => {
    const { result } = renderHook(() => useAnchorScroll());
    expect(typeof result.current).toBe('function');
  });

  it('handles anchor links starting with #', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    const result1 = handleAnchorClick('#section1');
    expect(scrollToAnchor).toHaveBeenCalledWith('#section1');
    expect(result1).toBe(false);

    const result2 = handleAnchorClick('#top');
    expect(scrollToAnchor).toHaveBeenCalledWith('#top');
    expect(result2).toBe(false);

    const result3 = handleAnchorClick('#contact');
    expect(scrollToAnchor).toHaveBeenCalledWith('#contact');
    expect(result3).toBe(false);
  });

  it('allows default behavior for non-anchor links', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    const result1 = handleAnchorClick('https://example.com');
    expect(scrollToAnchor).not.toHaveBeenCalled();
    expect(result1).toBe(true);

    const result2 = handleAnchorClick('/about');
    expect(scrollToAnchor).not.toHaveBeenCalled();
    expect(result2).toBe(true);

    const result3 = handleAnchorClick('mailto:test@example.com');
    expect(scrollToAnchor).not.toHaveBeenCalled();
    expect(result3).toBe(true);
  });

  it('handles empty string', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    const result1 = handleAnchorClick('');
    expect(scrollToAnchor).not.toHaveBeenCalled();
    expect(result1).toBe(true);
  });

  it('handles links with query parameters', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    const result1 = handleAnchorClick('https://example.com?param=value');
    expect(scrollToAnchor).not.toHaveBeenCalled();
    expect(result1).toBe(true);

    const result2 = handleAnchorClick('/page?param=value#section');
    expect(scrollToAnchor).not.toHaveBeenCalled();
    expect(result2).toBe(true);
  });

  it('handles links with fragments that are not at the start', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    const result1 = handleAnchorClick('https://example.com#section');
    expect(scrollToAnchor).not.toHaveBeenCalled();
    expect(result1).toBe(true);

    const result2 = handleAnchorClick('/page#section');
    expect(scrollToAnchor).not.toHaveBeenCalled();
    expect(result2).toBe(true);
  });

  it('handles various anchor link formats', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    const anchorLinks = [
      '#section1',
      '#top',
      '#contact',
      '#about-us',
      '#faq',
      '#123',
      '#section-1',
      '#section_1',
    ];

    anchorLinks.forEach((link) => {
      const result = handleAnchorClick(link);
      expect(scrollToAnchor).toHaveBeenCalledWith(link);
      expect(result).toBe(false);
    });

    expect(scrollToAnchor).toHaveBeenCalledTimes(anchorLinks.length);
  });

  it('handles various non-anchor link formats', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    const nonAnchorLinks = [
      'https://example.com',
      'http://localhost:3000',
      '/about',
      '/contact',
      'mailto:test@example.com',
      'tel:+1234567890',
      'javascript:void(0)',
      'data:text/html,<html></html>',
    ];

    nonAnchorLinks.forEach((link) => {
      const result = handleAnchorClick(link);
      expect(result).toBe(true);
    });

    expect(scrollToAnchor).not.toHaveBeenCalled();
  });

  it('handles edge cases', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    // Single hash
    const result1 = handleAnchorClick('#');
    expect(scrollToAnchor).toHaveBeenCalledWith('#');
    expect(result1).toBe(false);

    // Hash with spaces
    const result2 = handleAnchorClick('# section with spaces');
    expect(scrollToAnchor).toHaveBeenCalledWith('# section with spaces');
    expect(result2).toBe(false);

    // Hash with special characters
    const result3 = handleAnchorClick('#section-1_2.3');
    expect(scrollToAnchor).toHaveBeenCalledWith('#section-1_2.3');
    expect(result3).toBe(false);
  });

  it('maintains consistent behavior across multiple calls', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    // Test anchor link multiple times
    for (let i = 0; i < 3; i++) {
      const result = handleAnchorClick('#section1');
      expect(result).toBe(false);
    }

    // Test non-anchor link multiple times
    for (let i = 0; i < 3; i++) {
      const result = handleAnchorClick('https://example.com');
      expect(result).toBe(true);
    }

    expect(scrollToAnchor).toHaveBeenCalledTimes(3);
  });

  it('handles mixed link types in sequence', () => {
    const { result } = renderHook(() => useAnchorScroll());
    const handleAnchorClick = result.current;

    const links = [
      { href: '#section1', expectedResult: false, shouldCallScroll: true },
      { href: 'https://example.com', expectedResult: true, shouldCallScroll: false },
      { href: '#top', expectedResult: false, shouldCallScroll: true },
      { href: '/about', expectedResult: true, shouldCallScroll: false },
      { href: '#contact', expectedResult: false, shouldCallScroll: true },
    ];

    links.forEach(({ href, expectedResult, shouldCallScroll }) => {
      const result = handleAnchorClick(href);
      expect(result).toBe(expectedResult);
    });

    expect(scrollToAnchor).toHaveBeenCalledTimes(3);
    expect(scrollToAnchor).toHaveBeenCalledWith('#section1');
    expect(scrollToAnchor).toHaveBeenCalledWith('#top');
    expect(scrollToAnchor).toHaveBeenCalledWith('#contact');
  });
});
