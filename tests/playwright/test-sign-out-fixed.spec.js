import { test, expect } from '@playwright/test';

test.describe('Sign Out Button - Fixed Tests', () => {
  test('should successfully sign out user on port 3000', async ({ page }) => {
    console.log('🚀 Starting sign out test on port 3000');
    
    // Navigate to the correct port
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('Step 1: Setting up authenticated user state');
    
    // Set up localStorage with a valid user to bypass onboarding
    await page.evaluate(() => {
      const userData = {
        id: 'test-user-' + Date.now(),
        name: 'Test User',
        email: 'test@caresync.app',
        onboardingCompleted: true,
        profileSetupCompleted: true,
        createdAt: new Date().toISOString(),
        role: 'tracker'
      };
      
      // Set the required localStorage keys
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('hasLaunched', 'true');
      
      console.log('✅ Initialized user data:', userData);
    });
    
    // Reload to apply the localStorage changes
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for React to re-render
    
    console.log('Step 2: Verifying we bypassed onboarding');
    await page.screenshot({ path: 'test-results/01-after-user-setup.png', fullPage: true });
    
    // Check if we can see the main app navigation
    const hasMainNav = await page.isVisible('[testID="tab-settings"]') || 
                      await page.isVisible('[testID="tab-home"]') ||
                      await page.isVisible('text="Profile"');
    
    if (!hasMainNav) {
      console.log('❌ Main navigation not found, checking page content');
      const pageContent = await page.locator('body').textContent();
      console.log('Current page content:', pageContent?.slice(0, 500));
      
      // Try clicking any onboarding elements that might be present
      const trackerButton = page.locator('text="I track my cycle"');
      if (await trackerButton.isVisible()) {
        console.log('Found onboarding, clicking tracker option');
        await trackerButton.click();
        await page.waitForTimeout(1000);
        
        // Look for next/continue buttons
        const nextButtons = [
          page.locator('text=Next'),
          page.locator('text=Continue'), 
          page.locator('text=Get Started'),
          page.locator('[testID="next-button"]'),
          page.locator('[testID="continue-button"]')
        ];
        
        for (const button of nextButtons) {
          if (await button.isVisible()) {
            await button.click();
            await page.waitForTimeout(1000);
            break;
          }
        }
      }
      
      await page.waitForTimeout(2000);
    }
    
    console.log('Step 3: Navigating to settings page');
    await page.screenshot({ path: 'test-results/02-before-settings-nav.png', fullPage: true });
    
    // Try different ways to access settings
    const settingsSelectors = [
      '[testID="tab-settings"]',
      'text="Profile"',
      '[data-testid="tab-settings"]',
      '[role="tab"]:has-text("Profile")'
    ];
    
    let settingsClicked = false;
    for (const selector of settingsSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        console.log(`Found settings element with selector: ${selector}`);
        await element.click();
        await page.waitForTimeout(1000);
        settingsClicked = true;
        break;
      }
    }
    
    if (!settingsClicked) {
      throw new Error('Could not find or click settings tab');
    }
    
    await page.screenshot({ path: 'test-results/03-settings-page-loaded.png', fullPage: true });
    
    console.log('Step 4: Looking for sign out button');
    
    // Look for the sign out button with multiple strategies
    const signOutSelectors = [
      '[testID="sign-out-button"]',
      'text="Sign Out"',
      '[data-testid="sign-out-button"]',
      'button:has-text("Sign Out")'
    ];
    
    let signOutButton = null;
    for (const selector of signOutSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        console.log(`✅ Found sign out button with selector: ${selector}`);
        signOutButton = element;
        break;
      }
    }
    
    if (!signOutButton) {
      console.log('❌ Sign out button not found, checking page content');
      const pageText = await page.locator('body').textContent();
      console.log('Settings page content:', pageText?.slice(0, 1000));
      throw new Error('Sign out button not found on settings page');
    }
    
    console.log('Step 5: Clicking sign out button');
    await page.screenshot({ path: 'test-results/04-found-sign-out-button.png', fullPage: true });
    
    // Click the sign out button
    await signOutButton.click();
    await page.waitForTimeout(1500); // Wait for dialog to appear
    
    await page.screenshot({ path: 'test-results/05-after-sign-out-click.png', fullPage: true });
    
    console.log('Step 6: Looking for confirmation dialog');
    
    // Check for various dialog patterns
    const confirmationPatterns = [
      'text="Are you sure you want to sign out?"',
      'text="Sign Out"',
      '[role="dialog"]',
      '[role="alertdialog"]',
      '.modal', // If using a modal component
      '[data-testid="alert-dialog"]'
    ];
    
    let confirmationFound = false;
    for (const pattern of confirmationPatterns) {
      if (await page.isVisible(pattern)) {
        console.log(`✅ Found confirmation dialog with pattern: ${pattern}`);
        confirmationFound = true;
        break;
      }
    }
    
    if (confirmationFound) {
      console.log('Step 7: Confirming sign out');
      
      // Look for the confirm button (usually the second "Sign Out" text or a confirm button)
      const confirmSelectors = [
        'text="Sign Out"',
        'button:has-text("Sign Out")',
        '[testID="confirm-sign-out"]',
        '[role="button"]:has-text("Sign Out")'
      ];
      
      // Try to find the confirmation button (usually there will be 2 "Sign Out" texts)
      const signOutElements = await page.locator('text="Sign Out"').all();
      
      if (signOutElements.length >= 2) {
        // Click the second "Sign Out" (the confirmation button)
        await signOutElements[1].click();
        console.log('✅ Clicked confirmation button');
      } else {
        // Try other confirmation button selectors
        let confirmed = false;
        for (const selector of confirmSelectors) {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            await element.click();
            confirmed = true;
            console.log(`✅ Confirmed with selector: ${selector}`);
            break;
          }
        }
        
        if (!confirmed) {
          throw new Error('Could not find confirmation button in dialog');
        }
      }
      
      console.log('Step 8: Waiting for sign out to complete');
      await page.waitForTimeout(3000); // Wait for sign out process
      
      await page.screenshot({ path: 'test-results/06-after-sign-out-confirmation.png', fullPage: true });
      
      console.log('Step 9: Verifying user was signed out');
      
      // Check if user was signed out by looking for auth/onboarding screens
      const authIndicators = [
        'text="I track my cycle"',
        'text="Welcome"',
        'text="Get Started"',
        'text="Sign In"',
        'text="Sign Up"',
        'text="Welcome to CareSync"'
      ];
      
      let backToAuth = false;
      for (const indicator of authIndicators) {
        if (await page.isVisible(indicator)) {
          console.log(`✅ Found auth indicator: ${indicator}`);
          backToAuth = true;
          break;
        }
      }
      
      // Also check localStorage was cleared
      const userDataCleared = await page.evaluate(() => {
        const userData = localStorage.getItem('userData');
        return !userData || userData === 'null';
      });
      
      console.log('User data cleared from localStorage:', userDataCleared);
      
      if (backToAuth || userDataCleared) {
        console.log('✅ SUCCESS: User was successfully signed out!');
        await page.screenshot({ path: 'test-results/07-success-signed-out.png', fullPage: true });
        
        // Assert success
        expect(backToAuth || userDataCleared).toBe(true);
      } else {
        console.log('❌ FAILURE: User was not signed out properly');
        const currentContent = await page.locator('body').textContent();
        console.log('Current page content after sign out attempt:', currentContent?.slice(0, 500));
        
        await page.screenshot({ path: 'test-results/07-failure-not-signed-out.png', fullPage: true });
        throw new Error('Sign out failed - user was not redirected to auth screen and localStorage not cleared');
      }
      
    } else {
      console.log('❌ FAILURE: No confirmation dialog appeared');
      const pageContent = await page.locator('body').textContent();
      console.log('Page content after clicking sign out:', pageContent?.slice(0, 1000));
      throw new Error('No confirmation dialog appeared after clicking sign out button');
    }
  });
  
  test('should verify sign out button exists with correct testID', async ({ page }) => {
    console.log('🔍 Testing sign out button testID');
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Set up authenticated user
    await page.evaluate(() => {
      const userData = {
        id: 'testid-user-' + Date.now(),
        name: 'TestID User',
        email: 'testid@caresync.app',
        onboardingCompleted: true,
        profileSetupCompleted: true,
        createdAt: new Date().toISOString(),
        role: 'tracker'
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('hasLaunched', 'true');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to settings
    const settingsTab = page.locator('[testID="tab-settings"]').or(page.locator('text="Profile"'));
    
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(1000);
      
      // Check for sign out button with specific testID
      const signOutButton = page.locator('[testID="sign-out-button"]');
      const isVisible = await signOutButton.isVisible();
      
      console.log('Sign out button with testID="sign-out-button" visible:', isVisible);
      
      if (isVisible) {
        console.log('✅ SUCCESS: Sign out button found with correct testID');
        await page.screenshot({ path: 'test-results/testid-verification-success.png', fullPage: true });
        expect(isVisible).toBe(true);
      } else {
        console.log('❌ FAILURE: Sign out button testID not found');
        
        // Check if any sign out text exists at all
        const hasSignOutText = await page.isVisible('text="Sign Out"');
        console.log('Has "Sign Out" text:', hasSignOutText);
        
        await page.screenshot({ path: 'test-results/testid-verification-failure.png', fullPage: true });
        throw new Error('Sign out button with testID="sign-out-button" not found');
      }
    } else {
      throw new Error('Could not access settings page to verify testID');
    }
  });
});