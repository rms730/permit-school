# Running CI Checks Locally

This document explains how to run the exact same CI checks locally that run on GitHub Actions.

## Quick Start

To run all CI checks locally (matching GitHub Actions exactly):

```bash
npm run ci:local
```

This command will:

1. ✅ Check Node version (must be v20.x)
2. ✅ Validate environment variables
3. ✅ Run linting (root + web)
4. ✅ Run accessibility linting
5. ✅ Run typechecking
6. ✅ Build the application
7. ✅ Run unit tests
8. ✅ Install Playwright browsers
9. ✅ Start production server
10. ✅ Setup test data
11. ✅ Run E2E tests
12. ✅ Run Lighthouse CI
13. ✅ Run axe-core accessibility tests

## Pre-push Hook

A Husky pre-push hook is configured to automatically run all CI checks before pushing to GitHub. This ensures that:

- All checks pass locally before code reaches GitHub
- No broken code gets pushed to the repository
- CI failures are caught early in development

### Bypassing the Pre-push Hook

**⚠️ Not Recommended**: You can bypass the pre-push hook using:

```bash
git push --no-verify
```

However, this should only be used in emergency situations. The pre-push hook exists to prevent CI failures and maintain code quality.

## Environment Setup

The local CI runner uses the same environment variables as GitHub Actions:

- `CI=true`
- `NODE_ENV=development`
- `BASE_URL=http://127.0.0.1:4330`
- `TESTKIT_ON=true`
- `TESTKIT_TOKEN=dev-super-secret`

Placeholder values are used for external services (Supabase, Stripe, etc.) to match CI behavior.

## Node Version

The project requires Node.js version 20.x to match GitHub Actions. If you're using nvm:

```bash
nvm use
```

## Troubleshooting

### Node Version Mismatch

If you see "Node version mismatch" error:

```bash
nvm install 20
nvm use 20
```

### Port Conflicts

If port 4330 is already in use:

```bash
npx kill-port 4330
```

### Playwright Browsers

If Playwright tests fail, ensure browsers are installed:

```bash
cd web
npx playwright install --with-deps
```

### Environment Variables

If environment validation fails, ensure you have the required environment files:

```bash
npm run env:copy
```

## CI Job Mapping

| GitHub Action Job | Local Command                                  | Purpose                              |
| ----------------- | ---------------------------------------------- | ------------------------------------ |
| `lint`            | `npm run format:check` + `npm run -w web lint` | Code formatting and linting          |
| `lint-a11y`       | `npm run -w web lint:a11y`                     | Accessibility linting                |
| `build`           | `npm run -w web build:ci`                      | Application build                    |
| `test`            | `npm run -w web test`                          | Unit tests                           |
| `e2e`             | `npx playwright test`                          | End-to-end tests                     |
| `lighthouse-ci`   | `npx @lhci/cli autorun`                        | Performance and accessibility audits |

## Performance

The full CI run takes approximately 3-5 minutes locally, depending on your machine. The pre-push hook will block pushes until all checks pass.

## Continuous Integration

When you push to GitHub, the following checks will run:

1. **CI** - Root level checks (format, env validation)
2. **web-ci** - Web application build and typecheck
3. **Accessibility & Performance CI** - Lighthouse CI, accessibility linting, E2E tests

All checks must pass for the push to be considered successful.
