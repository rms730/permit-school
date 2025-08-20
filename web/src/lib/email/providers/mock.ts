import type { EmailClient, EmailPayload } from "../adapter";
import fs from "node:fs";
import path from "node:path";

const OUTBOX = path.join(process.cwd(), "var", "outbox");
fs.mkdirSync(OUTBOX, { recursive: true });

export const mockEmail: EmailClient = {
  async send(msg: EmailPayload) {
    const id = `mock_${Date.now()}`;
    const file = path.join(OUTBOX, `${id}.json`);
    fs.writeFileSync(file, JSON.stringify(msg, null, 2), "utf8");
    console.log(`[email:mock] wrote ${file}`);
    return { id };
  },
};
