import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Only run teardown if TESTKIT_ON is enabled
  if (process.env.TESTKIT_ON !== 'true') {
    console.log('TESTKIT_ON not enabled, skipping global teardown');
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Running global teardown...');

    // Reset test data
    const resetResponse = await page.request.post(`${baseURL}/api/testkit/reset`, {
      headers: {
        'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!resetResponse.ok()) {
      console.error('Failed to reset test data during teardown:', await resetResponse.text());
    } else {
      console.log('Test data reset successfully during teardown');
    }

  } catch (error) {
    console.error('Global teardown failed:', error);
    // Don't throw error during teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

export default globalTeardown;
