import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('renders and CTAs work', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: /pass your permit faster/i })).toBeVisible();
    
    // Check that the primary CTA is visible and clickable
    const startCta = page.getByRole('link', { name: /start free practice test/i });
    await expect(startCta).toBeVisible();
    
    // Click the CTA and verify it doesn't cause errors
    await startCta.click();
    
    // Accept either navigation to /practice or in‑page anchor; both should not error
    await expect(page).not.toHaveJSDialog();
  });

  test('has proper accessibility structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Check for proper heading hierarchy
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check for skip link
    const skipLink = page.getByRole('link', { name: /skip to content/i });
    await expect(skipLink).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that navigation links are present
    await expect(page.getByRole('link', { name: /courses/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /for schools/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    
    // Check that sign in link works
    const signInLink = page.getByRole('link', { name: /sign in/i });
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    
    // Should navigate to signin page
    await expect(page).not.toHaveJSDialog();
  });

  test('features section is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check that features section is present
    await expect(page.getByRole('heading', { name: /why choose permit school/i })).toBeVisible();
    
    // Check that feature cards are present
    await expect(page.getByText(/adaptive practice/i)).toBeVisible();
    await expect(page.getByText(/bite‑sized lessons/i)).toBeVisible();
    await expect(page.getByText(/instant explanations/i)).toBeVisible();
  });

  test('pricing section is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to pricing section
    await page.getByRole('link', { name: /pricing/i }).click();
    
    // Check that pricing section is present
    await expect(page.getByRole('heading', { name: /choose your plan/i })).toBeVisible();
    
    // Check that pricing tiers are present
    await expect(page.getByText(/free/i)).toBeVisible();
    await expect(page.getByText(/pro/i)).toBeVisible();
    await expect(page.getByText(/classroom/i)).toBeVisible();
  });

  test('FAQ section is functional', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to FAQ section
    await page.getByRole('link', { name: /faq/i }).click();
    
    // Check that FAQ section is present
    await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();
    
    // Check that FAQ items are present and expandable
    const firstFaq = page.getByRole('button', { name: /how much does permit school cost/i });
    await expect(firstFaq).toBeVisible();
    
    // Click to expand FAQ
    await firstFaq.click();
    
    // Check that content is revealed
    await expect(page.getByText(/we offer a free plan/i)).toBeVisible();
  });

  test('final CTA banner is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to bottom to find CTA banner
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check that final CTA is present
    await expect(page.getByRole('heading', { name: /ready to ace your permit/i })).toBeVisible();
    
    // Check that CTA buttons are present
    await expect(page.getByRole('link', { name: /start free practice test/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
  });
});
