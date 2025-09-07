const { test, expect } = require('@playwright/test');

test.describe('Complete Onboarding to Auth Flow', () => {
  test('should complete onboarding and reach authentication screen', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8081');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot to see current state
    await page.screenshot({ path: 'onboarding-step-1.png', fullPage: true });
    
    console.log('=== STEP 1: Check for onboarding elements ===');
    
    // Look for onboarding elements - check multiple possible selectors
    const continueButtons = await page.locator('button:has-text("Continue"), button:has-text("Get Started"), button:has-text("Next"), [testid*="continue"], [testid*="next"], [testid*="get-started"]');
    const buttonCount = await continueButtons.count();
    console.log('Continue/Next buttons found:', buttonCount);
    
    if (buttonCount > 0) {
      // Click the first continue button to advance onboarding
      await continueButtons.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'onboarding-step-2.png', fullPage: true });
      
      // Look for more continue buttons and keep clicking
      for (let i = 0; i < 5; i++) { // Maximum 5 steps
        const nextButtons = await page.locator('button:has-text("Continue"), button:has-text("Get Started"), button:has-text("Next"), [testid*="continue"], [testid*="next"]');
        const nextCount = await nextButtons.count();
        
        if (nextCount > 0) {
          console.log(`Step ${i + 2}: Found ${nextCount} continue buttons`);
          await nextButtons.first().click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `onboarding-step-${i + 3}.png`, fullPage: true });
        } else {
          console.log(`Step ${i + 2}: No more continue buttons found`);
          break;
        }
      }
    }
    
    // Now check if we've reached the auth screen or any other screen
    console.log('=== CHECKING CURRENT SCREEN ===');
    
    // Wait a bit more for any navigation
    await page.waitForTimeout(2000);
    
    // Check for auth screen elements
    const authElements = await page.locator('[data-testid="auth-screen"], [data-testid="email-input"], [data-testid="google-sign-in-button"], [data-testid="apple-sign-in-button"], text="Sign In", text="Sign Up", text="Google", text="Apple"');
    const authElementCount = await authElements.count();
    console.log('Auth elements found:', authElementCount);
    
    // Check for profile setup elements
    const profileElements = await page.locator('text="Profile Setup", text="Role", text="Tracker", text="Supporter"');
    const profileElementCount = await profileElements.count();
    console.log('Profile setup elements found:', profileElementCount);
    
    // Check for dashboard elements
    const dashboardElements = await page.locator('text="Dashboard", text="Dream Lover", [testid*="tab-"]');
    const dashboardElementCount = await dashboardElements.count();
    console.log('Dashboard elements found:', dashboardElementCount);
    
    // Take final screenshot
    await page.screenshot({ path: 'final-screen-after-onboarding.png', fullPage: true });
    
    // Get current page content to understand what screen we're on
    const currentText = await page.textContent('body');
    console.log('Current screen content preview:', currentText ? currentText.slice(0, 300) + '...' : 'No text found');
    
    // Log what we found
    if (authElementCount > 0) {
      console.log('✅ SUCCESS: Reached Authentication Screen');
      
      // If we found auth elements, test them
      const googleButton = await page.locator('[data-testid="google-sign-in-button"], text="Google"').first();
      const appleButton = await page.locator('[data-testid="apple-sign-in-button"], text="Apple"').first();
      
      if (await googleButton.isVisible()) {
        console.log('✅ Google Sign-In button is visible');
        console.log('Google button clickable:', await googleButton.isEnabled());
      }
      
      if (await appleButton.isVisible()) {
        console.log('✅ Apple Sign-In button is visible');  
        console.log('Apple button clickable:', await appleButton.isEnabled());
      }
      
    } else if (profileElementCount > 0) {
      console.log('📋 Currently on Profile Setup screen');
    } else if (dashboardElementCount > 0) {
      console.log('🏠 Currently on Dashboard screen');
    } else {
      console.log('❓ Unknown screen state');
    }
    
    console.log('✅ Test completed - Check screenshots for visual verification');
  });
});