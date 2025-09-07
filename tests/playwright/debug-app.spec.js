const { test, expect } = require('@playwright/test');

test.describe('Debug App Loading', () => {
  test('should inspect what is actually rendered and check for errors', async ({ page }) => {
    // Listen for console logs and errors
    const logs = [];
    const errors = [];
    
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    // Navigate to the app
    await page.goto('http://localhost:8081');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000); // Give React time to render
    
    // Take a screenshot of whatever is rendered
    await page.screenshot({ path: 'debug-app-initial.png', fullPage: true });
    
    // Get the page HTML content
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Page HTML:', bodyHTML.slice(0, 500) + (bodyHTML.length > 500 ? '...' : ''));
    
    // Check for React root element
    const reactRoot = await page.locator('#root, #__next, [data-reactroot]');
    const reactRootExists = await reactRoot.count();
    console.log('React root elements found:', reactRootExists);
    
    // Look for any text content
    const allText = await page.textContent('body');
    console.log('All visible text:', allText ? allText.slice(0, 200) + '...' : 'No text found');
    
    // Check for loading indicators
    const loadingElements = await page.locator('text=/loading|Loading/i').count();
    console.log('Loading elements found:', loadingElements);
    
    // Check for error messages
    const errorElements = await page.locator('text=/error|Error|failed|Failed/i').count();
    console.log('Error elements found:', errorElements);
    
    // Output all console logs
    console.log('\n=== CONSOLE LOGS ===');
    logs.forEach(log => console.log(log));
    
    // Output all errors
    console.log('\n=== JAVASCRIPT ERRORS ===');
    errors.forEach(error => console.log(error));
    
    // Check current URL
    console.log('Current URL:', page.url());
    
    // Check if there are any testID elements at all
    const testIdElements = await page.locator('[data-testid], [testid]').count();
    console.log('Elements with testID found:', testIdElements);
    
    console.log('✅ Debug inspection completed');
  });
});