---
title: "Pull Request Template"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
---

# Pull Request Template

**Purpose & Outcome**  
Standardized pull request template for Permit School that ensures all necessary information is provided, proper testing is completed, and the review process is efficient and thorough.

## Description

Brief description of the changes made in this PR.

## Type of Change

- [ ] **Bug fix** - Fixes an existing issue
- [ ] **New feature** - Adds new functionality
- [ ] **Breaking change** - Changes that break existing functionality
- [ ] **Documentation update** - Updates to documentation only
- [ ] **Refactoring** - Code changes that neither fix bugs nor add features
- [ ] **Performance improvement** - Changes that improve performance
- [ ] **Test update** - Adding or updating tests
- [ ] **Dependency update** - Updates to dependencies or build tools

## Testing

### Automated Tests

- [ ] **Unit tests** - Added/updated unit tests for new functionality
- [ ] **E2E tests** - Added/updated end-to-end tests for user flows
- [ ] **Accessibility tests** - Verified WCAG 2.2 AA compliance
- [ ] **Type checking** - TypeScript compilation passes
- [ ] **Linting** - ESLint passes with no warnings
- [ ] **Build** - Production build completes successfully

### Manual Testing

- [ ] **Feature testing** - Manually tested the new/changed functionality
- [ ] **Regression testing** - Verified existing functionality still works
- [ ] **Cross-browser testing** - Tested in Chrome, Firefox, Safari (if UI changes)
- [ ] **Mobile testing** - Tested on mobile devices (if UI changes)
- [ ] **Accessibility testing** - Verified keyboard navigation and screen reader support

### Test Commands Run

```bash
# List the commands you ran for testing
npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web test
npm --prefix web run test:e2e
npm --prefix web run axe:ci
npm --prefix web run build
```

## Checklist

### Code Quality

- [ ] **Code follows style guidelines** - Follows project coding standards
- [ ] **Self-review completed** - Code has been reviewed by the author
- [ ] **Documentation updated** - Updated relevant documentation
- [ ] **Comments added** - Added comments for complex logic
- [ ] **Error handling** - Proper error handling implemented
- [ ] **Security considerations** - No security vulnerabilities introduced

### Database Changes

- [ ] **Migration created** - New migration file created (if applicable)
- [ ] **RLS policies** - Row Level Security policies added/updated (if applicable)
- [ ] **Indexes** - Database indexes added for performance (if applicable)
- [ ] **Backward compatibility** - Changes are backward compatible
- [ ] **Rollback plan** - Rollback procedure documented

### Environment & Configuration

- [ ] **Environment variables** - New environment variables documented
- [ ] **Configuration changes** - Configuration changes documented
- [ ] **Dependencies** - New dependencies are necessary and minimal
- [ ] **Build process** - Build process still works correctly

## Screenshots (if applicable)

Add screenshots for UI changes, showing before and after states.

### Before

![Before screenshot](url-to-before-screenshot)

### After

![After screenshot](url-to-after-screenshot)

## Performance Impact

- [ ] **No performance regression** - Performance is maintained or improved
- [ ] **Bundle size** - Bundle size impact is minimal
- [ ] **Database queries** - Database queries are optimized
- [ ] **Load testing** - Load testing completed (if applicable)

## Security Considerations

- [ ] **Authentication** - Proper authentication checks implemented
- [ ] **Authorization** - Proper authorization checks implemented
- [ ] **Input validation** - All inputs are properly validated
- [ ] **SQL injection** - No SQL injection vulnerabilities
- [ ] **XSS protection** - XSS protection maintained
- [ ] **CSRF protection** - CSRF protection maintained

## Accessibility

- [ ] **Keyboard navigation** - All functionality accessible via keyboard
- [ ] **Screen reader support** - Proper ARIA labels and landmarks
- [ ] **Color contrast** - Meets WCAG 2.2 AA contrast requirements
- [ ] **Focus management** - Proper focus indicators and management
- [ ] **Semantic HTML** - Proper semantic HTML structure

## Breaking Changes

If this PR includes breaking changes, describe them here:

### What Changed

Description of what changed and why.

### Migration Guide

Steps users need to take to migrate:

1. Step 1
2. Step 2
3. Step 3

### Rollback Plan

How to rollback if issues are discovered:

1. Rollback step 1
2. Rollback step 2

## Related Issues

- Closes #[issue-number]
- Relates to #[issue-number]
- Addresses #[issue-number]

## Additional Notes

Any additional information that reviewers should know:

- Special testing considerations
- Known limitations
- Future improvements planned
- Dependencies on other PRs

## Review Checklist for Reviewers

### Code Review

- [ ] **Code quality** - Code is clean, readable, and follows standards
- [ ] **Functionality** - Feature works as expected
- [ ] **Security** - No security vulnerabilities
- [ ] **Performance** - No performance issues
- [ ] **Accessibility** - Meets accessibility requirements
- [ ] **Testing** - Adequate test coverage

### Documentation Review

- [ ] **Documentation updated** - Relevant docs updated
- [ ] **Comments clear** - Code comments are helpful
- [ ] **README updated** - README updated if needed
- [ ] **API docs** - API documentation updated if needed

### Operational Review

- [ ] **Deployment ready** - Changes can be safely deployed
- [ ] **Monitoring** - Monitoring/alerting updated if needed
- [ ] **Rollback plan** - Rollback plan is clear and tested
- [ ] **Dependencies** - Dependencies are appropriate and secure

## Deployment Notes

### Environment Variables

List any new environment variables required:

```bash
NEW_ENV_VAR=value
ANOTHER_VAR=value
```

### Database Migrations

If database migrations are included:

```bash
# Apply migrations
supabase db push

# Verify migration
supabase migration list
```

### Manual Steps

Any manual steps required for deployment:

1. Step 1
2. Step 2

## Rollback Instructions

If this PR needs to be rolled back:

1. **Code rollback**: Revert the PR
2. **Database rollback**: `supabase db reset` (if migrations included)
3. **Environment rollback**: Remove any new environment variables
4. **Verify rollback**: Test that the rollback was successful

---

**PR Template Version**: 1.0  
**Last Updated**: 2025-01-27
