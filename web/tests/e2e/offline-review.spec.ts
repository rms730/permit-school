import { test, expect } from '@playwright/test';

test.describe('Offline Review Kit', () => {
  test.beforeEach(async ({ page }) => {
    // Block all external requests except localhost
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        route.continue();
      } else {
        console.log(`Blocked external request: ${url}`);
        route.abort();
      }
    });

    // Set offline mode environment variable
    await page.addInitScript(() => {
      window.localStorage.setItem('OFFLINE_DEV', '1');
    });
  });

  test('should work completely offline with local Supabase', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Verify offline mode indicator is present
    await expect(page.locator('text=OFFLINE')).toBeVisible();
    
    // Test login with offline test user
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'student@offline.local');
    await page.fill('input[type="password"]', 'student123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL('**/dashboard');
    
    // Verify we're on the dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Test navigation to courses
    await page.click('text=Learn');
    await page.waitForURL('**/courses');
    await expect(page.locator('text=Available Courses')).toBeVisible();
    
    // Test course enrollment and learning
    await page.click('text=CA_DL_BASIC');
    await page.waitForURL('**/course/**');
    
    // Test quiz functionality
    await page.click('text=Start Quiz');
    await page.waitForURL('**/quiz/**');
    
    // Answer a few questions
    for (let i = 0; i < 3; i++) {
      await page.click('input[type="radio"]:first-child');
      await page.click('text=Next');
      await page.waitForTimeout(500);
    }
    
    // Complete quiz
    await page.click('text=Complete Quiz');
    await page.waitForURL('**/course/**');
    
    // Test exam functionality
    await page.click('text=Begin Exam');
    await page.waitForURL('**/exam/**');
    
    // Answer exam questions
    for (let i = 0; i < 5; i++) {
      await page.click('input[type="radio"]:first-child');
      await page.click('text=Next');
      await page.waitForTimeout(500);
    }
    
    // Complete exam
    await page.click('text=Complete Exam');
    await page.waitForURL('**/exam/**');
    
    // Test certificate generation
    await expect(page.locator('text=Certificate')).toBeVisible();
    
    // Test admin functionality
    await page.goto('http://localhost:3000/admin');
    await page.fill('input[type="email"]', 'admin@offline.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    
    // Test admin issue certificate
    await page.click('text=Certificates');
    await page.waitForURL('**/admin/certificates');
    await expect(page.locator('text=Certificates')).toBeVisible();
    
    // Test notifications
    await page.goto('http://localhost:3000/notifications');
    await expect(page.locator('text=Notifications')).toBeVisible();
    
    // Test guardian functionality
    await page.goto('http://localhost:3000/guardian');
    await page.fill('input[type="email"]', 'guardian@offline.local');
    await page.fill('input[type="password"]', 'guardian123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/guardian');
    await expect(page.locator('text=My Students')).toBeVisible();
    
    // Test student view
    await page.click('text=View Progress');
    await page.waitForURL('**/guardian/student/**');
    await expect(page.locator('text=Course Progress')).toBeVisible();
  });

  test('should show offline mode indicators', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for offline badge in AppBar
    await expect(page.locator('text=OFFLINE')).toBeVisible();
    
    // Check console for offline mode logs
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('Offline Mode Active')) {
        logs.push(msg.text());
      }
    });
    
    // Wait a moment for logs to appear
    await page.waitForTimeout(1000);
    
    // Verify offline mode was logged
    expect(logs.length).toBeGreaterThan(0);
  });

  test('should disable external services in offline mode', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Google One-Tap should not be present
    await expect(page.locator('#google-one-tap-container')).not.toBeVisible();
    
    // Google sign-in button should be disabled or not present
    await expect(page.locator('text=Continue with Google')).not.toBeVisible();
    
    // Check that no external requests were made
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        externalRequests.push(url);
      }
    });
    
    // Wait a moment for any requests to complete
    await page.waitForTimeout(2000);
    
    // Verify no external requests were made
    expect(externalRequests.length).toBe(0);
  });

  test('should handle offline mode gracefully', async ({ page }) => {
    // Test that the app loads without external dependencies
    await page.goto('http://localhost:3000');
    
    // Verify core functionality works
    await expect(page.locator('text=Permit School')).toBeVisible();
    
    // Test navigation
    await page.click('text=Sign In');
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    // Test form functionality
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    
    // Verify no external API calls are made
    const apiCalls: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('api.') && !url.includes('localhost')) {
        apiCalls.push(url);
      }
    });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Verify no external API calls
    expect(apiCalls.length).toBe(0);
  });
});
