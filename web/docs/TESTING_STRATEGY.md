# Testing Strategy

This document outlines the comprehensive testing strategy for the Permit School Design System and application components.

## Testing Pyramid

Our testing approach follows the testing pyramid with three levels:

1. **Unit Tests** (70%) - Individual component and function testing
2. **Integration Tests** (20%) - Component interaction and API testing
3. **E2E Tests** (10%) - Full user journey testing

## Unit Testing (Vitest + RTL)

### Component Testing

All Design System components should have comprehensive unit tests covering:

#### Core Functionality
- Component rendering
- Props handling
- State changes
- Event handlers
- Conditional rendering

#### Accessibility
- ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Color contrast (where applicable)

#### Edge Cases
- Empty/null props
- Error states
- Loading states
- Boundary conditions

### Example Test Structure

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Basic rendering
  it('renders correctly with required props', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  // Props testing
  it('handles optional props correctly', () => {
    render(<ComponentName title="Test" subtitle="Subtitle" />);
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  // Event handling
  it('calls onClick when button is clicked', () => {
    const mockClick = vi.fn();
    render(<ComponentName onClick={mockClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  // Accessibility
  it('has proper ARIA attributes', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });

  // Error states
  it('displays error state correctly', () => {
    render(<ComponentName error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
```

### Provider Testing

Test global providers with custom render functions:

```tsx
import { render } from '@testing-library/react';
import { SnackbarProvider } from '@/app/providers/SnackbarProvider';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <SnackbarProvider>
      {ui}
    </SnackbarProvider>
  );
};

describe('Component with Providers', () => {
  it('works with global providers', () => {
    renderWithProviders(<MyComponent />);
    // Test component behavior with providers
  });
});
```

### Hook Testing

Test custom hooks using `@testing-library/react-hooks`:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(initialValue);
  });

  it('updates state correctly', () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.updateValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

## Integration Testing

### Component Integration

Test how components work together:

```tsx
describe('Component Integration', () => {
  it('form submission works end-to-end', () => {
    render(
      <FormProvider>
        <FormComponent />
        <SubmitButton />
      </FormProvider>
    );
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
    // Verify success state
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### API Integration

Test API interactions with mocked responses:

```tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/data', (req, res, ctx) => {
    return res(ctx.json({ data: 'test' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Integration', () => {
  it('fetches and displays data', async () => {
    render(<DataComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });
});
```

## E2E Testing (Playwright)

### User Journey Testing

Test complete user workflows:

```tsx
import { test, expect } from '@playwright/test';

test('complete billing flow', async ({ page }) => {
  // Navigate to pricing page
  await page.goto('/pricing');
  
  // Select a plan
  await page.click('[data-testid="plus-plan"]');
  
  // Click checkout button
  await page.click('[data-testid="checkout-button"]');
  
  // Verify redirect to Stripe
  await expect(page).toHaveURL(/stripe\.com/);
});

test('notifications workflow', async ({ page }) => {
  // Open notifications drawer
  await page.click('[data-testid="notification-bell"]');
  
  // Verify drawer opens
  await expect(page.locator('[data-testid="notifications-drawer"]')).toBeVisible();
  
  // Mark notification as read
  await page.click('[data-testid="mark-read-button"]');
  
  // Verify notification is marked as read
  await expect(page.locator('[data-testid="unread-badge"]')).not.toBeVisible();
});
```

### Accessibility Testing

Include accessibility checks in E2E tests:

```tsx
test('accessibility compliance', async ({ page }) => {
  await page.goto('/');
  
  // Run axe-core accessibility audit
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Cross-browser Testing

Test across different browsers:

```tsx
test.describe('Cross-browser compatibility', () => {
  test('works in Chrome', async ({ page }) => {
    // Chrome-specific test
  });
  
  test('works in Firefox', async ({ page }) => {
    // Firefox-specific test
  });
  
  test('works in Safari', async ({ page }) => {
    // Safari-specific test
  });
});
```

## Performance Testing

### Lighthouse CI

Automated performance and accessibility audits:

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  run: |
    npm run lighthouse:ci
```

### Bundle Size Testing

Monitor component bundle sizes:

```tsx
import { getBundleSize } from '@next/bundle-analyzer';

test('component bundle size is within limits', () => {
  const size = getBundleSize('./ComponentName.tsx');
  expect(size).toBeLessThan(50); // 50KB limit
});
```

## Visual Regression Testing

### Screenshot Testing

Test visual consistency across changes:

```tsx
test('visual regression', async ({ page }) => {
  await page.goto('/component-page');
  await expect(page).toHaveScreenshot('component-default.png');
});
```

## Test Coverage

### Coverage Targets

- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Coverage Reporting

```json
{
  "scripts": {
    "test:coverage": "vitest --coverage",
    "test:coverage:report": "vitest --coverage --reporter=html"
  }
}
```

## Testing Best Practices

### 1. Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Test Data

- Use factories for test data
- Keep test data realistic
- Avoid hardcoded values

### 3. Mocking

- Mock external dependencies
- Use MSW for API mocking
- Mock time and dates consistently

### 4. Async Testing

- Use proper async/await patterns
- Handle loading states
- Test error scenarios

### 5. Accessibility Testing

- Include a11y tests in every component
- Test keyboard navigation
- Verify ARIA attributes

## CI/CD Integration

### GitHub Actions

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run lighthouse:ci
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit && npm run lint",
      "pre-push": "npm run test:full"
    }
  }
}
```

## Testing Tools

### Unit Testing
- **Vitest**: Fast unit test runner
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom matchers

### E2E Testing
- **Playwright**: Cross-browser E2E testing
- **@axe-core/playwright**: Accessibility testing

### Performance Testing
- **Lighthouse CI**: Performance and accessibility audits
- **Bundle Analyzer**: Bundle size monitoring

### Visual Testing
- **Playwright Screenshots**: Visual regression testing
- **Chromatic**: Component visual testing (optional)

## Maintenance

### Regular Updates
- Update testing dependencies monthly
- Review and update test coverage quarterly
- Audit accessibility tests annually

### Documentation
- Keep test documentation up to date
- Document testing patterns and conventions
- Maintain troubleshooting guides

### Monitoring
- Track test execution times
- Monitor flaky tests
- Review test coverage trends
