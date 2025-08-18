import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('renders and CTAs work', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Permit School/);
    
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: /pass your permit faster/i })).toBeVisible();
    
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
    
    // Check for main landmark
    await expect(page.getByRole('main')).toBeVisible();
    
    // Check for proper heading hierarchy
    await expect(page.getByRole('heading', { name: /pass your permit faster/i })).toBeVisible();
    
    // Check for skip link
    const skipLink = page.getByRole('link', { name: /skip to content/i });
    await expect(skipLink).toBeVisible();
    
    // Test skip link functionality
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that header is present (look for AppBar instead of banner role)
    await expect(page.locator('header')).toBeVisible();
    
    // Check that navigation links are present (use first instance to avoid duplicates)
    await expect(page.getByRole('link', { name: /courses/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /for schools/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /pricing/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i }).first()).toBeVisible();
    
    // Check that sign in link works (skip on mobile as it's in drawer)
    const signInLink = page.getByRole('link', { name: /sign in/i }).first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      // Should navigate to signin page
      await expect(page).toHaveURL(/.*signin/);
    }
  });

  test('features section is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check that features section is present
    await expect(page.getByRole('heading', { name: /why choose permit school/i })).toBeVisible();
    
    // Check that feature cards are present
    await expect(page.getByText(/adaptive practice/i)).toBeVisible();
    await expect(page.getByText(/bite‑sized lessons/i).first()).toBeVisible();
    await expect(page.getByText(/instant explanations/i)).toBeVisible();
  });

  test('pricing section is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check that pricing section is present
    await expect(page.getByRole('heading', { name: /simple, transparent pricing/i })).toBeVisible();
    
    // Check that pricing tiers are present (use more specific selectors)
    await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Classroom', exact: true })).toBeVisible();
  });

  test('FAQ section is functional', async ({ page }) => {
    await page.goto('/');
    
    // Check that FAQ section is present
    await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();
    
    // Check that FAQ items are present
    await expect(page.getByText(/how much does it cost/i)).toBeVisible();
    await expect(page.getByText(/how long does it take/i)).toBeVisible();
  });

  test('final CTA banner is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check that final CTA is present
    await expect(page.getByRole('heading', { name: /ready to get your permit/i })).toBeVisible();
    
    // Check that CTA buttons are present (use first instance to avoid duplicates)
    await expect(page.getByRole('link', { name: /start free practice test/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
  });
});
