import { test, expect } from '@playwright/test';

test('FAQ accordion expands and collapses correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/en');

  // Scroll to FAQ section
  await page.locator('#faq').scrollIntoViewIfNeeded();

  // Test FAQ accordion expansion
  const firstFaqButton = page.getByRole('button', { name: /Is this official DMV material/i });
  await firstFaqButton.click();
  
  // Check that the accordion content is visible
  await expect(page.getByText(/While we're not affiliated with the DMV/i)).toBeVisible();
  
  // Check that aria-expanded is true
  await expect(firstFaqButton).toHaveAttribute('aria-expanded', 'true');

  // Test that clicking another FAQ item closes the first one
  const secondFaqButton = page.getByRole('button', { name: /How close are your questions/i });
  await secondFaqButton.click();
  
  // First FAQ should be collapsed
  await expect(firstFaqButton).toHaveAttribute('aria-expanded', 'false');
  // Second FAQ should be expanded
  await expect(secondFaqButton).toHaveAttribute('aria-expanded', 'true');
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
