# Security & Compliance Notes

## Sprint 15 — Accessibility, PWA, and Performance

### Seat-Time & Offline Restrictions

**Critical Compliance Requirement**: Seat-time tracking and exam integrity must be maintained at all times.

#### PWA Implementation Constraints

1. **No Offline Seat-Time**: 
   - Seat-time tracking is explicitly disabled when offline
   - Service worker uses Network Only strategy for all learning/exam routes
   - No caching of authenticated or compliance-sensitive content

2. **Protected Routes** (Network Only):
   - `/api/**` - All API endpoints
   - `/learn/**` - Learning content and seat-time tracking
   - `/quiz/**` - Practice quizzes and assessments
   - `/exam/**` - Final exams and compliance testing
   - `/tutor` - AI tutoring sessions
   - `/billing/**` - Payment and subscription management
   - `/admin/**` - Administrative functions
   - `/profile/**` - User profile management
   - `/dashboard` - User dashboard
   - `/signin`, `/signout` - Authentication flows
   - `/enroll/**` - Course enrollment
   - `/guardian/**` - Guardian consent management

3. **Cached Routes** (Stale While Revalidate):
   - `/` - Home page
   - `/courses` - Course catalog
   - `/privacy`, `/terms` - Legal pages
   - `/verify/*` - Certificate verification
   - `/accessibility` - Accessibility statement
   - `/offline` - Offline fallback page

4. **Static Assets** (Cache First):
   - `/_next/static/**` - Next.js static assets
   - `/icons/**` - PWA icons
   - Google Fonts

#### Compliance Verification

- **Seat-time Integrity**: All learning time is tracked server-side with user authentication
- **Exam Security**: Exams require network connectivity and cannot be cached
- **Audit Trail**: All user interactions logged with timestamps and IP addresses
- **Data Protection**: PII and sensitive data never cached in service worker

#### Testing Requirements

1. **Offline Testing**:
   - Disconnect network and verify seat-time stops accruing
   - Confirm learning/exam pages show offline message
   - Verify static assets remain available offline

2. **Online Testing**:
   - Reconnect and verify seat-time resumes tracking
   - Confirm all protected routes load normally
   - Test PWA installation and functionality

3. **Security Testing**:
   - Verify no sensitive data in service worker cache
   - Confirm authentication required for all protected routes
   - Test rate limiting and abuse prevention

### Accessibility Compliance

#### WCAG 2.2 AA Requirements

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Screen Reader Support**: Proper ARIA labels and semantic HTML
3. **Color Contrast**: Minimum 4.5:1 contrast ratio for text
4. **Focus Indicators**: Visible focus outlines on all interactive elements
5. **Alternative Text**: Descriptive alt text for all images

#### Testing Tools

- **Automated**: axe-core CLI for CI/CD pipeline
- **Manual**: Keyboard-only navigation testing
- **Screen Readers**: NVDA (Windows) and VoiceOver (macOS) testing

### Performance Standards

#### Lighthouse Thresholds

- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 95
- **SEO**: ≥ 90

#### Core Web Vitals

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Security Considerations

1. **Service Worker**: No sensitive data stored in cache
2. **Authentication**: All protected routes require valid session
3. **Rate Limiting**: API endpoints protected against abuse
4. **CORS**: Proper cross-origin restrictions
5. **Content Security Policy**: Strict CSP headers

### Compliance Reporting

- **Accessibility**: Automated testing in CI/CD pipeline
- **Performance**: Lighthouse CI with artifact storage
- **Security**: Regular security audits and penetration testing
- **Compliance**: Audit trail for all user interactions and seat-time tracking
