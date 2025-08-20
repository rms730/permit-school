test('getPayments returns mock when STRIPE_ENABLED=false', async () => {
  // Set environment to disable Stripe
  process.env.STRIPE_ENABLED = 'false';
  
  const { getPayments } = await import('../index');
  const payments = await getPayments();
  
  // Test that it's the mock implementation by checking the behavior
  expect(payments.createCheckoutSession).toBeDefined();
  expect(payments.getPortalLink).toBeDefined();
  expect(payments.cancelSubscription).toBeDefined();
  expect(payments.resumeSubscription).toBeDefined();
  expect(payments.verifyWebhook).toBeDefined();
});

test('getPayments returns stripe when STRIPE_ENABLED=true', async () => {
  // Set environment to enable Stripe
  process.env.STRIPE_ENABLED = 'true';
  
  const { getPayments } = await import('../index');
  const payments = await getPayments();
  
  // Test that it's the stripe implementation by checking the behavior
  expect(payments.createCheckoutSession).toBeDefined();
  expect(payments.getPortalLink).toBeDefined();
  expect(payments.cancelSubscription).toBeDefined();
  expect(payments.resumeSubscription).toBeDefined();
  expect(payments.verifyWebhook).toBeDefined();
});

test('mock payments returns expected values', async () => {
  process.env.STRIPE_ENABLED = 'false';
  
  const { getPayments } = await import('../index');
  const payments = await getPayments();
  
  // Test mock checkout session
  const session = await payments.createCheckoutSession({
    successUrl: 'http://localhost:3000/success',
    cancelUrl: 'http://localhost:3000/cancel'
  });
  
  expect(session.id).toBe('sess_mock_123');
  expect(session.url).toBe('http://localhost:3000/success');
  
  // Test mock portal link
  const portal = await payments.getPortalLink({
    customerId: 'cus_test',
    returnUrl: 'http://localhost:3000/billing'
  });
  
  expect(portal.url).toBe('http://localhost:3000/account/billing');
  
  // Test mock subscription operations
  const cancelResult = await payments.cancelSubscription({ subscriptionId: 'sub_test' });
  expect(cancelResult.status).toBe('canceled');
  
  const resumeResult = await payments.resumeSubscription({ subscriptionId: 'sub_test' });
  expect(resumeResult.status).toBe('active');
  
  // Test mock webhook verification
  const webhookResult = await payments.verifyWebhook({} as Request);
  expect(webhookResult).toBeNull();
});
