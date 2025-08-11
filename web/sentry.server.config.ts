import * as Sentry from "@sentry/nextjs";

// sanitize PII fields
export const sentryOptions = {
  beforeSend(event) {
    const redact = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      const pii = ['first_name','last_name','middle_name','dob','phone','address_line1','address_line2','city','state','postal_code','guardian_name','guardian_email','guardian_phone'];
      for (const k of pii) if (k in obj) obj[k] = '[redacted]';
      Object.values(obj).forEach(redact);
    };
    redact(event.extra);
    redact(event.request);
    return event;
  },
};

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  ...sentryOptions,
});
