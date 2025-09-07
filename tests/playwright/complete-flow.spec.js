// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Complete App Flow', () => {
  test('complete flow from onboarding to dashboard', async ({ page }) => {
    console.log('🚀 Starting complete app flow test...');
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // Phase 1: Complete Onboarding
    console.log('\n=== PHASE 1: ONBOARDING ===');
    
    await page.screenshot({ path: 'test-results/flow-1-onboarding-start.png', fullPage: true });
    
    const nextButton = page.locator('[data-testid="onboarding-next-button"]');
    
    // Welcome -> Role selection
    console.log('Step 1: Welcome to Role selection');
    await nextButton.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/flow-2-role-selection.png', fullPage: true });
    
    // Select tracker role
    console.log('Step 2: Selecting tracker role');
    const trackerButton = page.locator('[data-testid="role-tracker-button"]');
    await trackerButton.click();
    await page.waitForTimeout(1000);
    
    // Continue through onboarding steps
    console.log('Step 3: Continuing through onboarding...');
    await nextButton.click(); // Role -> Connect Partner
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/flow-3-connect-partner.png', fullPage: true });
    
    await nextButton.click(); // Connect Partner -> Insights
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/flow-4-insights.png', fullPage: true });
    
    // Complete onboarding
    console.log('Step 4: Completing onboarding');
    await nextButton.click(); // Insights -> Profile Setup
    await page.waitForTimeout(3000);
    
    // Phase 2: Profile Setup
    console.log('\n=== PHASE 2: PROFILE SETUP ===');
    await page.screenshot({ path: 'test-results/flow-5-profile-setup.png', fullPage: true });
    
    // Check if we're on Profile Setup screen
    const profileSetupRole = await page.locator('[data-testid="role-tracker"]').isVisible();
    console.log('Profile setup screen visible:', profileSetupRole);
    
    if (profileSetupRole) {
      console.log('Selecting role in profile setup...');
      await page.locator('[data-testid="role-tracker"]').click();
      await page.waitForTimeout(1000);
      
      const continueButton = page.locator('[data-testid="continue-button"]');
      console.log('Clicking Continue to complete profile setup...');
      await continueButton.click();
      await page.waitForTimeout(3000);
    }
    
    // Phase 3: Check Final Screen
    console.log('\n=== PHASE 3: FINAL SCREEN ===');
    await page.screenshot({ path: 'test-results/flow-6-final-screen.png', fullPage: true });
    
    // Check what screen we landed on
    const dashboardVisible = await page.locator('[data-testid="dashboard-container"]').isVisible().catch(() => false);
    const authVisible = await page.locator('[data-testid="auth-screen"]').isVisible().catch(() => false);
    const tabsVisible = await page.locator('[data-testid="tab-home"]').isVisible().catch(() => false);
    
    console.log('Dashboard container visible:', dashboardVisible);
    console.log('Auth screen visible:', authVisible);  
    console.log('Navigation tabs visible:', tabsVisible);
    
    // Check for Dream Lover text (indicates dashboard)
    const dreamLoverText = await page.getByText('Dream Lover').isVisible().catch(() => false);
    console.log('Dream Lover text visible:', dreamLoverText);
    
    // Test navigation if tabs are available
    if (tabsVisible) {
      console.log('\n=== TESTING NAVIGATION TABS ===');
      
      // Test Calendar tab
      const calendarTab = page.locator('[data-testid="tab-calendar"]');
      if (await calendarTab.isVisible()) {
        console.log('Testing Calendar tab...');
        await calendarTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/flow-7-calendar.png', fullPage: true });
        
        // Return to home
        const homeTab = page.locator('[data-testid="tab-home"]');
        if (await homeTab.isVisible()) {
          await homeTab.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Test Log tab
      const logTab = page.locator('[data-testid="tab-log"]');
      if (await logTab.isVisible()) {
        console.log('Testing Log tab...');
        await logTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/flow-8-log.png', fullPage: true });
      }
    }
    
    // Test action buttons if available
    console.log('\n=== TESTING ACTION BUTTONS ===');
    
    const logPeriodButton = await page.locator('[data-testid="log-period-button"]').isVisible().catch(() => false);
    const logSymptomsButton = await page.locator('[data-testid="log-symptoms-button"]').isVisible().catch(() => false);
    
    console.log('Log Period button visible:', logPeriodButton);
    console.log('Log Symptoms button visible:', logSymptomsButton);
    
    // Final summary
    console.log('\n=== FLOW COMPLETE ===');
    const finalUrl = page.url();
    const pageTitle = await page.title();
    
    console.log('Final URL:', finalUrl);
    console.log('Final page title:', pageTitle);
    console.log('✅ Complete flow test finished!');
  });
});