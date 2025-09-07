import { test, expect } from '@playwright/test';

test.describe('Sign Out Button Functionality', () => {
  test('should allow user to complete onboarding, navigate to settings, and sign out', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    console.log('Step 1: App loaded, taking screenshot');
    await page.screenshot({ path: 'test-results/01-app-loaded.png', fullPage: true });
    
    // Check if we're on the onboarding screen
    const hasOnboarding = await page.isVisible('text="I track my cycle"');
    
    if (hasOnboarding) {
      console.log('Step 2: Found onboarding screen, selecting role');
      
      // Select "I track my cycle" to proceed as tracker
      await page.click('text="I track my cycle"');
      await page.screenshot({ path: 'test-results/02-selected-tracker-role.png', fullPage: true });
      
      // Wait for next button and click it
      const nextButton = page.locator('text=Next').or(page.locator('[testID="next-button"]'));
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.screenshot({ path: 'test-results/03-clicked-next.png', fullPage: true });
      }
      
      // Complete any additional onboarding steps
      let retries = 0;
      while (retries < 5) {
        // Look for common onboarding completion buttons
        const continueBtn = page.locator('text=Continue').or(
          page.locator('text=Get Started').or(
            page.locator('text=Finish').or(
              page.locator('text=Done').or(
                page.locator('[testID="continue-button"]').or(
                  page.locator('[testID="get-started-button"]').or(
                    page.locator('[testID="finish-button"]')
                  )
                )
              )
            )
          )
        );
        
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
          await page.waitForTimeout(1000); // Wait for navigation
          await page.screenshot({ path: `test-results/04-onboarding-step-${retries}.png`, fullPage: true });
        } else {
          break;
        }
        retries++;
      }
    }
    
    // Wait a bit more for potential navigation
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/05-after-onboarding.png', fullPage: true });
    
    // Check if we can see the main app (tabs)
    console.log('Step 3: Looking for main app navigation');
    const hasMainApp = await page.isVisible('[testID="tab-settings"]') || 
                      await page.isVisible('text="Profile"') ||
                      await page.isVisible('[testID="tab-home"]');
    
    if (hasMainApp) {
      console.log('Step 4: Found main app, navigating to settings');
      
      // Click on the settings/profile tab
      const settingsTab = page.locator('[testID="tab-settings"]').or(page.locator('text="Profile"'));
      if (await settingsTab.isVisible()) {
        await settingsTab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/06-navigated-to-settings.png', fullPage: true });
        
        console.log('Step 5: Looking for sign out button');
        
        // Look for the sign out button
        const signOutButton = page.locator('[testID="sign-out-button"]').or(page.locator('text="Sign Out"'));
        
        if (await signOutButton.isVisible()) {
          console.log('Step 6: Found sign out button, clicking it');
          
          await page.screenshot({ path: 'test-results/07-found-sign-out-button.png', fullPage: true });
          
          // Click the sign out button
          await signOutButton.click();
          
          // Wait for confirmation dialog
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'test-results/08-after-clicking-sign-out.png', fullPage: true });
          
          console.log('Step 7: Looking for confirmation dialog');
          
          // Look for the confirmation dialog
          const confirmDialog = await page.isVisible('text="Are you sure you want to sign out?"') ||
                               await page.isVisible('text="Sign Out"') ||
                               await page.isVisible('[role="dialog"]');
          
          if (confirmDialog) {
            console.log('Step 8: Found confirmation dialog');
            await page.screenshot({ path: 'test-results/09-confirmation-dialog.png', fullPage: true });
            
            // Click confirm sign out
            const confirmButton = page.locator('text="Sign Out"').nth(1); // The confirm button, not the original
            
            if (await confirmButton.isVisible()) {
              await confirmButton.click();
              console.log('Step 9: Clicked confirm sign out');
              
              // Wait for sign out to complete
              await page.waitForTimeout(3000);
              await page.screenshot({ path: 'test-results/10-after-sign-out.png', fullPage: true });
              
              console.log('Step 10: Verifying sign out completed');
              
              // Check if we're back to auth/onboarding screen
              const backToAuth = await page.isVisible('text="I track my cycle"') ||
                                await page.isVisible('text="Sign In"') ||
                                await page.isVisible('text="Welcome"') ||
                                await page.isVisible('text="Get Started"');
              
              if (backToAuth) {
                console.log('✅ SUCCESS: Sign out worked! User returned to auth screen');
                await page.screenshot({ path: 'test-results/11-success-back-to-auth.png', fullPage: true });
                
                expect(backToAuth).toBe(true);
              } else {
                console.log('❌ FAILURE: Sign out did not redirect to auth screen');
                await page.screenshot({ path: 'test-results/11-failure-still-logged-in.png', fullPage: true });
                
                // Log what we can see on screen
                const bodyText = await page.locator('body').textContent();
                console.log('Current page content:', bodyText?.slice(0, 500));
                
                throw new Error('Sign out failed - user was not redirected to auth screen');
              }
            } else {
              throw new Error('Confirmation button not found in dialog');
            }
          } else {
            console.log('❌ FAILURE: No confirmation dialog appeared');
            
            // Check if we're looking at the right elements
            const allDialogTexts = await page.locator('body').textContent();
            console.log('Page content after clicking sign out:', allDialogTexts?.slice(0, 1000));
            
            throw new Error('No confirmation dialog appeared after clicking sign out');
          }
        } else {
          throw new Error('Sign out button not found on settings page');
        }
      } else {
        throw new Error('Settings tab not found');
      }
    } else {
      console.log('❌ FAILURE: Could not access main app');
      
      // Log what we can see
      const bodyText = await page.locator('body').textContent();
      console.log('Current page content:', bodyText?.slice(0, 500));
      
      throw new Error('Could not navigate past onboarding to main app');
    }
  });

  test('should find sign out button with correct testID', async ({ page }) => {
    // This test focuses specifically on finding the sign out button
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Try to bypass onboarding by setting localStorage
    await page.evaluate(() => {
      const userData = {
        id: 'test-user-123',
        name: 'Test User',
        email: 'test@example.com',
        onboardingCompleted: true,
        profileSetupCompleted: true,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('hasLaunched', 'true');
    });
    
    // Reload to apply the changes
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/bypass-test-after-reload.png', fullPage: true });
    
    // Now try to find settings
    const settingsTab = page.locator('[testID="tab-settings"]');
    
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(1000);
      
      // Look for sign out button with testID
      const signOutButton = page.locator('[testID="sign-out-button"]');
      const isVisible = await signOutButton.isVisible();
      
      console.log('Sign out button with testID visible:', isVisible);
      
      if (isVisible) {
        await page.screenshot({ path: 'test-results/sign-out-button-found.png', fullPage: true });
        expect(isVisible).toBe(true);
      } else {
        // Check if any sign out text exists
        const signOutText = await page.isVisible('text="Sign Out"');
        console.log('Sign out text found:', signOutText);
        
        await page.screenshot({ path: 'test-results/sign-out-button-not-found.png', fullPage: true });
        throw new Error('Sign out button with testID not found');
      }
    } else {
      throw new Error('Could not access settings page even after localStorage bypass');
    }
  });
});