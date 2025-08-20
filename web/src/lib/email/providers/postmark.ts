import type { EmailClient, EmailPayload } from "../adapter";

export const postmarkEmail: EmailClient = {
  async send(msg: EmailPayload) {
    const token = process.env.POSTMARK_SERVER_TOKEN;
    if (!token) throw new Error("POSTMARK_SERVER_TOKEN is required for EMAIL_PROVIDER=postmark");
    const pm = await import("postmark");
    const client = new pm.ServerClient(token);
    const res = await client.sendEmail({
      From: process.env.EMAIL_FROM || "no-reply@example.com",
      To: Array.isArray(msg.to) ? msg.to.join(",") : msg.to,
      Subject: msg.subject,
      TextBody: msg.text,
      HtmlBody: msg.html,
      Headers: [{ Name: "X-Tags", Value: (msg.tags || []).join(",") }],
    });
    return { id: String(res.MessageID ?? `pm_${Date.now()}`) };
  },
};
