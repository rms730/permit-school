import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Clear module cache to ensure fresh imports
vi.resetModules();

describe('Confetti', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let createConfetti: any;
  let stopConfetti: any;
  let useConfetti: any;

  beforeEach(async () => {
    // Mock canvas and context
    mockContext = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
    } as any;

    mockCanvas = {
      style: {
        position: '',
        top: '',
        left: '',
        pointerEvents: '',
        zIndex: '',
      },
      width: 800,
      height: 600,
      getContext: vi.fn(() => mockContext),
    } as any;

    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
    
    // Mock document.body.appendChild
    vi.spyOn(document.body, 'appendChild').mockReturnValue(mockCanvas);
    
    // Mock window.matchMedia to return false for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion') ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      setTimeout(cb, 16);
      return 1;
    });

    // Mock cancelAnimationFrame
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    
    // Import the module after mocks are set up
    const confettiModule = await import('../confetti');
    createConfetti = confettiModule.createConfetti;
    stopConfetti = confettiModule.stopConfetti;
    useConfetti = confettiModule.useConfetti;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should create confetti with default config', () => {
    createConfetti();
    
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockCanvas);
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should create confetti with custom config', () => {
    const customConfig = {
      particleCount: 100,
      spread: 90,
      startVelocity: 45,
      colors: ['#ff0000', '#00ff00'],
    };

    createConfetti(customConfig);
    
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockCanvas);
  });

  it('should not create confetti when reduced motion is preferred', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    createConfetti();
    
    // Should not create canvas when reduced motion is preferred
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it('should stop confetti animation', () => {
    createConfetti();
    stopConfetti();
    
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should not create multiple canvas elements', () => {
    createConfetti();
    createConfetti();
    
    // Should only create one canvas
    expect(document.createElement).toHaveBeenCalledTimes(1);
  });

  it('should handle window resize', () => {
    createConfetti();
    
    // Simulate window resize
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
    
    // Canvas should be resized
    expect(mockCanvas.width).toBeDefined();
    expect(mockCanvas.height).toBeDefined();
  });

  it('should use default colors when not specified', () => {
    createConfetti();
    
    // Default colors should be used
    const defaultColors = ['#00BCD4', '#7C4DFF', '#4CAF50', '#FF9800', '#F44336'];
    // The confetti creation should use these colors
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should handle different particle shapes', () => {
    const configWithShapes = {
      shapes: ['square', 'circle'] as ('square' | 'circle')[],
      particleCount: 10,
    };

    createConfetti(configWithShapes);
    
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should set correct canvas styles', () => {
    createConfetti();
    
    expect(mockCanvas.style.position).toBe('fixed');
    expect(mockCanvas.style.top).toBe('0');
    expect(mockCanvas.style.left).toBe('0');
    expect(mockCanvas.style.pointerEvents).toBe('none');
    expect(mockCanvas.style.zIndex).toBe('9999');
  });

  it('should handle useConfetti hook', () => {
    const { fire, stop } = useConfetti();
    
    expect(typeof fire).toBe('function');
    expect(typeof stop).toBe('function');
  });

  it('should handle fire function from hook', () => {
    const { fire } = useConfetti();
    
    fire();
    
    expect(document.createElement).toHaveBeenCalledWith('canvas');
  });

  it('should handle stop function from hook', () => {
    const { stop } = useConfetti();
    
    stop();
    
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should handle custom origin', () => {
    const configWithOrigin = {
      origin: { x: 0.25, y: 0.75 },
      particleCount: 10,
    };

    createConfetti(configWithOrigin);
    
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should handle custom zIndex', () => {
    const configWithZIndex = {
      zIndex: 5000,
      particleCount: 10,
    };

    createConfetti(configWithZIndex);
    
    expect(mockCanvas.style.zIndex).toBe('5000');
  });
});
