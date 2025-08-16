# Migration Structure

This document explains the current migration structure and strategy for the permit-school platform.

## Current Migration Strategy

The platform uses a **hybrid migration approach**:

1. **Baseline Migration**: `0000_init.up.sql` contains core foundational tables
2. **Feature Migrations**: Individual numbered migrations for specific features
3. **Extension Migrations**: New migrations that extend existing functionality

## Migration Files Overview

### Baseline Migration
- **`0000_init.up.sql`**: Core tables (jurisdictions, courses, course_units)
- **`0000_init.down.sql`**: Rollback for baseline migration

### Feature Migrations (0010-0022)
- **`0010_jurisdiction_config.sql`**: Multi-state configuration system
- **`0011_profiles_enrollment.sql`**: User profiles and enrollment management
- **`0012_guardian_esign.sql`**: Guardian electronic signatures
- **`0013_i18n.sql`**: Internationalization support
- **`0014_question_bank_admin.sql`**: Question bank administration
- **`0015_security_privacy.sql`**: Security and privacy features
- **`0016_guardian_portal.sql`**: Guardian portal functionality
- **`0017_regulatory_reporting.sql`**: Regulatory reporting system
- **`0018_billing_lifecycle.sql`**: Billing lifecycle management
- **`0019_auth_ui_foundation.sql`**: Authentication UI foundation
- **`0020_modern_shell_settings.sql`**: Modern shell settings
- **`0021_cert_fulfillment.sql`**: Certificate fulfillment system
- **`0022_handbook_sources.sql`**: Handbook sources management

### Extension Migrations (0023+)
- **`0023_jurisdiction_config_extensions.sql`**: Extends jurisdiction_configs with additional fields
- **`0024_i18n.sql`**: Additional internationalization features
- **`0025_learner_ux_polish.sql`**: Learner UX improvements

## Migration Naming Convention

### Format
```
XXXX_description.sql
```

### Rules
- **0000**: Baseline/core migrations
- **0010-0099**: Feature migrations
- **0020+**: Extension and enhancement migrations
- **Description**: Lowercase with underscores, descriptive of the feature

### Examples
- `0010_jurisdiction_config.sql` - Jurisdiction configuration system
- `0023_jurisdiction_config_extensions.sql` - Extends jurisdiction config
- `0025_learner_ux_polish.sql` - Learner UX improvements

## Migration Dependencies

### Baseline Dependencies
- `0000_init.up.sql` must run first
- Contains core tables: jurisdictions, courses, course_units
- Other migrations depend on these core tables

### Feature Dependencies
- `0010_jurisdiction_config.sql` depends on `jurisdictions` table
- `0011_profiles_enrollment.sql` depends on `auth.users` (Supabase Auth)
- `0014_question_bank_admin.sql` depends on `courses` table
- `0017_regulatory_reporting.sql` depends on multiple tables

### Extension Dependencies
- `0023_jurisdiction_config_extensions.sql` extends `0010_jurisdiction_config.sql`
- `0024_i18n.sql` extends internationalization features
- `0025_learner_ux_polish.sql` extends user profiles

## Migration Execution Order

Supabase applies migrations in alphabetical order by filename. The current order ensures:

1. **Baseline**: Core tables created first
2. **Features**: Feature-specific tables and functions
3. **Extensions**: Enhancements to existing features

## Rollback Strategy

### Individual Rollbacks
Each migration should be designed to be reversible. However, not all migrations have explicit rollback files.

### Baseline Rollback
- `0000_init.down.sql` provides complete baseline rollback
- Drops all core tables and sequences

### Feature Rollbacks
- Most feature migrations use `IF EXISTS` and `IF NOT EXISTS` clauses
- This allows safe re-running of migrations
- Some migrations may need manual rollback procedures

## Best Practices

### Adding New Migrations

1. **Check existing migrations**: Ensure no naming conflicts
2. **Use descriptive names**: Clear indication of what the migration does
3. **Include comments**: Document the purpose and dependencies
4. **Use IF EXISTS/IF NOT EXISTS**: Make migrations safe to re-run
5. **Test rollback**: Ensure migrations can be safely reversed

### Example New Migration
```sql
-- 0026_new_feature.sql
-- Add new feature functionality
-- Dependencies: Requires 0010_jurisdiction_config.sql

-- Add new table
CREATE TABLE IF NOT EXISTS public.new_feature (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jurisdiction_id int NOT NULL REFERENCES public.jurisdictions(id),
    -- ... other columns
);

-- Add indexes
CREATE INDEX IF NOT EXISTS new_feature_jurisdiction_idx 
    ON public.new_feature (jurisdiction_id);

-- Enable RLS
ALTER TABLE public.new_feature ENABLE ROW LEVEL SECURITY;
```

### Migration Conflicts

If you encounter migration conflicts:

1. **Check naming**: Ensure no duplicate migration numbers
2. **Check dependencies**: Verify migration order is correct
3. **Check content**: Ensure no conflicting table/column definitions
4. **Test locally**: Run migrations in development first

## Migration Management

### Development Workflow

1. **Create migration**: Add new numbered migration file
2. **Test locally**: Run `supabase db reset` to test
3. **Review**: Check for conflicts and dependencies
4. **Deploy**: Apply to staging/production

### Production Deployment

1. **Backup**: Always backup before applying migrations
2. **Test**: Apply to staging environment first
3. **Monitor**: Watch for any issues during deployment
4. **Rollback**: Have rollback plan ready

### Migration History

Track migration history in:
- Git commits with migration files
- Database migration logs
- Deployment documentation

## Future Considerations

### Migration Compression
Consider compressing old migrations into baseline when:
- Platform is stable and mature
- Migration history becomes unwieldy
- Performance benefits are needed

### Migration Testing
Implement automated migration testing:
- Test migration application
- Test rollback procedures
- Test data integrity after migrations

### Migration Documentation
Maintain up-to-date documentation:
- Migration purposes and dependencies
- Rollback procedures
- Breaking changes and data migrations
