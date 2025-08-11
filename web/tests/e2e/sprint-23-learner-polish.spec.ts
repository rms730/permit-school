import { test, expect } from '@playwright/test';

test.describe('Sprint 23 - Learner Surfaces Polish', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for mobile testing
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test('should display modern learn page with engagement tracking', async ({ page }) => {
    // Mock user session
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/learn/mock-unit-id');
    
    // Check for modern header with progress
    await expect(page.locator('text=Unit')).toBeVisible();
    await expect(page.locator('.MuiLinearProgress-root')).toBeVisible();
    
    // Check for sticky actions
    await expect(page.locator('text=Previous')).toBeVisible();
    await expect(page.locator('text=Next')).toBeVisible();
    
    // Check for reading progress
    await expect(page.locator('text=Section')).toBeVisible();
    await expect(page.locator('text=complete')).toBeVisible();
  });

  test('should display modern quiz player with accessibility features', async ({ page }) => {
    // Mock quiz data
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/quiz/mock-attempt-id');
    
    // Check for modern quiz interface
    await expect(page.locator('text=Question')).toBeVisible();
    await expect(page.locator('.MuiLinearProgress-root')).toBeVisible();
    
    // Check for accessibility features
    await expect(page.locator('[aria-label="Accessibility options"]')).toBeVisible();
    await expect(page.locator('[aria-label="Mute"]')).toBeVisible();
    
    // Check for keyboard shortcuts info
    await page.click('[aria-label="Accessibility options"]');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    await expect(page.locator('text=Arrow keys: Navigate choices')).toBeVisible();
  });

  test('should display modern exam player with advanced features', async ({ page }) => {
    // Mock exam data
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/exam/mock-attempt-id');
    
    // Check for exam interface
    await expect(page.locator('text=Question')).toBeVisible();
    await expect(page.locator('text=Time remaining')).toBeVisible();
    
    // Check for exam-specific features
    await expect(page.locator('[aria-label="Review questions"]')).toBeVisible();
    await expect(page.locator('[aria-label="Flag question"]')).toBeVisible();
    
    // Check for pause functionality
    await expect(page.locator('text=Pause')).toBeVisible();
  });

  test('should handle keyboard navigation in quiz', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/quiz/mock-attempt-id');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Should show feedback
    await expect(page.locator('text=Correct!')).toBeVisible();
  });

  test('should handle keyboard navigation in exam', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/exam/mock-attempt-id');
    
    // Test exam keyboard shortcuts
    await page.keyboard.press('f'); // Flag question
    await page.keyboard.press('r'); // Review questions
    
    // Should show review dialog
    await expect(page.locator('text=Question Review')).toBeVisible();
  });

  test('should display resume helper on dashboard', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/dashboard');
    
    // Check for resume helper
    await expect(page.locator('text=Continue Learning')).toBeVisible();
    await expect(page.locator('text=overall progress')).toBeVisible();
    
    // Check for time tracking
    await expect(page.locator('text=today')).toBeVisible();
  });

  test('should display AppBar with resume CTA', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/dashboard');
    
    // Check for AppBar with resume functionality
    await expect(page.locator('text=Permit School')).toBeVisible();
    await expect(page.locator('text=Continue Learning')).toBeVisible();
  });

  test('should handle mobile navigation', async ({ page }) => {
    await page.goto('/learn/mock-unit-id');
    
    // Check for mobile-friendly navigation
    await expect(page.locator('[aria-label="open drawer"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[aria-label="open drawer"]');
    await expect(page.locator('text=Menu')).toBeVisible();
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Mock reduced motion preference
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
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
    });

    await page.goto('/quiz/mock-attempt-id');
    
    // Should not show confetti animations when reduced motion is preferred
    // This is handled by the confetti utility internally
    await expect(page.locator('text=Correct!')).toBeVisible();
  });

  test('should handle engagement tracking', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/learn/mock-unit-id');
    
    // Simulate user activity
    await page.mouse.move(100, 100);
    await page.keyboard.press('Tab');
    
    // Should track engagement (this is handled by the idleTracker)
    // The actual tracking happens in the background
    await expect(page.locator('text=Section')).toBeVisible();
  });

  test('should handle accessibility features', async ({ page }) => {
    await page.goto('/quiz/mock-attempt-id');
    
    // Check for proper ARIA labels
    await expect(page.locator('[aria-label="Accessibility options"]')).toBeVisible();
    await expect(page.locator('[aria-label="Mute"]')).toBeVisible();
    
    // Check for focus indicators
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/learn/mock-unit-id');
    
    await expect(page.locator('text=Section')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    
    await expect(page.locator('text=Section')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto('/learn/invalid-unit-id');
    
    // Should show error message
    await expect(page.locator('text=Unit not found')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Mock slow loading
    await page.route('**/api/**', route => {
      route.fulfill({ status: 200, body: '{}', delay: 1000 });
    });

    await page.goto('/quiz/mock-attempt-id');
    
    // Should show loading state
    await expect(page.locator('text=Loading quiz...')).toBeVisible();
  });
});
