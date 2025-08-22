import { test, expect } from '@playwright/test';

test('basic language switcher functionality', async ({ page }) => {
  // Test the main marketing page
  await page.goto('/en');
  await expect(page).toHaveURL(/\/en$/);
  
  // Check if we're on mobile (viewport width < 768px)
  const viewportSize = page.viewportSize();
  const isMobile = viewportSize && viewportSize.width < 768;
  
  let languageButton;
  
  if (isMobile) {
    // On mobile, open the drawer first
    await page.getByRole('button', { name: 'open drawer' }).click();
    languageButton = page.getByRole('button', { name: /change language/i });
  } else {
    // On desktop, find the language switcher directly
    languageButton = page.getByRole('button', { name: /change language/i });
  }
  
  await expect(languageButton).toBeVisible();
  
  // Test that we can click it and see the menu
  await languageButton.click();
  
  // Check that both language options are visible
  await expect(page.getByRole('menuitem', { name: /English/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Español/i })).toBeVisible();
  
  // Close the menu by clicking outside
  await page.click('body');
  
  // Test practice page has language switcher too
  await page.goto('/practice');
  const practiceLanguageButton = page.getByRole('button', { name: /change language/i });
  await expect(practiceLanguageButton).toBeVisible();
});
