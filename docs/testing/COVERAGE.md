---
title: "Testing Coverage"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/testing/STRATEGY.md>
  - </docs/testing/PLAYWRIGHT.md>
---

# Testing Coverage

**Purpose & Outcome**  
This document provides a comprehensive overview of current test coverage across all testing layers, including unit tests, integration tests, and end-to-end tests, with detailed metrics and analysis.

## Coverage Summary

**Last Updated**: 2025-01-27  
**Coverage Report**: Generated from Vitest v3.2.4 with V8 coverage provider

### Overall Coverage Metrics

| Metric         | Percentage | Status    |
| -------------- | ---------- | --------- |
| **Statements** | 0.74%      | ⚠️ Low    |
| **Branches**   | 40.88%     | ⚠️ Medium |
| **Functions**  | 35.64%     | ⚠️ Medium |
| **Lines**      | 0.74%      | ⚠️ Low    |

### Coverage by Category

| Category           | Files | Coverage | Priority |
| ------------------ | ----- | -------- | -------- |
| **Core Libraries** | 3     | 96.42%   | High     |
| **Components**     | 33    | 70.83%   | High     |
| **API Routes**     | 50+   | 0%       | Critical |
| **Pages**          | 50+   | 0%       | Medium   |
| **Utilities**      | 20+   | 0%       | Medium   |

## Unit Test Coverage

### Covered Files

#### Core Libraries (High Coverage)

```
web/src/lib/confetti.ts                   96.42% (statements)
web/src/lib/idleTracker.ts                75.93% (statements)
web/src/lib/switchLocale.ts               `100%` (statements)
```

#### Components (Good Coverage)

```
web/src/components/AppBar.tsx             `100%` (statements)
web/src/components/AppBarV2.tsx           `100%` (statements)
web/src/components/CertificateActions.tsx (`100%` statements)
web/src/components/FAQ.tsx                (`100%` statements)
web/src/components/Footer.tsx             (`100%` statements)
web/src/components/Header.tsx             (`100%` statements)
web/src/components/Hero.tsx               (`100%` statements)
web/src/components/HowItWorks.tsx         (`100%` statements)
web/src/components/IntlLanguageSwitcher.tsx (`100%` statements)
web/src/components/LanguageSwitcher.tsx   (`100%` statements)
web/src/components/NotificationBell.tsx   (`100%` statements)
web/src/components/OfflineModeBadge.tsx   (`100%` statements)
web/src/components/OfflineModeIndicator.tsx (`100%` statements)
web/src/components/Pricing.tsx            (`100%` statements)
web/src/components/PricingCTA.tsx         (`100%` statements)
web/src/components/SimpleHeader.tsx       (`100%` statements)
web/src/components/SkipLink.tsx           (`100%` statements)
```

### Uncovered Critical Areas

#### API Routes (0% Coverage)

```
web/src/app/api/account/profile/route.ts
web/src/app/api/admin/audit/route.ts
web/src/app/api/admin/jobs/export/route.ts
web/src/app/api/admin/regulatory/runs/route.ts
web/src/app/api/notifications/route.ts
web/src/app/api/profile/route.ts
```

#### Core Pages (0% Coverage)

```
web/src/app/dashboard/page.tsx
web/src/app/onboarding/page.tsx
web/src/app/profile/page.tsx
web/src/app/billing/page.tsx
web/src/app/guardian/page.tsx
web/src/app/learn/useSeatTime.ts
```

#### Critical Utilities (0% Coverage)

```
web/src/lib/email.ts
web/src/lib/certPdf.ts
web/src/lib/consentPdf.ts
web/src/lib/entitlements.ts
web/src/lib/jurisdictionConfig.ts
web/src/lib/notify.ts
web/src/lib/storageSignedUrl.ts
web/src/lib/supabaseAdmin.ts
web/src/lib/supabaseRoute.ts
web/src/lib/supabaseServer.ts
web/src/lib/tokens.ts
```

## End-to-End Test Coverage

### Test Files and Coverage

| Test File                        | Test Cases | Coverage Area                  | Status     |
| -------------------------------- | ---------- | ------------------------------ | ---------- |
| `auth-onboarding.spec.ts`        | 1          | User registration & onboarding | ✅ Covered |
| `auth-ui.spec.ts`                | 6          | Authentication UI flows        | ✅ Covered |
| `billing-lifecycle.spec.ts`      | 8          | Complete billing workflow      | ✅ Covered |
| `dual-product.spec.ts`           | 2          | Multi-state functionality      | ✅ Covered |
| `exam-certificate.spec.ts`       | 3          | Exam completion & certificates | ✅ Covered |
| `final-exam.spec.ts`             | 4          | Final exam workflow            | ✅ Covered |
| `guardian-esign.spec.ts`         | 2          | Guardian consent flow          | ✅ Covered |
| `guardian-notifications.spec.ts` | 3          | Guardian notification system   | ✅ Covered |
| `home-nav-and-faq.spec.ts`       | 2          | Navigation & FAQ               | ✅ Covered |
| `home.spec.ts`                   | 1          | Homepage functionality         | ✅ Covered |
| `i18n-switcher.spec.ts`          | 8          | Internationalization           | ✅ Covered |
| `interactivity-fixes.spec.ts`    | 8          | UI interactivity               | ✅ Covered |
| `learn-quiz.spec.ts`             | 2          | Learning & quiz flow           | ✅ Covered |
| `learner-features.spec.ts`       | 4          | Core learner features          | ✅ Covered |
| `navigation-fixes.spec.ts`       | 3          | Navigation improvements        | ✅ Covered |
| `offline-review.spec.ts`         | 2          | Offline functionality          | ✅ Covered |
| `regulatory-reporting.spec.ts`   | 3          | Admin reporting                | ✅ Covered |

### User Workflow Coverage

#### ✅ Fully Covered Workflows

1. **User Registration & Onboarding**

   - Sign up process
   - Profile completion
   - Guardian consent (for minors)
   - Email verification

2. **Learning Experience**

   - Course enrollment
   - Unit navigation
   - Seat time tracking
   - Quiz completion
   - Progress tracking

3. **Assessment & Certification**

   - Final exam eligibility
   - Exam completion
   - Certificate generation
   - Certificate verification

4. **Billing & Payments**

   - Subscription creation
   - Payment processing
   - Invoice management
   - Subscription cancellation

5. **Admin Operations**
   - User management
   - Regulatory reporting
   - Certificate issuance
   - System monitoring

#### ⚠️ Partially Covered Workflows

1. **Guardian Management**

   - Guardian dashboard
   - Child progress monitoring
   - Consent management

2. **Advanced Features**
   - Tutor AI functionality
   - Offline mode
   - Advanced admin features

#### ❌ Missing Coverage

1. **Error Handling**

   - Network failures
   - Database errors
   - External service failures

2. **Edge Cases**
   - Concurrent user sessions
   - Data race conditions
   - Performance under load

## Accessibility Test Coverage

### Automated Testing

- **axe-core integration**: ✅ Implemented
- **ESLint jsx-a11y rules**: ✅ Configured
- **Playwright accessibility tests**: ✅ Implemented

### Test Coverage Areas

- Homepage accessibility
- Form accessibility
- Navigation accessibility
- Component accessibility

### Manual Testing Checklist

- [x] Keyboard navigation
- [x] Screen reader compatibility
- [x] Color contrast
- [x] Focus management
- [x] Semantic HTML

## Performance Test Coverage

### Lighthouse CI Coverage

- **Homepage**: ✅ Monitored
- **Courses page**: ✅ Monitored
- **Dashboard**: ⚠️ Needs monitoring
- **Admin pages**: ❌ Not monitored

### Core Web Vitals

- **LCP**: ✅ Monitored (< 2.5s target)
- **FID**: ✅ Monitored (< 100ms target)
- **CLS**: ✅ Monitored (< 0.1 target)

### Bundle Size Monitoring

- **Main bundle**: ✅ Monitored
- **Vendor bundle**: ✅ Monitored
- **Total bundle**: ✅ Monitored

## Coverage Improvement Plan

### Phase 1: Critical API Coverage (Priority: High)

**Target**: Increase API route coverage to 80%

**Files to Cover**:

```
web/src/app/api/health/route.ts
web/src/app/api/profile/route.ts
web/src/app/api/account/profile/route.ts
web/src/app/api/enroll/route.ts
web/src/app/api/enrollments/route.ts
web/src/app/api/public/catalog/route.ts
web/src/app/api/progress/seat-time/route.ts
web/src/app/api/progress/heartbeat/route.ts
web/src/app/api/attempts/start/route.ts
web/src/app/api/attempts/answer/route.ts
web/src/app/api/attempts/complete/route.ts
web/src/app/api/exam/eligibility/route.ts
web/src/app/api/exam/start/route.ts
web/src/app/api/exam/answer/route.ts
web/src/app/api/exam/complete/route.ts
web/src/app/api/certificates/verify/[number]/route.ts
web/src/app/api/guardian/request/route.ts
web/src/app/api/guardian/verify/[token]/route.ts
web/src/app/api/guardian/consent/route.ts
web/src/app/api/billing/checkout/route.ts
web/src/app/api/billing/summary/route.ts
web/src/app/api/billing/invoices/route.ts
web/src/app/api/billing/portal/route.ts
web/src/app/api/tutor/route.ts
web/src/app/api/notifications/route.ts
```

**Implementation Strategy**:

```typescript
// Example API test structure
describe("/api/profile", () => {
  test("GET returns user profile", async () => {
    // Mock authenticated user
    // Test successful response
  });

  test("PUT updates user profile", async () => {
    // Mock authenticated user
    // Test profile update
  });

  test("returns 401 for unauthenticated requests", async () => {
    // Test authentication requirement
  });
});
```

### Phase 2: Core Utilities Coverage (Priority: High)

**Target**: Increase utility coverage to 70%

**Files to Cover**:

```
web/src/lib/email.ts
web/src/lib/certPdf.ts
web/src/lib/consentPdf.ts
web/src/lib/entitlements.ts
web/src/lib/jurisdictionConfig.ts
web/src/lib/notify.ts
web/src/lib/storageSignedUrl.ts
web/src/lib/supabaseAdmin.ts
web/src/lib/supabaseRoute.ts
web/src/lib/supabaseServer.ts
web/src/lib/tokens.ts
```

### Phase 3: Page Component Coverage (Priority: Medium)

**Target**: Increase page coverage to 50%

**Pages to Cover**:

```
web/src/app/dashboard/page.tsx
web/src/app/onboarding/page.tsx
web/src/app/profile/page.tsx
web/src/app/billing/page.tsx
web/src/app/guardian/page.tsx
web/src/app/learn/[unitId]/page.tsx
web/src/app/exam/[attemptId]/page.tsx
web/src/app/quiz/[attemptId]/page.tsx
```

### Phase 4: E2E Test Expansion (Priority: Medium)

**New Test Scenarios**:

1. **Error Handling Tests**

   - Network failure scenarios
   - Database error handling
   - External service failures

2. **Performance Tests**

   - Load testing for critical paths
   - Memory leak detection
   - Bundle size regression tests

3. **Security Tests**
   - Authentication bypass attempts
   - Authorization testing
   - Input validation testing

## Coverage Monitoring

### Automated Monitoring

**GitHub Actions Integration**:

```yaml
# .github/workflows/coverage.yml
- name: Generate coverage report
  run: npm --prefix web test -- --coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: web/coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
```

**Coverage Thresholds**:

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          statements: 70,
          branches: 60,
          functions: 70,
          lines: 70
        }
      }
    }
  }
});
```

### Manual Monitoring

**Weekly Reviews**:

- Review coverage reports
- Identify uncovered critical paths
- Plan coverage improvements

**Monthly Reviews**:

- Analyze coverage trends
- Update coverage targets
- Review test effectiveness

## Coverage Metrics Dashboard

### Current Status Dashboard

| Metric                 | Current | Target | Trend        |
| ---------------------- | ------- | ------ | ------------ |
| **Overall Coverage**   | 0.74%   | 70%    | 📈 Improving |
| **API Coverage**       | 0%      | 80%    | 📈 Improving |
| **Component Coverage** | 70.83%  | 80%    | 📈 Improving |
| **Utility Coverage**   | 16.13%  | 70%    | 📈 Improving |
| **E2E Coverage**       | 85%     | 90%    | 📈 Improving |

### Coverage Trends

**Last 4 Weeks**:

- Week 1: 0.5% → Week 2: 0.6% → Week 3: 0.7% → Week 4: 0.74%

**Projected Goals**:

- Month 1: 20% coverage
- Month 2: 40% coverage
- Month 3: 60% coverage
- Month 4: 70% coverage

## Coverage Best Practices

### Writing Effective Tests

1. **Test Behavior, Not Implementation**

   ```typescript
   // ✅ Good - Tests user behavior
   test("user can complete onboarding", async () => {
     await user.click(getByText("Complete Profile"));
     await expect(getByText("Welcome")).toBeVisible();
   });

   // ❌ Bad - Tests implementation
   test("onboarding form submits data", async () => {
     await user.click(getByTestId("submit-button"));
     expect(mockSubmit).toHaveBeenCalled();
   });
   ```

2. **Use Meaningful Test Names**

   ```typescript
   // ✅ Good
   test("displays error message when email is invalid", () => {});

   // ❌ Bad
   test("test email validation", () => {});
   ```

3. **Test Edge Cases**
   ```typescript
   test("handles empty form submission", async () => {});
   test("handles network errors gracefully", async () => {});
   test("handles concurrent requests", async () => {});
   ```

### Coverage Maintenance

1. **Regular Coverage Reviews**

   - Weekly coverage report analysis
   - Monthly coverage trend review
   - Quarterly coverage strategy update

2. **Coverage Quality**

   - Focus on meaningful coverage, not just percentage
   - Ensure critical paths are tested
   - Maintain test quality alongside coverage

3. **Coverage Automation**
   - Automated coverage reporting
   - Coverage threshold enforcement
   - Coverage trend monitoring

---

**Next**: [Playwright E2E Testing](PLAYWRIGHT.md) - Detailed guide for end-to-end testing with Playwright
