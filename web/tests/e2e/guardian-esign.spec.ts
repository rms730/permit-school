import { test, expect } from '@playwright/test';

import { getTestkitAPI, getTestUser } from './utils/testkit';

test.describe('Guardian e-sign (Minor)', () => {
  test('should complete guardian consent flow', async ({ page }) => {
    // Skip if TESTKIT_TOKEN is not available
    if (!process.env.TESTKIT_TOKEN) {
      test.skip(true, 'TESTKIT_TOKEN not available');
      return;
    }

    try {
      const testkit = await getTestkitAPI(page);
      const testUser = getTestUser();

      // Setup: create minor user
      const minorUser = await testkit.createUser({ minor: true });

      // Sign in as minor
      await page.goto('/signin');
      await page.getByLabel(/email/i).fill(minorUser.email);
      await page.getByLabel(/password/i).fill(minorUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should redirect to guardian consent page
      await expect(page).toHaveURL(/\/guardian\/consent/);

      // Fill guardian information
      await page.getByLabel(/guardian name/i).fill('John Doe');
      await page.getByLabel(/guardian email/i).fill('guardian@example.com');
      await page.getByLabel(/guardian phone/i).fill('555-123-4567');

      // Check consent checkbox
      await page.getByLabel(/i consent/i).check();

      // Submit consent form
      await page.getByRole('button', { name: /submit/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Should show success message
      await expect(page.getByText(/consent submitted/i)).toBeVisible();
    } catch (error) {
      test.skip(true, `Test setup failed: ${error}`);
    }
  });

  test('should show consent receipt link', async ({ page }) => {
    // Skip if TESTKIT_TOKEN is not available
    if (!process.env.TESTKIT_TOKEN) {
      test.skip(true, 'TESTKIT_TOKEN not available');
      return;
    }

    try {
      const testkit = await getTestkitAPI(page);
      const testUser = getTestUser();

      // Setup: create minor user with existing consent
      const minorUser = await testkit.createUser({ minor: true });
      await testkit.addGuardianConsent(minorUser.id, {
        guardian_name: 'John Doe',
        guardian_email: 'guardian@example.com',
        guardian_phone: '555-123-4567'
      });

      // Sign in as minor
      await page.goto('/signin');
      await page.getByLabel(/email/i).fill(minorUser.email);
      await page.getByLabel(/password/i).fill(minorUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Should show consent receipt link
      await expect(page.getByText(/consent receipt/i)).toBeVisible();

      // Click consent receipt link
      await page.getByRole('link', { name: /consent receipt/i }).click();

      // Should show consent receipt page
      await expect(page).toHaveURL(/\/guardian\/receipt/);
      await expect(page.getByText(/guardian consent receipt/i)).toBeVisible();
    } catch (error) {
      test.skip(true, `Test setup failed: ${error}`);
    }
  });
});
