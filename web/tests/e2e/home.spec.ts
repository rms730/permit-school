import { test, expect } from '@playwright/test';

test('Home page loads without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  const consoleLogs: string[] = [];
  const failedRequests: string[] = [];
  
  // Capture console logs and errors
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  // Capture failed network requests
  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });

  // Navigate to the home page
  await page.goto('/en', { waitUntil: 'domcontentloaded' });
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Log detailed information for debugging
  console.log('Console logs:', consoleLogs);
  console.log('Errors:', errors);
  console.log('Failed requests:', failedRequests);
  
  // Verify the page loads without errors
  expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0);
  
  // Verify key elements are present using specific selectors
  await expect(page.locator('h1')).toContainText('Pass your California permit test');
  await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Simple, Transparent Pricing' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();
});
