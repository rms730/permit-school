import { test, expect } from '@playwright/test';

import { getTestkitAPI, getTestUser } from './utils/testkit';

test.describe('Auth & Onboarding (Adult)', () => {
  test('should complete signup and onboarding flow', async ({ page }) => {
    const testkit = await getTestkitAPI(page);
    const testUser = getTestUser();

    // Start at signin page
    await page.goto('/signin');

    // Click sign up link
    await page.getByRole('link', { name: /sign up/i }).click();

    // Fill signup form
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/);

    // Step 1: About you
    await page.getByLabel(/first name/i).fill(testUser.first_name);
    await page.getByLabel(/last name/i).fill(testUser.last_name);
    await page.getByLabel(/date of birth/i).fill(testUser.date_of_birth);
    await page.getByLabel(/phone/i).fill('+15551234567');
    await page.getByRole('button', { name: /next/i }).click();

    // Step 2: Address
    await page.getByLabel(/address line 1/i).fill('123 Test St');
    await page.getByLabel(/address line 2/i).fill('Apt 1');
    await page.getByLabel(/city/i).fill('Test City');
    await page.getByLabel(/state/i).fill('CA');
    await page.getByLabel(/zip code/i).fill('90210');
    await page.getByRole('button', { name: /next/i }).click();

    // Step 3: Agreements (no guardian step for adult)
    await page.getByLabel(/I agree to the Terms of Service/i).check();
    await page.getByLabel(/I agree to the Privacy Policy/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 4: Review
    await page.getByRole('button', { name: /complete profile/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Profile completeness banner should not be visible
    await expect(page.getByText(/complete your profile/i)).not.toBeVisible();

    // Should show welcome message
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should enroll in course after onboarding', async ({ page }) => {
    const testkit = await getTestkitAPI(page);
    const testUser = getTestUser();

    // Enroll user in course via testkit
    await testkit.enrollUser(testUser.id, 'CA', 'DE-ONLINE');

    // Sign in
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Should show course enrollment
    await expect(page.getByText(/CA DE-ONLINE/i)).toBeVisible();
  });
});
