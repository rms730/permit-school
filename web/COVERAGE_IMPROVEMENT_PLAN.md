# Coverage Improvement Plan - Target 90%+

## Current Status
- **Overall Coverage**: 2.83%
- **Target**: 90%+
- **Gap**: 87.17% to achieve

## Strategy Overview

### Phase 1: High-Impact Components (Priority 1)
Focus on components and utilities that are:
- Frequently used across the app
- Have complex logic
- Are critical for user experience

### Phase 2: Page Components (Priority 2)
Test page components that:
- Handle user interactions
- Manage state
- Integrate with APIs

### Phase 3: API Routes (Priority 3)
Test API routes for:
- Error handling
- Data validation
- Business logic

### Phase 4: Utilities & Helpers (Priority 4)
Test utility functions for:
- Edge cases
- Error conditions
- Complex logic

## Phase 1: High-Impact Components

### 1.1 Core UI Components
- [ ] `components/ui/CardX.tsx` - 0% coverage
- [ ] `components/ui/ErrorState.tsx` - 0% coverage
- [ ] `components/ui/PageHeader.tsx` - 0% coverage
- [ ] `components/ui/ResponsiveImage.tsx` - 0% coverage
- [ ] `components/ui/SkeletonX.tsx` - 0% coverage

### 1.2 Layout Components
- [ ] `components/layout/AppShell.tsx` - 0% coverage
- [ ] `components/Header.tsx` - 0% coverage
- [ ] `components/Footer.tsx` - 0% coverage
- [ ] `components/SimpleHeader.tsx` - 0% coverage

### 1.3 Feature Components
- [ ] `components/FAQ.tsx` - 0% coverage
- [ ] `components/HowItWorks.tsx` - 0% coverage
- [ ] `components/Pricing.tsx` - 0% coverage
- [ ] `components/PricingCTA.tsx` - 0% coverage
- [ ] `components/Testimonials.tsx` - 0% coverage

### 1.4 Auth Components
- [ ] `components/auth/GoogleOneTap.tsx` - 0% coverage
- [ ] `components/NotificationBell.tsx` - 0% coverage

## Phase 2: Page Components

### 2.1 Public Pages
- [ ] `app/(public)/home/page.tsx` - 0% coverage
- [ ] `app/(public)/permits/page.tsx` - 0% coverage
- [ ] `app/(public)/prep/page.tsx` - 0% coverage
- [ ] `app/(public)/prep/diagnostic/page.tsx` - 0% coverage
- [ ] `app/(public)/prep/mock/page.tsx` - 0% coverage
- [ ] `app/(public)/prep/score-report/[attemptId]/page.tsx` - 0% coverage
- [ ] `app/(public)/privacy/page.tsx` - 0% coverage
- [ ] `app/(public)/terms/page.tsx` - 0% coverage

### 2.2 Auth Pages
- [ ] `app/(auth)/signin/page.tsx` - 0% coverage
- [ ] `app/(auth)/signout/page.tsx` - 0% coverage
- [ ] `app/(public)/login/page.tsx` - 0% coverage
- [ ] `app/(public)/signup/page.tsx` - 0% coverage

### 2.3 App Pages
- [ ] `app/dashboard/page.tsx` - 0% coverage
- [ ] `app/courses/page.tsx` - 0% coverage
- [ ] `app/learn/[unitId]/page.tsx` - 0% coverage
- [ ] `app/practice/page.tsx` - 0% coverage
- [ ] `app/quiz/[attemptId]/page.tsx` - 0% coverage
- [ ] `app/quiz/start/[unitId]/page.tsx` - 0% coverage
- [ ] `app/exam/page.tsx` - 0% coverage
- [ ] `app/exam/[attemptId]/page.tsx` - 0% coverage

### 2.4 Account Pages
- [ ] `app/account/page.tsx` - 0% coverage
- [ ] `app/account/profile/page.tsx` - 0% coverage
- [ ] `app/account/auth/page.tsx` - 0% coverage
- [ ] `app/account/privacy/page.tsx` - 0% coverage
- [ ] `app/account/delete/confirm/page.tsx` - 0% coverage

## Phase 3: API Routes

### 3.1 Core API Routes
- [ ] `app/api/health/route.ts` - 100% coverage ✅
- [ ] `app/api/auth/profile/upsert/route.ts` - 0% coverage
- [ ] `app/api/profile/route.ts` - 0% coverage
- [ ] `app/api/notifications/route.ts` - 0% coverage
- [ ] `app/api/notifications/read/route.ts` - 0% coverage

### 3.2 Learning API Routes
- [ ] `app/api/prep/attempt/create/route.ts` - 0% coverage
- [ ] `app/api/prep/attempt/submit/route.ts` - 0% coverage
- [ ] `app/api/prep/score-report/[attemptId]/route.ts` - 0% coverage
- [ ] `app/api/attempts/start/route.ts` - 0% coverage
- [ ] `app/api/attempts/answer/route.ts` - 0% coverage
- [ ] `app/api/attempts/complete/route.ts` - 0% coverage

### 3.3 Exam API Routes
- [ ] `app/api/exam/start/route.ts` - 0% coverage
- [ ] `app/api/exam/answer/route.ts` - 0% coverage
- [ ] `app/api/exam/complete/route.ts` - 0% coverage
- [ ] `app/api/exam/eligibility/route.ts` - 0% coverage

### 3.4 Billing API Routes
- [ ] `app/api/billing/checkout/route.ts` - 0% coverage
- [ ] `app/api/billing/portal/route.ts` - 0% coverage
- [ ] `app/api/billing/invoices/route.ts` - 0% coverage
- [ ] `app/api/billing/summary/route.ts` - 0% coverage
- [ ] `app/api/billing/cancel/route.ts` - 0% coverage
- [ ] `app/api/billing/resume/route.ts` - 0% coverage

## Phase 4: Utilities & Helpers

### 4.1 Core Utilities
- [ ] `lib/auth.ts` - 0% coverage
- [ ] `lib/email.ts` - 0% coverage
- [ ] `lib/notify.ts` - 0% coverage
- [ ] `lib/offline.ts` - 0% coverage
- [ ] `lib/ratelimit.ts` - 0% coverage
- [ ] `lib/scrollToAnchor.ts` - 30.76% coverage (needs improvement)

### 4.2 I18n Utilities
- [ ] `lib/i18n/index.ts` - 0% coverage
- [ ] `lib/i18n/locales.ts` - 0% coverage
- [ ] `lib/i18n/server.ts` - 0% coverage
- [ ] `lib/i18n/I18nProvider.tsx` - 0% coverage

### 4.3 Storage Utilities
- [ ] `lib/storage/signedUrl.ts` - 0% coverage
- [ ] `lib/certStorage.ts` - 0% coverage
- [ ] `lib/certPdf.ts` - 0% coverage
- [ ] `lib/consentPdf.ts` - 0% coverage

## Implementation Strategy

### 1. Component Testing Approach
- Use `renderWithProviders` for consistent testing environment
- Mock external dependencies (APIs, auth, etc.)
- Test user interactions with `userEvent`
- Test accessibility with `vitest-axe`
- Test error states and edge cases

### 2. Page Testing Approach
- Test page rendering without errors
- Test navigation and routing
- Test data loading states
- Test error boundaries
- Test user interactions

### 3. API Route Testing Approach
- Test successful responses
- Test error handling
- Test input validation
- Test authentication/authorization
- Test edge cases

### 4. Utility Testing Approach
- Test all exported functions
- Test edge cases and error conditions
- Test with different input types
- Mock external dependencies

## Coverage Targets by Category

### Components: 90%+
- Core UI components: 100%
- Layout components: 90%
- Feature components: 85%
- Auth components: 90%

### Pages: 85%+
- Public pages: 80%
- Auth pages: 90%
- App pages: 85%
- Account pages: 90%

### API Routes: 80%+
- Core routes: 90%
- Learning routes: 80%
- Exam routes: 80%
- Billing routes: 75%

### Utilities: 90%+
- Core utilities: 90%
- I18n utilities: 85%
- Storage utilities: 80%

## Estimated Impact

Based on file sizes and complexity:
- **Components**: ~40% of codebase → Target: 90% coverage
- **Pages**: ~35% of codebase → Target: 85% coverage  
- **API Routes**: ~15% of codebase → Target: 80% coverage
- **Utilities**: ~10% of codebase → Target: 90% coverage

**Projected Overall Coverage**: ~87-92%

## Next Steps

1. **Start with Phase 1** - High-impact components
2. **Create test templates** for each category
3. **Implement systematic testing** following established patterns
4. **Monitor coverage** after each phase
5. **Adjust strategy** based on coverage results

## Success Metrics

- [ ] Overall coverage > 90%
- [ ] Component coverage > 90%
- [ ] Page coverage > 85%
- [ ] API route coverage > 80%
- [ ] Utility coverage > 90%
- [ ] All tests passing
- [ ] No regression in existing functionality
