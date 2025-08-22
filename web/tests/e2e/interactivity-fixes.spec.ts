import { test, expect } from '@playwright/test';

test.describe('Interactivity Fixes', () => {
  test('FAQ accordions expand and collapse correctly', async ({ page }) => {
    await page.goto('/en');
    
    // Scroll to FAQ section
    await page.locator('#faq').scrollIntoViewIfNeeded();
    
    // Test all FAQ accordions
    const faqButtons = page.getByRole('button', { name: /Is this official DMV material|How close are your questions|Do you offer a money-back guarantee|Will this work on my phone|How long does it take|Do you support other states/i });
    const count = await faqButtons.count();
    
    for (let i = 0; i < count; i++) {
      const button = faqButtons.nth(i);
      
      // Click to expand
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      
      // Verify content is visible
      const content = page.locator(`#faq-content-${i}`);
      await expect(content).toBeVisible();
      
      // Click to collapse
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('Header navigation works on desktop and mobile', async ({ page }) => {
    await page.goto('/en');
    
    // Test desktop navigation
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Test anchor links
    const howItWorksButton = page.getByRole('button', { name: 'How it works' });
    await howItWorksButton.click();
    await expect(page.locator('#how-it-works')).toBeInViewport();
    
    const pricingButton = page.getByRole('button', { name: 'Pricing' });
    await pricingButton.click();
    await expect(page.locator('#pricing')).toBeInViewport();
    
    const faqButton = page.getByRole('button', { name: 'FAQ' });
    await faqButton.click();
    await expect(page.locator('#faq')).toBeInViewport();
    
    // Test external link
    const practiceButton = page.getByRole('link', { name: 'Practice tests' });
    await practiceButton.click();
    await expect(page).toHaveURL(/\/practice/);
    
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en');
    
    // Open mobile menu
    const menuButton = page.getByRole('button', { name: 'open drawer' });
    await menuButton.click();
    
    // Test mobile navigation items
    await expect(page.getByRole('button', { name: 'How it works' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Practice tests' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pricing' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'FAQ' })).toBeVisible();
  });

  test('Hero section buttons are clickable', async ({ page }) => {
    await page.goto('/en');
    
    // Test hero CTA buttons
    const startFreeButton = page.getByRole('link', { name: 'Start free practice' });
    await expect(startFreeButton).toBeVisible();
    await startFreeButton.click();
    await expect(page).toHaveURL(/\/practice/);
    
    await page.goto('/en');
    
    const seeHowButton = page.getByRole('link', { name: 'See how it works' });
    await expect(seeHowButton).toBeVisible();
    await seeHowButton.click();
    await expect(page.locator('#how-it-works')).toBeInViewport();
  });

  test('Language switcher works correctly', async ({ page }) => {
    await page.goto('/en');
    
    // Find and click language switcher
    const languageButton = page.getByRole('button', { name: 'Change language' });
    await expect(languageButton).toBeVisible();
    await languageButton.click();
    
    // Switch to Spanish
    const spanishOption = page.getByRole('menuitem', { name: 'Español' });
    await expect(spanishOption).toBeVisible();
    await spanishOption.click();
    
    // Verify URL changed
    await expect(page).toHaveURL(/\/es/);
    
    // Wait for page to load and verify some Spanish content is present
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('No overlay interference with interactions', async ({ page }) => {
    await page.goto('/en');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Debug: Check if FAQ section exists at the start
    const faqSection = page.locator('#faq');
    const exists = await faqSection.count();
    console.log('FAQ section count at start:', exists);
    
    // Test that we can click on various interactive elements (avoid navigation that might break the page)
    const elements = [
      page.getByRole('button', { name: 'How it works' }),
      page.getByRole('button', { name: 'Pricing' }),
    ];
    
    for (const element of elements) {
      await expect(element).toBeVisible();
      // Hover to ensure no overlay blocks interaction
      await element.hover();
      // Click to ensure it's clickable (these are anchor links, so they should scroll)
      await element.click();
      
      // Wait a bit for scroll to complete
      await page.waitForTimeout(500);
    }
    
    // Test FAQ button separately since it scrolls to a section
    const faqButton = page.getByRole('button', { name: 'FAQ' });
    await expect(faqButton).toBeVisible();
    await faqButton.hover();
    await faqButton.click();
    
    // Wait for smooth scroll to complete
    await page.waitForTimeout(1000);
    
    // Verify FAQ section exists and is visible
    await expect(page.locator('#faq')).toBeVisible();
  });

  test('Mobile menu opens and closes properly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en');
    
    // Open menu
    const menuButton = page.getByRole('button', { name: 'open drawer' });
    await menuButton.click();
    
    // Verify menu is open
    await expect(page.getByRole('button', { name: 'How it works' })).toBeVisible();
    
    // Close menu by clicking outside or escape
    await page.keyboard.press('Escape');
    
    // Verify menu is closed
    await expect(page.getByRole('button', { name: 'How it works' })).not.toBeVisible();
  });
});
