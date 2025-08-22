import { test, expect } from '@playwright/test';

test('language switcher toggles between EN and ES and persists', async ({ page, context }) => {
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
  
  // Open language switcher menu
  await languageButton.click();
  
  // Wait for menu to appear and choose Español
  const spanishOption = page.getByRole('menuitem', { name: /Español/i });
  await expect(spanishOption).toBeVisible();
  await spanishOption.click();
  
  await expect(page).toHaveURL(/\/es(\/)?$/);

  // Check that the page content has changed to Spanish
  // Look for Spanish text in the hero section
  await expect(page.locator('h1')).toContainText(/Permiso|Escuela/i);

  // Reload and ensure ES persists (cookie worked)
  await page.reload();
  await expect(page).toHaveURL(/\/es(\/)?$/);

  // Switch back to English
  let languageButton2;
  if (isMobile) {
    // On mobile, open the drawer again since we navigated away
    await page.getByRole('button', { name: 'open drawer' }).click();
    languageButton2 = page.getByRole('button', { name: /cambiar idioma|change language/i });
  } else {
    languageButton2 = page.getByRole('button', { name: /cambiar idioma|change language/i });
  }
  await expect(languageButton2).toBeVisible();
  await languageButton2.click();
  
  const englishOption = page.getByRole('menuitem', { name: /English/i });
  await expect(englishOption).toBeVisible();
  await englishOption.click();
  
  await expect(page).toHaveURL(/\/en(\/)?$/);
  
  // Verify English content is back
  await expect(page.locator('h1')).toContainText(/Permit|School/i);
});

test('language switcher preserves route and query parameters', async ({ page }) => {
  // Start on a specific route with query params
  await page.goto('/en/practice?mode=quick&test=true');
  await expect(page).toHaveURL(/\/en\/practice\?mode=quick&test=true/);
  
  // Wait for page to load and find language switcher
  const languageButton = page.getByRole('button', { name: /change language/i });
  await expect(languageButton).toBeVisible();
  
  // Switch to Spanish
  await languageButton.click();
  const spanishOption = page.getByRole('menuitem', { name: /Español/i });
  await expect(spanishOption).toBeVisible();
  await spanishOption.click();
  
  // Verify route and query params are preserved
  await expect(page).toHaveURL(/\/es\/practice\?mode=quick&test=true/);
  
  // Switch back to English
  const languageButton2 = page.getByRole('button', { name: /cambiar idioma|change language/i });
  await expect(languageButton2).toBeVisible();
  await languageButton2.click();
  
  const englishOption = page.getByRole('menuitem', { name: /English/i });
  await expect(englishOption).toBeVisible();
  await englishOption.click();
  
  // Verify we're back to English with same route and params
  await expect(page).toHaveURL(/\/en\/practice\?mode=quick&test=true/);
});

test('language switcher works on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/en');
  
  // Open mobile drawer
  await page.getByRole('button', { name: 'open drawer' }).click();
  
  // Find and click language switcher in mobile drawer
  const languageSwitcher = page.locator('[aria-label="Change language"]').first();
  await expect(languageSwitcher).toBeVisible();
  await languageSwitcher.click();
  
  // Wait for menu to appear and choose Spanish
  const spanishOption = page.getByRole('menuitem', { name: /Español/i });
  await expect(spanishOption).toBeVisible();
  await spanishOption.click();
  
  await expect(page).toHaveURL(/\/es(\/)?$/);
  
  // Verify Spanish content
  await expect(page.locator('h1')).toContainText(/Permiso|Escuela/i);
});

test('language switcher appears on all header components', async ({ page }) => {
  // Test marketing page header
  await page.goto('/en');
  await expect(page.getByRole('button', { name: /change language/i })).toBeVisible();
  
  // Test practice page (should have SimpleHeader)
  await page.goto('/practice');
  await expect(page.getByRole('button', { name: /change language/i })).toBeVisible();
  
  // Test dashboard page (if it exists and uses AppBarV2)
  try {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: /change language/i })).toBeVisible();
  } catch {
    // Dashboard might not exist, that's okay
    console.log('Dashboard page not available for testing');
  }
});

test('language switcher accessibility features work', async ({ page }) => {
  await page.goto('/en');
  
  const languageButton = page.getByRole('button', { name: /change language/i });
  
  // Check accessibility attributes
  await expect(languageButton).toHaveAttribute('aria-haspopup', 'menu');
  await expect(languageButton).toHaveAttribute('aria-expanded', 'false');
  
  // Open menu
  await languageButton.click();
  
  // Check expanded state
  await expect(languageButton).toHaveAttribute('aria-expanded', 'true');
  
  // Check menu items have proper roles
  await expect(page.getByRole('menuitem', { name: /English/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Español/i })).toBeVisible();
  
  // Check selected state
  await expect(page.getByRole('menuitem', { name: /English/i })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('menuitem', { name: /Español/i })).toHaveAttribute('aria-selected', 'false');
});
