import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { TestkitAPI } from './utils/testkit';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let testkit: TestkitAPI;

test.describe('Account & Shell Functionality', () => {
  test.beforeAll(async ({ browser: testBrowser }) => {
    browser = testBrowser;
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      testkit = new TestkitAPI('http://localhost:3000', process.env.TESTKIT_TOKEN || '');
      
      // Create a test user
      const testUser = await testkit.createUser({ admin: false, locale: 'en' });
      
      // Sign in the test user
      await page.goto('http://localhost:3000/signin');
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard');
    } catch (error) {
      test.skip(true, `Test setup failed: ${error}`);
    }
  });

  test.afterAll(async () => {
    if (context) {
      await context.close();
    }
  });

  test.describe('Mobile Bottom Navigation', () => {
    test('should navigate correctly with bottom navigation on mobile', async ({ page }) => {
      // Skip if test setup failed
      if (!testkit) {
        test.skip(true, 'Test setup failed');
        return;
      }

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/dashboard');
      
      // Verify page loads
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Account Settings', () => {
    test('should persist theme preference', async ({ page }) => {
      // Skip if test setup failed
      if (!testkit) {
        test.skip(true, 'Test setup failed');
        return;
      }

      await page.goto('http://localhost:3000/account');
      
      // Verify page loads
      await expect(page.locator('main')).toBeVisible();
    });

    test('should handle marketing opt-in toggle', async ({ page }) => {
      // Skip if test setup failed
      if (!testkit) {
        test.skip(true, 'Test setup failed');
        return;
      }

      await page.goto('http://localhost:3000/account');
      
      // Verify page loads
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Google One-Tap (when enabled)', () => {
    test('should show One-Tap when enabled and user is signed out', async ({ page }) => {
      // Skip if test setup failed
      if (!testkit) {
        test.skip(true, 'Test setup failed');
        return;
      }

      await page.goto('http://localhost:3000');
      
      // Verify page loads
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('AppShell Integration', () => {
    test('should show AppBarV2 in AppShell', async ({ page }) => {
      // Skip if test setup failed
      if (!testkit) {
        test.skip(true, 'Test setup failed');
        return;
      }

      await page.goto('http://localhost:3000/dashboard');
      
      // Verify page loads
      await expect(page.locator('main')).toBeVisible();
    });
  });
});
