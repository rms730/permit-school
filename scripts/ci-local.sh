#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to cleanup on exit
cleanup() {
    print_warning "Cleaning up..."
    # Kill any processes on port 4330
    if command_exists npx; then
        npx kill-port 4330 2>/dev/null || true
    fi
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
}

# Set up cleanup trap
trap cleanup EXIT

# Check Node version
print_step "Checking Node version..."
NODE_VERSION=$(node -v)
if [[ "$NODE_VERSION" != v20* ]]; then
    print_error "Node version mismatch. Expected v20.x, got $NODE_VERSION"
    print_warning "Please run: nvm use"
    exit 1
fi
print_success "Node version: $NODE_VERSION"

# Check npm version
print_step "Checking npm version..."
NPM_VERSION=$(npm -v)
print_success "npm version: $NPM_VERSION"

# Set up environment variables (matching CI)
export CI=true
export NODE_ENV=development
export BASE_URL=http://127.0.0.1:4330
export NEXT_PUBLIC_SITE_URL=http://127.0.0.1:4330
export TESTKIT_ON=true
export TESTKIT_TOKEN=dev-super-secret
export PLAYWRIGHT_EXTERNAL_SERVER=1

# Use placeholder values for required env vars (matching CI)
export NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-placeholder-key
export SUPABASE_URL=https://example.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=service-role-placeholder
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
export NEXT_PUBLIC_SENTRY_DSN=https://placeholder.sentry.io

print_step "Environment variables set for CI parity"

# 1. Root level checks
print_step "Running root level checks..."

print_step "Checking Cursor rules..."
if [[ ! -f .cursorrules ]] && [[ ! -f cursor.rules.md ]]; then
    print_error "Missing .cursorrules/cursor.rules.md"
    exit 1
fi
print_success "Cursor rules present"

print_step "Installing root dependencies..."
npm ci
print_success "Root dependencies installed"

print_step "Running Prettier check..."
npm run format:check
print_success "Prettier check passed"

print_step "Validating root environment..."
npm run env:check:dev
print_success "Root environment validated"

# 2. Web level checks
print_step "Running web level checks..."

cd web

print_step "Installing web dependencies..."
npm ci
print_success "Web dependencies installed"

print_step "Validating web environment..."
npm run env:check
print_success "Web environment validated"

print_step "Running web linting..."
npm run lint
print_success "Web linting passed"

print_step "Running accessibility linting..."
npm run lint:a11y
print_success "Accessibility linting passed"

print_step "Running typecheck..."
npm run typecheck
print_success "Typecheck passed"

print_step "Building web application..."
# Disable static generation to avoid React context errors
export NEXT_DISABLE_STATIC_GENERATION=1
npm run build:ci
print_success "Web build completed"

# 3. Unit tests
print_step "Running unit tests..."
npm run test
print_success "Unit tests passed"

# 4. Install Playwright browsers
print_step "Installing Playwright browsers..."
npx playwright install --with-deps
print_success "Playwright browsers installed"

# 5. Start production server
print_step "Starting production server..."
# Kill any existing process on port 4330
npx kill-port 4330 2>/dev/null || true

# Start the standalone server in background
nohup npm run start:ci > .next_start.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
print_step "Waiting for server to be ready..."
for i in {1..60}; do
    if curl -fsS http://127.0.0.1:4330 >/dev/null 2>&1; then
        print_success "Server ready at http://127.0.0.1:4330"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Server not ready after 30s, checking logs..."
        cat .next_start.log 2>/dev/null || echo "No log file found"
    fi
    sleep 1
done

# 6. Setup test data
print_step "Setting up test data..."
curl -X POST http://127.0.0.1:4330/api/testkit/reset \
    -H "Authorization: Bearer $TESTKIT_TOKEN" \
    -H "Content-Type: application/json" || print_warning "Reset failed, continuing..."

# Create test users
curl -X POST http://127.0.0.1:4330/api/testkit/user \
    -H "Authorization: Bearer $TESTKIT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"admin": true, "locale": "en"}' || print_warning "Admin user creation failed"

curl -X POST http://127.0.0.1:4330/api/testkit/user \
    -H "Authorization: Bearer $TESTKIT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"admin": false, "locale": "en"}' || print_warning "Student user creation failed"

curl -X POST http://127.0.0.1:4330/api/testkit/user \
    -H "Authorization: Bearer $TESTKIT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"minor": true, "admin": false, "locale": "en"}' || print_warning "Minor user creation failed"

# Create exam blueprint
curl -X POST http://127.0.0.1:4330/api/testkit/exam/blueprint \
    -H "Authorization: Bearer $TESTKIT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"j_code": "CA", "course_code": "DE-ONLINE", "num_questions": 5}' || print_warning "Blueprint creation failed"

print_success "Test data setup completed"

# 7. Run E2E tests
print_step "Running E2E tests..."
npx playwright test --reporter=line
print_success "E2E tests passed"

# 8. Cleanup test data
print_step "Cleaning up test data..."
curl -X POST http://127.0.0.1:4330/api/testkit/reset \
    -H "Authorization: Bearer $TESTKIT_TOKEN" \
    -H "Content-Type: application/json" || print_warning "Cleanup failed, continuing..."

# 9. Run Lighthouse CI
print_step "Running Lighthouse CI..."
# Set port for LHCI
export PORT=4320
npx --yes @lhci/cli@0.13.0 autorun \
    --config=.lighthouserc.cjs \
    --collect.startServerCommand="PORT=$PORT npm run start:ci" \
    --collect.url="http://localhost:$PORT/" \
    --collect.numberOfRuns=2
print_success "Lighthouse CI passed"

# 10. Run axe-core accessibility tests
print_step "Running axe-core accessibility tests..."
npm run axe:ci
print_success "Axe-core accessibility tests passed"

cd ..

print_success "🎉 All CI checks passed locally!"
print_success "Your local environment matches CI exactly."
