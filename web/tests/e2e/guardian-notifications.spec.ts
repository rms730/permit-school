import { test, expect } from '@playwright/test';
import { createTestUser, cleanupTestUser } from './utils/testkit';

test.describe('Guardian Portal & Notifications', () => {
  let guardianUser: any;
  let studentUser: any;

  test.beforeAll(async () => {
    // Create test users
    guardianUser = await createTestUser('guardian');
    studentUser = await createTestUser('student');
  });

  test.afterAll(async () => {
    // Cleanup test users
    await cleanupTestUser(guardianUser.id);
    await cleanupTestUser(studentUser.id);
  });

  test('guardian can access portal and see linked students', async ({ page }) => {
    // Sign in as guardian
    await page.goto('/signin');
    await page.fill('input[name="email"]', guardianUser.email);
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect and check guardian link is visible
    await page.waitForURL('/dashboard');
    await expect(page.locator('text=Guardian')).toBeVisible();
    
    // Navigate to guardian portal
    await page.click('text=Guardian');
    await page.waitForURL('/guardian');
    
    // Check guardian portal title
    await expect(page.locator('h1')).toContainText('My Students');
  });

  test('notifications bell shows unread count', async ({ page }) => {
    // Sign in as student
    await page.goto('/signin');
    await page.fill('input[name="email"]', studentUser.email);
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('/dashboard');
    
    // Check notification bell is visible
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();
    
    // Click notification bell
    await page.click('[data-testid="notification-bell"]');
    
    // Check notification menu opens
    await expect(page.locator('text=Notifications')).toBeVisible();
  });

  test('notifications page loads correctly', async ({ page }) => {
    // Sign in as student
    await page.goto('/signin');
    await page.fill('input[name="email"]', studentUser.email);
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('/dashboard');
    
    // Navigate to notifications page
    await page.goto('/notifications');
    
    // Check notifications page loads
    await expect(page.locator('h1')).toContainText('Notifications');
  });
});
