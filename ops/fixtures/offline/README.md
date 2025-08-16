# Offline Review Kit Fixtures

This directory contains JSON fixtures for seeding the offline development environment with test data.

## Fixture Files

### `users.json`

- **Purpose**: Test user accounts for different roles
- **Contains**: Admin, student (adult), minor student, and guardian accounts
- **Usage**: Seeded via testkit API endpoints

### `enrollments.json`

- **Purpose**: Course enrollments for test students
- **Contains**: Sample enrollments with different states (active, completed, in-progress)
- **Usage**: Creates realistic learning scenarios

### `entitlements.json`

- **Purpose**: Access entitlements and permissions
- **Contains**: Course access, exam attempts, certificate generation rights
- **Usage**: Tests billing and access control features

### `seat-time.json`

- **Purpose**: Learning progress and seat time tracking
- **Contains**: Unit progress, quiz attempts, time spent learning
- **Usage**: Tests compliance and progress tracking

## Usage

These fixtures are automatically loaded by the `ops/offline/offline.sh` script when starting the offline review environment.

## Customization

To modify test data:

1. Edit the JSON files in this directory
2. Update the seeding logic in `ops/offline/offline.sh`
3. Restart the offline environment

## Notes

- All test users use `@offline.local` email domains
- Passwords are simple for testing (e.g., `admin123`, `student123`)
- Data is reset on each `supabase db reset`
- Fixtures are designed to test all major application flows
