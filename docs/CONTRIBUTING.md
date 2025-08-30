# Contributing Guide

This document provides guidelines for contributing to the permit-school project, including coding standards, development workflow, and contribution process.

## Overview

This contributing guide covers:

- **Development Setup**: How to set up your development environment
- **Coding Standards**: Code style, conventions, and best practices
- **Development Workflow**: Git workflow and branching strategy
- **Testing Requirements**: Testing standards and procedures
- **Code Review Process**: How to submit and review code changes
- **Release Process**: How releases are managed and deployed

## Development Setup

### Prerequisites

Before contributing, ensure you have:

- **Node.js 20+**: Required for development
- **Git**: Version control system
- **npm or yarn**: Package manager
- **Code Editor**: VS Code recommended with extensions

### Initial Setup

1. **Fork and Clone**:
   ```bash
   # Fork the repository on GitHub
   # Clone your fork
   git clone https://github.com/your-username/permit-school.git
   cd permit-school
   ```

2. **Install Dependencies**:
   ```bash
   # Install root dependencies
   npm install
   
   # Install web app dependencies
   npm run -w web install
   ```

3. **Environment Setup**:
   ```bash
   # Copy environment templates
   npm run env:copy
   
   # Set up environment variables
   npm run env:setup
   ```

4. **Database Setup**:
   ```bash
   # Start Supabase locally
   supabase start
   
   # Run migrations
   supabase db push
   ```

5. **Verify Setup**:
   ```bash
   # Run all checks
   npm run ci:check:full
   
   # Start development server
   npm run dev
   ```

### Development Tools

#### Recommended VS Code Extensions

- **TypeScript**: Built-in TypeScript support
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: CSS class autocomplete
- **GitLens**: Git integration
- **Thunder Client**: API testing

#### Development Scripts

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Check code quality
npm run lint
npm run typecheck

# Format code
npm run format:fix
```

## Coding Standards

### TypeScript

#### Type Definitions

- Use explicit types for function parameters and return values
- Prefer interfaces over types for object shapes
- Use generic types for reusable components
- Avoid `any` type - use `unknown` or proper types

```typescript
// Good
interface User {
  id: string;
  email: string;
  name?: string;
}

function getUser(id: string): Promise<User | null> {
  // Implementation
}

// Avoid
function getUser(id: any): any {
  // Implementation
}
```

#### Component Structure

- Use functional components with hooks
- Separate concerns into smaller components
- Use proper prop types and default values
- Implement proper error boundaries

```typescript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

export default function UserCard({ 
  user, 
  onEdit, 
  className = '' 
}: UserCardProps) {
  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [user, onEdit]);

  return (
    <div className={`user-card ${className}`}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={handleEdit}>
          Edit
        </button>
      )}
    </div>
  );
}
```

### React Best Practices

#### Hooks Usage

- Follow the Rules of Hooks
- Use custom hooks for reusable logic
- Optimize with useMemo and useCallback
- Handle cleanup in useEffect

```typescript
// Custom hook example
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        setLoading(true);
        const userData = await getUser(userId);
        if (mounted) {
          setUser(userData);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return { user, loading, error };
}
```

#### State Management

- Use local state for component-specific data
- Use context for shared state across components
- Use SWR for server state management
- Avoid prop drilling

```typescript
// Context example
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    // Login logic
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### CSS and Styling

#### Tailwind CSS

- Use Tailwind utility classes
- Create custom components for repeated patterns
- Use responsive design utilities
- Follow accessibility guidelines

```typescript
// Component with Tailwind classes
export default function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### API Design

#### RESTful Endpoints

- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response formats
- Implement proper error handling
- Use appropriate status codes

```typescript
// API route example
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const users = await getUsers({ page, limit });

    return Response.json({
      data: users,
      pagination: {
        page,
        limit,
        total: users.length
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Error Handling

- Use consistent error response format
- Log errors appropriately
- Provide meaningful error messages
- Handle different error types

```typescript
// Error handling utility
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Development Workflow

### Git Workflow

#### Branching Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature development branches
- **bugfix/***: Bug fix branches
- **hotfix/***: Critical production fixes

#### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(auth): add OAuth login support

fix(api): resolve user profile update issue

docs(readme): update installation instructions

test(e2e): add payment flow tests
```

#### Pull Request Process

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**:
   - Write code following standards
   - Add tests for new functionality
   - Update documentation

3. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push and Create PR**:
   ```bash
   git push origin feature/your-feature-name
   # Create PR on GitHub
   ```

5. **Code Review**:
   - Address review comments
   - Ensure CI checks pass
   - Get approval from maintainers

6. **Merge**:
   - Squash and merge to develop
   - Delete feature branch

### Code Review Guidelines

#### Review Checklist

- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

#### Review Comments

- Be constructive and specific
- Suggest improvements, not just point out issues
- Use inline comments for specific lines
- Provide examples when helpful

## Testing Requirements

### Unit Testing

#### Test Structure

- Use Vitest for unit testing
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Mock external dependencies

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserCard from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  it('displays user information correctly', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    screen.getByRole('button', { name: /edit/i }).click();
    
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

#### Test Coverage

- Aim for 80%+ code coverage
- Focus on critical business logic
- Test edge cases and error conditions
- Use coverage reports to identify gaps

### Integration Testing

#### API Testing

- Test API endpoints with real database
- Use test data fixtures
- Clean up test data after tests
- Test error scenarios

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase } from './test-utils';

describe('User API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('creates a new user', async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com'
      })
    });

    expect(response.status).toBe(201);
    const user = await response.json();
    expect(user.name).toBe('Test User');
  });
});
```

### E2E Testing

#### Playwright Tests

- Test complete user workflows
- Use realistic test data
- Test across different browsers
- Include accessibility testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('completes registration flow', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    await page.click('[data-testid="register-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Welcome, Test User');
  });
});
```

## Documentation Standards

### Code Documentation

#### JSDoc Comments

- Document public APIs and functions
- Include parameter and return type descriptions
- Provide usage examples
- Keep documentation up to date

```typescript
/**
 * Fetches user data from the API
 * @param userId - The unique identifier of the user
 * @param options - Optional fetch options
 * @returns Promise resolving to user data or null if not found
 * @throws {AppError} When API request fails
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * if (user) {
 *   console.log(user.name);
 * }
 * ```
 */
export async function fetchUser(
  userId: string,
  options?: RequestInit
): Promise<User | null> {
  // Implementation
}
```

#### README Files

- Include setup instructions
- Document API endpoints
- Provide usage examples
- List dependencies and requirements

### Technical Documentation

- Keep architecture documentation current
- Document design decisions
- Include troubleshooting guides
- Maintain API documentation

## Release Process

### Version Management

#### Semantic Versioning

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

#### Release Branches

1. **Create Release Branch**:
   ```bash
   git checkout -b release/v1.0.0
   ```

2. **Update Version**:
   ```bash
   npm version patch  # or minor/major
   ```

3. **Update Changelog**:
   - Document new features and fixes
   - Include breaking changes
   - Credit contributors

4. **Final Testing**:
   ```bash
   npm run ci:all
   npm run test:e2e
   ```

5. **Merge to Main**:
   ```bash
   git checkout main
   git merge release/v1.0.0
   git tag v1.0.0
   git push origin main --tags
   ```

### Deployment

#### Staging Deployment

- Deploy to staging environment
- Run smoke tests
- Verify functionality
- Get stakeholder approval

#### Production Deployment

- Deploy to production
- Monitor for issues
- Rollback if necessary
- Announce release

## Code of Conduct

### Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project standards

### Reporting Issues

- Use issue templates
- Provide detailed information
- Include steps to reproduce
- Be patient and responsive

## Getting Help

### Resources

- **Documentation**: Check `/docs` directory
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Team Chat**: Join team communication channels

### Mentorship

- Ask questions openly
- Offer to help others
- Share knowledge and experience
- Participate in code reviews

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [Testing Strategy](./testing/STRATEGY.md) - Testing guidelines
- [API Routes](./api/ROUTES.md) - API documentation
- [Environment Setup](./ENVIRONMENT.md) - Development environment
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
