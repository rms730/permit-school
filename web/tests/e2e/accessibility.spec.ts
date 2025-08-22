import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

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

  test('should have basic keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test that the page is keyboard accessible
    await page.keyboard.press('Tab');
    
    // Should be able to navigate with keyboard
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should have basic accessibility structure', async ({ page }) => {
    await page.goto('/');

    // Check for basic accessibility structure
    const mainContent = page.locator('main, [role="main"], #main');
    const hasMainContent = await mainContent.count() > 0;
    expect(hasMainContent).toBeTruthy();

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });
});
