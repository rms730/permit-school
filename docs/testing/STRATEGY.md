---
title: "Testing Strategy"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/TESTING.md>
  - </docs/testing/COVERAGE.md>
  - </docs/testing/PLAYWRIGHT.md>
---

# Testing Strategy

**Purpose & Outcome**  
This document outlines the comprehensive testing strategy for Permit School, ensuring code quality, preventing regressions, and maintaining compliance requirements through multiple testing layers.

## Testing Philosophy

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

### Testing Principles

1. **Test the behavior, not the implementation** - Focus on what the code does, not how it does it
2. **Write tests that fail fast** - Catch issues early in the development cycle
3. **Maintain test data independence** - Each test should be isolated and repeatable
4. **Test user workflows, not just functions** - Ensure end-to-end functionality works
5. **Automate everything** - Manual testing should be minimal and focused

## Testing Tools & Stack

### Unit Testing
- **Framework**: Vitest (Vite-based test runner)
- **Assertions**: Built-in Vitest assertions
- **Mocking**: Vitest mocking capabilities
- **Coverage**: V8 coverage provider

### Integration Testing
- **Framework**: Vitest with custom test utilities
- **Database**: Supabase test instance
- **API Testing**: Built-in Next.js API route testing

### End-to-End Testing
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, Safari
- **Test Data**: Testkit API for data management
- **Visual Testing**: Playwright screenshot comparison

### Accessibility Testing
- **Tool**: axe-core
- **Integration**: ESLint jsx-a11y rules
- **Automated**: Playwright with axe-core

### Performance Testing
- **Tool**: Lighthouse CI
- **Metrics**: Core Web Vitals
- **Thresholds**: Configurable performance budgets

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual functions, components, and utilities in isolation

**Coverage Areas**:
- Utility functions (`src/lib/`)
- React components (`src/components/`)
- Business logic functions
- Data transformation functions

**Example**:
```typescript
// src/lib/__tests__/confetti.test.ts
import { triggerConfetti } from '../confetti';

describe('confetti', () => {
  test('triggers confetti animation', () => {
    const mockCanvas = document.createElement('canvas');
    document.body.appendChild(mockCanvas);
    
    const result = triggerConfetti();
    expect(result).toBe(true);
  });
});
```

### 2. Integration Tests

**Purpose**: Test interactions between components and API endpoints

**Coverage Areas**:
- API route handlers
- Database operations
- External service integrations
- Component interactions

**Example**:
```typescript
// src/app/api/__tests__/health.test.ts
import { GET } from '../health/route';

describe('/api/health', () => {
  test('returns system status', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data.status).toBe('ok');
    expect(data.supabase).toBe('ok');
  });
});
```

### 3. End-to-End Tests

**Purpose**: Test complete user workflows from start to finish

**Coverage Areas**:
- User registration and onboarding
- Course enrollment and learning
- Quiz and exam completion
- Certificate generation
- Admin operations

**Example**:
```typescript
// tests/e2e/auth-onboarding.spec.ts
import { test, expect } from '@playwright/test';

test('complete user onboarding flow', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="signup-button"]');
  
  await expect(page).toHaveURL('/onboarding');
  await page.fill('[data-testid="first-name"]', 'John');
  await page.fill('[data-testid="last-name"]', 'Doe');
  await page.click('[data-testid="complete-onboarding"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### 4. Accessibility Tests

**Purpose**: Ensure WCAG 2.2 AA compliance

**Coverage Areas**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management
- Semantic HTML

**Example**:
```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test('homepage accessibility', async ({ page }) => {
  await page.goto('/');
  
  // Run axe-core accessibility audit
  const results = await page.evaluate(() => {
    return new Promise((resolve) => {
      axe.run((err, results) => {
        resolve(results);
      });
    });
  });
  
  expect(results.violations).toHaveLength(0);
});
```

### 5. Performance Tests

**Purpose**: Monitor and maintain performance standards

**Coverage Areas**:
- Core Web Vitals
- Page load times
- API response times
- Bundle sizes

**Example**:
```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000', 'http://localhost:3000/courses'],
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
      },
    },
  },
};
```

## Test Data Management

### Testkit API

**Purpose**: Manage test data for E2E tests

**Available Endpoints**:
- `POST /api/testkit/reset` - Clear all test data
- `POST /api/testkit/user` - Create test user
- `POST /api/testkit/enroll` - Enroll user in course
- `POST /api/testkit/seat-time` - Add seat time

**Usage**:
```typescript
// tests/e2e/utils/testkit.ts
export async function createTestUser(page: Page, userData: any) {
  const response = await page.request.post('/api/testkit/user', {
    data: userData,
    headers: { 'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}` }
  });
  return response.json();
}
```

### Database Seeding

**Purpose**: Set up consistent test data

**Tools**:
- Supabase migrations for schema
- Custom seeding scripts in `ops/seed/`
- Test-specific data fixtures

**Example**:
```typescript
// ops/seed/seed-test-data.ts
export async function seedTestData() {
  const supabase = getSupabaseAdmin();
  
  // Create test courses
  await supabase.from('courses').insert([
    { id: 'test-course-1', title: 'Test Course 1', j_code: 'CA' }
  ]);
  
  // Create test questions
  await supabase.from('questions').insert([
    { id: 'test-question-1', question: 'Test question?', correct_answer: 'A' }
  ]);
}
```

## Test Environment Setup

### Local Development

**Prerequisites**:
- Node.js 20+
- Supabase CLI
- PostgreSQL (via Supabase)

**Setup Commands**:
```bash
# Install dependencies
npm ci
npm --prefix web ci

# Start Supabase
supabase start

# Run tests
npm --prefix web test              # Unit tests
npm --prefix web run test:e2e      # E2E tests
npm --prefix web run axe:ci        # Accessibility tests
```

### CI Environment

**GitHub Actions Configuration**:
```yaml
# .github/workflows/ci.yml
- name: Run unit tests
  run: npm --prefix web test

- name: Run E2E tests
  run: npm --prefix web run test:e2e
  env:
    TESTKIT_ON: true
    TESTKIT_TOKEN: ${{ secrets.TESTKIT_TOKEN }}
```

## Testing Best Practices

### 1. Test Organization

**File Structure**:
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
└── app/
    └── api/
        └── health/
            ├── route.ts
            └── __tests__/
                └── route.test.ts
```

**Naming Conventions**:
- Test files: `*.test.ts` or `*.spec.ts`
- Test suites: `describe('ComponentName', () => {})`
- Test cases: `test('should do something', () => {})`

### 2. Test Isolation

**Database Isolation**:
```typescript
beforeEach(async () => {
  await testkit.reset();
});

afterEach(async () => {
  await testkit.reset();
});
```

**Component Isolation**:
```typescript
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MuiProvider>
      <I18nProvider>
        {ui}
      </I18nProvider>
    </MuiProvider>
  );
};
```

### 3. Selector Strategy

**Preferred Selectors** (in order):
1. **Role-based**: `getByRole('button', { name: 'Submit' })`
2. **Label-based**: `getByLabel('Email address')`
3. **Test ID**: `getByTestId('submit-button')`
4. **Text content**: `getByText('Welcome')`

**Avoid**:
- CSS selectors: `.btn-primary`
- XPath selectors
- Implementation details

### 4. Assertion Strategy

**User-focused assertions**:
```typescript
// ✅ Good - Tests user behavior
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page).toHaveURL('/dashboard');

// ❌ Bad - Tests implementation
await expect(page.locator('.welcome-message')).toBeVisible();
```

### 5. Error Handling

**Test error scenarios**:
```typescript
test('handles network errors gracefully', async ({ page }) => {
  // Mock network failure
  await page.route('**/api/profile', route => route.abort());
  
  await page.goto('/profile');
  await expect(page.getByText('Unable to load profile')).toBeVisible();
});
```

## Performance Testing Strategy

### Core Web Vitals Monitoring

**Metrics**:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

**Implementation**:
```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
      },
    },
  },
};
```

### Bundle Size Monitoring

**Tools**:
- Next.js bundle analyzer
- Webpack bundle analyzer
- GitHub Actions size checks

**Thresholds**:
- Main bundle: < 500KB
- Vendor bundle: < 1MB
- Total bundle: < 2MB

## Accessibility Testing Strategy

### Automated Testing

**Tools**:
- axe-core for automated audits
- ESLint jsx-a11y for code-level checks
- Playwright accessibility testing

**Implementation**:
```typescript
// tests/e2e/accessibility.spec.ts
test('all pages meet accessibility standards', async ({ page }) => {
  const pages = ['/', '/courses', '/signin', '/dashboard'];
  
  for (const pagePath of pages) {
    await page.goto(pagePath);
    const results = await page.evaluate(() => axe.run());
    expect(results.violations).toHaveLength(0);
  }
});
```

### Manual Testing Checklist

**Keyboard Navigation**:
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] Skip links work

**Screen Reader**:
- [ ] Proper heading structure
- [ ] Alt text for images
- [ ] ARIA labels where needed
- [ ] Form labels associated

**Visual Design**:
- [ ] Color contrast meets WCAG AA
- [ ] Text resizable to 200%
- [ ] No color-only information
- [ ] Focus indicators visible

## Continuous Integration

### Pre-commit Hooks

**Tools**:
- Husky for Git hooks
- lint-staged for staged files

**Configuration**:
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:ci"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "npm run test -- --findRelatedTests"
    ]
  }
}
```

### CI Pipeline

**Stages**:
1. **Lint & Type Check** - Code quality
2. **Unit Tests** - Fast feedback
3. **Build** - Ensure build works
4. **E2E Tests** - Integration testing
5. **Accessibility** - Compliance check
6. **Performance** - Performance monitoring

**Failure Handling**:
- Fail fast on critical issues
- Allow warnings for non-critical issues
- Retry flaky tests automatically
- Generate detailed reports

## Test Maintenance

### Regular Tasks

**Weekly**:
- Review test failures
- Update test data if needed
- Check test coverage reports

**Monthly**:
- Update test dependencies
- Review and update test strategies
- Performance benchmark review

**Quarterly**:
- Full test suite audit
- Update testing documentation
- Review CI/CD pipeline

### Metrics & Monitoring

**Key Metrics**:
- Test coverage percentage
- Test execution time
- Flaky test rate
- Test failure rate

**Tools**:
- GitHub Actions test reports
- Coverage reports
- Performance monitoring
- Error tracking

---

**Next**: [Testing Coverage](COVERAGE.md) - Current test coverage metrics and analysis
