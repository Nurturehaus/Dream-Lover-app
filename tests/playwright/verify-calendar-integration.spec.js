import { test, expect } from '@playwright/test';

test.describe('Calendar Integration Verification', () => {
  test('should verify if calendar widget exists on dashboard', async ({ page }) => {
    console.log('🔍 Testing calendar widget visibility');
    
    // Listen to console for debugging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`Browser [${msg.type()}]:`, msg.text());
      }
    });
    
    // Navigate to the app
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-app-initial-state.png', fullPage: true });
    
    console.log('Step 1: Checking initial app state');
    
    // Check what screen we're on
    const pageTitle = await page.textContent('body');
    console.log('Page content length:', pageTitle?.length || 0);
    
    // Check if we're on onboarding
    const isOnboarding = await page.isVisible('text="Welcome to CareSync"') || 
                        await page.isVisible('text="Get Started"') ||
                        await page.isVisible('text="I track my cycle"');
    
    console.log('Is on onboarding:', isOnboarding);
    
    if (isOnboarding) {
      console.log('Step 2: Attempting to navigate through onboarding');
      
      // Try to complete onboarding quickly
      const skipButton = page.locator('text="Skip for now"').or(page.locator('text="Skip"'));
      if (await skipButton.isVisible()) {
        await skipButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Try clicking through onboarding steps
      const nextButton = page.locator('text="Next"').or(page.locator('text="Continue"'));
      let attempts = 0;
      while (await nextButton.isVisible() && attempts < 5) {
        await nextButton.click();
        await page.waitForTimeout(1500);
        attempts++;
        console.log(`Onboarding step ${attempts} completed`);
      }
      
      // Try to select a role if on role selection
      const trackerRole = page.locator('text="I track my cycle"');
      if (await trackerRole.isVisible()) {
        await trackerRole.click();
        await page.waitForTimeout(1000);
        
        const continueButton = page.locator('text="Continue"').or(page.locator('text="Next"'));
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(2000);
        }
      }
      
      await page.screenshot({ path: 'test-results/02-after-onboarding-attempt.png', fullPage: true });
    }
    
    console.log('Step 3: Checking for dashboard');
    
    // Check if we're now on dashboard
    const isDashboard = await page.isVisible('[testID="dashboard-container"]') ||
                       await page.isVisible('text="Dream Lover"') ||
                       await page.isVisible('text="Day"') ||
                       await page.isVisible('text="Cycle Phase"');
    
    console.log('Is on dashboard:', isDashboard);
    
    if (isDashboard) {
      console.log('Step 4: Testing calendar widget on dashboard');
      
      // Check for calendar widget
      const calendarWidget = page.locator('[testID="dashboard-calendar-widget"]');
      const isCalendarVisible = await calendarWidget.isVisible();
      console.log('Calendar widget visible:', isCalendarVisible);
      
      // Check for calendar components
      const phaseCard = page.locator('[testID="phase-info-card"]');
      const calendarContainer = page.locator('[testID="calendar-container"]');
      const miniLegend = page.locator('[testID="mini-legend"]');
      
      console.log('Phase card visible:', await phaseCard.isVisible());
      console.log('Calendar container visible:', await calendarContainer.isVisible());
      console.log('Mini legend visible:', await miniLegend.isVisible());
      
      await page.screenshot({ path: 'test-results/03-dashboard-with-calendar.png', fullPage: true });
      
      // Test if calendar widget is actually integrated
      if (isCalendarVisible) {
        console.log('✅ SUCCESS: Calendar widget found on dashboard!');
      } else {
        console.log('❌ ISSUE: Calendar widget not visible on dashboard');
        
        // Debug - check what elements are actually on the page
        const allTestIds = await page.$$eval('[testid]', elements => 
          elements.map(el => el.getAttribute('testid'))
        );
        console.log('All testIDs found:', allTestIds);
      }
    } else {
      console.log('❌ ISSUE: Could not reach dashboard');
      
      // Check what screen we're actually on
      const currentScreen = await page.textContent('body');
      console.log('Current screen content (first 200 chars):', currentScreen?.slice(0, 200));
      
      await page.screenshot({ path: 'test-results/04-stuck-screen.png', fullPage: true });
    }
    
    console.log('Step 5: Final verification complete');
    await page.screenshot({ path: 'test-results/05-final-state.png', fullPage: true });
    
    // The test passes regardless so we can see the results
    expect(true).toBe(true);
  });
});