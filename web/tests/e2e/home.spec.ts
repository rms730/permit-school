import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('renders and CTAs work', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Permit School/);
    
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: /pass your dmv permit test/i })).toBeVisible();
    
    // Check that the primary CTA is visible and clickable (use first one)
    const startCta = page.getByRole('link', { name: /start free practice test/i }).first();
    await expect(startCta).toBeVisible();
    
    // Click the CTA and verify it doesn't cause errors
    await startCta.click();
    
    // Should navigate to practice page
    await expect(page).toHaveURL(/.*practice/);
  });

  test('accessibility structure is correct', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    await expect(page.getByRole('heading', { name: /pass your dmv permit test/i })).toBeVisible();
    
    // Check for skip link
    const skipLink = page.getByRole('link', { name: /skip to content/i });
    await expect(skipLink).toBeVisible();
    
    // Check that skip link is focusable
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that header is present (look for AppBar instead of banner role)
    await expect(page.locator('header')).toBeVisible();
    
    // Check that navigation links are present (use first instance to avoid duplicates)
    await expect(page.getByRole('link', { name: /features/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /pricing/i }).first()).toBeVisible();
    
    // Check that sign in link works (skip on mobile as it's in drawer)
    const signInLink = page.getByRole('link', { name: /login/i }).first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      // Should navigate to login page
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('features section is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check that features section is present
    await expect(page.getByRole('heading', { name: /why permit school/i })).toBeVisible();
    
    // Check that feature cards are present (use specific selectors to avoid duplicates)
    await expect(page.getByRole('heading', { name: 'Realistic questions', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Adaptive practice', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Progress insights', exact: true })).toBeVisible();
  });

  test('pricing section is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check that pricing section is present
    await expect(page.getByRole('heading', { name: /simple, transparent pricing/i })).toBeVisible();
    
    // Check that pricing tiers are present (use more specific selectors)
    await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Plus', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible();
  });

  test('FAQ section is functional', async ({ page }) => {
    await page.goto('/');
    
    // Check that FAQ section is present
    await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();
    
    // Check that FAQ items are present
    await expect(page.getByRole('button', { name: /how much does it cost/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /how long does it take/i })).toBeVisible();
    
    // Test FAQ expansion
    const firstFaq = page.getByRole('button', { name: /how much does it cost/i });
    await firstFaq.click();
    await expect(page.getByText(/we offer a free practice test/i)).toBeVisible();
  });

  test('final CTA banner is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check that final CTA is present
    await expect(page.getByRole('heading', { name: /ready to ace your permit test/i })).toBeVisible();
    
    // Check that CTA buttons are present (use first instance to avoid duplicates)
    await expect(page.getByRole('link', { name: /start free practice test/i }).first()).toBeVisible();
  });
});
