---
title: "Contributing to Permit School"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/README.md>
  - </docs/ENVIRONMENT_SETUP.md>
  - </docs/TESTING.md>
---

# Contributing to Permit School

**Purpose & Outcome**  
Complete guide for contributing to Permit School, covering development standards, testing requirements, and the PR process. This ensures code quality, maintains compliance, and enables safe collaboration.

## Quick Start

```bash
# 1. Setup environment
git clone https://github.com/rms730/permit-school.git
cd permit-school
npm --prefix web ci
supabase start

# 2. Make changes and test
npm --prefix web run lint && npm --prefix web test && npm --prefix web run test:e2e

# 3. Submit PR
git add -A && git commit -m "feat: add new feature"
git push -u origin feature/your-feature
```

## Prerequisites

- ✅ [Environment Setup](docs/ENVIRONMENT_SETUP.md) completed
- ✅ [Local Development](docs/LOCAL_DEVELOPMENT.md) environment running
- ✅ Understanding of [Testing Guide](docs/TESTING.md)

## Development Standards

### Code Style

**TypeScript**:

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper typing for all function parameters and returns
- No `any` types without explicit justification

**React Components**:

```typescript
// ✅ Good: Functional component with proper typing
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <MUIButton variant={variant} onClick={onClick}>
      {children}
    </MUIButton>
  );
}

// ❌ Bad: Any types, no interface
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

**API Design**:

```typescript
// ✅ Good: Proper error handling and validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);

    const result = await processRequest(validated);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Database Standards

**Migrations**:

```sql
-- ✅ Good: Proper naming and structure
-- 0019_add_user_preferences.sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}';

-- Add RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- ❌ Bad: No RLS, no comments
ALTER TABLE profiles ADD COLUMN prefs json;
```

**Naming Conventions**:

- Tables: `snake_case` (e.g., `user_profiles`)
- Columns: `snake_case` (e.g., `created_at`)
- Functions: `snake_case` (e.g., `get_user_profile`)
- Indexes: `idx_table_column` (e.g., `idx_profiles_email`)

### Security Guidelines

**Environment Variables**:

- Never commit secrets to version control
- Use `.env.local` for local development
- Document required variables in PR description
- Use environment-specific configurations

**Authentication & Authorization**:

```typescript
// ✅ Good: Server-side auth check
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process request with user context
}

// ❌ Bad: Client-side auth only
export async function GET() {
  // No auth check - security risk
  return NextResponse.json({ data: "sensitive" });
}
```

## Testing Requirements

### Before Submitting PR

```bash
# 1. Run all tests locally
npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web test
npm --prefix web run test:e2e

# 2. Check accessibility
npm --prefix web run axe:ci

# 3. Verify build
npm --prefix web run build
```

### Test Coverage Requirements

- **Unit Tests**: 80%+ coverage for new code
- **E2E Tests**: All critical user flows covered
- **Accessibility**: WCAG 2.2 AA compliance
- **Type Safety**: No TypeScript errors

### Adding New Tests

**Unit Tests**:

```typescript
// web/src/lib/__tests__/utils.test.ts
import { formatCertificateNumber } from "../utils";

describe("formatCertificateNumber", () => {
  test("formats CA certificate correctly", () => {
    expect(formatCertificateNumber("CA", 123)).toBe("CA-2025-000123");
  });

  test("handles zero padding", () => {
    expect(formatCertificateNumber("TX", 1)).toBe("TX-2025-000001");
  });
});
```

**E2E Tests**:

```typescript
// web/tests/e2e/feature-name.spec.ts
import { test, expect } from "@playwright/test";
import { getTestkitAPI } from "./utils/testkit";

test.describe("Feature Name", () => {
  test("should work correctly", async ({ page }) => {
    const testkit = await getTestkitAPI(page);
    await testkit.reset();

    // Test implementation
    await page.goto("/feature");
    await expect(page.getByText("Success")).toBeVisible();
  });
});
```

## Pull Request Process

### PR Checklist

- [ ] **Tests pass** - All unit, E2E, and accessibility tests
- [ ] **Code quality** - ESLint passes, TypeScript compiles
- [ ] **Documentation** - Updated relevant docs
- [ ] **Security** - No secrets, proper auth checks
- [ ] **Performance** - No obvious performance regressions
- [ ] **Accessibility** - WCAG 2.2 AA compliant
- [ ] **Manual testing** - Feature works as expected

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility verified

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced

## Screenshots (if applicable)

Add screenshots for UI changes

## Related Issues

Closes #123
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by maintainers
3. **Manual testing** of critical paths
4. **Approval** from at least one maintainer

## Branch Strategy

### Branch Naming

```bash
# Feature branches
git checkout -b feature/user-dashboard
git checkout -b feature/guardian-consent

# Bug fixes
git checkout -b fix/login-error
git checkout -b fix/accessibility-issue

# Documentation
git checkout -b docs/api-documentation
git checkout -b docs/setup-guide
```

### Commit Messages

```bash
# ✅ Good: Conventional commits
git commit -m "feat: add user dashboard with progress tracking"
git commit -m "fix: resolve login error for expired sessions"
git commit -m "docs: update API documentation for new endpoints"
git commit -m "test: add E2E tests for guardian consent flow"

# ❌ Bad: Unclear messages
git commit -m "fix stuff"
git commit -m "update"
git commit -m "changes"
```

**Conventional Commit Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Adding New Features

### 1. Planning

- Create an issue describing the feature
- Define acceptance criteria
- Consider impact on existing functionality
- Plan testing strategy

### 2. Implementation

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Add tests
# Update documentation

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/your-feature
```

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
-- Create new migration
-- supabase/migrations/0019_add_feature.sql

-- Add new table
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT
);

-- Add RLS policies
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view features" ON public.features
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage features" ON public.features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### API Endpoints

```typescript
// web/src/app/api/features/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";

const featureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = featureSchema.parse(body);

    const { data, error } = await supabase
      .from("features")
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Feature creation error:", error);
    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 },
    );
  }
}
```

### React Components

```typescript
// web/src/components/FeatureCard.tsx
import { Card, CardContent, Typography, Button } from '@mui/material';
import { useState } from 'react';

interface FeatureCardProps {
  feature: {
    id: string;
    name: string;
    description?: string;
  };
  onEdit?: (id: string) => void;
}

export function FeatureCard({ feature, onEdit }: FeatureCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      onEdit?.(feature.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3">
          {feature.name}
        </Typography>
        {feature.description && (
          <Typography variant="body2" color="text.secondary">
            {feature.description}
          </Typography>
        )}
        {onEdit && (
          <Button
            onClick={handleEdit}
            disabled={isLoading}
            variant="outlined"
            size="small"
          >
            Edit
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

## Troubleshoot

### Common Issues

**Tests failing locally but passing in CI**:

```bash
# Reset test environment
npm --prefix web run test:e2e:install
supabase db reset
npm --prefix web run test:e2e
```

**TypeScript errors**:

```bash
# Check for type issues
npm --prefix web run typecheck

# Fix common issues
npm --prefix web run lint --fix
```

**Database migration conflicts**:

```bash
# Reset and reapply
supabase db reset
supabase db push

# Check migration status
supabase migration list
```

### Getting Help

1. **Check documentation** - Most answers are in the docs
2. **Search issues** - Look for similar problems
3. **Ask in discussions** - Use GitHub Discussions
4. **Create issue** - For bugs or feature requests

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report inappropriate behavior

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Next**: [Environment Setup](docs/ENVIRONMENT_SETUP.md) - Complete development environment setup
