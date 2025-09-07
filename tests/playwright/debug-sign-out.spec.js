import { test, expect } from '@playwright/test';

test.describe('Debug Sign Out', () => {
  test('should debug why sign out is not working', async ({ page }) => {
    console.log('🔍 Debugging sign out functionality');
    
    // Log all console messages including errors
    page.on('console', msg => {
      console.log(`Browser [${msg.type()}]:`, msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('Page Error:', error.message);
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Set up user
    await page.evaluate(() => {
      localStorage.setItem('userData', JSON.stringify({
        id: 'debug-test',
        name: 'Debug User',
        email: 'debug@test.com',
        onboardingCompleted: true,
        profileSetupCompleted: true,
        role: 'tracker'
      }));
      localStorage.setItem('hasLaunched', 'true');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Navigate to settings
    await page.locator('text="Profile"').first().click();
    await page.waitForTimeout(2000);
    
    // Find sign out button
    const signOutButton = page.locator('[data-testid="sign-out-button"]');
    
    if (!(await signOutButton.isVisible())) {
      console.log('❌ Sign out button not found');
      
      // Debug: show all buttons on the page
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons:`);
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        console.log(`  Button ${i}: "${text}"`);
      }
      
      throw new Error('Sign out button not found');
    }
    
    console.log('✅ Found sign out button');
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'test-results/debug-01-before-click.png', fullPage: true });
    
    // Check what happens when we click the button
    console.log('🖱️ Clicking sign out button...');
    
    // Add a delay and check if any alerts/dialogs appear
    await signOutButton.click();
    
    console.log('✅ Clicked sign out button');
    
    // Wait a bit to see if anything appears
    await page.waitForTimeout(3000);
    
    // Check for any modal dialogs or alerts
    const hasAlert = await page.locator('[role="alert"]').count();
    const hasDialog = await page.locator('[role="dialog"]').count();
    const hasModal = await page.locator('.modal').count();
    
    console.log(`Dialogs found: alert=${hasAlert}, dialog=${hasDialog}, modal=${hasModal}`);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'test-results/debug-02-after-click.png', fullPage: true });
    
    // Check if React Native Alert created any elements
    const alertElements = await page.evaluate(() => {
      // Look for any elements that might be alert-related
      const possibleAlerts = [];
      
      // Check for text containing "Sign Out" or "Are you sure"
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        if (el.textContent && el.textContent.includes('Sign Out')) {
          possibleAlerts.push({
            tag: el.tagName,
            text: el.textContent.trim(),
            className: el.className,
            role: el.getAttribute('role')
          });
        }
      }
      
      return possibleAlerts;
    });
    
    console.log('Elements containing "Sign Out":', alertElements);
    
    // Check localStorage to see if sign out was attempted
    const storageAfterClick = await page.evaluate(() => {
      return {
        userData: localStorage.getItem('userData'),
        keys: Object.keys(localStorage)
      };
    });
    
    console.log('localStorage after click:', storageAfterClick);
    
    // Give it more time and check again
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-results/debug-03-final-state.png', fullPage: true });
    
    // Final check
    const finalStorage = await page.evaluate(() => {
      return localStorage.getItem('userData');
    });
    
    console.log('Final userData in localStorage:', finalStorage);
    
    // Check if we're on a different screen now
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    const isOnAuth = await page.isVisible('text="I track my cycle"');
    const isOnWelcome = await page.isVisible('text="Welcome"');
    console.log('On auth screen:', isOnAuth, 'On welcome screen:', isOnWelcome);
    
    // This test is for debugging, so we'll pass regardless of actual sign out
    expect(true).toBe(true);
  });
});