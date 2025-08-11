import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility smoke', () => {
  test('should pass accessibility tests on home page', async ({ page }) => {
    await page.goto('/');

    // Run axe-core accessibility test
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Check for serious/critical violations
    const seriousViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'serious' || violation.impact === 'critical'
    );

    expect(seriousViolations).toHaveLength(0);

    // Log all violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:', accessibilityScanResults.violations);
    }
  });

  test('should pass accessibility tests on courses page', async ({ page }) => {
    await page.goto('/courses');

    // Run axe-core accessibility test
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Check for serious/critical violations
    const seriousViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'serious' || violation.impact === 'critical'
    );

    expect(seriousViolations).toHaveLength(0);
  });

  test('should pass accessibility tests on signin page', async ({ page }) => {
    await page.goto('/signin');

    // Run axe-core accessibility test
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Check for serious/critical violations
    const seriousViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'serious' || violation.impact === 'critical'
    );

    expect(seriousViolations).toHaveLength(0);
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Should focus on skip link first
    await expect(page.locator('a[href="#main"]')).toBeFocused();

    // Continue tabbing through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to navigate with keyboard
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for proper ARIA labels on interactive elements
    const buttons = page.locator('button');
    const links = page.locator('a');
    const inputs = page.locator('input');

    // All buttons should have accessible names
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      const hasAccessibleName = ariaLabel || textContent?.trim();
      expect(hasAccessibleName).toBeTruthy();
    }

    // All links should have accessible names
    const linkCount = await links.count();
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      const textContent = await link.textContent();
      const hasAccessibleName = ariaLabel || textContent?.trim();
      expect(hasAccessibleName).toBeTruthy();
    }
  });
});
