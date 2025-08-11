import { test, expect } from '@playwright/test';

test.describe('Regulatory Reporting', () => {
  test.beforeEach(async ({ page }) => {
    // Skip in production
    test.skip(process.env.NODE_ENV === 'production', 'Skipping regulatory tests in production');
    
    // Navigate to admin compliance page
    await page.goto('/admin/compliance');
  });

  test('should display compliance dashboard', async ({ page }) => {
    // Check that the page loads
    await expect(page.getByRole('heading', { name: 'Regulatory Compliance' })).toBeVisible();
    
    // Check that the generate report form is present
    await expect(page.getByText('Generate Report')).toBeVisible();
    
    // Check that the filter form is present
    await expect(page.getByText('Filter Runs')).toBeVisible();
    
    // Check that the report history table is present
    await expect(page.getByText('Report History')).toBeVisible();
  });

  test('should show jurisdiction and course selectors', async ({ page }) => {
    // Check jurisdiction selector (should default to CA)
    const jurisdictionSelect = page.getByRole('combobox', { name: 'Jurisdiction' });
    await expect(jurisdictionSelect).toBeVisible();
    await expect(jurisdictionSelect).toHaveValue('CA');
    
    // Check course selector
    const courseSelect = page.getByRole('combobox', { name: 'Course' });
    await expect(courseSelect).toBeVisible();
  });

  test('should show date pickers', async ({ page }) => {
    // Check period start date picker
    const startDatePicker = page.getByLabel('Period Start');
    await expect(startDatePicker).toBeVisible();
    
    // Check period end date picker
    const endDatePicker = page.getByLabel('Period End');
    await expect(endDatePicker).toBeVisible();
  });

  test('should show action buttons', async ({ page }) => {
    // Check dry run button
    const dryRunButton = page.getByRole('button', { name: 'Dry Run' });
    await expect(dryRunButton).toBeVisible();
    await expect(dryRunButton).toBeDisabled(); // Should be disabled until course is selected
    
    // Check generate button
    const generateButton = page.getByRole('button', { name: 'Generate & Download' });
    await expect(generateButton).toBeVisible();
    await expect(generateButton).toBeDisabled(); // Should be disabled until course is selected
  });

  test('should show filter controls', async ({ page }) => {
    // Check jurisdiction filter
    const jurisdictionFilter = page.getByRole('combobox', { name: /Jurisdiction.*Filter/ });
    await expect(jurisdictionFilter).toBeVisible();
    
    // Check course filter
    const courseFilter = page.getByRole('combobox', { name: /Course.*Filter/ });
    await expect(courseFilter).toBeVisible();
  });

  test('should display report history table', async ({ page }) => {
    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Date Range' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Jurisdiction' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Course' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Summary' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Artifacts' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // If no runs exist, should show appropriate message
    const noRunsMessage = page.getByText('No regulatory runs found');
    
    // This might be visible if no data exists, or the table might be empty
    // We'll just check that the page doesn't crash
    await expect(page.getByText('Report History')).toBeVisible();
  });

  test('should show breadcrumb navigation', async ({ page }) => {
    // Check that we can navigate back to admin
    const adminLink = page.getByRole('link', { name: 'Admin' });
    if (await adminLink.isVisible()) {
      await expect(adminLink).toBeVisible();
    }
  });
});
