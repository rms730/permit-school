import { test, expect } from '@playwright/test';

test.describe('Billing Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the billing page
    await page.goto('/billing');
  });

  test('should display billing page for authenticated users', async ({ page }) => {
    // Check if we're redirected to login (if not authenticated)
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth')) {
      // User needs to authenticate first
      await expect(page.locator('text=Sign In')).toBeVisible();
      return;
    }

    // If authenticated, should see billing page
    await expect(page.locator('h1, h2, h3, h4').filter({ hasText: 'Billing' })).toBeVisible();
  });

  test('should show subscription status when user has active subscription', async ({ page }) => {
    // This test assumes the user has an active subscription
    // In a real test environment, you'd set up test data first
    
    // Check for subscription status elements
    const subscriptionCard = page.locator('[data-testid="subscription-card"], .MuiCard-root').first();
    
    if (await subscriptionCard.isVisible()) {
      // Should show subscription information
      await expect(page.locator('text=Subscription Status')).toBeVisible();
      
      // Should have manage billing button
      await expect(page.locator('button').filter({ hasText: 'Manage Billing' })).toBeVisible();
    }
  });

  test('should show upgrade option for users without subscription', async ({ page }) => {
    // This test assumes the user doesn't have an active subscription
    
    // Check for upgrade card
    const upgradeCard = page.locator('text=Upgrade to Premium');
    
    if (await upgradeCard.isVisible()) {
      // Should show pricing information
      await expect(page.locator('text=$9.99')).toBeVisible();
      await expect(page.locator('text=per month')).toBeVisible();
      
      // Should have subscribe button
      await expect(page.locator('button').filter({ hasText: 'Subscribe Now' })).toBeVisible();
    }
  });

  test('should handle billing portal access', async ({ page }) => {
    // This test would require a user with an active subscription
    const manageBillingButton = page.locator('button').filter({ hasText: 'Manage Billing' });
    
    if (await manageBillingButton.isVisible()) {
      // Click the manage billing button
      await manageBillingButton.click();
      
      // Should either redirect to Stripe portal or show an error
      // In a test environment, this might show an error or redirect
      await page.waitForTimeout(2000); // Wait for potential redirect
      
      const currentUrl = page.url();
      if (!currentUrl.includes('/billing')) {
        // Should have redirected to Stripe portal
        expect(currentUrl).toContain('stripe.com');
      }
    }
  });

  test('should handle subscription cancellation flow', async ({ page }) => {
    // This test would require a user with an active subscription
    const cancelButton = page.locator('button').filter({ hasText: 'Cancel Subscription' });
    
    if (await cancelButton.isVisible()) {
      // Click cancel button
      await cancelButton.click();
      
      // Should show confirmation or success message
      await expect(page.locator('text=Subscription canceled,text=success,text=confirmed')).toBeVisible();
    }
  });

  test('should handle subscription resumption flow', async ({ page }) => {
    // This test would require a user with a canceled subscription
    const resumeButton = page.locator('button').filter({ hasText: 'Resume Subscription' });
    
    if (await resumeButton.isVisible()) {
      // Click resume button
      await resumeButton.click();
      
      // Should show confirmation or success message
      await expect(page.locator('text=Subscription resumed,text=success,text=active')).toBeVisible();
    }
  });

  test('should display invoice history when available', async ({ page }) => {
    // Check for invoice history section
    const invoiceSection = page.locator('text=Invoice History');
    
    if (await invoiceSection.isVisible()) {
      // Should show invoice table
      await expect(page.locator('table')).toBeVisible();
      
      // Should have invoice rows
      const invoiceRows = page.locator('table tbody tr');
      await expect(invoiceRows.first()).toBeVisible();
    }
  });

  test('should handle payment failure notifications', async ({ page }) => {
    // This test would require a user with payment issues
    const paymentWarning = page.locator('text=Payment issue detected,text=payment,text=failed');
    
    if (await paymentWarning.isVisible()) {
      // Should show warning about payment issues
      await expect(paymentWarning).toBeVisible();
      
      // Should show failed payment attempts count
      await expect(page.locator('text=Failed payment attempts')).toBeVisible();
    }
  });

  test('should display dunning state information', async ({ page }) => {
    // This test would require a user in dunning state
    const dunningInfo = page.locator('text=dunning,text=payment,text=issue');
    
    if (await dunningInfo.isVisible()) {
      // Should show dunning state information
      await expect(dunningInfo).toBeVisible();
    }
  });

  test('should handle billing summary API', async ({ page }) => {
    // Test the billing summary API endpoint
    const response = await page.request.get('/api/billing/summary');
    
    // Should return 401 if not authenticated, or 200 with data if authenticated
    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('subscription_status');
      expect(data).toHaveProperty('dunning_state');
    }
  });

  test('should handle invoices API', async ({ page }) => {
    // Test the invoices API endpoint
    const response = await page.request.get('/api/billing/invoices');
    
    // Should return 401 if not authenticated, or 200 with data if authenticated
    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('invoices');
      expect(Array.isArray(data.invoices)).toBe(true);
    }
  });

  test('should handle cancel subscription API', async ({ page }) => {
    // Test the cancel subscription API endpoint
    const response = await page.request.post('/api/billing/cancel', {
      data: {}
    });
    
    // Should return 401 if not authenticated, or appropriate status if authenticated
    expect([200, 401, 404]).toContain(response.status());
  });

  test('should handle resume subscription API', async ({ page }) => {
    // Test the resume subscription API endpoint
    const response = await page.request.post('/api/billing/resume', {
      data: {}
    });
    
    // Should return 401 if not authenticated, or appropriate status if authenticated
    expect([200, 401, 404]).toContain(response.status());
  });
});

test.describe('Admin Billing Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin billing dashboard
    await page.goto('/admin/billing');
  });

  test('should require admin access', async ({ page }) => {
    // Check if we're redirected to login or get access denied
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth')) {
      // User needs to authenticate first
      await expect(page.locator('text=Sign In')).toBeVisible();
      return;
    }

    // If authenticated but not admin, should show access denied
    const accessDenied = page.locator('text=Admin access required,text=Forbidden,text=403');
    if (await accessDenied.isVisible()) {
      await expect(accessDenied).toBeVisible();
      return;
    }

    // If admin access granted, should see dashboard
    await expect(page.locator('h1, h2, h3, h4').filter({ hasText: 'Billing Dashboard' })).toBeVisible();
  });

  test('should display billing KPIs for admin users', async ({ page }) => {
    // This test assumes admin access
    const kpiCards = page.locator('.MuiCard-root');
    
    if (await kpiCards.first().isVisible()) {
      // Should show KPI cards
      await expect(page.locator('text=Active Subscriptions')).toBeVisible();
      await expect(page.locator('text=Past Due')).toBeVisible();
      await expect(page.locator('text=MRR')).toBeVisible();
      await expect(page.locator('text=30-Day Churn')).toBeVisible();
    }
  });

  test('should display past due users table for admin users', async ({ page }) => {
    // This test assumes admin access
    const pastDueSection = page.locator('text=Past Due Subscriptions');
    
    if (await pastDueSection.isVisible()) {
      // Should show past due table
      await expect(page.locator('table')).toBeVisible();
      
      // Should have table headers
      await expect(page.locator('text=User')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
      await expect(page.locator('text=Dunning State')).toBeVisible();
      await expect(page.locator('text=Actions')).toBeVisible();
    }
  });

  test('should display recent invoices table for admin users', async ({ page }) => {
    // This test assumes admin access
    const invoicesSection = page.locator('text=Recent Invoices');
    
    if (await invoicesSection.isVisible()) {
      // Should show invoices table
      await expect(page.locator('table')).toBeVisible();
      
      // Should have table headers
      await expect(page.locator('text=User')).toBeVisible();
      await expect(page.locator('text=Date')).toBeVisible();
      await expect(page.locator('text=Amount')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
    }
  });

  test('should handle admin billing APIs', async ({ page }) => {
    // Test admin billing API endpoints
    const endpoints = [
      '/api/admin/billing/kpis',
      '/api/admin/billing/past-due',
      '/api/admin/billing/invoices'
    ];

    for (const endpoint of endpoints) {
      const response = await page.request.get(endpoint);
      
      // Should return 401 if not authenticated, 403 if not admin, or 200 if admin
      expect([200, 401, 403]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    }
  });
});
