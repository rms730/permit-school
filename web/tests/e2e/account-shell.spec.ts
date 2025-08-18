import { test, expect } from '@playwright/test';
import { TestkitAPI } from './utils/testkit';

test.describe('Account & Shell Functionality', () => {
  let testkit: TestkitAPI;
  let testUser: { email: string; password: string };

  test.beforeAll(async ({ browser }) => {
    // Create a testkit API instance
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4330');
    testkit = new TestkitAPI('http://127.0.0.1:4330', process.env.TESTKIT_TOKEN || '');
    
    // Create a test user
    const user = await testkit.createUser({ admin: false, locale: 'en' });
    testUser = { email: user.email, password: user.password };
    
    await context.close();
  });

  test.describe('Mobile Bottom Navigation', () => {
    test('should navigate correctly with bottom navigation on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Sign in first using the created test user
      await page.goto('/login');
      
      // Click "Sign in with Email" to show the form
      await page.click('text=Sign in with Email');
      
      // Fill in the form using proper selectors
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation to dashboard
      await page.waitForURL('/dashboard');

      // Check that bottom navigation is visible on mobile
      const bottomNav = page.locator('[role="tablist"]');
      await expect(bottomNav).toBeVisible();

      // Test navigation to different tabs
      const tabs = [
        { label: 'Home', url: '/dashboard' },
        { label: 'Learn', url: '/courses' },
        { label: 'Notifications', url: '/notifications' },
        { label: 'Profile', url: '/account' },
      ];

      for (const tab of tabs) {
        // Click the tab
        await page.click(`text=${tab.label}`);
        
        // Wait for navigation
        await page.waitForURL(tab.url);
        
        // Verify the tab is active
        const activeTab = page.locator(`[role="tab"][aria-selected="true"]`);
        await expect(activeTab).toContainText(tab.label);
      }
    });

    test('should have proper touch targets (≥44px)', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Sign in and navigate to dashboard
      await page.goto('/login');
      
      // Click "Sign in with Email" to show the form
      await page.click('text=Sign in with Email');
      
      // Fill in the form using proper selectors
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Check bottom navigation tabs
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        const box = await tab.boundingBox();
        
        // Check minimum touch target size (44px)
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test.describe('Account Settings', () => {
    test('should persist theme preference', async ({ page }) => {
      // Sign in
      await page.goto('/login');
      
      // Click "Sign in with Email" to show the form
      await page.click('text=Sign in with Email');
      
      // Fill in the form using proper selectors
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Navigate to account settings
      await page.goto('/account');

      // Navigate to profile edit
      await page.click('text=Profile');
      await page.waitForURL('/account/profile');

      // Change theme to dark
      await page.selectOption('select[aria-label="Theme"]', 'dark');
      await page.click('text=Save Changes');

      // Wait for save confirmation
      await page.waitForSelector('text=Profile updated successfully');

      // Reload page
      await page.reload();

      // Verify theme preference is persisted
      const themeSelect = page.locator('select[aria-label="Theme"]');
      await expect(themeSelect).toHaveValue('dark');
    });

    test('should upload and display avatar', async ({ page }) => {
      // Sign in
      await page.goto('/login');
      
      // Click "Sign in with Email" to show the form
      await page.click('text=Sign in with Email');
      
      // Fill in the form using proper selectors
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Navigate to profile edit
      await page.goto('/account/profile');

      // Upload avatar
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('tests/fixtures/avatar.jpg');

      // Wait for upload to complete
      await page.waitForSelector('text=Avatar updated successfully');

      // Verify avatar is displayed
      const avatar = page.locator('img[alt*="User"]');
      await expect(avatar).toBeVisible();

      // Check that avatar src is a signed URL (contains signature)
      const avatarSrc = await avatar.getAttribute('src');
      expect(avatarSrc).toContain('?');
      expect(avatarSrc).toContain('signature=');
    });

    test('should handle marketing opt-in toggle', async ({ page }) => {
      // Sign in
      await page.goto('/login');
      
      // Click "Sign in with Email" to show the form
      await page.click('text=Sign in with Email');
      
      // Fill in the form using proper selectors
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Navigate to privacy settings
      await page.goto('/account/privacy');

      // Toggle marketing opt-in
      const marketingToggle = page.locator('input[type="checkbox"]');
      const initialState = await marketingToggle.isChecked();
      
      await marketingToggle.click();

      // Wait for save confirmation
      await page.waitForSelector('text=Settings updated successfully');

      // Verify toggle state changed
      const newState = await marketingToggle.isChecked();
      expect(newState).toBe(!initialState);
    });

    test('should show Google auth status', async ({ page }) => {
      // Sign in
      await page.goto('/login');
      
      // Click "Sign in with Email" to show the form
      await page.click('text=Sign in with Email');
      
      // Fill in the form using proper selectors
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Navigate to auth settings
      await page.goto('/account/auth');

      // Check that auth methods are displayed
      await expect(page.locator('text=Sign-in Methods')).toBeVisible();
      await expect(page.locator('text=Email')).toBeVisible();
      await expect(page.locator('text=Google')).toBeVisible();

      // Check that email shows as active
      const emailStatus = page.locator('text=Email').locator('..').locator('[data-testid="status-chip"]');
      await expect(emailStatus).toContainText('Active');
    });
  });

  test.describe('Google One-Tap (when enabled)', () => {
    test('should show One-Tap when enabled and user is signed out', async ({ page }) => {
      // Set environment variable for One-Tap
      await page.addInitScript(() => {
        (window as any).process = { env: { NEXT_PUBLIC_GOOGLE_ONE_TAP: '1', NODE_ENV: 'test' } };
      });

      // Navigate to home page (signed out)
      await page.goto('/');

      // Check that One-Tap container is present
      const oneTapContainer = page.locator('#google-one-tap-container');
      await expect(oneTapContainer).toBeVisible();
    });

    test('should not show One-Tap when disabled', async ({ page }) => {
      // Set environment variable to disable One-Tap
      await page.addInitScript(() => {
        (window as any).process = { env: { NEXT_PUBLIC_GOOGLE_ONE_TAP: '0', NODE_ENV: 'test' } };
      });

      // Navigate to home page
      await page.goto('/');

      // Check that One-Tap container is not present
      const oneTapContainer = page.locator('#google-one-tap-container');
      await expect(oneTapContainer).not.toBeVisible();
    });
  });

  test.describe('AppShell Integration', () => {
    test('should show AppBarV2 in AppShell', async ({ page }) => {
      // Sign in
      await page.goto('/login');
      
      // Click "Sign in with Email" to show the form
      await page.click('text=Sign in with Email');
      
      // Fill in the form using proper selectors
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Check that AppBarV2 elements are present
      await expect(page.locator('text=Permit School')).toBeVisible();
      await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
    });

    test('should handle sign out from AppShell', async ({ page }) => {
      // Sign in
      await page.goto('/login');
      
      // Click "Sign in with Email" to show the form
      await page.click('text=Sign in with Email');
      
      // Fill in the form using proper selectors
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Click user avatar to open menu
      await page.click('[data-testid="user-avatar"]');

      // Click sign out
      await page.click('text=Sign Out');

      // Should redirect to home page
      await page.waitForURL('/');
    });
  });
});
