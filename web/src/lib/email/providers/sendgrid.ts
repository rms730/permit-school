import type { EmailClient, EmailPayload } from "../adapter";

export const sendgridEmail: EmailClient = {
  async send(msg: EmailPayload) {
    const key = process.env.SENDGRID_API_KEY;
    if (!key) throw new Error("SENDGRID_API_KEY is required for EMAIL_PROVIDER=sendgrid");
    const sg = await import("@sendgrid/mail");
    sg.setApiKey(key);
    const [res] = await sg.send({
      from: process.env.EMAIL_FROM || "no-reply@example.com",
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      headers: { "X-Tags": (msg.tags || []).join(",") },
    });
    return { id: String(res.headers["x-message-id"] ?? `sg_${Date.now()}`) };
  },
};
