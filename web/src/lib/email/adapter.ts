export type EmailPayload = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  tags?: string[];
};

export type EmailClient = {
  send: (msg: EmailPayload) => Promise<{ id: string }>;
};

export function getEmail(): EmailClient {
  const provider = (process.env.EMAIL_PROVIDER || "mock").toLowerCase();
  try {
    if (provider === "resend") return require("./providers/resend").resendEmail;
    if (provider === "sendgrid") return require("./providers/sendgrid").sendgridEmail;
    if (provider === "postmark") return require("./providers/postmark").postmarkEmail;
  } catch (e) {
    console.warn(`[email] provider "${provider}" not available, falling back to mock.`, e);
  }
  return require("./providers/mock").mockEmail;
}
