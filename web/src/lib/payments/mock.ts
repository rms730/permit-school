import { Payments } from "./types";

export const mockPayments: Payments = {
  async createCheckoutSession({ successUrl, cancelUrl }) {
    return { id: "sess_mock_123", url: successUrl || "http://localhost:3000" };
  },
  async getPortalLink() {
    return { url: "http://localhost:3000/account/billing" };
  },
  async cancelSubscription() {
    return { status: "canceled" };
  },
  async resumeSubscription() {
    return { status: "active" };
  },
  async verifyWebhook() {
    // In local/CI, we don't fail CI on missing webhooks.
    return null;
  },
};
