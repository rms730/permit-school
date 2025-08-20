import Stripe from "stripe";
import { Payments } from "./types";

function getStripeOrThrow() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is required when STRIPE_ENABLED=true");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export const stripePayments: Payments = {
  async createCheckoutSession({ userId, priceId, successUrl, cancelUrl, metadata }) {
    const stripe = getStripeOrThrow();
    if (!priceId) throw new Error("priceId required for Stripe checkout");
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId, ...(metadata || {}) },
    });
    return { id: session.id, url: session.url! };
  },

  async getPortalLink({ customerId, returnUrl }) {
    const stripe = getStripeOrThrow();
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { url };
  },

  async cancelSubscription({ subscriptionId }) {
    const stripe = getStripeOrThrow();
    const sub = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    return { status: sub.status };
  },

  async resumeSubscription({ subscriptionId }) {
    const stripe = getStripeOrThrow();
    const sub = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
    return { status: sub.status };
  },

  async verifyWebhook(req: Request) {
    // If you want real webhook verification, read raw body and use STRIPE_WEBHOOK_SECRET
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return null; // allow soft-disable in dev
    // For Next.js App Router, you may need to read raw body:
    // const payload = await req.text();
    // const sig = req.headers.get("stripe-signature")!;
    // return stripe.webhooks.constructEvent(payload, sig, secret);
    return null; // implement when you wire raw body; for now, soft-disable
  },
};
