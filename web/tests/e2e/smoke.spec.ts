import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('loads core pages', async ({ page }) => {
    // Test landing page
    await page.goto('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: /permit school/i })).toBeVisible();
    
    // Test locale-specific landing page
    await page.goto('http://localhost:3000/en');
    await expect(page.getByRole('heading', { name: /permit school/i })).toBeVisible();
    
    // Test Spanish locale
    await page.goto('http://localhost:3000/es');
    await expect(page.getByRole('heading', { name: /permit school/i })).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Check for navigation elements
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Test language switcher if present
    const langSwitcher = page.getByRole('button', { name: /language|idioma/i });
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      // Should show language options
      await expect(page.getByRole('menu')).toBeVisible();
    }
  });

  test('CTA buttons are clickable', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Test primary CTA button
    const primaryButton = page.getByRole('button', { name: /start|begin|get started/i });
    if (await primaryButton.isVisible()) {
      await expect(primaryButton).toBeEnabled();
      // Click should not throw errors
      await primaryButton.click();
    }
    
    // Test secondary CTA button
    const secondaryButton = page.getByRole('button', { name: /courses|learn more|view/i });
    if (await secondaryButton.isVisible()) {
      await expect(secondaryButton).toBeEnabled();
      await secondaryButton.click();
    }
  });

  test('footer links work', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Test footer navigation
    const footer = page.getByRole('contentinfo');
    if (await footer.isVisible()) {
      // Test privacy link
      const privacyLink = page.getByRole('link', { name: /privacy/i });
      if (await privacyLink.isVisible()) {
        await expect(privacyLink).toBeEnabled();
      }
      
      // Test terms link
      const termsLink = page.getByRole('link', { name: /terms/i });
      if (await termsLink.isVisible()) {
        await expect(termsLink).toBeEnabled();
      }
      
      // Test accessibility link
      const accessibilityLink = page.getByRole('link', { name: /accessibility/i });
      if (await accessibilityLink.isVisible()) {
        await expect(accessibilityLink).toBeEnabled();
      }
    }
  });

  test('responsive design works', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: /permit school/i })).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: /permit school/i })).toBeVisible();
  });

  test('page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // Allow some expected errors but fail on unexpected ones
    const unexpectedErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('manifest') &&
      !error.includes('service worker')
    );
    
    expect(unexpectedErrors).toHaveLength(0);
  });
});
