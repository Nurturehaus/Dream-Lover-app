import { test, expect } from '@playwright/test';

test.describe('Sign Up Button Test', () => {
  test('should test sign up button functionality', async ({ page }) => {
    console.log('🔍 Testing sign up button functionality');
    
    // Listen to console for debugging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`Browser [${msg.type()}]:`, msg.text());
      }
    });
    
    // Clear localStorage to ensure we're on the auth screen
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-results/signup-01-initial.png', fullPage: true });
    
    console.log('Step 1: Looking for auth screen');
    
    // Check if we're on auth screen or need to get there
    const hasAuthElements = await page.isVisible('text="Sign In"') || 
                           await page.isVisible('text="Sign in"') ||
                           await page.isVisible('text="Welcome back"');
    
    console.log('Auth elements visible:', hasAuthElements);
    
    if (!hasAuthElements) {
      console.log('Not on auth screen, need to navigate there');
      
      // If we're on onboarding, try to get to auth
      const onboardingButton = page.locator('text="Skip for now"').or(page.locator('text="Sign In"'));
      if (await onboardingButton.isVisible()) {
        await onboardingButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    await page.screenshot({ path: 'test-results/signup-02-auth-screen.png', fullPage: true });
    
    console.log('Step 2: Looking for sign up link');
    
    // Find the sign up link
    const signUpLink = page.locator('text="Sign up"');
    const isSignUpVisible = await signUpLink.isVisible();
    
    console.log('Sign up link visible:', isSignUpVisible);
    
    if (!isSignUpVisible) {
      // Check all text on page
      const allText = await page.locator('body').textContent();
      console.log('Page content:', allText?.slice(0, 500));
      
      // Look for alternative sign up elements
      const altSignUp = await page.isVisible('text="sign up"') || 
                       await page.isVisible('text="Sign Up"') ||
                       await page.isVisible('text="Create account"');
      
      console.log('Alternative sign up text found:', altSignUp);
      
      if (!altSignUp) {
        throw new Error('Sign up link not found');
      }
    }
    
    console.log('Step 3: Clicking sign up link');
    
    // Click the sign up link
    await signUpLink.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/signup-03-after-click.png', fullPage: true });
    
    console.log('Step 4: Checking if sign up mode activated');
    
    // Check if we're now in sign up mode
    const signUpIndicators = [
      'text="Create account"',
      'text="Sign up"',
      'text="Name"',
      'text="Confirm Password"',
      'text="Create Account"',
      'text="Register"'
    ];
    
    let inSignUpMode = false;
    for (const indicator of signUpIndicators) {
      if (await page.isVisible(indicator)) {
        console.log(`✅ Found sign up indicator: ${indicator}`);
        inSignUpMode = true;
        break;
      }
    }
    
    if (!inSignUpMode) {
      console.log('❌ Not in sign up mode after clicking');
      
      // Check what actually changed
      const currentText = await page.locator('body').textContent();
      console.log('Current page content after click:', currentText?.slice(0, 800));
      
      // Look for any form fields that might indicate sign up mode
      const nameField = await page.isVisible('input[placeholder*="Name"]') ||
                       await page.isVisible('[testID="name-input"]');
      const confirmPasswordField = await page.isVisible('input[placeholder*="Confirm"]') ||
                                   await page.isVisible('[testID="confirm-password-input"]');
      
      console.log('Name field visible:', nameField);
      console.log('Confirm password field visible:', confirmPasswordField);
      
      if (nameField || confirmPasswordField) {
        console.log('✅ Found sign up form fields');
        inSignUpMode = true;
      }
    }
    
    if (inSignUpMode) {
      console.log('🎉 SUCCESS: Sign up mode activated!');
      expect(inSignUpMode).toBe(true);
    } else {
      console.log('❌ FAILURE: Sign up button did not work');
      throw new Error('Sign up button did not activate sign up mode');
    }
  });
});