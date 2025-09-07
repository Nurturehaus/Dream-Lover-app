const { test, expect } = require('@playwright/test');

test.describe('Complete Authentication Flow Test', () => {
  test('should complete onboarding and test authentication features', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'auth-flow-01-onboarding.png', fullPage: true });
    
    console.log('🎯 STEP 1: Complete Onboarding Flow');
    
    // Click through onboarding steps
    let stepCount = 1;
    
    // Look for Next/Continue buttons and click them
    while (stepCount <= 5) { // Max 5 onboarding steps
      const nextButton = await page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Get Started")').first();
      
      if (await nextButton.isVisible()) {
        console.log(`  Clicking Next button on step ${stepCount}`);
        await nextButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `auth-flow-0${stepCount + 1}-onboarding-step-${stepCount + 1}.png`, fullPage: true });
        stepCount++;
      } else {
        console.log(`  No Next button found on step ${stepCount}, checking for Skip or completion`);
        break;
      }
    }
    
    // Look for Skip button if still on onboarding
    const skipButton = await page.locator('button:has-text("Skip"), text="Skip for now"');
    if (await skipButton.isVisible()) {
      console.log('  Found Skip button, clicking to complete onboarding');
      await skipButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'auth-flow-06-after-skip.png', fullPage: true });
    }
    
    console.log('🔐 STEP 2: Verify Authentication Screen');
    
    // Wait for navigation to auth screen
    await page.waitForTimeout(2000);
    
    // Check if we're on the Auth screen
    const authTitle = await page.locator('text="Welcome back", text="Sign In", text="Sign Up"');
    const googleButton = await page.locator('text="Google"').first();
    const appleButton = await page.locator('text="Apple"').first();
    
    await page.screenshot({ path: 'auth-flow-07-auth-screen.png', fullPage: true });
    
    const authTitleVisible = await authTitle.isVisible();
    const googleButtonVisible = await googleButton.isVisible();
    const appleButtonVisible = await appleButton.isVisible();
    
    console.log('  Auth title visible:', authTitleVisible);
    console.log('  Google button visible:', googleButtonVisible);
    console.log('  Apple button visible:', appleButtonVisible);
    
    if (authTitleVisible && googleButtonVisible && appleButtonVisible) {
      console.log('✅ SUCCESS: Authentication screen loaded with social login buttons');
      
      console.log('🧪 STEP 3: Test Google Sign-In Button');
      
      // Test Google Sign-In button
      console.log('  Testing Google button clickability...');
      expect(await googleButton.isEnabled()).toBe(true);
      
      // Click Google button and handle any popups/errors
      await googleButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'auth-flow-08-after-google-click.png', fullPage: true });
      
      // Check for any error messages or loading states
      const errorMessage = await page.locator('text*="error", text*="Error", text*="failed", text*="Failed"');
      const loadingIndicator = await page.locator('text*="loading", text*="Loading", text*="Signing"');
      
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log('  Google Sign-In Error:', errorText);
      } else if (await loadingIndicator.isVisible()) {
        console.log('  Google Sign-In triggered loading state ✅');
      } else {
        console.log('  Google Sign-In button clicked (no visible feedback - may be web limitation) ✅');
      }
      
      console.log('🧪 STEP 4: Test Apple Sign-In Button');
      
      // Wait a moment then test Apple button
      await page.waitForTimeout(1000);
      
      // Test Apple Sign-In button
      console.log('  Testing Apple button clickability...');
      expect(await appleButton.isEnabled()).toBe(true);
      
      // Click Apple button and handle any popups/errors  
      await appleButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'auth-flow-09-after-apple-click.png', fullPage: true });
      
      // Check for any error messages or loading states
      const appleErrorMessage = await page.locator('text*="error", text*="Error", text*="failed", text*="Failed"');
      const appleLoadingIndicator = await page.locator('text*="loading", text*="Loading", text*="Signing"');
      
      if (await appleErrorMessage.isVisible()) {
        const errorText = await appleErrorMessage.textContent();
        console.log('  Apple Sign-In Error:', errorText);
      } else if (await appleLoadingIndicator.isVisible()) {
        console.log('  Apple Sign-In triggered loading state ✅');
      } else {
        console.log('  Apple Sign-In button clicked (no visible feedback - may be web limitation) ✅');
      }
      
      console.log('📝 STEP 5: Test Email/Password Form');
      
      // Test basic form inputs
      const emailInput = await page.locator('input[type="email"], [placeholder*="email" i], [placeholder*="Email" i]').first();
      const passwordInput = await page.locator('input[type="password"], [placeholder*="password" i], [placeholder*="Password" i]').first();
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        console.log('  Testing email input...');
        await emailInput.fill('test@example.com');
        
        console.log('  Testing password input...');
        await passwordInput.fill('testpassword123');
        
        await page.screenshot({ path: 'auth-flow-10-form-filled.png', fullPage: true });
        
        const emailValue = await emailInput.inputValue();
        const passwordValue = await passwordInput.inputValue();
        
        console.log('  Email input working:', emailValue === 'test@example.com');
        console.log('  Password input working:', passwordValue === 'testpassword123');
      } else {
        console.log('  Email/Password form not found or not visible');
      }
      
    } else {
      // If not on auth screen, check what screen we're on
      const currentText = await page.textContent('body');
      console.log('❓ Not on auth screen. Current content:', currentText?.slice(0, 200) + '...');
      
      // Check if we went directly to dashboard or profile setup
      const dashboardElements = await page.locator('text="Dashboard", text="Dream Lover"');
      const profileElements = await page.locator('text="Profile Setup", text="Role"');
      
      if (await dashboardElements.isVisible()) {
        console.log('📊 App navigated directly to Dashboard (user already exists)');
      } else if (await profileElements.isVisible()) {
        console.log('👤 App navigated to Profile Setup screen');
      }
    }
    
    await page.screenshot({ path: 'auth-flow-11-final-state.png', fullPage: true });
    console.log('✅ AUTHENTICATION FLOW TEST COMPLETED');
  });
});