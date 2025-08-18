---
title: "Billing Lifecycle Management"
owner: "Operations"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/RUNBOOKS.md>
  - </docs/DMV_REPORTING.md>
---

# Billing Lifecycle Management

**Purpose & Outcome**  
Complete guide for managing Stripe billing operations, subscription lifecycle, dunning procedures, and revenue operations for Permit School. This ensures reliable revenue collection, proper subscription management, and compliance with billing regulations.

## Prerequisites

- ✅ Stripe account with API access
- ✅ Admin access to billing dashboard
- ✅ Environment variables configured
- ✅ Webhook endpoints configured

## Stripe Configuration

### Environment Setup

**Required Environment Variables**:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Billing URLs
BILLING_SUCCESS_URL=https://your-domain.com/billing?status=success
BILLING_CANCEL_URL=https://your-domain.com/billing?status=cancel
STRIPE_PORTAL_RETURN_URL=https://your-domain.com/billing

# Dunning Configuration
DUNNING_EMAIL_DAY_1=now
DUNNING_EMAIL_DAY_2=3
DUNNING_EMAIL_DAY_3=7

# Admin Jobs
DUNNING_DAILY_ENABLED=true
TRIAL_REMINDERS_ENABLED=true
ADMIN_JOB_TOKEN=your-secure-token
```

### Webhook Configuration

**Stripe Webhook Endpoint**:

```
URL: https://your-domain.com/api/billing/webhook
Events:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- payment_method.attached
```

**Verify Webhook**:

```bash
# Test webhook locally
stripe listen --forward-to http://localhost:3000/api/billing/webhook

# Verify webhook signature
curl -X POST https://your-domain.com/api/billing/webhook \
  -H "Stripe-Signature: test" \
  -d '{"type":"test"}'
```

## Subscription Lifecycle

### New Subscription Flow

**1. User Initiates Subscription**:

```bash
# Frontend creates checkout session
POST /api/billing/checkout
{
  "course_id": "course-uuid",
  "success_url": "https://your-domain.com/billing?status=success",
  "cancel_url": "https://your-domain.com/billing?status=cancel"
}

# Response includes Stripe checkout URL
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**2. Stripe Webhook Processing**:

```bash
# Webhook receives subscription.created event
# Database updated with subscription details
# User entitlement activated
# Welcome email sent
```

**3. Verification**:

```bash
# Check subscription status
curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/subscriptions/sub_123

# Verify database record
SELECT * FROM billing_subscriptions WHERE stripe_subscription_id = 'sub_123';
```

### Subscription Management

**User Self-Service**:

```bash
# Access billing portal
POST /api/billing/portal
{
  "return_url": "https://your-domain.com/billing"
}

# Cancel subscription
POST /api/billing/cancel
{
  "cancel_at_period_end": true
}

# Resume subscription
POST /api/billing/resume
```

**Admin Management**:

```bash
# View subscription details
# Admin Dashboard → Billing → Subscriptions

# Cancel subscription immediately
# Admin Dashboard → Billing → Subscriptions → Cancel

# Update payment method
# Stripe Dashboard → Customers → Payment Methods
```

## Dunning Management

### Dunning State Machine

**States**:

```
none → email_1 → email_2 → email_3 → canceled
```

**State Transitions**:

- `none` → `email_1`: Payment fails
- `email_1` → `email_2`: 3 days after first email
- `email_2` → `email_3`: 7 days after first email
- `email_3` → `canceled`: 7 days after final email

### Dunning Email Sequence

**Email 1 (Immediate)**:

```
Subject: Payment Failed - Action Required
Content: Immediate notification with payment method update instructions
```

**Email 2 (3 days)**:

```
Subject: Payment Still Pending - Urgent Action Required
Content: Increased urgency with payment method update instructions
```

**Email 3 (7 days)**:

```
Subject: Final Notice - Subscription Will Be Canceled
Content: Final warning with cancellation notice
```

### Dunning Automation

**Daily Job**:

```bash
# Trigger dunning job
curl -X POST https://your-domain.com/api/admin/jobs/dunning-daily \
  -H "Authorization: Bearer $ADMIN_JOB_TOKEN"

# Job processes:
# 1. Identifies subscriptions in dunning states
# 2. Sends appropriate emails
# 3. Updates dunning state
# 4. Cancels subscriptions after final notice
```

**Manual Dunning**:

```bash
# Send manual dunning email
# Admin Dashboard → Billing → Past Due → Send Email

# Override dunning state
# Admin Dashboard → Billing → Subscriptions → Override State
```

## Payment Processing

### Payment Method Management

**Add Payment Method**:

```bash
# User adds payment method via Stripe Portal
# Webhook: payment_method.attached
# Database updated with new payment method
```

**Update Payment Method**:

```bash
# User updates payment method
# Stripe Portal → Payment Methods → Update
# Webhook: payment_method.attached
# Database updated
```

**Remove Payment Method**:

```bash
# User removes payment method
# Stripe Portal → Payment Methods → Remove
# Webhook: payment_method.detached
# Database updated
```

### Payment Failure Handling

**Automatic Retry**:

```bash
# Stripe automatically retries failed payments
# Retry schedule: 1, 3, 5, 7 days after failure
# Webhook: invoice.payment_failed
# Dunning state updated to email_1
```

**Manual Retry**:

```bash
# Admin can manually retry payment
# Stripe Dashboard → Invoices → Retry Payment
# Or via API:
curl -X POST https://api.stripe.com/v1/invoices/in_123/pay \
  -H "Authorization: Bearer $STRIPE_SECRET_KEY"
```

## Billing Analytics

### Key Metrics

**Revenue Metrics**:

```sql
-- Monthly Recurring Revenue (MRR)
SELECT
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) / 100.0 as mrr
FROM billing_invoices
WHERE status = 'paid'
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month;

-- Churn Rate
SELECT
  DATE_TRUNC('month', canceled_at) as month,
  COUNT(*) as churned_subscriptions,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM billing_subscriptions) as churn_rate
FROM billing_subscriptions
WHERE canceled_at IS NOT NULL
GROUP BY month
ORDER BY month;
```

**Subscription Metrics**:

```sql
-- Active Subscriptions
SELECT COUNT(*) as active_subscriptions
FROM billing_subscriptions
WHERE status = 'active';

-- Trial Conversions
SELECT
  COUNT(*) as trial_conversions,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM billing_subscriptions WHERE trial_end IS NOT NULL) as conversion_rate
FROM billing_subscriptions
WHERE trial_end IS NOT NULL
  AND status = 'active';
```

### Dashboard Views

**Admin Dashboard**:

- Active subscriptions count
- Past due subscriptions
- Monthly revenue
- Churn rate
- Payment failure rate

**Stripe Dashboard**:

- Revenue analytics
- Customer metrics
- Payment method analytics
- Subscription analytics

## Invoice Management

### Invoice Generation

**Automatic Invoicing**:

```bash
# Stripe automatically generates invoices
# Webhook: invoice.created
# Database updated with invoice details
# Email sent to customer
```

**Manual Invoicing**:

```bash
# Create manual invoice
curl -X POST https://api.stripe.com/v1/invoices \
  -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  -d "customer=cus_123" \
  -d "auto_advance=false"
```

### Invoice Processing

**Successful Payment**:

```bash
# Webhook: invoice.payment_succeeded
# Database updated
# Success email sent
# Entitlement extended
```

**Failed Payment**:

```bash
# Webhook: invoice.payment_failed
# Dunning state updated
# Failure email sent
# Retry scheduled
```

## Refund Processing

### Refund Policies

**Automatic Refunds**:

- Failed payments within 24 hours
- Duplicate charges
- System errors

**Manual Refunds**:

- Customer requests
- Service issues
- Billing errors

### Refund Process

**Initiate Refund**:

```bash
# Via Stripe Dashboard
# Stripe Dashboard → Payments → Refund

# Via API
curl -X POST https://api.stripe.com/v1/refunds \
  -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  -d "payment_intent=pi_123" \
  -d "amount=1000"
```

**Refund Processing**:

```bash
# Webhook: charge.refunded
# Database updated
# Refund email sent
# Entitlement adjusted if needed
```

## Compliance & Reporting

### Financial Reporting

**Monthly Reconciliation**:

```bash
# 1. Export Stripe transactions
# Stripe Dashboard → Reports → Transactions

# 2. Compare with database records
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as transactions,
  SUM(amount) / 100.0 as total_amount
FROM billing_invoices
WHERE status = 'paid'
GROUP BY month;

# 3. Reconcile discrepancies
# Investigate and resolve any differences
```

**Tax Reporting**:

```bash
# Export tax data
# Stripe Dashboard → Reports → Tax Reports

# Generate tax summaries
# Include in financial reporting
```

### Audit Trail

**Billing Events**:

```sql
-- All billing events logged
SELECT * FROM audit_logs
WHERE table_name = 'billing_subscriptions'
  OR table_name = 'billing_invoices'
ORDER BY created_at DESC;
```

**Payment History**:

```sql
-- Complete payment history
SELECT
  bi.created_at,
  bi.amount,
  bi.status,
  bs.stripe_subscription_id
FROM billing_invoices bi
JOIN billing_subscriptions bs ON bi.subscription_id = bs.id
ORDER BY bi.created_at DESC;
```

## Troubleshooting

### Common Issues

**Webhook Failures**:

```bash
# Check webhook logs
# Stripe Dashboard → Developers → Webhooks → Logs

# Verify webhook signature
# Check webhook secret in environment variables

# Test webhook endpoint
curl -X POST https://your-domain.com/api/billing/webhook \
  -H "Stripe-Signature: test" \
  -d '{"type":"test"}'
```

**Payment Failures**:

```bash
# Check payment method
# Stripe Dashboard → Customers → Payment Methods

# Verify customer details
# Stripe Dashboard → Customers → Customer Details

# Check for fraud indicators
# Stripe Dashboard → Radar → Risk Evaluation
```

**Subscription Issues**:

```bash
# Check subscription status
# Stripe Dashboard → Subscriptions → Subscription Details

# Verify webhook processing
# Check database for subscription records

# Review dunning state
# Database → billing_subscriptions → dunning_state
```

### Debug Commands

**Check Stripe Configuration**:

```bash
# Verify API keys
curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/account

# Test webhook endpoint
stripe listen --forward-to http://localhost:3000/api/billing/webhook
```

**Database Verification**:

```bash
# Check subscription records
SELECT * FROM billing_subscriptions WHERE status = 'active';

# Verify invoice records
SELECT * FROM billing_invoices WHERE status = 'paid';

# Check dunning states
SELECT dunning_state, COUNT(*)
FROM billing_subscriptions
GROUP BY dunning_state;
```

## References

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Billing](https://stripe.com/docs/billing)
- [Operational Runbooks](docs/RUNBOOKS.md)

---

**Last updated**: 2025-01-27  
**Next review**: 2025-02-27
