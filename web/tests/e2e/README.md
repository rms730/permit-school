# E2E Test Organization Guide

## Test File Naming Convention

Test files should be named descriptively based on the functionality they test, not tied to development sprints.

### Current Test Files

| File Name | Purpose | Description |
|-----------|---------|-------------|
| `auth-ui.spec.ts` | Authentication UI | Login/signup forms, Google auth, form validation |
| `learner-features.spec.ts` | Learner Experience | Learning pages, quiz/exam interfaces, engagement tracking |
| `account-shell.spec.ts` | Account Management | User profile, settings, account navigation |
| `catalog-i18n.spec.ts` | Course Catalog | Course listing, internationalization, language switching |
| `accessibility.spec.ts` | Accessibility | ARIA labels, keyboard navigation, screen reader support |
| `billing-lifecycle.spec.ts` | Billing & Payments | Subscription management, payment flows, invoices |
| `regulatory-reporting.spec.ts` | Compliance | Regulatory reports, data export, compliance features |
| `auth-onboarding.spec.ts` | User Onboarding | New user flow, welcome screens, tutorial |
| `exam-certificate.spec.ts` | Certifications | Exam completion, certificate generation, verification |
| `guardian-esign.spec.ts` | Guardian Features | Parent/guardian consent, electronic signatures |
| `guardian-notifications.spec.ts` | Guardian Notifications | Parent alerts, progress updates, communication |
| `learn-quiz.spec.ts` | Learning & Assessment | Quiz functionality, progress tracking, scoring |
| `offline-review.spec.ts` | Offline Functionality | Offline mode, data sync, offline review |

### Naming Guidelines

1. **Use descriptive names**: `auth-ui.spec.ts` not `sprint-22-ux-refresh.spec.ts`
2. **Group related functionality**: All auth tests in one file
3. **Use kebab-case**: `learner-features.spec.ts` not `learnerFeatures.spec.ts`
4. **Be specific but concise**: `billing-lifecycle.spec.ts` not `payment-subscription-invoice-management.spec.ts`

### Test Organization Principles

1. **Feature-based grouping**: Group tests by user-facing features
2. **User journey focus**: Test complete user workflows
3. **Cross-cutting concerns**: Separate accessibility, performance, and error handling
4. **Maintainability**: Keep related tests together for easier maintenance

### Adding New Tests

When adding new test files:

1. **Choose a descriptive name** that reflects the functionality
2. **Group related tests** in the same file
3. **Update this README** with the new file and its purpose
4. **Follow existing patterns** for test structure and naming

### Test File Structure

Each test file should follow this structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name - Clear Description', () => {
  test('should perform specific action', async ({ page }) => {
    // Test implementation
  });
});
```

### CI Integration

All test files are automatically included in CI runs. The test suite runs:
- On pull requests
- On main branch pushes
- In parallel across multiple browsers
- With proper error reporting and artifacts
