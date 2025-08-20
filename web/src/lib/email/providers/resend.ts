import type { EmailClient, EmailPayload } from "../adapter";

export const resendEmail: EmailClient = {
  async send(msg: EmailPayload) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is required for EMAIL_PROVIDER=resend");
    // Lazy import to avoid build-time SDK requirement if unused
    const { Resend } = await import("resend");
    const client = new Resend(key);
    const res = await client.emails.send({
      from: process.env.EMAIL_FROM || "no-reply@example.com",
      to: Array.isArray(msg.to) ? msg.to : [msg.to],
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      tags: (msg.tags || []).map((name) => ({ name, value: "true" })),
    });
    return { id: String(res.id ?? `resend_${Date.now()}`) };
  },
};
