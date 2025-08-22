const { chromium } = require('@playwright/test');

async function debugHeadings() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/en');
  
  // Get all headings
  const headings = await page.evaluate(() => {
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    return Array.from(headingElements).map((el, index) => ({
      index,
      tag: el.tagName.toLowerCase(),
      text: el.textContent.trim().substring(0, 50),
      id: el.id || '',
      className: el.className || ''
    }));
  });
  
  console.log('Heading hierarchy:');
  headings.forEach(h => {
    console.log(`${h.tag}: "${h.text}" (id: ${h.id})`);
  });
  
  await browser.close();
}

debugHeadings().catch(console.error);
