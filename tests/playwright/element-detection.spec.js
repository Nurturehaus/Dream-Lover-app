// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Element Detection and Interactive Testing', () => {
  test('detect what elements are present and take screenshots', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Take a screenshot to see what's actually displayed
    await page.screenshot({ path: 'test-results/current-page-state.png', fullPage: true });
    
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Check what test IDs are present
    const testIds = await page.$$eval('[data-testid]', elements => 
      elements.map(el => el.getAttribute('data-testid'))
    );
    console.log('Found test IDs:', testIds);
    
    // Check for common elements
    const commonSelectors = [
      'button',
      'input',
      '[data-testid]',
      '.container',
      '#root',
      'form'
    ];
    
    for (const selector of commonSelectors) {
      const count = await page.locator(selector).count();
      console.log(`Found ${count} elements matching "${selector}"`);
    }
    
    // Check for text content that might indicate what screen we're on
    const pageText = await page.textContent('body');
    console.log('Page contains auth keywords:', /sign|login|email|password/i.test(pageText));
    console.log('Page contains dashboard keywords:', /dashboard|dream|lover|cycle/i.test(pageText));
    console.log('Page contains navigation keywords:', /calendar|log|insights|settings/i.test(pageText));
    
    // Try to click any visible buttons and take screenshots
    const buttons = await page.locator('button:visible').count();
    console.log(`Found ${buttons} visible buttons`);
    
    if (buttons > 0) {
      await page.screenshot({ path: 'test-results/before-button-click.png' });
      // Click the first visible button
      try {
        await page.locator('button:visible').first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/after-button-click.png' });
      } catch (e) {
        console.log('Could not click button:', e.message);
      }
    }
  });
  
  test('try to interact with any available navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);
    
    // Look for any navigation elements
    const navElements = [
      '[data-testid="tab-home"]',
      '[data-testid="tab-calendar"]', 
      '[data-testid="tab-log"]',
      '[data-testid="tab-insights"]',
      '[data-testid="tab-settings"]',
      'a',
      'button'
    ];
    
    for (const selector of navElements) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      const count = await page.locator(selector).count();
      
      console.log(`${selector}: ${count} found, first visible: ${isVisible}`);
      
      if (isVisible) {
        try {
          await element.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `test-results/clicked-${selector.replace(/[^a-zA-Z0-9]/g, '')}.png` });
          console.log(`Successfully clicked ${selector}`);
        } catch (e) {
          console.log(`Could not click ${selector}:`, e.message);
        }
      }
    }
  });
});