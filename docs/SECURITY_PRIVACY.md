# Security & Privacy

This document outlines the security and privacy measures implemented in the permit-school project, including authentication, data protection, compliance requirements, and security best practices.

## Overview

The permit-school platform handles sensitive educational data and personal information, requiring robust security measures and privacy protection. This document covers:

- **Authentication & Authorization**: User authentication and access control
- **Data Protection**: Encryption, storage, and transmission security
- **Privacy Compliance**: GDPR, COPPA, and state-specific requirements
- **Security Headers**: Web security headers and protection
- **Incident Response**: Security incident handling procedures

## Authentication & Authorization

### Supabase Auth Integration

The platform uses Supabase Auth for secure user authentication:

```typescript
// web/src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

### Authentication Methods

Supported authentication methods:

1. **Email/Password**: Traditional email and password authentication
2. **Magic Links**: Passwordless authentication via email
3. **OAuth Providers**: Google, GitHub (configurable)
4. **Multi-factor Authentication**: TOTP-based 2FA (planned)

### Session Management

- **JWT Tokens**: Secure session tokens with configurable expiration
- **Refresh Tokens**: Automatic token refresh for seamless user experience
- **Session Storage**: Secure session storage with encryption
- **Logout**: Proper session cleanup on logout

### Row Level Security (RLS)

Supabase RLS policies ensure data isolation:

```sql
-- Example RLS policy for user data
CREATE POLICY "Users can only access their own data"
ON users
FOR ALL
USING (auth.uid() = id);

-- Example RLS policy for course enrollment
CREATE POLICY "Users can only access their enrollments"
ON enrollments
FOR ALL
USING (auth.uid() = user_id);
```

## Data Protection

### Data Encryption

#### At Rest

- **Database Encryption**: Supabase provides AES-256 encryption for data at rest
- **File Storage**: Encrypted file storage for certificates and documents
- **Backup Encryption**: All backups are encrypted

#### In Transit

- **HTTPS/TLS**: All communications use TLS 1.3
- **API Security**: All API endpoints require HTTPS
- **WebSocket Security**: Secure WebSocket connections for real-time features

### Data Classification

Data is classified based on sensitivity:

| Classification   | Description               | Examples                          | Protection Level |
| ---------------- | ------------------------- | --------------------------------- | ---------------- |
| **Public**       | Non-sensitive information | Course descriptions, public FAQs  | Basic            |
| **Internal**     | Business information      | Course content, progress data     | Standard         |
| **Confidential** | Personal information      | User profiles, payment data       | High             |
| **Restricted**   | Highly sensitive          | Guardian consent, legal documents | Maximum          |

### Data Minimization

The platform follows data minimization principles:

- **Purpose Limitation**: Data collected only for specific purposes
- **Retention Policies**: Automatic data deletion after retention periods
- **Access Controls**: Principle of least privilege for data access
- **Anonymization**: Data anonymization for analytics

## Privacy Compliance

### GDPR Compliance

The platform implements GDPR requirements:

#### Data Subject Rights

- **Right to Access**: Users can request their data
- **Right to Rectification**: Users can update their information
- **Right to Erasure**: Users can request data deletion
- **Right to Portability**: Users can export their data
- **Right to Object**: Users can object to data processing

#### Implementation

```typescript
// Example data export API
export async function GET(request: Request) {
  const user = await getCurrentUser();
  const userData = await exportUserData(user.id);

  return Response.json({
    data: userData,
    format: "json",
    timestamp: new Date().toISOString(),
  });
}
```

### COPPA Compliance

For users under 13, the platform implements COPPA requirements:

#### Guardian Consent

- **Verifiable Parental Consent**: Required for users under 13
- **Guardian Verification**: Email verification for guardians
- **Limited Data Collection**: Minimal data collection for minors
- **Parental Controls**: Guardian oversight of minor accounts

#### Implementation

```typescript
// Guardian consent verification
export async function POST(request: Request) {
  const { token, guardianEmail } = await request.json();

  const isValid = await verifyGuardianConsent(token, guardianEmail);

  if (isValid) {
    await activateMinorAccount(userId);
    await sendGuardianConfirmation(guardianEmail);
  }
}
```

### State-Specific Requirements

#### California (CCPA/CPRA)

- **Privacy Notice**: Clear privacy policy
- **Opt-out Rights**: Right to opt-out of data sales
- **Data Disclosure**: Annual data disclosure requirements

#### Texas

- **Data Breach Notification**: 60-day notification requirement
- **Consumer Rights**: Right to access and delete personal data

## Security Headers

### Web Security Headers

The platform implements comprehensive security headers:

```typescript
// next.config.js
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.supabase.co;",
  },
];
```

### Content Security Policy (CSP)

The CSP policy restricts resource loading:

- **Script Sources**: Only trusted sources allowed
- **Style Sources**: Inline styles restricted
- **Image Sources**: HTTPS and data URLs allowed
- **Connect Sources**: API endpoints and external services

## API Security

### Authentication Requirements

All API endpoints require authentication:

```typescript
// Example protected API route
export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process request...
}
```

### Rate Limiting

API endpoints implement rate limiting:

```typescript
// Rate limiting middleware
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const identifier = request.headers.get("x-forwarded-for") || "unknown";

  const { success } = await rateLimit(identifier, 10, 60); // 10 requests per minute

  if (!success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Process request...
}
```

### Input Validation

All inputs are validated using Zod schemas:

```typescript
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().min(13).max(120),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validatedData = userSchema.parse(body);

  // Process validated data...
}
```

## Data Breach Response

### Incident Response Plan

1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Impact assessment and containment
3. **Notification**: Required notifications to authorities and users
4. **Remediation**: Security fixes and system updates
5. **Recovery**: System restoration and monitoring
6. **Review**: Post-incident analysis and improvements

### Notification Requirements

#### Timeline

- **72 Hours**: GDPR notification to authorities
- **60 Days**: Texas notification to affected individuals
- **Immediate**: Internal notification to security team

#### Content

- **Nature of Breach**: Description of the incident
- **Affected Data**: Types of data compromised
- **Impact Assessment**: Potential consequences
- **Remedial Actions**: Steps taken to address the breach
- **Contact Information**: How to get more information

## Security Monitoring

### Logging & Monitoring

The platform implements comprehensive logging:

```typescript
// Security event logging
export async function logSecurityEvent(event: SecurityEvent) {
  await supabase.from("security_events").insert({
    event_type: event.type,
    user_id: event.userId,
    ip_address: event.ipAddress,
    user_agent: event.userAgent,
    details: event.details,
    timestamp: new Date().toISOString(),
  });
}
```

### Alerting

Automated alerts for security events:

- **Failed Login Attempts**: Multiple failed login attempts
- **Suspicious Activity**: Unusual access patterns
- **Data Access**: Access to sensitive data
- **System Changes**: Configuration or code changes

### Vulnerability Management

#### Regular Assessments

- **Automated Scans**: Weekly vulnerability scans
- **Penetration Testing**: Quarterly security assessments
- **Code Reviews**: Security-focused code reviews
- **Dependency Updates**: Regular dependency updates

#### Security Tools

- **ESLint Security**: Security-focused linting rules
- **Snyk**: Dependency vulnerability scanning
- **Sentry**: Error monitoring and security alerts

## Privacy by Design

### Default Privacy Settings

The platform implements privacy by design principles:

- **Privacy First**: Privacy considerations in all design decisions
- **Data Minimization**: Collect only necessary data
- **User Control**: Users control their privacy settings
- **Transparency**: Clear privacy policies and data practices

### Privacy Controls

Users have granular privacy controls:

```typescript
// Privacy settings interface
interface PrivacySettings {
  profileVisibility: "public" | "private";
  dataSharing: boolean;
  marketingEmails: boolean;
  analyticsTracking: boolean;
  thirdPartySharing: boolean;
}
```

## Compliance Documentation

### Required Documents

1. **Privacy Policy**: Comprehensive privacy policy
2. **Terms of Service**: User agreement and terms
3. **Data Processing Agreement**: DPA for third-party services
4. **Cookie Policy**: Cookie usage and consent
5. **Breach Response Plan**: Incident response procedures

### Regular Reviews

- **Annual Review**: Privacy policy and security measures
- **Quarterly Assessment**: Security posture and compliance
- **Monthly Monitoring**: Security metrics and trends

## Security Checklist

### Development Security

- [ ] Input validation on all endpoints
- [ ] Authentication required for sensitive operations
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Secrets management implemented
- [ ] Dependency vulnerabilities addressed

### Operational Security

- [ ] Regular security updates
- [ ] Access controls implemented
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures
- [ ] Incident response plan ready
- [ ] Security training completed

### Compliance Security

- [ ] Privacy policy up to date
- [ ] Data subject rights implemented
- [ ] Consent mechanisms in place
- [ ] Data retention policies enforced
- [ ] Breach notification procedures ready
- [ ] Regular compliance audits

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture and security design
- [API Routes](./api/ROUTES.md) - API security and authentication
- [Environment Variables](./ENVIRONMENT.md) - Secrets and configuration management
- [Incident Response](./INCIDENT_RESPONSE.md) - Security incident procedures
- [Privacy Runbook](./PRIVACY_RUNBOOK.md) - Privacy operations and procedures
