# Configuration Strategy

This document explains how configuration is managed in the permit-school platform, distinguishing between environment variables and database-stored configuration.

## Overview

The platform uses a **hybrid configuration approach**:

1. **Environment Variables**: For infrastructure, secrets, and deployment-specific settings
2. **Database Configuration**: For jurisdiction-specific business rules and settings

## Environment Variables (Infrastructure & Secrets)

These should remain as environment variables because they are:

### Infrastructure & Deployment

- **Supabase**: Database connection and authentication
- **Application URLs**: Base URLs, site URLs, billing URLs
- **Build Information**: Environment, commit SHA, build timestamps
- **CI/CD**: Test configuration, deployment settings

### Secrets & API Keys

- **Stripe**: Payment processing keys and webhooks
- **Email**: Resend API key
- **Authentication**: Google OAuth credentials
- **Monitoring**: Sentry DSN
- **Database**: Service role keys

### Global Settings

- **Rate Limiting**: Global rate limit configuration
- **Offline Mode**: Development offline mode toggle

## Database Configuration (Jurisdiction-Specific)

These are stored in the `jurisdiction_configs` table because they vary by state/jurisdiction:

### Exam Configuration

- `final_exam_questions`: Number of questions in final exam
- `final_exam_pass_pct`: Minimum pass percentage (0.1 to 1.0)
- `seat_time_required_minutes`: Minimum study time required

### Certificate Configuration

- `certificate_prefix`: Prefix for certificate numbers (e.g., 'CA', 'TX')
- `certificate_issuer_name`: Name of issuing organization
- `certificate_issuer_license`: License number of issuing organization

### Support & Contact

- `support_email`: Jurisdiction-specific support email
- `support_phone`: Jurisdiction-specific support phone
- `disclaimer`: Legal disclaimer text
- `terms_url`: Terms of service URL
- `privacy_url`: Privacy policy URL

### Business Rules

- `regulatory_signing_secret`: Secret for signing regulatory reports
- `fulfillment_low_stock_threshold`: Inventory alert threshold

## Configuration Lookup Order

The application uses this priority order for configuration:

1. **Primary**: Database (`jurisdiction_configs` table)
2. **Fallback**: Environment variables (for backward compatibility)
3. **Default**: Hardcoded defaults

## Migration Strategy

### From Environment Variables to Database

When adding a new jurisdiction-specific setting:

1. **Add to Database Schema**: Extend `jurisdiction_configs` table
2. **Update Application Code**: Use database lookup with fallback
3. **Update Admin Interface**: Add configuration UI at `/admin/jurisdictions`
4. **Document**: Update this guide and `.env.example` files
5. **Deprecate**: Mark environment variable as deprecated

### Example: Adding Support Phone

```sql
-- 1. Add to database schema
ALTER TABLE public.jurisdiction_configs
ADD COLUMN support_phone text;

-- 2. Update application code
const config = await getJurisdictionConfig('CA');
const supportPhone = config.support_phone || process.env.NEXT_PUBLIC_SUPPORT_PHONE || '1-800-PERMIT';

-- 3. Update admin interface
// Add field to JurisdictionConfigDialog.tsx

-- 4. Update documentation
// Mark NEXT_PUBLIC_SUPPORT_PHONE as deprecated in .env.example
```

## Benefits of This Approach

### Multi-State Support

- Each jurisdiction can have different exam requirements
- Different certificate formats per state
- Jurisdiction-specific support contact information

### Admin Flexibility

- Non-technical admins can update business rules
- No code deployment required for configuration changes
- Audit trail of configuration changes

### Security

- Sensitive secrets remain in environment variables
- Database configuration is properly secured with RLS
- Clear separation of concerns

### Development

- Environment variables for local development
- Database configuration for production
- Fallback mechanism ensures backward compatibility

## Managing Configuration

### For Developers

1. Set up environment variables in `.env.local`
2. Use database configuration for jurisdiction-specific settings
3. Test with different jurisdiction configurations

### For Administrators

1. Access `/admin/jurisdictions` to configure jurisdiction settings
2. Update exam requirements, certificate settings, support info
3. Changes take effect immediately (no deployment required)

### For Operations

1. Deploy with environment variables for infrastructure
2. Use database migrations for schema changes
3. Monitor configuration changes through audit logs

## Future Considerations

### Potential Database Additions

- **Pricing Rules**: Jurisdiction-specific pricing logic
- **Content Settings**: Language preferences, content sources
- **Compliance Rules**: State-specific regulatory requirements
- **Feature Flags**: Jurisdiction-specific feature availability

### Environment Variable Candidates for Migration

- `RATE_LIMIT_MAX`: Could be jurisdiction-specific
- `OFFLINE_DEV`: Could be per-jurisdiction development mode
- `BILLING_*_URL`: Could be jurisdiction-specific billing flows

### Monitoring & Alerting

- Track configuration changes through audit logs
- Alert on missing jurisdiction configurations
- Validate configuration consistency across jurisdictions
