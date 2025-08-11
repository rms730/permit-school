import { test, expect } from '@playwright/test';

test.describe('Public Catalog & i18n', () => {
  test('should display course catalog with upgrade CTA', async ({ page }) => {
    await page.goto('/courses');

    // Should show course catalog
    await expect(page.getByText(/available courses/i)).toBeVisible();

    // Should show CA course
    await expect(page.getByText(/CA DE-ONLINE/i)).toBeVisible();

    // Should show upgrade CTA when priced
    await expect(page.getByRole('button', { name: /upgrade/i })).toBeVisible();
  });

  test('should toggle language and update content', async ({ page }) => {
    await page.goto('/');

    // Check initial language (should be English)
    await expect(page).toHaveAttribute('html', 'lang', 'en');

    // Find language switcher and click it
    const languageSwitcher = page.getByRole('button', { name: /language/i });
    await languageSwitcher.click();

    // Select Spanish
    await page.getByRole('option', { name: /español/i }).click();

    // Should update language attribute
    await expect(page).toHaveAttribute('html', 'lang', 'es');

    // Should update navigation text
    await expect(page.getByRole('link', { name: /inicio/i })).toBeVisible();

    // Switch back to English
    await languageSwitcher.click();
    await page.getByRole('option', { name: /english/i }).click();

    // Should be back to English
    await expect(page).toHaveAttribute('html', 'lang', 'en');
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
  });

  test('should maintain language preference across pages', async ({ page }) => {
    await page.goto('/');

    // Switch to Spanish
    const languageSwitcher = page.getByRole('button', { name: /language/i });
    await languageSwitcher.click();
    await page.getByRole('option', { name: /español/i }).click();

    // Navigate to courses page
    await page.goto('/courses');

    // Should maintain Spanish language
    await expect(page).toHaveAttribute('html', 'lang', 'es');
    await expect(page.getByText(/cursos disponibles/i)).toBeVisible();
  });
});
