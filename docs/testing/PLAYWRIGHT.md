---
title: "Playwright E2E Testing"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/testing/STRATEGY.md>
  - </docs/testing/COVERAGE.md>
  - </web/tests/e2e/>
---

# Playwright E2E Testing

**Purpose & Outcome**  
Complete guide for end-to-end testing with Playwright, covering test setup, writing tests, debugging, and maintaining a robust E2E test suite for Permit School.

## Overview

Playwright is our primary end-to-end testing framework, providing:
- **Cross-browser testing** (Chromium, Firefox, Safari)
- **Reliable automation** with auto-waiting and retry mechanisms
- **Powerful debugging** with traces, videos, and screenshots
- **Test data management** via Testkit API
- **CI/CD integration** with GitHub Actions

## Test Structure

### File Organization

```
web/tests/e2e/
├── global-setup.ts              # Global test setup
├── global-teardown.ts           # Global test cleanup
├── utils/                       # Test utilities
│   ├── testkit.ts              # Testkit API helpers
│   └── auth.ts                 # Authentication helpers
├── auth-onboarding.spec.ts      # User registration & onboarding
├── auth-ui.spec.ts             # Authentication UI flows
├── billing-lifecycle.spec.ts    # Complete billing workflow
├── dual-product.spec.ts        # Multi-state functionality
├── exam-certificate.spec.ts     # Exam completion & certificates
├── final-exam.spec.ts          # Final exam workflow
├── guardian-esign.spec.ts      # Guardian consent flow
├── guardian-notifications.spec.ts # Guardian notification system
├── home-nav-and-faq.spec.ts    # Navigation & FAQ
├── home.spec.ts                # Homepage functionality
├── i18n-switcher.spec.ts       # Internationalization
├── interactivity-fixes.spec.ts # UI interactivity
├── learn-quiz.spec.ts          # Learning & quiz flow
├── learner-features.spec.ts    # Core learner features
├── navigation-fixes.spec.ts    # Navigation improvements
├── offline-review.spec.ts      # Offline functionality
└── regulatory-reporting.spec.ts # Admin reporting
```

### Test Categories

| Category | Test Files | Purpose |
|----------|------------|---------|
| **Authentication** | `auth-*.spec.ts` | User registration, login, onboarding |
| **Learning** | `learn-*.spec.ts` | Course enrollment, unit navigation, quizzes |
| **Assessment** | `exam-*.spec.ts` | Final exams, certificates |
| **Billing** | `billing-*.spec.ts` | Payment processing, subscriptions |
| **Guardian** | `guardian-*.spec.ts` | Guardian consent, notifications |
| **Admin** | `regulatory-*.spec.ts` | Admin operations, reporting |
| **UI/UX** | `*-ui.spec.ts`, `*-fixes.spec.ts` | Interface testing, accessibility |
| **Internationalization** | `i18n-*.spec.ts` | Multi-language support |

## Configuration

### Playwright Config

```typescript
// web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run start:ci',
    url: 'http://localhost:4330',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Environment Variables

```bash
# Required for E2E tests
TESTKIT_ON=true                    # Enable testkit API
TESTKIT_TOKEN=dev-super-secret     # Testkit authentication
NEXT_PUBLIC_ENV=test               # Test environment
SUPABASE_URL=http://127.0.0.1:54321 # Local Supabase
SUPABASE_SERVICE_ROLE_KEY=your_key  # Supabase service role
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { getTestkitAPI } from './utils/testkit';

test.describe('User Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Reset test data before each test
    const testkit = await getTestkitAPI(page);
    await testkit.reset();
  });

  test('adult user can complete onboarding', async ({ page }) => {
    // Arrange - Set up test data
    const testkit = await getTestkitAPI(page);
    await testkit.createUser({
      email: 'adult@test.com',
      admin: false,
      profile: {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
      },
    });

    // Act - Perform user actions
    await page.goto('/signin');
    await page.getByLabel('Email').fill('adult@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Assert - Verify expected outcomes
    await expect(page.getByText('Welcome, John')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Test Data Management

#### Testkit API Usage

```typescript
// tests/e2e/utils/testkit.ts
export async function getTestkitAPI(page: Page) {
  return {
    reset: async () => {
      await page.request.post('/api/testkit/reset', {
        headers: { 'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}` }
      });
    },

    createUser: async (userData: any) => {
      return await page.request.post('/api/testkit/user', {
        data: userData,
        headers: { 'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}` }
      });
    },

    enroll: async (enrollmentData: any) => {
      return await page.request.post('/api/testkit/enroll', {
        data: enrollmentData,
        headers: { 'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}` }
      });
    },

    addSeatTime: async (seatTimeData: any) => {
      return await page.request.post('/api/testkit/seat-time', {
        data: seatTimeData,
        headers: { 'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}` }
      });
    },
  };
}
```

#### Authentication Helpers

```typescript
// tests/e2e/utils/auth.ts
export async function signInAs(page: Page, email: string, password: string = 'password123') {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
}

export async function signInAsAdmin(page: Page) {
  await signInAs(page, 'admin@test.com');
}

export async function signInAsStudent(page: Page) {
  await signInAs(page, 'student@test.com');
}
```

### Selector Strategy

#### Preferred Selectors

```typescript
// ✅ Role-based selectors (preferred)
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('link', { name: 'Dashboard' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');

// ✅ Label-based selectors
await page.getByLabel('Email address').fill('test@example.com');
await page.getByLabel('Password').fill('password123');

// ✅ Test ID selectors (when needed)
await page.getByTestId('submit-button').click();
await page.getByTestId('error-message').toBeVisible();

// ✅ Text content selectors
await page.getByText('Welcome').toBeVisible();
await page.getByText('Sign In', { exact: true }).click();
```

#### Avoid These Selectors

```typescript
// ❌ CSS selectors (fragile)
await page.locator('.btn-primary').click();
await page.locator('#email-input').fill('test@example.com');

// ❌ XPath selectors (complex)
await page.locator('//button[contains(text(), "Submit")]').click();

// ❌ Implementation details
await page.locator('[data-testid="internal-button"]').click();
```

### Waiting Strategies

#### Best Practices

```typescript
// ✅ Use assertions instead of waits
await expect(page.getByText('Success')).toBeVisible();
await expect(page).toHaveURL('/dashboard');

// ✅ Wait for navigation
await page.waitForURL('/dashboard');

// ✅ Wait for network requests
await page.waitForResponse(response => 
  response.url().includes('/api/profile') && response.status() === 200
);

// ❌ Avoid arbitrary waits
await page.waitForTimeout(1000);
```

#### Auto-waiting

Playwright automatically waits for elements to be ready:

```typescript
// These automatically wait for the element to be ready
await page.getByRole('button').click();
await page.getByLabel('Email').fill('test@example.com');
await page.getByText('Welcome').toBeVisible();
```

## Test Examples

### Authentication Flow

```typescript
test('user can sign up and complete onboarding', async ({ page }) => {
  // Arrange
  const testkit = await getTestkitAPI(page);
  await testkit.reset();

  // Act - Sign up
  await page.goto('/signup');
  await page.getByLabel('Email').fill('newuser@test.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel('Confirm Password').fill('password123');
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Assert - Onboarding page
  await expect(page).toHaveURL('/onboarding');
  await expect(page.getByText('Complete Your Profile')).toBeVisible();

  // Act - Complete onboarding
  await page.getByLabel('First Name').fill('John');
  await page.getByLabel('Last Name').fill('Doe');
  await page.getByLabel('Date of Birth').fill('2000-01-01');
  await page.getByRole('button', { name: 'Complete Profile' }).click();

  // Assert - Dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome, John')).toBeVisible();
});
```

### Course Enrollment

```typescript
test('user can enroll in course', async ({ page }) => {
  // Arrange
  const testkit = await getTestkitAPI(page);
  await testkit.createUser({
    email: 'student@test.com',
    admin: false,
  });
  await signInAsStudent(page);

  // Act - Browse courses
  await page.goto('/courses');
  await page.getByRole('link', { name: 'California Driver Education' }).click();

  // Act - Enroll
  await page.getByRole('button', { name: 'Enroll Now' }).click();
  await page.getByRole('button', { name: 'Confirm Enrollment' }).click();

  // Assert - Enrollment success
  await expect(page.getByText('Enrollment Successful')).toBeVisible();
  await expect(page).toHaveURL(/\/learn/);
});
```

### Quiz Completion

```typescript
test('user can complete unit quiz', async ({ page }) => {
  // Arrange
  const testkit = await getTestkitAPI(page);
  await testkit.createUser({ email: 'student@test.com' });
  await testkit.enroll({ email: 'student@test.com', course_id: 'test-course' });
  await signInAsStudent(page);

  // Act - Navigate to quiz
  await page.goto('/learn/unit-1');
  await page.getByRole('button', { name: 'Start Quiz' }).click();

  // Act - Answer questions
  await page.getByRole('radio', { name: 'Stop' }).check();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('radio', { name: 'Yield' }).check();
  await page.getByRole('button', { name: 'Submit Quiz' }).click();

  // Assert - Quiz results
  await expect(page.getByText('Quiz Complete')).toBeVisible();
  await expect(page.getByText('Score: 100%')).toBeVisible();
});
```

### Guardian Consent Flow

```typescript
test('minor user requires guardian consent', async ({ page }) => {
  // Arrange
  const testkit = await getTestkitAPI(page);
  await testkit.createUser({
    email: 'minor@test.com',
    profile: { date_of_birth: '2010-01-01' }
  });

  // Act - Attempt enrollment
  await signInAs(page, 'minor@test.com');
  await page.goto('/courses');
  await page.getByRole('button', { name: 'Enroll Now' }).click();

  // Assert - Guardian consent required
  await expect(page.getByText('Guardian Consent Required')).toBeVisible();
  await page.getByLabel('Guardian Name').fill('Jane Doe');
  await page.getByLabel('Guardian Email').fill('guardian@test.com');
  await page.getByRole('button', { name: 'Request Consent' }).click();

  // Assert - Consent email sent
  await expect(page.getByText('Consent request sent')).toBeVisible();
});
```

## Debugging Tests

### Running Tests in Debug Mode

```bash
# Debug specific test
npx playwright test auth-onboarding.spec.ts --debug

# Debug with browser UI
npx playwright test --ui

# Debug with headed browser
npx playwright test --headed
```

### Using Traces

```typescript
// Enable traces in config
use: {
  trace: 'on-first-retry', // or 'on' for all tests
}

// View traces
npx playwright show-trace trace.zip
```

### Screenshots and Videos

```typescript
// Manual screenshots
await page.screenshot({ path: 'debug-screenshot.png' });

// Manual videos
await page.video()?.saveAs('debug-video.webm');
```

### Console Logging

```typescript
// Debug with console logs
test('debug test', async ({ page }) => {
  console.log('Starting test...');
  await page.goto('/');
  console.log('Page loaded');
  
  // Use page.evaluate for browser console
  await page.evaluate(() => {
    console.log('Browser console message');
  });
});
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/ci.yml
- name: Install Playwright
  run: npm --prefix web run test:e2e:install

- name: Run E2E tests
  run: npm --prefix web run test:e2e
  env:
    TESTKIT_ON: true
    TESTKIT_TOKEN: ${{ secrets.TESTKIT_TOKEN }}
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: web/playwright-report/
    retention-days: 30
```

### Parallel Execution

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Best Practices

### Test Organization

1. **Group related tests** using `test.describe()`
2. **Use descriptive test names** that explain the scenario
3. **Keep tests independent** - each test should be able to run alone
4. **Use beforeEach/afterEach** for setup and cleanup

### Test Data Management

1. **Reset data before each test** using Testkit API
2. **Create minimal test data** - only what's needed for the test
3. **Use realistic data** that matches production scenarios
4. **Clean up after tests** to prevent data pollution

### Selector Strategy

1. **Prefer role-based selectors** for better accessibility
2. **Use test IDs sparingly** - only when other selectors don't work
3. **Avoid CSS selectors** - they're fragile and implementation-dependent
4. **Make selectors resilient** to UI changes

### Error Handling

1. **Test error scenarios** - not just happy paths
2. **Verify error messages** are user-friendly
3. **Test network failures** and recovery
4. **Handle async operations** properly

### Performance

1. **Keep tests fast** - aim for under 30 seconds per test
2. **Use efficient selectors** - avoid complex XPath or CSS
3. **Minimize network requests** - mock when possible
4. **Run tests in parallel** when possible

## Common Patterns

### Form Testing

```typescript
test('form validation works', async ({ page }) => {
  await page.goto('/signup');
  
  // Test required field validation
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page.getByText('Email is required')).toBeVisible();
  
  // Test email validation
  await page.getByLabel('Email').fill('invalid-email');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page.getByText('Invalid email format')).toBeVisible();
  
  // Test successful submission
  await page.getByLabel('Email').fill('valid@email.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL('/onboarding');
});
```

### API Testing

```typescript
test('API endpoints work correctly', async ({ page }) => {
  // Test health endpoint
  const healthResponse = await page.request.get('/api/health');
  expect(healthResponse.status()).toBe(200);
  
  // Test authenticated endpoint
  const profileResponse = await page.request.get('/api/profile');
  expect(profileResponse.status()).toBe(401); // Unauthenticated
  
  // Test with authentication
  await signInAsStudent(page);
  const authProfileResponse = await page.request.get('/api/profile');
  expect(authProfileResponse.status()).toBe(200);
});
```

### Navigation Testing

```typescript
test('navigation works correctly', async ({ page }) => {
  await signInAsStudent(page);
  
  // Test main navigation
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page).toHaveURL('/dashboard');
  
  await page.getByRole('link', { name: 'Courses' }).click();
  await expect(page).toHaveURL('/courses');
  
  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page).toHaveURL('/profile');
});
```

## Troubleshooting

### Common Issues

1. **Element not found**
   - Check if element is visible and in viewport
   - Verify selector is correct
   - Add wait for element to be ready

2. **Test flakiness**
   - Use proper waiting strategies
   - Avoid race conditions
   - Reset test data properly

3. **Authentication issues**
   - Verify test user exists
   - Check authentication state
   - Use proper sign-in helpers

4. **Network timeouts**
   - Increase timeout values
   - Check network connectivity
   - Verify API endpoints are working

### Debug Commands

```bash
# Run specific test with debug
npx playwright test auth-onboarding.spec.ts --debug

# Run with headed browser
npx playwright test --headed

# Run with UI mode
npx playwright test --ui

# Show test report
npx playwright show-report

# Generate code from actions
npx playwright codegen localhost:3000
```

---

**Next**: [Testing Strategy](STRATEGY.md) - Overall testing approach and methodology
