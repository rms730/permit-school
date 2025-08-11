import { test, expect } from '@playwright/test';
import { getTestkitAPI, getTestUser } from './utils/testkit';

test.describe('Learn → Seat-time Gating → Unit Quiz', () => {
  test('should gate quiz behind seat-time requirements', async ({ page }) => {
    const testkit = await getTestkitAPI(page);
    const testUser = getTestUser();

    // Enroll user and add minimal seat time
    await testkit.enrollUser(testUser.id, 'CA', 'DE-ONLINE');
    await testkit.addSeatTime(testUser.id, 'CA', 'DE-ONLINE', 1000); // 1 second

    // Sign in
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Navigate to course
    await page.goto('/course/CA/DE-ONLINE');

    // Click on first unit
    await page.getByRole('link', { name: /unit 1/i }).first().click();

    // Should be on unit page
    await expect(page).toHaveURL(/\/learn\//);

    // Take Quiz button should be disabled (insufficient seat time)
    const takeQuizButton = page.getByRole('button', { name: /take quiz/i });
    await expect(takeQuizButton).toBeDisabled();
  });

  test('should enable quiz after sufficient seat-time', async ({ page }) => {
    const testkit = await getTestkitAPI(page);
    const testUser = getTestUser();

    // Enroll user and add sufficient seat time (30 minutes)
    await testkit.enrollUser(testUser.id, 'CA', 'DE-ONLINE');
    await testkit.addSeatTime(testUser.id, 'CA', 'DE-ONLINE', 30 * 60 * 1000);

    // Sign in
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Navigate to course
    await page.goto('/course/CA/DE-ONLINE');

    // Click on first unit
    await page.getByRole('link', { name: /unit 1/i }).first().click();

    // Should be on unit page
    await expect(page).toHaveURL(/\/learn\//);

    // Take Quiz button should be enabled
    const takeQuizButton = page.getByRole('button', { name: /take quiz/i });
    await expect(takeQuizButton).toBeEnabled();

    // Start quiz
    await takeQuizButton.click();

    // Should be on quiz page
    await expect(page).toHaveURL(/\/quiz\/start\//);

    // Answer a couple of questions
    for (let i = 0; i < 2; i++) {
      // Select first answer option
      await page.locator('input[type="radio"]').first().check();
      await page.getByRole('button', { name: /next/i }).click();
    }

    // Complete quiz
    await page.getByRole('button', { name: /submit/i }).click();

    // Should show quiz results
    await expect(page.getByText(/quiz complete/i)).toBeVisible();
    await expect(page.getByText(/score/i)).toBeVisible();
  });
});
