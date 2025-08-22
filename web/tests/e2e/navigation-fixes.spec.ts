import { test, expect } from '@playwright/test';

test('header navigation works correctly after fixes', async ({ page }) => {
  await page.goto('http://localhost:3000/en');

  // Check if we're on mobile (viewport width < 768px)
  const viewportSize = page.viewportSize();
  const isMobile = viewportSize && viewportSize.width < 768;

  let practiceButton;
  
  if (isMobile) {
    // On mobile, open the drawer first
    await page.getByRole('button', { name: 'open drawer' }).click();
    practiceButton = page.getByRole('link', { name: 'Practice tests' });
  } else {
    // On desktop, find the practice button directly
    practiceButton = page.getByRole('link', { name: 'Practice tests' });
  }
  
  await expect(practiceButton).toBeVisible();
  
  // Click Practice tests and verify navigation
  await practiceButton.click();
  await expect(page).toHaveURL('http://localhost:3000/practice');
  await expect(page.getByText('Start Your Practice Test')).toBeVisible();
  
  // Go back to home page
  await page.goto('http://localhost:3000/en');
  
  // Test anchor scrolling for "How it works"
  let howItWorksButton;
  
  if (isMobile) {
    // On mobile, open the drawer again since we navigated away
    await page.getByRole('button', { name: 'open drawer' }).click();
    howItWorksButton = page.getByRole('button', { name: 'How it works' });
  } else {
    howItWorksButton = page.getByRole('button', { name: 'How it works' });
  }
  
  await expect(howItWorksButton).toBeVisible();
  
  // Click and verify the page scrolls to the section
  await howItWorksButton.click();
  
  // Wait a moment for smooth scroll to complete
  await page.waitForTimeout(500);
  
  // Verify the How it Works section is visible
  await expect(page.locator('#how-it-works')).toBeInViewport();
  
  // Test Pricing anchor scrolling
  let pricingButton;
  if (isMobile) {
    await page.getByRole('button', { name: 'open drawer' }).click();
    pricingButton = page.getByRole('button', { name: 'Pricing' });
  } else {
    pricingButton = page.getByRole('button', { name: 'Pricing' });
  }
  await pricingButton.click();
  await page.waitForTimeout(500);
  await expect(page.locator('#pricing')).toBeInViewport();
  
  // Test FAQ anchor scrolling
  let faqButton;
  if (isMobile) {
    await page.getByRole('button', { name: 'open drawer' }).click();
    faqButton = page.getByRole('button', { name: 'FAQ' });
  } else {
    faqButton = page.getByRole('button', { name: 'FAQ' });
  }
  await faqButton.click();
  await page.waitForTimeout(500);
  await expect(page.locator('#faq')).toBeInViewport();
});

test('mobile drawer closes after navigation', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:3000/en');

  // Open mobile drawer
  await page.getByRole('button', { name: 'open drawer' }).click();
  
  // Verify drawer is open (navigation items are visible)
  await expect(page.getByRole('button', { name: 'How it works' })).toBeVisible();
  
  // Click an anchor link and verify drawer closes
  await page.getByRole('button', { name: 'How it works' }).click();
  
  // Wait for smooth scroll and drawer to close
  await page.waitForTimeout(500);
  
  // Verify the section is in view and drawer is closed
  await expect(page.locator('#how-it-works')).toBeInViewport();
  
  // Verify drawer is closed by checking that navigation items are not visible
  await expect(page.getByRole('button', { name: 'How it works' })).not.toBeVisible();
});
