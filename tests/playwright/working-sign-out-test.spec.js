import { test, expect } from '@playwright/test';

test.describe('Working Sign Out Test', () => {
  test('should successfully sign out user with window.confirm', async ({ page }) => {
    console.log('🚀 Testing sign out with fixed window.confirm implementation');
    
    // Listen to console for our debug messages
    page.on('console', msg => {
      console.log(`Browser [${msg.type()}]:`, msg.text());
    });
    
    // Handle confirm dialogs automatically
    page.on('dialog', async dialog => {
      console.log(`Dialog appeared: ${dialog.type()} - "${dialog.message()}"`);
      if (dialog.type() === 'confirm' && dialog.message().includes('Are you sure you want to sign out?')) {
        console.log('✅ Accepting sign out confirmation');
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Set up authenticated user
    await page.evaluate(() => {
      const userData = {
        id: 'working-test-' + Date.now(),
        name: 'Working Test User',
        email: 'working@test.com',
        onboardingCompleted: true,
        profileSetupCompleted: true,
        createdAt: new Date().toISOString(),
        role: 'tracker',
        provider: 'email'
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('hasLaunched', 'true');
      console.log('✅ User setup complete');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-results/working-01-initial.png', fullPage: true });
    
    // Navigate to settings
    await page.locator('text="Profile"').first().click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/working-02-settings.png', fullPage: true });
    
    // Find and click sign out button
    const signOutButton = page.locator('[data-testid="sign-out-button"]');
    
    if (!(await signOutButton.isVisible())) {
      throw new Error('Sign out button not found');
    }
    
    console.log('✅ Found sign out button, clicking...');
    
    // Click the sign out button - this should trigger window.confirm
    await signOutButton.click();
    
    console.log('✅ Clicked sign out button');
    
    // Wait for sign out process to complete
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: 'test-results/working-03-after-signout.png', fullPage: true });
    
    // Check if localStorage was cleared
    const storageCheck = await page.evaluate(() => {
      const userData = localStorage.getItem('userData');
      return {
        userData: userData,
        userDataCleared: !userData || userData === 'null',
        allKeys: Object.keys(localStorage)
      };
    });
    
    console.log('📦 localStorage after sign out:', storageCheck);
    
    // Check if we're back to auth screen
    const authVisible = await page.isVisible('text="I track my cycle"') || 
                       await page.isVisible('text="Welcome"') ||
                       await page.isVisible('text="Get Started"');
    
    console.log('🔄 Auth screen visible:', authVisible);
    
    // Success if EITHER localStorage is cleared OR we're back to auth
    const success = storageCheck.userDataCleared || authVisible;
    
    if (success) {
      console.log('🎉 SUCCESS: Sign out worked perfectly!');
      console.log(`✅ localStorage cleared: ${storageCheck.userDataCleared}`);
      console.log(`✅ Auth screen visible: ${authVisible}`);
      expect(success).toBe(true);
    } else {
      console.log('❌ FAILURE: Sign out did not work');
      console.log('Current page state:', {
        url: page.url(),
        localStorage: storageCheck,
        authVisible
      });
      throw new Error('Sign out failed');
    }
  });
});