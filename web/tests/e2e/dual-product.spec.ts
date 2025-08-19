import { test, expect } from '@playwright/test';
import { testkit } from './utils/testkit';

test.describe('Dual Product Implementation', () => {
  test.beforeEach(async ({ page }) => {
    // Seed test data before each test
    await testkit.seedPrograms();
    await testkit.seedPrepTests();
    await testkit.seedPrepBlueprints();
  });

  test('displays both marketing pages', async ({ page }) => {
    // Test permits marketing page
    await page.goto('/permits');
    await expect(page).toHaveTitle(/Driver Permits/);
    await expect(page.locator('h1')).toContainText('Pass your permit test');

    // Test prep marketing page
    await page.goto('/prep');
    await expect(page).toHaveTitle(/College Test Prep/);
    await expect(page.locator('h1')).toContainText('Master the ACT & SAT');
  });

  test('displays diagnostic test page', async ({ page }) => {
    await page.goto('/prep/diagnostic');
    await expect(page).toHaveTitle(/Diagnostic Test/);
    await expect(page.locator('h1')).toContainText('Discover Your Starting Point');
    await expect(page.locator('text=Start Free Diagnostic')).toBeVisible();
  });

  test('displays mock test page', async ({ page }) => {
    await page.goto('/prep/mock');
    await expect(page).toHaveTitle(/Mock Test/);
    await expect(page.locator('h1')).toContainText('Practice Like It\'s the Real Thing');
    await expect(page.locator('text=Take Mock Test')).toBeVisible();
    
    // Check for test format information
    await expect(page.locator('text=ACT')).toBeVisible();
    await expect(page.locator('text=SAT')).toBeVisible();
    await expect(page.locator('text=Total Time: 3 hours')).toBeVisible();
  });

  test('displays score report page', async ({ page }) => {
    // Navigate to a mock score report
    await page.goto('/prep/score-report/test-attempt-123');
    await expect(page).toHaveTitle(/Score Report/);
    await expect(page.locator('h1')).toContainText('Score Report');
    await expect(page.locator('text=Composite Score')).toBeVisible();
    await expect(page.locator('text=Section Breakdown')).toBeVisible();
    await expect(page.locator('text=Skill Analysis')).toBeVisible();
  });

  test('seeding endpoints work correctly', async ({ page }) => {
    const response = await page.request.post('/api/testkit/programs/seed', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      },
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.message).toContain('successfully');
    expect(data.programs).toHaveLength(3); // PERMIT, ACT, SAT
    expect(data.courses).toHaveLength(2); // ACT-PREP-101, SAT-PREP-101
  });
});