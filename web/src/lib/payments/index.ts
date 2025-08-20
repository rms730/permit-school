import { Payments } from "./types";

export async function getPayments(): Promise<Payments> {
  const enabled = process.env.STRIPE_ENABLED === "true";
  if (!enabled) {
    const { mockPayments } = await import("./mock");
    return mockPayments;
  }
  const { stripePayments } = await import("./stripe");
  return stripePayments;
}
