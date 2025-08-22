import { test, expect } from '@playwright/test';

test('Home page loads without runtime errors', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/en');
  
  // Wait for the page to load (use a shorter timeout)
  await page.waitForLoadState('domcontentloaded');
  
  // Log detailed information for debugging
  const consoleLogs: string[] = [];
  const errors: string[] = [];
  const failedRequests: string[] = [];
  
  page.on('console', (msg) => {
    consoleLogs.push(msg.text());
  });
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()}`);
  });
  
  // Wait a bit for any errors to accumulate
  await page.waitForTimeout(2000);
  
  // Log detailed information for debugging
  console.log('Console logs:', consoleLogs);
  console.log('Errors:', errors);
  console.log('Failed requests:', failedRequests);
  
  // Check for basic page structure
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  
  // Verify no critical errors
  expect(errors.length).toBe(0);
});
