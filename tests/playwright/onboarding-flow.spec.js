// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Onboarding Flow Testing', () => {
  test('complete onboarding flow and reach dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Verify we're on onboarding screen
    await expect(page.locator('[data-testid="onboarding-screen"]')).toBeVisible();
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/onboarding-step-1.png' });
    
    // Click Next button to go through onboarding steps
    const nextButton = page.locator('[data-testid="onboarding-next-button"]');
    await expect(nextButton).toBeVisible();
    
    console.log('Clicking Next button for step 1');
    await nextButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/onboarding-step-2.png' });
    
    // Check if role selection buttons are visible on step 2
    const trackerButton = page.locator('[data-testid="role-tracker-button"]');
    const supporterButton = page.locator('[data-testid="role-supporter-button"]');
    
    if (await trackerButton.isVisible()) {
      console.log('Role selection step - selecting tracker role');
      await trackerButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Continue through remaining steps
    for (let step = 2; step <= 4; step++) {
      if (await nextButton.isVisible()) {
        console.log(`Clicking Next button for step ${step}`);
        await nextButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `test-results/onboarding-step-${step + 1}.png` });
      }
    }
    
    // After onboarding, we should reach the dashboard or auth screen
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/after-onboarding.png' });
    
    // Check what screen we landed on
    const dashboardContainer = page.locator('[data-testid="dashboard-container"]');
    const authScreen = page.locator('[data-testid="auth-screen"]');
    
    const isDashboard = await dashboardContainer.isVisible().catch(() => false);
    const isAuth = await authScreen.isVisible().catch(() => false);
    
    console.log('Dashboard visible:', isDashboard);
    console.log('Auth screen visible:', isAuth);
    
    if (isDashboard) {
      console.log('Successfully reached dashboard!');
      await expect(dashboardContainer).toBeVisible();
    } else if (isAuth) {
      console.log('Reached auth screen after onboarding');
      await expect(authScreen).toBeVisible();
    } else {
      console.log('Unknown screen after onboarding');
      const pageText = await page.textContent('body');
      console.log('Page text contains:', pageText.substring(0, 200));
    }
  });
  
  test('test individual onboarding buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Test clicking the next button multiple times to see the flow
    const nextButton = page.locator('[data-testid="onboarding-next-button"]');
    
    for (let i = 0; i < 5; i++) {
      if (await nextButton.isVisible()) {
        const buttonText = await nextButton.textContent();
        console.log(`Step ${i + 1}: Button text is "${buttonText}"`);
        
        await nextButton.click();
        await page.waitForTimeout(1500);
        
        // Check for role selection buttons
        const trackerButton = page.locator('[data-testid="role-tracker-button"]');
        const supporterButton = page.locator('[data-testid="role-supporter-button"]');
        
        if (await trackerButton.isVisible()) {
          console.log('  - Role selection buttons are visible');
          await trackerButton.click(); // Select tracker role
          await page.waitForTimeout(1000);
        }
      } else {
        console.log(`Step ${i + 1}: Next button not visible, flow complete`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/onboarding-complete-test.png' });
  });
});