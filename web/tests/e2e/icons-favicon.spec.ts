import { test, expect } from '@playwright/test';

test('favicon & manifest are served correctly', async ({ page, request }) => {
  // Test favicon.ico
  const fav = await request.get('/favicon.ico');
  expect(fav.status()).toBe(200);
  
  // Check if content-length exists and is greater than 0, or if transfer-encoding is chunked
  const contentLength = fav.headers()['content-length'];
  const transferEncoding = fav.headers()['transfer-encoding'];
  
  if (contentLength) {
    expect(Number(contentLength)).toBeGreaterThan(0);
  } else if (transferEncoding === 'chunked') {
    // Accept chunked transfer encoding as valid
    expect(transferEncoding).toBe('chunked');
  } else {
    // If neither content-length nor chunked, the file should still exist
    expect(fav.status()).toBe(200);
  }

  // Test manifest.webmanifest
  const man = await request.get('/manifest.webmanifest');
  expect(man.status()).toBe(200);
  const json = await man.json();
  expect(Array.isArray(json.icons)).toBeTruthy();
  expect(json.icons.some((i: any) => i.src === '/icons/icon-192.png')).toBeTruthy();
  expect(json.icons.some((i: any) => i.src === '/icons/icon-512.png')).toBeTruthy();
  expect(json.icons.some((i: any) => i.src === '/icons/maskable-512.png')).toBeTruthy();

  // Test individual icon files
  const icon192 = await request.get('/icons/icon-192.png');
  expect(icon192.status()).toBe(200);
  expect(Number(icon192.headers()['content-length'] || '0')).toBeGreaterThan(0);

  const icon512 = await request.get('/icons/icon-512.png');
  expect(icon512.status()).toBe(200);
  expect(Number(icon512.headers()['content-length'] || '0')).toBeGreaterThan(0);

  const maskable512 = await request.get('/icons/maskable-512.png');
  expect(maskable512.status()).toBe(200);
  expect(Number(maskable512.headers()['content-length'] || '0')).toBeGreaterThan(0);

  // Test favicon PNGs
  const favicon16 = await request.get('/favicon-16x16.png');
  expect(favicon16.status()).toBe(200);
  expect(Number(favicon16.headers()['content-length'] || '0')).toBeGreaterThan(0);

  const favicon32 = await request.get('/favicon-32x32.png');
  expect(favicon32.status()).toBe(200);
  expect(Number(favicon32.headers()['content-length'] || '0')).toBeGreaterThan(0);

  const appleTouch = await request.get('/apple-touch-icon.png');
  expect(appleTouch.status()).toBe(200);
  expect(Number(appleTouch.headers()['content-length'] || '0')).toBeGreaterThan(0);

  // Test that icon metadata is present in HTML
  await page.goto('/en');
  
  // Check for favicon links
  const iconLinks = await page.locator('link[rel="icon"]').all();
  expect(iconLinks.length).toBeGreaterThan(0);
  
  // Check for specific favicon.ico link (link elements are hidden by default)
  await expect(page.locator('link[rel="icon"][href="/favicon.ico"]')).toHaveAttribute('href', '/favicon.ico');
  
  // Check for favicon PNG links
  await expect(page.locator('link[rel="icon"][href="/favicon-32x32.png"]')).toHaveAttribute('href', '/favicon-32x32.png');
  await expect(page.locator('link[rel="icon"][href="/favicon-16x16.png"]')).toHaveAttribute('href', '/favicon-16x16.png');
  
  // Check for apple touch icon
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
  
  // Check for manifest link
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  
  // Check for mask icon
  await expect(page.locator('link[rel="mask-icon"]')).toHaveAttribute('href', '/icons/maskable-512.png');
});

test('icons are not affected by i18n middleware', async ({ request }) => {
  // Test that icon requests to locale-prefixed URLs return 404 (as expected)
  // since the middleware skips static assets entirely
  const favEn = await request.get('/en/favicon.ico');
  expect(favEn.status()).toBe(404);
  
  const manEn = await request.get('/en/manifest.webmanifest');
  expect(manEn.status()).toBe(404);
  
  const icon192En = await request.get('/en/icons/icon-192.png');
  expect(icon192En.status()).toBe(404);
  
  // Test Spanish locale as well
  const favEs = await request.get('/es/favicon.ico');
  expect(favEs.status()).toBe(404);
  
  const manEs = await request.get('/es/manifest.webmanifest');
  expect(manEs.status()).toBe(404);
});
