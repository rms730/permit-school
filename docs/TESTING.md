---
title: "Testing Guide"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/LOCAL_DEVELOPMENT.md>
  - </web/tests/e2e/README.md>
---

# Testing Guide

**Purpose & Outcome**  
Complete testing strategy for Permit School, covering unit tests, E2E tests, accessibility testing, and CI integration. This ensures code quality, prevents regressions, and maintains compliance requirements.

## Prerequisites

- ✅ [Local Development](LOCAL_DEVELOPMENT.md) environment running
- ✅ All services started (Supabase, web app)
- ✅ Test environment variables configured

## Testing Strategy

### Test Pyramid

```
    ┌─────────────┐
    │   E2E Tests │ ← User workflows, critical paths
    └─────────────┘
   ┌───────────────┐
   │ Integration   │ ← API endpoints, database
   └───────────────┘
  ┌─────────────────┐
  │   Unit Tests    │ ← Components, utilities, functions
  └─────────────────┘
```

### Test Types

| Type              | Tool       | Purpose                         | Frequency    |
| ----------------- | ---------- | ------------------------------- | ------------ |
| **Unit**          | Vitest     | Individual functions/components | Every commit |
| **E2E**           | Playwright | Complete user workflows         | Every commit |
| **Accessibility** | axe-core   | WCAG 2.2 AA compliance          | Every commit |
| **Performance**   | Lighthouse | Core Web Vitals                 | Daily        |
| **Security**      | ESLint     | Code security rules             | Every commit |

## Unit Testing

### Running Unit Tests

```bash
# Run all unit tests
npm --prefix web test

# Run with watch mode
npm --prefix web run test:watch

# Run with coverage
npm --prefix web test -- --coverage

# Run specific test file
npm --prefix web test -- utils.test.ts

# Run tests matching pattern
npm --prefix web test -- --run "confetti"
```

### Test Structure

**Component Tests** (`web/src/components/__tests__/`):

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Utility Tests** (`web/src/lib/__tests__/`):

```typescript
import { formatCertificateNumber } from "../certPdf";

describe("formatCertificateNumber", () => {
  test("formats number correctly", () => {
    expect(formatCertificateNumber("CA", 123)).toBe("CA-2025-000123");
  });

  test("handles zero padding", () => {
    expect(formatCertificateNumber("TX", 1)).toBe("TX-2025-000001");
  });
});
```

### Testing Utilities

**Custom Render** (`web/test/setup.ts`):

```typescript
import { render } from '@testing-library/react';
import { MuiProvider } from '../src/providers/MuiProvider';

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => <MuiProvider>{children}</MuiProvider>,
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };
```

### Mocking

**Supabase Client**:

```typescript
import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    })),
  })),
}));
```

## E2E Testing

### Running E2E Tests

```bash
# Install Playwright browsers (first time)
npm --prefix web run test:e2e:install

# Run all E2E tests
npm --prefix web run test:e2e

# Run with UI for debugging
npm --prefix web run test:e2e:ui

# Run specific test file
npx playwright test auth-onboarding.spec.ts

# Run tests in debug mode
npm --prefix web run test:e2e:debug
```

### Test Structure

**Test File** (`web/tests/e2e/auth-onboarding.spec.ts`):

```typescript
import { test, expect } from "@playwright/test";
import { getTestkitAPI } from "./utils/testkit";

test.describe("Authentication & Onboarding", () => {
  test("adult user can sign up and complete onboarding", async ({ page }) => {
    // Arrange - Set up test data
    const testkit = await getTestkitAPI(page);
    await testkit.reset();

    // Act - Perform user actions
    await page.goto("/signup");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign Up" }).click();

    // Assert - Verify expected outcomes
    await expect(page.getByText("Welcome")).toBeVisible();
    await expect(page).toHaveURL("/onboarding");
  });
});
```

### Testkit API

**Creating Test Data**:

```typescript
// Create user with profile
await testkit.createUser({
  email: "student@example.com",
  admin: false,
  profile: {
    first_name: "John",
    last_name: "Doe",
    date_of_birth: "2000-01-01",
  },
});

// Enroll in course
await testkit.enroll({
  email: "student@example.com",
  course_id: "course-uuid",
});

// Add seat time
await testkit.addSeatTime({
  email: "student@example.com",
  minutes: 150,
});
```

### E2E Test Categories

1. **Authentication & Onboarding**

   - Sign up, sign in, profile completion
   - Guardian consent for minors

2. **Learning Experience**

   - Course enrollment, unit navigation
   - Seat-time tracking, quiz completion

3. **Exam & Certification**

   - Final exam eligibility and completion
   - Certificate issuance workflow

4. **Admin Operations**

   - User management, certificate issuance
   - Regulatory reporting

5. **Accessibility**
   - Keyboard navigation, screen reader support
   - WCAG 2.2 AA compliance

### E2E Best Practices

**Selectors**:

```typescript
// ✅ Prefer role-based selectors
await page.getByRole("button", { name: "Submit" }).click();
await page.getByLabel("Email").fill("test@example.com");

// ✅ Use data-testid only when necessary
await page.getByTestId("unique-element").click();

// ❌ Avoid CSS selectors
await page.locator(".btn-primary").click();
```

**Waiting Strategies**:

```typescript
// ✅ Use assertions instead of waits
await expect(page.getByText("Success")).toBeVisible();

// ✅ Wait for navigation
await page.waitForURL("/dashboard");

// ❌ Avoid arbitrary waits
await page.waitForTimeout(1000);
```

## Accessibility Testing

### Running Accessibility Tests

```bash
# Run axe-core tests
npm --prefix web run axe:ci

# Run with specific URLs
npx axe http://localhost:3000/ http://localhost:3000/courses

# Run in CI mode
npm --prefix web run axe:ci --exit 1
```

### Accessibility Rules

**ESLint Configuration** (`web/.eslintrc.json`):

```json
{
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/html-has-lang": "error"
  }
}
```

### Accessibility Checklist

- [ ] **Keyboard Navigation** - All interactive elements reachable
- [ ] **Focus Management** - Visible focus indicators
- [ ] **Screen Reader Support** - Proper ARIA labels and landmarks
- [ ] **Color Contrast** - Meets WCAG 2.2 AA standards (4.5:1)
- [ ] **Alt Text** - All images have descriptive alt text
- [ ] **Form Labels** - All form controls have associated labels
- [ ] **Semantic HTML** - Proper heading structure and landmarks

## Performance Testing

### Lighthouse CI

```bash
# Run Lighthouse CI
npm --prefix web run lhci

# Configure thresholds
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000', 'http://localhost:3000/courses'],
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
  },
};
```

### Performance Metrics

| Metric   | Target  | Measurement              |
| -------- | ------- | ------------------------ |
| **LCP**  | < 2.5s  | Largest Contentful Paint |
| **FID**  | < 100ms | First Input Delay        |
| **CLS**  | < 0.1   | Cumulative Layout Shift  |
| **TTFB** | < 600ms | Time to First Byte       |

## CI Integration

### GitHub Actions

**Workflow** (`.github/workflows/ci.yml`):

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm --prefix web ci

      - name: Run linting
        run: npm --prefix web run lint

      - name: Run type checking
        run: npm --prefix web run typecheck

      - name: Run unit tests
        run: npm --prefix web test

      - name: Install Playwright
        run: npm --prefix web run test:e2e:install

      - name: Run E2E tests
        run: npm --prefix web run test:e2e
        env:
          TESTKIT_ON: true
          TESTKIT_TOKEN: ${{ secrets.TESTKIT_TOKEN }}

      - name: Run accessibility tests
        run: npm --prefix web run axe:ci
```

### Required Secrets

```bash
# GitHub repository secrets
TESTKIT_TOKEN=your-testkit-token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Test Data Management

### Testkit API Endpoints

**Available endpoints** (when `TESTKIT_ON=true`):

```bash
# Reset all test data
POST /api/testkit/reset

# Create test user
POST /api/testkit/user
{
  "email": "test@example.com",
  "admin": false,
  "profile": { ... }
}

# Enroll user in course
POST /api/testkit/enroll
{
  "email": "test@example.com",
  "course_id": "uuid"
}

# Add seat time
POST /api/testkit/seat-time
{
  "email": "test@example.com",
  "minutes": 150
}
```

### Test Data Cleanup

```typescript
// Global setup/teardown
beforeAll(async () => {
  await testkit.reset();
});

afterAll(async () => {
  await testkit.reset();
});
```

## Troubleshoot

### Common Test Issues

**E2E Tests Failing**:

```bash
# Check if services are running
supabase status
curl http://localhost:3000/api/health

# Reset test data
curl -X POST http://localhost:3000/api/testkit/reset \
  -H "Authorization: Bearer $TESTKIT_TOKEN"

# Run with debug output
DEBUG=pw:api npm --prefix web run test:e2e
```

**Unit Tests Failing**:

```bash
# Check for TypeScript errors
npm --prefix web run typecheck

# Run with verbose output
npm --prefix web test -- --verbose

# Check test environment
npm --prefix web test -- --run "setup"
```

**Accessibility Tests Failing**:

```bash
# Check specific violations
npx axe http://localhost:3000 --exit 1

# Run with detailed output
npx axe http://localhost:3000 --verbose
```

### Debug Mode

```bash
# Debug E2E tests
npm --prefix web run test:e2e:debug

# Debug specific test
npx playwright test auth-onboarding.spec.ts --debug

# Debug with browser
npm --prefix web run test:e2e:ui
```

## References

- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Next**: [Web Architecture](WEB_ARCHITECTURE.md) - System design and component structure
