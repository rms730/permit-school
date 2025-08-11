import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.FROM_EMAIL ?? 'no-reply@example.com';

function safeSend(html: string, subject: string, to: string) {
  if (!resend) {
    console.log('Email disabled: RESEND_API_KEY not configured');
    return { ok: false as const, reason: 'RESEND_DISABLED' };
  }
  return resend.emails.send({ from: FROM, to, subject, html });
}

export async function sendWelcomeEmail({ to, name }: { to: string; name?: string }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to Permit School!</h2>
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
    </div>`;
  
  return safeSend(html, 'Welcome to Permit School', to);
}

export async function sendSubscriptionActiveEmail({ to, name }: { to: string; name?: string }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Subscription Active</h2>
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
    </div>`;
  
  return safeSend(html, 'Your subscription is active', to);
}

export async function sendCertificateIssuedEmail({ 
  to, 
  name, 
  certNumber, 
  verifyUrl, 
  pdfUrl 
}: { 
  to: string; 
  name?: string; 
  certNumber: string; 
  verifyUrl: string; 
  pdfUrl: string; 
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Certificate Issued</h2>
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
    </div>`;
  
  return safeSend(html, `Certificate Issued - ${certNumber}`, to);
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
