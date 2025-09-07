import { test, expect } from '@playwright/test';

test.describe('Simple Sign Out Test', () => {
  test('should successfully sign out user', async ({ page }) => {
    console.log('🚀 Testing sign out functionality');
    
    // Listen to console for debugging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`Console [${msg.type()}]:`, msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Set up authenticated user
    await page.evaluate(() => {
      const userData = {
        id: 'simple-test-' + Date.now(),
        name: 'Simple Test User',
        email: 'simple@test.com',
        onboardingCompleted: true,
        profileSetupCompleted: true,
        createdAt: new Date().toISOString(),
        role: 'tracker',
        provider: 'email'
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('hasLaunched', 'true');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Navigate to settings using text selector (avoids duplicate element issue)
    const profileTab = page.locator('text="Profile"').first();
    await profileTab.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/simple-01-settings.png', fullPage: true });
    
    // Find sign out button using our fixed data-testid
    const signOutButton = page.locator('[data-testid="sign-out-button"]');
    
    if (!(await signOutButton.isVisible())) {
      throw new Error('Sign out button not found');
    }
    
    console.log('✅ Found sign out button');
    
    // Click sign out
    await signOutButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/simple-02-dialog.png', fullPage: true });
    
    // Handle confirmation - get all "Sign Out" text elements and click the last one
    const signOutTexts = page.locator('text="Sign Out"');
    const count = await signOutTexts.count();
    console.log(`Found ${count} "Sign Out" elements`);
    
    if (count >= 2) {
      // Click the confirmation button (usually the last one)
      await signOutTexts.nth(-1).click();
    } else {
      // Fallback: click any "Sign Out" we can find
      await signOutTexts.first().click();
    }
    
    console.log('✅ Clicked sign out confirmation');
    
    // Wait for sign out to complete
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: 'test-results/simple-03-after-signout.png', fullPage: true });
    
    // Check if localStorage was cleared
    const storageCleared = await page.evaluate(() => {
      const userData = localStorage.getItem('userData');
      return !userData || userData === 'null';
    });
    
    console.log('localStorage cleared:', storageCleared);
    
    // Check if we're back to auth screen
    const authVisible = await page.isVisible('text="I track my cycle"') || 
                       await page.isVisible('text="Welcome"') ||
                       await page.isVisible('text="Get Started"');
    
    console.log('Auth screen visible:', authVisible);
    
    // Success if EITHER condition is met
    const success = storageCleared || authVisible;
    
    if (success) {
      console.log('🎉 SUCCESS: Sign out worked!');
      expect(success).toBe(true);
    } else {
      console.log('❌ FAILURE: Sign out did not work');
      throw new Error('Sign out failed');
    }
  });
});