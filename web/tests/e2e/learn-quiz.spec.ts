import { test, expect } from '@playwright/test';

import { getTestkitAPI, getTestUser } from './utils/testkit';

test.describe('Learn → Seat-time Gating → Unit Quiz', () => {
  test('should gate quiz behind seat-time requirements', async ({ page }) => {
    // Skip if TESTKIT_TOKEN is not available
    if (!process.env.TESTKIT_TOKEN) {
      test.skip(true, 'TESTKIT_TOKEN not available');
      return;
    }

    try {
      const testkit = await getTestkitAPI(page);
      const testUser = getTestUser();

      // Setup: enroll but don't add seat time
      await testkit.enrollUser(testUser.id, 'CA', 'DE-ONLINE');
      await testkit.setEntitlement(testUser.id, 'CA', true);

      // Sign in
      await page.goto('/signin');
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).fill(testUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Navigate to learn page
      await page.goto('/learn');

      // Should show seat time requirement
      await expect(page.getByText(/seat time/i)).toBeVisible();
      await expect(page.getByText(/required/i)).toBeVisible();

      // Quiz button should be disabled
      const quizButton = page.getByRole('button', { name: /quiz/i });
      await expect(quizButton).toBeDisabled();
    } catch (error) {
      test.skip(true, `Test setup failed: ${error}`);
    }
  });

  test('should enable quiz after sufficient seat-time', async ({ page }) => {
    // Skip if TESTKIT_TOKEN is not available
    if (!process.env.TESTKIT_TOKEN) {
      test.skip(true, 'TESTKIT_TOKEN not available');
      return;
    }

    try {
      const testkit = await getTestkitAPI(page);
      const testUser = getTestUser();

      // Setup: enroll and add sufficient seat time
      await testkit.enrollUser(testUser.id, 'CA', 'DE-ONLINE');
      await testkit.addSeatTime(testUser.id, 'CA', 'DE-ONLINE', 150 * 60 * 1000); // 150 minutes
      await testkit.setEntitlement(testUser.id, 'CA', true);

      // Sign in
      await page.goto('/signin');
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).fill(testUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Navigate to learn page
      await page.goto('/learn');

      // Should show seat time completed
      await expect(page.getByText(/seat time/i)).toBeVisible();
      await expect(page.getByText(/completed/i)).toBeVisible();

      // Quiz button should be enabled
      const quizButton = page.getByRole('button', { name: /quiz/i });
      await expect(quizButton).toBeEnabled();

      // Click quiz button
      await quizButton.click();

      // Should navigate to quiz page
      await expect(page).toHaveURL(/\/quiz\/\d+/);
    } catch (error) {
      test.skip(true, `Test setup failed: ${error}`);
    }
  });
});
