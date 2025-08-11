import { Resend } from 'resend';
import { type SupportedLocale } from './i18n/locales';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.FROM_EMAIL ?? 'no-reply@example.com';

// Generic email sending function
export async function sendEmail({
  to,
  subject,
  template,
  data
}: {
  to: string;
  subject: string;
  template: string;
  data: any;
}) {
  if (!resend) {
    console.warn('Resend not configured, skipping email');
    return;
  }

  let html = '';
  
  // Handle different templates
  switch (template) {
    case 'deletion-confirmation':
      html = `
        <p>Hi,</p>
        <p>You have requested to delete your account. Please click the link below to confirm this action:</p>
        <p><a href="${data.confirmation_url}">Confirm Account Deletion</a></p>
        <p>This link will expire on ${new Date(data.expires_at).toLocaleString()}.</p>
        <p>If you did not request this deletion, please ignore this email.</p>
        <p>Reason provided: ${data.reason}</p>
        <p>Best regards,<br>The Permit School Team</p>
      `;
      break;
    default:
      html = `<p>${subject}</p>`;
  }

  return safeSend(html, subject, to);
}

// Email templates for different locales
const emailTemplates = {
  en: {
    welcome: {
      subject: 'Welcome to Permit School',
      title: 'Welcome to Permit School!',
      greeting: (name?: string) => name ? `Hi ${name},` : 'Hi,',
      body: (name?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>Welcome to Permit School! Your account has been created successfully.</p>
        <p>You can now start your learning journey:</p>
        <ul>
          <li>Visit your course: <a href="${process.env.APP_BASE_URL}/course/CA/DE-ONLINE">Start Learning</a></li>
          <li>Complete units and take quizzes</li>
          <li>Track your progress</li>
        </ul>
        <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Best regards,<br>The Permit School Team</p>
      `
    },
    subscription: {
      subject: 'Your subscription is active',
      title: 'Subscription Active',
      body: (name?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>Your Permit School subscription is now active! 🎉</p>
        <p>You now have access to:</p>
        <ul>
          <li>All course units and content</li>
          <li>Final exam eligibility</li>
          <li>Certificate issuance upon completion</li>
        </ul>
        <p><strong>Start learning now:</strong> <a href="${process.env.APP_BASE_URL}/course/CA/DE-ONLINE">Continue Your Course</a></p>
        <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Best regards,<br>The Permit School Team</p>
      `
    },
    certificate: {
      subject: (certNumber: string) => `Certificate Issued - ${certNumber}`,
      title: 'Certificate Issued',
      body: (name?: string, certNumber?: string, pdfUrl?: string, verifyUrl?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>Congratulations! Your certificate has been issued successfully. 🎓</p>
        <p><strong>Certificate Number:</strong> ${certNumber}</p>
        <p>You can:</p>
        <ul>
          <li><a href="${pdfUrl}">Download your certificate (PDF)</a></li>
          <li><a href="${verifyUrl}">Verify your certificate online</a></li>
        </ul>
        <p>Your certificate is now publicly verifiable and can be shared with employers or authorities as needed.</p>
        <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Best regards,<br>The Permit School Team</p>
      `
    }
  },
  es: {
    welcome: {
      subject: 'Bienvenido a Permit School',
      title: '¡Bienvenido a Permit School!',
      greeting: (name?: string) => name ? `Hola ${name},` : 'Hola,',
      body: (name?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>¡Bienvenido a Permit School! Tu cuenta ha sido creada exitosamente.</p>
        <p>Ahora puedes comenzar tu viaje de aprendizaje:</p>
        <ul>
          <li>Visita tu curso: <a href="${process.env.APP_BASE_URL}/course/CA/DE-ONLINE">Comenzar a Aprender</a></li>
          <li>Completa unidades y toma cuestionarios</li>
          <li>Rastrea tu progreso</li>
        </ul>
        <p>Si tienes alguna pregunta, contáctanos en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    },
    subscription: {
      subject: 'Tu suscripción está activa',
      title: 'Suscripción Activa',
      body: (name?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>¡Tu suscripción a Permit School está ahora activa! 🎉</p>
        <p>Ahora tienes acceso a:</p>
        <ul>
          <li>Todas las unidades del curso y contenido</li>
          <li>Elegibilidad para el examen final</li>
          <li>Emisión de certificado al completar</li>
        </ul>
        <p><strong>Comenzar a aprender ahora:</strong> <a href="${process.env.APP_BASE_URL}/course/CA/DE-ONLINE">Continuar Tu Curso</a></p>
        <p>Si tienes alguna pregunta, contáctanos en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    },
    certificate: {
      subject: (certNumber: string) => `Certificado Emitido - ${certNumber}`,
      title: 'Certificado Emitido',
      body: (name?: string, certNumber?: string, pdfUrl?: string, verifyUrl?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>¡Felicitaciones! Tu certificado ha sido emitido exitosamente. 🎓</p>
        <p><strong>Número de Certificado:</strong> ${certNumber}</p>
        <p>Puedes:</p>
        <ul>
          <li><a href="${pdfUrl}">Descargar tu certificado (PDF)</a></li>
          <li><a href="${verifyUrl}">Verificar tu certificado en línea</a></li>
        </ul>
        <p>Tu certificado ahora es públicamente verificable y puede ser compartido con empleadores o autoridades según sea necesario.</p>
        <p>Si tienes alguna pregunta, contáctanos en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    }
  }
};

function safeSend(html: string, subject: string, to: string) {
  if (!resend) {
    console.log('Email disabled: RESEND_API_KEY not configured');
    return { ok: false as const, reason: 'RESEND_DISABLED' };
  }
  return resend.emails.send({ from: FROM, to, subject, html });
}

export async function sendWelcomeEmail({ 
  to, 
  name, 
  locale = 'en' 
}: { 
  to: string; 
  name?: string; 
  locale?: SupportedLocale; 
}) {
  const template = emailTemplates[locale]?.welcome || emailTemplates.en.welcome;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${template.title}</h2>
      ${template.body(name)}
    </div>`;
  
  return safeSend(html, template.subject, to);
}

export async function sendSubscriptionActiveEmail({ 
  to, 
  name, 
  locale = 'en' 
}: { 
  to: string; 
  name?: string; 
  locale?: SupportedLocale; 
}) {
  const template = emailTemplates[locale]?.subscription || emailTemplates.en.subscription;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${template.title}</h2>
      ${template.body(name)}
    </div>`;
  
  return safeSend(html, template.subject, to);
}

export async function sendCertificateIssuedEmail({ 
  to, 
  name, 
  certNumber, 
  verifyUrl, 
  pdfUrl,
  locale = 'en'
}: { 
  to: string; 
  name?: string; 
  certNumber: string; 
  verifyUrl: string; 
  pdfUrl: string; 
  locale?: SupportedLocale;
}) {
  const template = emailTemplates[locale]?.certificate || emailTemplates.en.certificate;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${template.title}</h2>
      ${template.body(name, certNumber, pdfUrl, verifyUrl)}
    </div>`;
  
  return safeSend(html, template.subject(certNumber), to);
}

export async function sendCertificateVoidedEmail({ 
  to, 
  name, 
  certNumber, 
  reason 
}: { 
  to: string; 
  name?: string; 
  certNumber: string; 
  reason?: string; 
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d32f2f;">Certificate Voided</h2>
      <p>${name ? `Hi ${name},` : 'Hi,'}</p>
      <p>Your certificate has been voided by our administration team.</p>
      <p><strong>Certificate Number:</strong> ${certNumber}</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>This certificate is no longer valid and should not be used for any official purposes.</p>
      <p>If you believe this was done in error, please contact us immediately at ${process.env.SUPPORT_EMAIL}.</p>
      <p>Best regards,<br>The Permit School Team</p>
    </div>`;
  
  return safeSend(html, `Certificate Voided - ${certNumber}`, to);
}

export async function sendGuardianRequestEmail({ 
  to, 
  guardian_name, 
  student_display, 
  course_title, 
  verify_url, 
  help_email 
}: { 
  to: string; 
  guardian_name: string; 
  student_display: string; 
  course_title: string; 
  verify_url: string; 
  help_email: string; 
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Guardian Consent Request</h2>
      <p>Dear ${guardian_name},</p>
      <p>${student_display} has requested your consent to participate in the <strong>${course_title}</strong> course at Permit School.</p>
      <p>As a legal guardian, your consent is required for students under 18 years of age to proceed with this educational course.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>What you need to do:</strong></p>
        <ol style="margin: 10px 0;">
          <li>Click the secure link below to access the consent form</li>
          <li>Review the course information and jurisdiction requirements</li>
          <li>Provide your digital signature and consent</li>
        </ol>
      </div>
      <p><strong>Secure Consent Link:</strong> <a href="${verify_url}" style="color: #1976d2; text-decoration: none;">Provide Consent</a></p>
      <p style="color: #666; font-size: 14px;">This link will expire in 14 days for security purposes.</p>
      <p>If you have any questions or need assistance, please contact us at <a href="mailto:${help_email}">${help_email}</a>.</p>
      <p>Thank you for your time and cooperation.</p>
      <p>Best regards,<br>The Permit School Team</p>
    </div>`;
  
  return safeSend(html, `Guardian Consent Request - ${course_title}`, to);
}

export async function sendGuardianReceiptEmail({ 
  to, 
  guardian_name, 
  student_display, 
  course_title, 
  pdf_url, 
  verify_url 
}: { 
  to: string; 
  guardian_name: string; 
  student_display: string; 
  course_title: string; 
  pdf_url: string; 
  verify_url: string; 
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4caf50;">Guardian Consent Confirmed</h2>
      <p>Dear ${guardian_name},</p>
      <p>Thank you for providing your consent for ${student_display} to participate in the <strong>${course_title}</strong> course.</p>
      <p>Your consent has been successfully recorded and ${student_display} can now proceed with their course.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Important Information:</strong></p>
        <ul style="margin: 10px 0;">
          <li>A receipt of your consent has been generated</li>
          <li>You can download the receipt using the link below</li>
          <li>The consent can be verified online at any time</li>
        </ul>
      </div>
      <p><strong>Download Receipt:</strong> <a href="${pdf_url}" style="color: #1976d2; text-decoration: none;">Download PDF Receipt</a></p>
      <p><strong>Verify Consent:</strong> <a href="${verify_url}" style="color: #1976d2; text-decoration: none;">Verify Online</a></p>
      <p style="color: #666; font-size: 14px;">Please keep this receipt for your records.</p>
      <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL}.</p>
      <p>Best regards,<br>The Permit School Team</p>
    </div>`;
  
  return safeSend(html, `Guardian Consent Receipt - ${course_title}`, to);
}
