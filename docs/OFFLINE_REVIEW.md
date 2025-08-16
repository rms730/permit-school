# Offline Review Kit

A complete offline development environment for testing Permit School without internet connectivity.

## Quick Start (5 minutes)

### Prerequisites

- Docker installed and running
- Supabase CLI installed (`npm install -g supabase`)
- Node.js 18+ installed

### 1. Start the Offline Environment

```bash
# From the project root
./ops/offline/offline.sh
```

This script will:

- Start local Supabase with all migrations
- Create test users and data
- Start Next.js in offline mode
- Display URLs and credentials

### 2. Access the Application

- **App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **API**: http://localhost:54321

### 3. Test Users

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Admin    | admin@offline.local   | admin123    |
| Student  | student@offline.local | student123  |
| Minor    | minor@offline.local   | minor123    |
| Guardian | guardian@offian.local | guardian123 |

## Testing Flows

### Student Flow

1. Sign in as `student@offline.local`
2. Navigate to courses
3. Enroll in CA_DL_BASIC
4. Complete learning units
5. Take quizzes
6. Pass final exam
7. Generate certificate

### Admin Flow

1. Sign in as `admin@offline.local`
2. View admin dashboard
3. Manage courses and questions
4. Issue certificates
5. View compliance reports

### Guardian Flow

1. Sign in as `guardian@offline.local`
2. View linked students
3. Monitor progress
4. Review certificates

## Offline Mode Features

### What's Disabled

- Google One-Tap sign-in
- External API calls (Sentry, Resend, Stripe)
- External font/asset loading
- Email delivery (logged to console)

### What Works

- All core application functionality
- Local Supabase database
- File uploads to local storage
- Certificate generation
- Progress tracking
- Admin operations

### Visual Indicators

- "OFFLINE" badge in AppBar
- Console logs showing offline mode
- Disabled external service buttons

## Common Gotchas

### Database Issues

```bash
# Reset database if needed
supabase db reset

# Check Supabase status
supabase status
```

### Port Conflicts

If ports are in use:

```bash
# Stop existing Supabase
supabase stop

# Start fresh
./ops/offline/offline.sh
```

### Environment Variables

The script creates `web/.env.local` automatically. If you need to modify:

```bash
# Edit environment
nano web/.env.local

# Restart the app
cd web && npm run dev:offline
```

### Test Data

Test data is seeded via testkit endpoints. To reset:

```bash
# Clear and reseed
curl -X POST http://localhost:54321/functions/v1/testkit/reset \
  -H "Content-Type: application/json" \
  -d '{"action": "reset_all"}'
```

## Verification

### Check Offline Mode

1. Look for "OFFLINE" badge in top-right
2. Check browser console for offline logs
3. Verify no external network requests

### Test Complete Flow

1. Student login → course enrollment → learning → quiz → exam → certificate
2. Admin login → dashboard → certificate issuance
3. Guardian login → student monitoring

### Network Verification

```bash
# Turn off WiFi/network
# Verify app still works
# Check no external requests in dev tools
```

## Troubleshooting

### Supabase Won't Start

```bash
# Check Docker
docker ps

# Restart Docker if needed
docker restart

# Try again
./ops/offline/offline.sh
```

### App Won't Load

```bash
# Check if ports are free
lsof -i :3000
lsof -i :54321

# Kill processes if needed
kill -9 <PID>

# Restart
./ops/offline/offline.sh
```

### Test Users Not Working

```bash
# Check Supabase logs
supabase logs

# Reset database
supabase db reset

# Restart
./ops/offline/offline.sh
```

## Development

### Adding Test Data

Edit fixtures in `ops/fixtures/offline/`:

- `users.json` - Test user accounts
- `enrollments.json` - Course enrollments
- `entitlements.json` - Access permissions
- `seat-time.json` - Learning progress

### Modifying Offline Behavior

Edit `web/src/lib/offline.ts` to:

- Add new disabled features
- Modify offline indicators
- Change configuration

### Running Tests

```bash
# Run offline E2E tests
npm run test:e2e -- tests/e2e/offline-review.spec.ts

# Run with UI
npm run test:e2e:ui -- tests/e2e/offline-review.spec.ts
```

## Security Notes

- All test users use simple passwords
- No real payment processing
- No external service keys
- Local storage only
- Safe for development/testing

## Next Steps

After testing offline:

1. Commit any changes
2. Push to feature branch
3. Create PR with offline testing results
4. Document any issues found
