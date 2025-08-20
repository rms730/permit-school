export type Payments = {
  createCheckoutSession(input: {
    userId: string;
    courseId?: string;
    successUrl: string;
    cancelUrl: string;
    priceId?: string;
    metadata?: Record<string,string>;
  }): Promise<{ id: string; url: string }>;

  getPortalLink(input: { customerId: string; returnUrl: string }): Promise<{ url: string }>;

  cancelSubscription(input: { subscriptionId: string }): Promise<{ status: string }>;
  resumeSubscription(input: { subscriptionId: string }): Promise<{ status: string }>;

  verifyWebhook(req: Request): Promise<any | null>;
};
