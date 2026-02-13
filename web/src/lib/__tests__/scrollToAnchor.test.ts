import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrollToAnchor } from '../scrollToAnchor';

describe('scrollToAnchor', () => {
  let mockElement: HTMLElement;
  let mockHeader: HTMLElement;
  let mockScrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock DOM elements
    mockElement = {
      getBoundingClientRect: vi.fn(() => ({
        top: 100,
        left: 0,
        width: 200,
        height: 50,
        right: 200,
        bottom: 150,
      })),
    } as any;

    mockHeader = {
      offsetHeight: 60,
    } as any;

    // Mock document methods
    vi.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
      if (selector === 'header') return mockHeader;
      if (selector === '#test-anchor') return mockElement;
      return null;
    });

    // Mock window methods
    mockScrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true,
    });

    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to anchor element with default offset', () => {
    scrollToAnchor('#test-anchor');

    expect(document.querySelector).toHaveBeenCalledWith('#test-anchor');
    expect(document.querySelector).toHaveBeenCalledWith('header');
    expect(mockElement.getBoundingClientRect).toHaveBeenCalled();
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 20, // 100 (element top) - 60 (header height) - 20 (default offset)
      behavior: 'smooth',
    });
  });

  it('scrolls to anchor element with custom offset', () => {
    scrollToAnchor('#test-anchor', 50);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: -10, // 100 (element top) - 60 (header height) - 50 (custom offset)
      behavior: 'smooth',
    });
  });

  it('handles case when header is not found', () => {
    vi.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
      if (selector === 'header') return null;
      if (selector === '#test-anchor') return mockElement;
      return null;
    });

    scrollToAnchor('#test-anchor', 30);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 70, // 100 (element top) - 0 (no header) - 30 (offset)
      behavior: 'smooth',
    });
  });

  it('handles case when anchor element is not found', () => {
    vi.spyOn(document, 'querySelector').mockImplementation(() => null);

    scrollToAnchor('#non-existent-anchor');

    expect(document.querySelector).toHaveBeenCalledWith('#non-existent-anchor');
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it('handles case when anchor element is found but header is not', () => {
    vi.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
      if (selector === 'header') return null;
      if (selector === '#test-anchor') return mockElement;
      return null;
    });

    scrollToAnchor('#test-anchor');

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 80, // 100 (element top) - 0 (no header) - 20 (default offset)
      behavior: 'smooth',
    });
  });

  it('handles different element positions', () => {
    // Mock element at different position
    mockElement.getBoundingClientRect = vi.fn(() => ({
      top: 500,
      left: 0,
      width: 200,
      height: 50,
      right: 200,
      bottom: 550,
    }));

    scrollToAnchor('#test-anchor', 10);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 430, // 500 (element top) - 60 (header height) - 10 (offset)
      behavior: 'smooth',
    });
  });

  it('handles different header heights', () => {
    // Mock header with different height
    mockHeader.offsetHeight = 100;

    scrollToAnchor('#test-anchor', 15);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: -15, // 100 (element top) - 100 (header height) - 15 (offset)
      behavior: 'smooth',
    });
  });

  it('handles zero offset', () => {
    scrollToAnchor('#test-anchor', 0);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 40, // 100 (element top) - 60 (header height) - 0 (offset)
      behavior: 'smooth',
    });
  });

  it('handles negative offset', () => {
    scrollToAnchor('#test-anchor', -10);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 50, // 100 (element top) - 60 (header height) - (-10) (negative offset)
      behavior: 'smooth',
    });
  });

  it('handles different pageYOffset values', () => {
    Object.defineProperty(window, 'pageYOffset', {
      value: 200,
      writable: true,
    });

    scrollToAnchor('#test-anchor');

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 220, // 100 (element top) + 200 (pageYOffset) - 60 (header height) - 20 (offset)
      behavior: 'smooth',
    });
  });

  it('handles complex element positioning', () => {
    // Mock element with different bounding rect
    mockElement.getBoundingClientRect = vi.fn(() => ({
      top: 0,
      left: 0,
      width: 200,
      height: 50,
      right: 200,
      bottom: 50,
    }));

    Object.defineProperty(window, 'pageYOffset', {
      value: 100,
      writable: true,
    });

    scrollToAnchor('#test-anchor', 25);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 15, // 0 (element top) + 100 (pageYOffset) - 60 (header height) - 25 (offset)
      behavior: 'smooth',
    });
  });

  it('handles edge case with very large header', () => {
    mockHeader.offsetHeight = 1000;

    scrollToAnchor('#test-anchor');

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: -920, // 100 (element top) - 1000 (header height) - 20 (offset)
      behavior: 'smooth',
    });
  });

  it('handles edge case with very large offset', () => {
    scrollToAnchor('#test-anchor', 1000);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: -960, // 100 (element top) - 60 (header height) - 1000 (offset)
      behavior: 'smooth',
    });
  });
});
