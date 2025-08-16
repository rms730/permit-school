# Billing Lifecycle Documentation

This document provides comprehensive documentation for the billing lifecycle system, including dunning workflows, email templates, and operational procedures.

## Overview

The billing lifecycle system provides end-to-end revenue operations management with automated dunning, self-serve capabilities, and comprehensive admin oversight.

## Lifecycle States

### Subscription States

- **active**: Subscription is active and payment is current
- **trialing**: Subscription is in trial period
- **past_due**: Payment has failed, subscription is past due
- **canceled**: Subscription has been canceled
- **incomplete**: Initial payment failed
- **incomplete_expired**: Initial payment failed and expired
- **unpaid**: Payment failed and subscription is unpaid
- **paused**: Subscription is paused

### Dunning States

- **none**: No payment issues
- **email_1**: First payment failure email sent
- **email_2**: Second payment failure email sent
- **email_3**: Final payment failure email sent
- **canceled**: Subscription canceled due to payment failure

## Dunning Timeline

### Payment Failure Flow

1. **Payment Fails** → `invoice.payment_failed` webhook

   - Invoice recorded in `billing_invoices`
   - Dunning state: `none` → `email_1`
   - Immediate email sent
   - In-app notification created
   - Next action scheduled: +3 days

2. **Day 3** → Daily dunning job processes

   - Dunning state: `email_1` → `email_2`
   - Email 2 sent with increased urgency
   - Next action scheduled: +7 days

3. **Day 10** → Daily dunning job processes

   - Dunning state: `email_2` → `email_3`
   - Email 3 sent (final notice)
   - Next action scheduled: +24 hours

4. **Day 11** → Daily dunning job processes
   - Dunning state: `email_3` → `canceled`
   - Subscription canceled at period end
   - Entitlement revoked
   - Final cancellation email sent

### Payment Success Flow

1. **Payment Succeeds** → `invoice.payment_succeeded` webhook
   - Invoice marked as paid
   - Dunning state reset to `none`
   - Fail count reset to 0
   - Success email sent
   - Entitlement restored (if applicable)

## Email Templates

### Payment Failure Emails

#### Email 1 (Immediate)

**Subject**: Payment Failed - Action Required

**English**:

```
Hi [Name],

We were unable to process your payment of $[Amount] for your Permit School subscription.

What you need to do:
• Update your payment method in your billing portal
• Ensure your card has sufficient funds
• Check that your card hasn't expired

Update Payment Method: [Billing Portal Link]

If you need assistance, please contact us at [Support Email].

Best regards,
The Permit School Team
```

**Spanish**:

```
Hola [Nombre],

No pudimos procesar tu pago de $[Cantidad] para tu suscripción de Permit School.

Lo que necesitas hacer:
• Actualiza tu método de pago en tu portal de facturación
• Asegúrate de que tu tarjeta tenga fondos suficientes
• Verifica que tu tarjeta no haya expirado

Actualizar Método de Pago: [Enlace del Portal de Facturación]

Si necesitas ayuda, contáctanos en [Email de Soporte].

Saludos cordiales,
El Equipo de Permit School
```

#### Email 2 (3 Days Later)

**Subject**: Payment Still Pending - Urgent Action Required

**English**:

```
Hi [Name],

Your payment of $[Amount] for your Permit School subscription is still pending.

Important: If we don't receive payment soon, your subscription may be paused and you'll lose access to your course materials.

Please update your payment method immediately: [Billing Portal Link]

If you need assistance, please contact us at [Support Email].

Best regards,
The Permit School Team
```

**Spanish**:

```
Hola [Nombre],

Tu pago de $[Cantidad] para tu suscripción de Permit School aún está pendiente.

Importante: Si no recibimos el pago pronto, tu suscripción puede ser pausada y perderás acceso a los materiales del curso.

Por favor actualiza tu método de pago inmediatamente: [Enlace del Portal de Facturación]

Si necesitas ayuda, contáctanos en [Email de Soporte].

Saludos cordiales,
El Equipo de Permit School
```

#### Email 3 (7 Days Later)

**Subject**: Final Payment Notice - Subscription at Risk

**English**:

```
Hi [Name],

This is your final notice regarding your unpaid Permit School subscription payment of $[Amount].

Urgent Action Required: If payment is not received within 24 hours, your subscription will be canceled and you'll lose access to all course materials.

Update Payment Method Now: [Billing Portal Link]

If you need assistance, please contact us immediately at [Support Email].

Best regards,
The Permit School Team
```

**Spanish**:

```
Hola [Nombre],

Este es tu aviso final sobre tu pago impago de $[Cantidad] para tu suscripción de Permit School.

Acción Urgente Requerida: Si el pago no se recibe dentro de 24 horas, tu suscripción será cancelada y perderás acceso a todos los materiales del curso.

Actualizar Método de Pago Ahora: [Enlace del Portal de Facturación]

Si necesitas ayuda, contáctanos inmediatamente en [Email de Soporte].

Saludos cordiales,
El Equipo de Permit School
```

### Success Emails

#### Payment Success

**Subject**: Payment Successful - Subscription Active

**English**:

```
Hi [Name],

Great news! Your payment has been processed successfully and your Permit School subscription is now active. 🎉

You have full access to all course materials and can continue your learning journey.

Continue Learning: [Course Link]

If you have any questions, please contact us at [Support Email].

Best regards,
The Permit School Team
```

**Spanish**:

```
Hola [Nombre],

¡Excelentes noticias! Tu pago ha sido procesado exitosamente y tu suscripción de Permit School está ahora activa. 🎉

Tienes acceso completo a todos los materiales del curso y puedes continuar tu viaje de aprendizaje.

Continuar Aprendiendo: [Enlace del Curso]

Si tienes alguna pregunta, contáctanos en [Email de Soporte].

Saludos cordiales,
El Equipo de Permit School
```

### Trial Reminder Emails

#### 3-Day Reminder

**Subject**: Trial Ending Soon - 3 Days Left

**English**:

```
Hi [Name],

Your Permit School trial will end in 3 days. To continue your learning journey, you'll need to subscribe.

What happens when your trial ends:
• You'll lose access to course materials
• Your progress will be saved
• You can resume anytime by subscribing

Subscribe Now: [Billing Link]

If you have any questions, please contact us at [Support Email].

Best regards,
The Permit School Team
```

**Spanish**:

```
Hola [Nombre],

Tu prueba de Permit School terminará en 3 días. Para continuar tu viaje de aprendizaje, necesitarás suscribirte.

Qué pasa cuando termina tu prueba:
• Perderás acceso a los materiales del curso
• Tu progreso será guardado
• Puedes reanudar en cualquier momento suscribiéndote

Suscribirse Ahora: [Enlace de Facturación]

Si tienes alguna pregunta, contáctanos en [Email de Soporte].

Saludos cordiales,
El Equipo de Permit School
```

#### 1-Day Reminder

**Subject**: Trial Ending Tomorrow - Last Chance

**English**:

```
Hi [Name],

Your Permit School trial ends tomorrow! This is your last chance to subscribe and continue your learning journey.

Don't lose your progress: Subscribe now to maintain access to all course materials.

Subscribe Now: [Billing Link]

If you have any questions, please contact us at [Support Email].

Best regards,
The Permit School Team
```

**Spanish**:

```
Hola [Nombre],

¡Tu prueba de Permit School termina mañana! Esta es tu última oportunidad de suscribirte y continuar tu viaje de aprendizaje.

No pierdas tu progreso: Suscríbete ahora para mantener acceso a todos los materiales del curso.

Suscribirse Ahora: [Enlace de Facturación]

Si tienes alguna pregunta, contáctanos en [Email de Soporte].

Saludos cordiales,
El Equipo de Permit School
```

### Cancellation Emails

#### Cancellation Confirmation

**Subject**: Subscription Cancellation Confirmed

**English**:

```
Hi [Name],

Your Permit School subscription cancellation has been confirmed.

Access until: [End Date]

You can resume your subscription anytime before this date by visiting your billing portal.

Resume Subscription: [Billing Link]

If you have any questions, please contact us at [Support Email].

Best regards,
The Permit School Team
```

**Spanish**:

```
Hola [Nombre],

Tu cancelación de suscripción de Permit School ha sido confirmada.

Acceso hasta: [Fecha de Fin]

Puedes reanudar tu suscripción en cualquier momento antes de esta fecha visitando tu portal de facturación.

Reanudar Suscripción: [Enlace de Facturación]

Si tienes alguna pregunta, contáctanos en [Email de Soporte].

Saludos cordiales,
El Equipo de Permit School
```

## Webhook Event Mapping

### Stripe Webhook Events

| Event                           | Action                           | Database Updates                      | Emails/Notifications             |
| ------------------------------- | -------------------------------- | ------------------------------------- | -------------------------------- |
| `invoice.payment_failed`        | Record invoice, update dunning   | `billing_invoices`, `billing_dunning` | Email 1, in-app notification     |
| `invoice.payment_succeeded`     | Mark invoice paid, reset dunning | `billing_invoices`, `billing_dunning` | Success email, notification      |
| `customer.subscription.updated` | Update subscription status       | `subscriptions`, `entitlements`       | None (handled by invoice events) |
| `customer.subscription.deleted` | Mark subscription canceled       | `subscriptions`, `entitlements`       | Cancellation notification        |

### Admin Job Events

| Job               | Frequency | Purpose                     | Actions                                          |
| ----------------- | --------- | --------------------------- | ------------------------------------------------ |
| `dunning-daily`   | Daily     | Process dunning escalations | Send emails, update states, cancel subscriptions |
| `trial-reminders` | Daily     | Send trial end reminders    | Send 3-day and 1-day reminders                   |

## Admin Procedures

### Daily Operations

#### 1. Monitor Billing Dashboard

- Check `/admin/billing` for KPIs and alerts
- Review past due subscriptions
- Monitor dunning states

#### 2. Review Failed Payments

- Check dunning state progression
- Verify email delivery
- Monitor manual intervention needs

#### 3. Handle Manual Actions

- Send immediate dunning emails if needed
- Cancel subscriptions manually if required
- Process refunds or adjustments

### Weekly Operations

#### 1. Review Churn Metrics

- Analyze 7-day and 30-day churn rates
- Identify patterns in payment failures
- Review dunning effectiveness

#### 2. Audit Billing Data

- Verify invoice accuracy
- Check subscription status consistency
- Review entitlement assignments

#### 3. Update Procedures

- Adjust dunning timelines if needed
- Update email templates based on feedback
- Refine admin dashboard metrics

### Monthly Operations

#### 1. Financial Reconciliation

- Reconcile Stripe data with internal records
- Verify MRR calculations
- Review revenue recognition

#### 2. System Maintenance

- Clean up old billing events
- Archive completed dunning records
- Update billing configurations

#### 3. Performance Review

- Analyze dunning success rates
- Review customer satisfaction metrics
- Plan system improvements

## Troubleshooting

### Common Issues

#### Payment Failures Not Processing

1. Check webhook endpoint status
2. Verify Stripe webhook configuration
3. Review webhook event logs
4. Check database connectivity

#### Dunning Emails Not Sending

1. Verify email service configuration
2. Check email template syntax
3. Review user email addresses
4. Monitor email delivery logs

#### Subscription Status Mismatch

1. Compare Stripe and local subscription data
2. Check webhook processing logs
3. Verify subscription update logic
4. Review entitlement assignment

#### Admin Dashboard Issues

1. Check admin role assignments
2. Verify RLS policy configuration
3. Review API endpoint permissions
4. Check database view definitions

### Emergency Procedures

#### Payment System Outage

1. Disable automatic dunning
2. Pause subscription cancellations
3. Notify customers of temporary issues
4. Resume normal operations when resolved

#### Data Inconsistency

1. Export current billing data
2. Compare with Stripe dashboard
3. Identify discrepancies
4. Manually reconcile differences

#### Security Incident

1. Review access logs
2. Check for unauthorized changes
3. Reset admin tokens if compromised
4. Audit billing data integrity

## Configuration

### Environment Variables

```bash
# Dunning Configuration
DUNNING_EMAIL_DAY_1=now
DUNNING_EMAIL_DAY_2=3
DUNNING_EMAIL_DAY_3=7

# Admin Jobs
DUNNING_DAILY_ENABLED=true
TRIAL_REMINDERS_ENABLED=true
ADMIN_JOB_TOKEN=your-secure-token

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PORTAL_RETURN_URL=http://localhost:3000/billing

# Email Configuration
RESEND_API_KEY=re_xxx
FROM_EMAIL=no-reply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

### Database Configuration

#### RLS Policies

- `billing_invoices`: Owner SELECT, admin SELECT
- `billing_dunning`: Admin-only access
- `subscriptions`: Owner SELECT, admin SELECT
- `entitlements`: Owner SELECT, admin SELECT

#### Indexes

- `billing_invoices(user_id, created_at desc)`
- `billing_invoices(subscription_id)`
- `billing_dunning(next_action_at)`

### Monitoring

#### Key Metrics

- Active subscription count
- Past due subscription count
- Dunning state distribution
- Email delivery rates
- Payment success rates
- Churn rates

#### Alerts

- High past due count
- Dunning job failures
- Webhook processing errors
- Email delivery failures
- Data inconsistency warnings

## Compliance & Security

### Data Protection

- All billing data encrypted at rest
- PII minimized in logs and notifications
- Secure transmission of payment data
- Regular security audits

### Audit Requirements

- Complete billing event logging
- Admin action tracking
- Webhook processing records
- Email delivery confirmations

### Privacy Considerations

- Minimal data in notifications
- Secure handling of payment information
- User consent for billing communications
- Right to data deletion

## Multi-State Considerations

### Jurisdiction-Specific Requirements

- State-specific billing regulations
- Tax calculation requirements
- Refund policy compliance
- Consumer protection laws

### Scalability Planning

- Jurisdiction-aware billing logic
- Multi-currency support
- Regional payment methods
- Localized email templates

### Future Enhancements

- Advanced dunning strategies
- Payment plan support
- Subscription tier management
- Revenue analytics dashboard
