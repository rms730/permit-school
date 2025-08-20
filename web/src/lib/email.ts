import { type SupportedLocale } from './i18n/locales';
import { getEmail } from './email/adapter';

const FROM = process.env.EMAIL_FROM ?? 'no-reply@example.com';

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
    },
    payment_failed_1: {
      subject: 'Payment Failed - Action Required',
      title: 'Payment Failed',
      body: (name?: string, amount?: string, invoiceUrl?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>We were unable to process your payment of ${amount || '$0.00'} for your Permit School subscription.</p>
        <p><strong>What you need to do:</strong></p>
        <ul>
          <li>Update your payment method in your billing portal</li>
          <li>Ensure your card has sufficient funds</li>
          <li>Check that your card hasn't expired</li>
        </ul>
        <p><strong>Update Payment Method:</strong> <a href="${process.env.APP_BASE_URL}/billing">Manage Billing</a></p>
        <p>If you need assistance, please contact us at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Best regards,<br>The Permit School Team</p>
      `
    },
    payment_failed_2: {
      subject: 'Payment Still Pending - Urgent Action Required',
      title: 'Payment Still Pending',
      body: (name?: string, amount?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>Your payment of ${amount || '$0.00'} for your Permit School subscription is still pending.</p>
        <p><strong>Important:</strong> If we don't receive payment soon, your subscription may be paused and you'll lose access to your course materials.</p>
        <p><strong>Please update your payment method immediately:</strong> <a href="${process.env.APP_BASE_URL}/billing">Manage Billing</a></p>
        <p>If you need assistance, please contact us at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Best regards,<br>The Permit School Team</p>
      `
    },
    payment_failed_3: {
      subject: 'Final Payment Notice - Subscription at Risk',
      title: 'Final Payment Notice',
      body: (name?: string, amount?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>This is your final notice regarding your unpaid Permit School subscription payment of ${amount || '$0.00'}.</p>
        <p><strong>Urgent Action Required:</strong> If payment is not received within 24 hours, your subscription will be canceled and you'll lose access to all course materials.</p>
        <p><strong>Update Payment Method Now:</strong> <a href="${process.env.APP_BASE_URL}/billing">Manage Billing</a></p>
        <p>If you need assistance, please contact us immediately at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Best regards,<br>The Permit School Team</p>
      `
    },
    payment_succeeded: {
      subject: 'Payment Successful - Subscription Active',
      title: 'Payment Successful',
      body: (name?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>Great news! Your payment has been processed successfully and your Permit School subscription is now active. 🎉</p>
        <p>You have full access to all course materials and can continue your learning journey.</p>
        <p><strong>Continue Learning:</strong> <a href="${process.env.APP_BASE_URL}/course/CA/DE-ONLINE">Access Your Course</a></p>
        <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Best regards,<br>The Permit School Team</p>
      `
    },
    trial_3day: {
      subject: 'Trial Ending Soon - 3 Days Left',
      title: 'Trial Ending Soon',
      body: (name?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>Your Permit School trial will end in 3 days. To continue your learning journey, you'll need to subscribe.</p>
        <p><strong>What happens when your trial ends:</strong></p>
        <ul>
          <li>You'll lose access to course materials</li>
          <li>Your progress will be saved</li>
          <li>You can resume anytime by subscribing</li>
        </ul>
        <p><strong>Subscribe Now:</strong> <a href="${process.env.APP_BASE_URL}/billing">Choose Your Plan</a></p>
        <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Best regards,<br>The Permit School Team</p>
      `
    },
    trial_1day: {
      subject: 'Trial Ending Tomorrow - Last Chance',
      title: 'Trial Ending Tomorrow',
      body: (name?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>Your Permit School trial ends tomorrow! This is your last chance to subscribe and continue your learning journey.</p>
        <p><strong>Don't lose your progress:</strong> Subscribe now to maintain access to all course materials.</p>
        <p><strong>Subscribe Now:</strong> <a href="${process.env.APP_BASE_URL}/billing">Choose Your Plan</a></p>
        <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Best regards,<br>The Permit School Team</p>
      `
    },
    cancel_confirm: {
      subject: 'Subscription Cancellation Confirmed',
      title: 'Subscription Cancellation Confirmed',
      body: (name?: string, endDate?: string) => `
        <p>${name ? `Hi ${name},` : 'Hi,'}</p>
        <p>Your Permit School subscription cancellation has been confirmed.</p>
        <p><strong>Access until:</strong> ${endDate || 'end of current period'}</p>
        <p>You can resume your subscription anytime before this date by visiting your billing portal.</p>
        <p><strong>Resume Subscription:</strong> <a href="${process.env.APP_BASE_URL}/billing">Manage Billing</a></p>
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
    },
    payment_failed_1: {
      subject: 'Pago Fallido - Acción Requerida',
      title: 'Pago Fallido',
      body: (name?: string, amount?: string, invoiceUrl?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>No pudimos procesar tu pago de ${amount || '$0.00'} para tu suscripción de Permit School.</p>
        <p><strong>Lo que necesitas hacer:</strong></p>
        <ul>
          <li>Actualiza tu método de pago en tu portal de facturación</li>
          <li>Asegúrate de que tu tarjeta tenga fondos suficientes</li>
          <li>Verifica que tu tarjeta no haya expirado</li>
        </ul>
        <p><strong>Actualizar Método de Pago:</strong> <a href="${process.env.APP_BASE_URL}/billing">Gestionar Facturación</a></p>
        <p>Si necesitas ayuda, contáctanos en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    },
    payment_failed_2: {
      subject: 'Pago Aún Pendiente - Acción Urgente Requerida',
      title: 'Pago Aún Pendiente',
      body: (name?: string, amount?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>Tu pago de ${amount || '$0.00'} para tu suscripción de Permit School aún está pendiente.</p>
        <p><strong>Importante:</strong> Si no recibimos el pago pronto, tu suscripción puede ser pausada y perderás acceso a los materiales del curso.</p>
        <p><strong>Por favor actualiza tu método de pago inmediatamente:</strong> <a href="${process.env.APP_BASE_URL}/billing">Gestionar Facturación</a></p>
        <p>Si necesitas ayuda, contáctanos en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    },
    payment_failed_3: {
      subject: 'Aviso Final de Pago - Suscripción en Riesgo',
      title: 'Aviso Final de Pago',
      body: (name?: string, amount?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>Este es tu aviso final sobre tu pago impago de ${amount || '$0.00'} para tu suscripción de Permit School.</p>
        <p><strong>Acción Urgente Requerida:</strong> Si el pago no se recibe dentro de 24 horas, tu suscripción será cancelada y perderás acceso a todos los materiales del curso.</p>
        <p><strong>Actualizar Método de Pago Ahora:</strong> <a href="${process.env.APP_BASE_URL}/billing">Gestionar Facturación</a></p>
        <p>Si necesitas ayuda, contáctanos inmediatamente en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    },
    payment_succeeded: {
      subject: 'Pago Exitoso - Suscripción Activa',
      title: 'Pago Exitoso',
      body: (name?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>¡Excelentes noticias! Tu pago ha sido procesado exitosamente y tu suscripción de Permit School está ahora activa. 🎉</p>
        <p>Tienes acceso completo a todos los materiales del curso y puedes continuar tu viaje de aprendizaje.</p>
        <p><strong>Continuar Aprendiendo:</strong> <a href="${process.env.APP_BASE_URL}/course/CA/DE-ONLINE">Acceder a Tu Curso</a></p>
        <p>Si tienes alguna pregunta, contáctanos en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    },
    trial_3day: {
      subject: 'Prueba Terminando Pronto - 3 Días Restantes',
      title: 'Prueba Terminando Pronto',
      body: (name?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>Tu prueba de Permit School terminará en 3 días. Para continuar tu viaje de aprendizaje, necesitarás suscribirte.</p>
        <p><strong>Qué pasa cuando termina tu prueba:</strong></p>
        <ul>
          <li>Perderás acceso a los materiales del curso</li>
          <li>Tu progreso será guardado</li>
          <li>Puedes reanudar en cualquier momento suscribiéndote</li>
        </ul>
        <p><strong>Suscribirse Ahora:</strong> <a href="${process.env.APP_BASE_URL}/billing">Elegir Tu Plan</a></p>
        <p>Si tienes alguna pregunta, contáctanos en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    },
    trial_1day: {
      subject: 'Prueba Terminando Mañana - Última Oportunidad',
      title: 'Prueba Terminando Mañana',
      body: (name?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>¡Tu prueba de Permit School termina mañana! Esta es tu última oportunidad de suscribirte y continuar tu viaje de aprendizaje.</p>
        <p><strong>No pierdas tu progreso:</strong> Suscríbete ahora para mantener acceso a todos los materiales del curso.</p>
        <p><strong>Suscribirse Ahora:</strong> <a href="${process.env.APP_BASE_URL}/billing">Elegir Tu Plan</a></p>
        <p>Si tienes alguna pregunta, contáctanos en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    },
    cancel_confirm: {
      subject: 'Cancelación de Suscripción Confirmada',
      title: 'Cancelación de Suscripción Confirmada',
      body: (name?: string, endDate?: string) => `
        <p>${name ? `Hola ${name},` : 'Hola,'}</p>
        <p>Tu cancelación de suscripción de Permit School ha sido confirmada.</p>
        <p><strong>Acceso hasta:</strong> ${endDate || 'fin del período actual'}</p>
        <p>Puedes reanudar tu suscripción en cualquier momento antes de esta fecha visitando tu portal de facturación.</p>
        <p><strong>Reanudar Suscripción:</strong> <a href="${process.env.APP_BASE_URL}/billing">Gestionar Facturación</a></p>
        <p>Si tienes alguna pregunta, contáctanos en ${process.env.SUPPORT_EMAIL}.</p>
        <p>Saludos cordiales,<br>El Equipo de Permit School</p>
      `
    }
  }
};

async function safeSend(html: string, subject: string, to: string) {
  const emailClient = getEmail();
  try {
    const result = await emailClient.send({
      to,
      subject,
      html,
      tags: ['permit-school']
    });
    return { ok: true as const, id: result.id };
  } catch (error) {
    console.error('Email send failed:', error);
    return { ok: false as const, reason: 'SEND_FAILED', error };
  }
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

// Billing lifecycle email functions
export async function sendPaymentFailedEmail({ 
  to, 
  name, 
  amount, 
  step = 1,
  locale = 'en' 
}: { 
  to: string; 
  name?: string; 
  amount?: string; 
  step?: 1 | 2 | 3;
  locale?: SupportedLocale; 
}) {
  const template = emailTemplates[locale]?.[`payment_failed_${step}`] || emailTemplates.en[`payment_failed_${step}`];
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${template.title}</h2>
      ${template.body(name, amount)}
    </div>`;
  
  return safeSend(html, template.subject, to);
}

export async function sendPaymentSucceededEmail({ 
  to, 
  name, 
  locale = 'en' 
}: { 
  to: string; 
  name?: string; 
  locale?: SupportedLocale; 
}) {
  const template = emailTemplates[locale]?.payment_succeeded || emailTemplates.en.payment_succeeded;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${template.title}</h2>
      ${template.body(name)}
    </div>`;
  
  return safeSend(html, template.subject, to);
}

export async function sendTrialReminderEmail({ 
  to, 
  name, 
  daysLeft, 
  locale = 'en' 
}: { 
  to: string; 
  name?: string; 
  daysLeft: 1 | 3;
  locale?: SupportedLocale; 
}) {
  const template = emailTemplates[locale]?.[`trial_${daysLeft}day`] || emailTemplates.en[`trial_${daysLeft}day`];
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${template.title}</h2>
      ${template.body(name)}
    </div>`;
  
  return safeSend(html, template.subject, to);
}

export async function sendCancelConfirmationEmail({ 
  to, 
  name, 
  endDate, 
  locale = 'en' 
}: { 
  to: string; 
  name?: string; 
  endDate?: string; 
  locale?: SupportedLocale; 
}) {
  const template = emailTemplates[locale]?.cancel_confirm || emailTemplates.en.cancel_confirm;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${template.title}</h2>
      ${template.body(name, endDate)}
    </div>`;
  
  return safeSend(html, template.subject, to);
}
