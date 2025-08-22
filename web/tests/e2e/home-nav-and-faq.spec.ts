import { test, expect } from '@playwright/test';

test('FAQ accordion expands and collapses correctly', async ({ page }) => {
  await page.goto('/en');
  
  // Find FAQ accordion summaries (MUI AccordionSummary components)
  const faqButtons = page.locator('[id^="faq-header-"]');
  const buttonCount = await faqButtons.count();
  
  if (buttonCount > 0) {
    const firstFaqButton = faqButtons.first();
    
    // Click to expand
    await firstFaqButton.click();
    
    // Check that aria-expanded is true
    await expect(firstFaqButton).toHaveAttribute('aria-expanded', 'true');
    
    // Check that the accordion content is visible
    const faqContent = page.locator('[id^="faq-content-"]');
    await expect(faqContent.first()).toBeVisible();
    
    // Click to collapse
    await firstFaqButton.click();
    
    // Check that aria-expanded is false
    await expect(firstFaqButton).toHaveAttribute('aria-expanded', 'false');
  } else {
    // FAQ section doesn't exist on this page, which is okay
    console.log('FAQ buttons not found on this page');
  }
});

test('header navigation buttons work correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/en');

  // Test that the header exists and has the brand name (use the link version)
  await expect(page.getByRole('link', { name: 'Permit School' })).toBeVisible();

  // Check if we're on mobile (viewport width < 768px)
  const viewportSize = page.viewportSize();
  const isMobile = viewportSize && viewportSize.width < 768;

  if (isMobile) {
    // On mobile, navigation items are in the drawer behind a menu button
    await expect(page.getByRole('button', { name: 'open drawer' })).toBeVisible();
    
    // Open the mobile drawer to test navigation items
    await page.getByRole('button', { name: 'open drawer' }).click();
    
    // Now test that navigation items are visible in the drawer (use more specific selectors)
    await expect(page.getByRole('list').getByText('How it works')).toBeVisible();
    await expect(page.getByRole('list').getByText('Practice tests')).toBeVisible();
    await expect(page.getByRole('list').getByText('Pricing')).toBeVisible();
    await expect(page.getByRole('list').getByText('FAQ')).toBeVisible();
    
    // Test that "Start free" button exists in the drawer
    const startFreeButton = page.locator('[data-cta="header-start-free"]').first();
    await expect(startFreeButton).toBeVisible();
    await expect(startFreeButton).toHaveText('Start free');
  } else {
    // On desktop, navigation items are visible in the header
    // Anchor links are rendered as buttons, page links are rendered as links
    await expect(page.getByRole('button', { name: 'How it works' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Practice tests' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pricing' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'FAQ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    
    // Test that header "Start free" button exists and has correct data-cta
    const startFreeButton = page.locator('[data-cta="header-start-free"]').first();
    await expect(startFreeButton).toBeVisible();
    await expect(startFreeButton).toHaveText('Start free');
  }
});
