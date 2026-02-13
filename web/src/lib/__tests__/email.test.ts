import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    RESEND_API_KEY: 'test-key',
    FROM_EMAIL: 'test@example.com',
    APP_BASE_URL: 'https://test.example.com',
    SUPPORT_EMAIL: 'support@test.example.com',
  },
}));

// Import after mocks are set up
import {
  sendEmail,
  sendWelcomeEmail,
  sendSubscriptionActiveEmail,
  sendCertificateIssuedEmail,
  sendPaymentFailedEmail,
  sendPaymentSucceededEmail,
  sendTrialReminderEmail,
  sendCancelConfirmationEmail,
  sendGuardianReceiptEmail
} from '../email';

describe('email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('handles deletion confirmation template', async () => {
      const data = {
        confirmation_url: 'https://test.example.com/confirm',
        expires_at: new Date('2024-12-31').toISOString(),
        reason: 'User requested deletion',
      };

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Confirm Account Deletion',
        template: 'deletion-confirmation',
        data,
      });

      // When Resend is not configured, result is undefined
      expect(result).toBeUndefined();
    });

    it('handles unknown template gracefully', async () => {
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'unknown-template',
        data: {},
      });

      // When Resend is not configured, result is undefined
      expect(result).toBeUndefined();
    });

    it('handles missing Resend configuration', async () => {
      // Temporarily remove API key
      const originalEnv = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        template: 'deletion-confirmation',
        data: {},
      });

      expect(result).toBeUndefined();

      // Restore
      process.env.RESEND_API_KEY = originalEnv;
    });
  });

  describe('sendWelcomeEmail', () => {
    it('sends welcome email successfully', async () => {
      const result = await sendWelcomeEmail({
        to: 'test@example.com',
        name: 'John Doe',
        locale: 'en',
      });

      expect(result).toBeDefined();
    });

    it('handles missing name', async () => {
      const result = await sendWelcomeEmail({
        to: 'test@example.com',
        locale: 'en',
      });

      expect(result).toBeDefined();
    });

    it('falls back to English for unknown locale', async () => {
      const result = await sendWelcomeEmail({
        to: 'test@example.com',
        name: 'Test User',
        locale: 'fr' as any,
      });

      expect(result).toBeDefined();
    });
  });

  describe('sendSubscriptionActiveEmail', () => {
    it('sends subscription active email', async () => {
      const result = await sendSubscriptionActiveEmail({
        to: 'test@example.com',
        name: 'John Doe',
        locale: 'en',
      });

      expect(result).toBeDefined();
    });
  });

  describe('sendCertificateIssuedEmail', () => {
    it('sends certificate issued email', async () => {
      const result = await sendCertificateIssuedEmail({
        to: 'test@example.com',
        name: 'John Doe',
        certNumber: 'CERT-123',
        verifyUrl: 'https://test.example.com/verify/CERT-123',
        pdfUrl: 'https://test.example.com/pdf/CERT-123',
        locale: 'en',
      });

      expect(result).toBeDefined();
    });
  });

  describe('sendPaymentFailedEmail', () => {
    it('sends payment failed email step 1', async () => {
      const result = await sendPaymentFailedEmail({
        to: 'test@example.com',
        name: 'John Doe',
        amount: '$29.99',
        step: 1,
        locale: 'en',
      });

      expect(result).toBeDefined();
    });

    it('sends payment failed email step 2', async () => {
      const result = await sendPaymentFailedEmail({
        to: 'test@example.com',
        name: 'John Doe',
        amount: '$29.99',
        step: 2,
        locale: 'en',
      });

      expect(result).toBeDefined();
    });

    it('sends payment failed email step 3', async () => {
      const result = await sendPaymentFailedEmail({
        to: 'test@example.com',
        name: 'John Doe',
        amount: '$29.99',
        step: 3,
        locale: 'en',
      });

      expect(result).toBeDefined();
    });

    it('defaults to step 1', async () => {
      const result = await sendPaymentFailedEmail({
        to: 'test@example.com',
        name: 'John Doe',
        amount: '$29.99',
        locale: 'en',
      });

      expect(result).toBeDefined();
    });
  });

  describe('sendPaymentSucceededEmail', () => {
    it('sends payment succeeded email', async () => {
      const result = await sendPaymentSucceededEmail({
        to: 'test@example.com',
        name: 'John Doe',
        locale: 'en',
      });

      expect(result).toBeDefined();
    });
  });

  describe('sendTrialReminderEmail', () => {
    it('sends 3-day trial reminder', async () => {
      const result = await sendTrialReminderEmail({
        to: 'test@example.com',
        name: 'John Doe',
        daysLeft: 3,
        locale: 'en',
      });

      expect(result).toBeDefined();
    });

    it('sends 1-day trial reminder', async () => {
      const result = await sendTrialReminderEmail({
        to: 'test@example.com',
        name: 'John Doe',
        daysLeft: 1,
        locale: 'en',
      });

      expect(result).toBeDefined();
    });
  });

  describe('sendCancelConfirmationEmail', () => {
    it('sends cancellation confirmation email', async () => {
      const result = await sendCancelConfirmationEmail({
        to: 'test@example.com',
        name: 'John Doe',
        endDate: '2024-12-31',
        locale: 'en',
      });

      expect(result).toBeDefined();
    });
  });

  describe('sendGuardianReceiptEmail', () => {
    it('sends guardian receipt email', async () => {
      const result = await sendGuardianReceiptEmail({
        to: 'guardian@example.com',
        guardian_name: 'Jane Doe',
        student_display: 'John Doe',
        course_title: 'Driver Education',
        pdf_url: 'https://test.example.com/pdf/consent',
        verify_url: 'https://test.example.com/verify/consent',
      });

      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('handles missing environment variables gracefully', async () => {
      const originalFromEmail = process.env.FROM_EMAIL;
      delete process.env.FROM_EMAIL;

      const result = await sendWelcomeEmail({
        to: 'test@example.com',
        name: 'John Doe',
      });

      expect(result).toBeDefined();

      // Restore
      process.env.FROM_EMAIL = originalFromEmail;
    });
  });
});
