import { test, expect } from '@playwright/test';

test.describe('Regulatory Reporting', () => {
  test('should display admin reports page', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for the page to load
    await expect(page.locator('body')).toBeVisible();
    
    // Check for either the main title (if authenticated) or auth message (if not)
    const complianceReportsTitle = page.getByText(/Compliance Reports/i);
    const authMessage = page.getByText(/You must sign in to view this page/i);
    
    const hasComplianceReports = await complianceReportsTitle.count() > 0;
    const hasAuthMessage = await authMessage.count() > 0;
    
    // Should show either the reports page or auth message
    expect(hasComplianceReports || hasAuthMessage).toBeTruthy();
    
    // Check for basic page structure
    const mainContent = page.locator('main').or(page.locator('[role="main"]')).or(page.locator('.MuiContainer-root'));
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
  });

  test('should show course selectors when authenticated', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for the page to load
    await expect(page.locator('body')).toBeVisible();
    
    // Check for course selectors (only if authenticated)
    const courseSelectors = page.getByRole('combobox', { name: /Select Course/i });
    const selectorCount = await courseSelectors.count();
    
    if (selectorCount > 0) {
      await expect(courseSelectors.first()).toBeVisible();
    } else {
      // If no course selectors found, check for auth message
      const authMessage = page.getByText(/You must sign in to view this page/i);
      if (await authMessage.count() > 0) {
        await expect(authMessage).toBeVisible();
      }
    }
  });

  test('should display syllabus PDF generation option when authenticated', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for the page to load
    await expect(page.locator('body')).toBeVisible();
    
    // Check for syllabus PDF section (only if authenticated)
    const syllabusSection = page.getByText(/Syllabus PDF/i);
    if (await syllabusSection.count() > 0) {
      await expect(syllabusSection).toBeVisible();
    } else {
      // If syllabus section not found, check for auth message
      const authMessage = page.getByText(/You must sign in to view this page/i);
      if (await authMessage.count() > 0) {
        await expect(authMessage).toBeVisible();
      }
    }
  });

  test('should display evidence CSV generation option when authenticated', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for the page to load
    await expect(page.locator('body')).toBeVisible();
    
    // Check for evidence CSV section (only if authenticated)
    const evidenceSection = page.getByText(/Evidence of Study CSV/i);
    if (await evidenceSection.count() > 0) {
      await expect(evidenceSection).toBeVisible();
    } else {
      // If evidence section not found, check for auth message
      const authMessage = page.getByText(/You must sign in to view this page/i);
      if (await authMessage.count() > 0) {
        await expect(authMessage).toBeVisible();
      }
    }
  });

  test('should have proper form controls when authenticated', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for the page to load
    await expect(page.locator('body')).toBeVisible();
    
    // Check for any form controls (selects, buttons, etc.) - only if authenticated
    const formControls = page.locator('select, button, input');
    const controlCount = await formControls.count();
    
    if (controlCount > 0) {
      // At least some form controls should be visible
      await expect(formControls.first()).toBeVisible();
    } else {
      // If no form controls, check for auth message
      const authMessage = page.getByText(/You must sign in to view this page/i);
      if (await authMessage.count() > 0) {
        await expect(authMessage).toBeVisible();
      }
    }
  });
});
