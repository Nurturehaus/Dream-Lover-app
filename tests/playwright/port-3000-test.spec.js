// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Port 3000 Troubleshooting', () => {
  test('check what is on port 3000', async ({ page }) => {
    // Go to port 3000 instead of 8081
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/port-3000-state.png', fullPage: true });
    
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Check what's in the body
    const bodyText = await page.textContent('body');
    console.log('Body text length:', bodyText ? bodyText.length : 0);
    console.log('Body text (first 200 chars):', bodyText ? bodyText.substring(0, 200) : 'No body text');
    
    // Check for any elements
    const allElements = await page.$$eval('*', elements => elements.length);
    console.log('Total DOM elements:', allElements);
    
    // Check for React root
    const root = await page.locator('#root').count();
    console.log('React root elements found:', root);
    
    if (root > 0) {
      const rootContent = await page.locator('#root').textContent();
      console.log('Root content:', rootContent ? rootContent.substring(0, 200) : 'Empty root');
    }
    
    // Check console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit more and check for any delayed content
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/port-3000-after-wait.png' });
    
    console.log('Console errors found:', errors.length);
    errors.forEach(error => console.log('ERROR:', error));
  });
});