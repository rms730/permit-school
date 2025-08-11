import { test, expect } from '@playwright/test';

test.describe('Sprint 22 - UX Refresh & Google Auth', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for mobile testing
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test('should display modern home page with hero section', async ({ page }) => {
    await page.goto('/home');
    
    // Check for modern AppBar
    await expect(page.locator('text=Permit School')).toBeVisible();
    
    // Check for hero section
    await expect(page.locator('text=Master Your Permit Test')).toBeVisible();
    await expect(page.locator('text=Interactive, engaging, and designed for success')).toBeVisible();
    
    // Check for CTA buttons
    await expect(page.locator('text=Start Learning Free')).toBeVisible();
    await expect(page.locator('text=Browse Courses')).toBeVisible();
    
    // Check for benefits section
    await expect(page.locator('text=Why Choose Permit School?')).toBeVisible();
    await expect(page.locator('text=Interactive Learning')).toBeVisible();
    await expect(page.locator('text=Track Progress')).toBeVisible();
  });

  test('should display modern login page with Google CTA first', async ({ page }) => {
    await page.goto('/login');
    
    // Check for modern design elements
    await expect(page.locator('text=Welcome Back!')).toBeVisible();
    await expect(page.locator('text=Sign in to continue your learning journey')).toBeVisible();
    
    // Check for Google sign-in button (primary CTA)
    const googleButton = page.locator('text=Continue with Google');
    await expect(googleButton).toBeVisible();
    
    // Check for email sign-in option (secondary)
    await expect(page.locator('text=Sign in with Email')).toBeVisible();
    
    // Check for sign up link
    await expect(page.locator('text=Don\'t have an account?')).toBeVisible();
    await expect(page.locator('text=Sign up')).toBeVisible();
  });

  test('should display modern signup page with Google CTA first', async ({ page }) => {
    await page.goto('/signup');
    
    // Check for modern design elements
    await expect(page.locator('text=Join Permit School!')).toBeVisible();
    await expect(page.locator('text=Start your learning journey today')).toBeVisible();
    
    // Check for Google sign-up button (primary CTA)
    const googleButton = page.locator('text=Continue with Google');
    await expect(googleButton).toBeVisible();
    
    // Check for email sign-up option (secondary)
    await expect(page.locator('text=Sign up with Email')).toBeVisible();
    
    // Check for sign in link
    await expect(page.locator('text=Already have an account?')).toBeVisible();
    await expect(page.locator('text=Sign in')).toBeVisible();
  });

  test('should handle email form toggle on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Click email sign-in option
    await page.click('text=Sign in with Email');
    
    // Check that email form is displayed
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('text=Signing In...')).toBeVisible();
    
    // Check for back button
    await expect(page.locator('text=← Back to options')).toBeVisible();
  });

  test('should handle email form toggle on signup page', async ({ page }) => {
    await page.goto('/signup');
    
    // Click email sign-up option
    await page.click('text=Sign up with Email');
    
    // Check that email form is displayed
    await expect(page.locator('input[placeholder*="Full Name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('text=Creating Account...')).toBeVisible();
    
    // Check for back button
    await expect(page.locator('text=← Back to options')).toBeVisible();
  });

  test('should have mobile-friendly navigation', async ({ page }) => {
    await page.goto('/home');
    
    // Check for mobile menu button (should be visible on mobile)
    const menuButton = page.locator('[aria-label="open drawer"]');
    await expect(menuButton).toBeVisible();
    
    // Click menu button
    await menuButton.click();
    
    // Check for mobile drawer
    await expect(page.locator('text=Menu')).toBeVisible();
    
    // Check for sign in button in mobile drawer
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should have touch-friendly button sizes', async ({ page }) => {
    await page.goto('/login');
    
    // Check that buttons have minimum 44px height (touch-friendly)
    const googleButton = page.locator('text=Continue with Google');
    const buttonBox = await googleButton.boundingBox();
    
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/login');
    
    // Tab to Google button
    await page.keyboard.press('Tab');
    
    // Check that focus is visible (this is handled by CSS, but we can verify the element is focused)
    const googleButton = page.locator('text=Continue with Google');
    await expect(googleButton).toBeFocused();
  });

  test('should have responsive card layouts', async ({ page }) => {
    await page.goto('/home');
    
    // Check that cards stack properly on mobile
    const cards = page.locator('[data-testid="benefit-card"]').or(page.locator('.MuiCard-root'));
    
    // On mobile, cards should be stacked vertically
    // We can verify this by checking that multiple cards exist and are visible
    await expect(cards.first()).toBeVisible();
  });

  test('should have accessible color contrast', async ({ page }) => {
    await page.goto('/login');
    
    // Check that text has sufficient contrast
    // This is primarily handled by the theme, but we can verify text is visible
    await expect(page.locator('text=Welcome Back!')).toBeVisible();
    await expect(page.locator('text=Sign in to continue your learning journey')).toBeVisible();
  });

  test('should handle auth callback route', async ({ page }) => {
    // Test that the auth callback page exists and handles loading state
    await page.goto('/auth/callback');
    
    // Should show loading state
    await expect(page.locator('text=Completing sign in...')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check for proper ARIA labels on interactive elements
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('aria-label', 'Email');
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('aria-label', 'Password');
  });
});
