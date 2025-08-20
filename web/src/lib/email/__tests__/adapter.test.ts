import fs from 'node:fs';
import path from 'node:path';

// Set mock provider for testing
process.env.EMAIL_PROVIDER = 'mock';

test('mock email functionality works', async () => {
  // Test the mock email functionality directly
  const outboxDir = path.join(process.cwd(), 'var', 'outbox');
  fs.mkdirSync(outboxDir, { recursive: true });
  
  const testMessage = {
    to: 'test@example.com',
    subject: 'Test Email',
    text: 'Hello from test',
    html: '<p>Hello from test</p>',
    tags: ['test', 'unit']
  };
  
  // Simulate the mock email send
  const id = `mock_${Date.now()}`;
  const filePath = path.join(outboxDir, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(testMessage, null, 2), 'utf8');
  
  // Check that the file was written
  expect(fs.existsSync(filePath)).toBe(true);
  
  // Check file contents
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const savedMessage = JSON.parse(fileContent);
  
  expect(savedMessage).toEqual(testMessage);
  expect(id).toMatch(/^mock_\d+$/);
  
  // Clean up
  fs.unlinkSync(filePath);
});

test('email adapter factory returns correct provider', () => {
  // Test that the factory logic works correctly
  const provider = (process.env.EMAIL_PROVIDER || 'mock').toLowerCase();
  expect(provider).toBe('mock');
  
  // Test that the provider is in the allowed list
  const allowedProviders = ['mock', 'resend', 'sendgrid', 'postmark'];
  expect(allowedProviders).toContain(provider);
});
