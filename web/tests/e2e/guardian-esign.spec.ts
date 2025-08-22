import { test, expect } from '@playwright/test';

import { getTestkitAPI, getTestMinorUser } from './utils/testkit';

test.describe('Guardian e-sign (Minor)', () => {
  test('should complete guardian consent flow', async ({ page }) => {
    const testkit = await getTestkitAPI(page);
    const minorUser = getTestMinorUser();

    // Create guardian request via testkit
    const guardianRequest = await testkit.createGuardianRequest(
      minorUser.id,
      'CA',
      'DE-ONLINE'
    );

    // Navigate to guardian signing page
    await page.goto(guardianRequest.signing_url);

    // Should show guardian consent form
    await expect(page.getByText(/guardian consent/i)).toBeVisible();
    await expect(page.getByText(/student initials/i)).toBeVisible();

    // Fill guardian information
    await page.getByLabel(/guardian name/i).fill('Test Guardian');
    await page.getByLabel(/relationship/i).fill('Parent');
    await page.getByLabel(/I consent/i).check();

    // Submit consent
    await page.getByRole('button', { name: /submit consent/i }).click();

    // Should show success message
    await expect(page.getByText(/consent submitted/i)).toBeVisible();

    // Sign in as minor to verify status
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(minorUser.email);
    await page.getByLabel(/password/i).fill(minorUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Should show verified guardian status
    await expect(page.getByText(/verified/i)).toBeVisible();
  });

  test('should show consent receipt link', async ({ page }) => {
    const testkit = await getTestkitAPI(page);
    const minorUser = getTestMinorUser();

    // Create guardian request and complete consent
    const guardianRequest = await testkit.createGuardianRequest(
      minorUser.id,
      'CA',
      'DE-ONLINE'
    );

    await page.goto(guardianRequest.signing_url);
    await page.getByLabel(/guardian name/i).fill('Test Guardian');
    await page.getByLabel(/relationship/i).fill('Parent');
    await page.getByLabel(/I consent/i).check();
    await page.getByRole('button', { name: /submit consent/i }).click();

    // Should show receipt link
    await expect(page.getByText(/download receipt/i)).toBeVisible();
    
    // Receipt link should be clickable
    const receiptLink = page.getByRole('link', { name: /download receipt/i });
    await expect(receiptLink).toBeVisible();
    await expect(receiptLink).toHaveAttribute('href', /\.pdf$/);
  });
});
