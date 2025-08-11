# Contributing to Permit School

Thank you for contributing to Permit School! This guide covers development practices, testing standards, and how to add new features.

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/rms730/permit-school.git
cd permit-school

# Install dependencies
cd web && npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

## Testing Standards

### E2E Testing with Playwright

We use Playwright for end-to-end testing with deterministic test data via our testkit APIs.

#### Best Practices

**1. Selectors**
- **Prefer role-based selectors**: `page.getByRole('button', { name: 'Submit' })`
- **Use labels for form fields**: `page.getByLabel('Email')`
- **Add data-testid only when necessary**: `page.getByTestId('unique-element')`

**2. Test Structure**
```typescript
test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange - Set up test data via testkit
    const testkit = await getTestkitAPI(page);
    await testkit.createUser({ admin: true });

    // Act - Perform user actions
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Create' }).click();

    // Assert - Verify expected outcomes
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

**3. Test Data Management**
- Use testkit APIs for deterministic state
- Never depend on real external services (Stripe, email)
- Clean up between tests (handled by global setup/teardown)

**4. Waiting Strategies**
- Use `expect().toBeVisible()` instead of `page.waitForSelector()`
- Let Playwright's auto-waiting handle most cases
- Use `page.waitForURL()` for navigation assertions

#### Running Tests

```bash
# Install Playwright browsers
npm run test:e2e:install

# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test auth-onboarding.spec.ts

# Run with UI for debugging
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

#### Adding New Tests

1. **Create test file**: `web/tests/e2e/feature-name.spec.ts`
2. **Import utilities**: `import { getTestkitAPI } from './utils/testkit'`
3. **Use testkit for setup**: Create users, enrollments, etc.
4. **Follow naming convention**: `should [expected behavior] when [condition]`
5. **Add to CI**: Tests run automatically in GitHub Actions

### Unit Testing

We use Jest and React Testing Library for unit tests.

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

### Accessibility Testing

All new features must pass accessibility tests.

```bash
# Run accessibility linting
npm run lint

# Run axe-core tests
npm run axe:ci
```

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper typing for all function parameters and returns

### React Components
- Use functional components with hooks
- Prefer MUI components over custom CSS
- Follow accessibility best practices (ARIA labels, semantic HTML)

### API Design
- Use RESTful conventions
- Implement proper error handling
- Add input validation with Zod schemas
- Use proper HTTP status codes

### Database
- Follow existing naming conventions
- Use RLS policies for security
- Add proper indexes for performance
- Document schema changes in migrations

## Security Guidelines

### Environment Variables
- Never commit secrets to version control
- Use `.env.local` for local development
- Document required environment variables

### Authentication & Authorization
- Use Supabase Auth for user management
- Implement proper RLS policies
- Validate user permissions on all endpoints

### Data Protection
- Sanitize all user inputs
- Use parameterized queries
- Implement rate limiting on public endpoints

## Pull Request Process

### Before Submitting
1. **Run tests**: Ensure all tests pass locally
2. **Check linting**: Fix any ESLint violations
3. **Update documentation**: Add/update relevant docs
4. **Test manually**: Verify the feature works as expected

### PR Checklist
- [ ] Tests added/updated for new functionality
- [ ] All existing tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
- [ ] Accessibility requirements met

### Review Process
1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by maintainers
3. **Manual testing** of critical paths
4. **Approval** from at least one maintainer

## Adding New Features

### 1. Planning
- Create an issue describing the feature
- Define acceptance criteria
- Consider impact on existing functionality

### 2. Implementation
- Create a feature branch: `git checkout -b feature/name`
- Implement the feature following our standards
- Add comprehensive tests
- Update documentation

### 3. Testing
- Write unit tests for business logic
- Add E2E tests for user flows
- Test accessibility compliance
- Verify performance impact

### 4. Documentation
- Update README.md if needed
- Add inline code comments
- Update API documentation
- Create user-facing documentation

## Common Patterns

### Database Migrations
```sql
-- Create new table
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE example ENABLE ROW LEVEL SECURITY;
```

### API Endpoints
```typescript
export async function POST(request: NextRequest) {
  try {
    // Validate input
    const body = await request.json();
    const validated = schema.parse(body);

    // Process request
    const result = await processRequest(validated);

    // Return response
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
```

### React Components
```typescript
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  return (
    <Button
      onClick={onAction}
      aria-label={`Perform action for ${title}`}
    >
      {title}
    </Button>
  );
}
```

## Getting Help

- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check README.md and inline code comments
- **Code examples**: Look at existing tests and components

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our Code of Conduct and follow it in all interactions.

Thank you for contributing to Permit School! 🚀
