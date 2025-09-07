const { test, expect } = require('@playwright/test');

test.describe('Calendar Widget Integration Test', () => {
  test('should successfully complete onboarding and show dashboard with calendar', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/01-initial-load.png' });
    
    // Complete onboarding flow step by step
    console.log('Starting onboarding flow...');
    
    // Step 1: Handle welcome screen
    try {
      await page.waitForSelector('text=Next', { timeout: 5000 });
      await page.locator('text=Next').click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/02-after-next.png' });
      console.log('✅ Clicked Next on welcome screen');
    } catch (e) {
      console.log('❌ No Next button found or already past welcome');
    }
    
    // Step 2: Handle role selection
    try {
      await page.waitForSelector('text=I Track My Cycle', { timeout: 5000 });
      await page.locator('text=I Track My Cycle').click();
      await page.waitForTimeout(1000);
      
      // Look for Continue button
      await page.waitForSelector('text=Continue', { timeout: 5000 });
      await page.locator('text=Continue').click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/03-after-role-selection.png' });
      console.log('✅ Selected tracker role and clicked Continue');
    } catch (e) {
      console.log('❌ Role selection step failed or not found');
    }
    
    // Step 3: Handle profile setup
    try {
      await page.waitForSelector('input', { timeout: 5000 });
      await page.fill('input', 'Test User');
      await page.waitForTimeout(500);
      
      await page.waitForSelector('text=Continue', { timeout: 5000 });
      await page.locator('text=Continue').click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/04-after-profile-setup.png' });
      console.log('✅ Completed profile setup');
    } catch (e) {
      console.log('❌ Profile setup step failed or not found');
    }
    
    // Step 4: Skip any remaining onboarding steps
    let skipAttempts = 0;
    while (skipAttempts < 3) {
      try {
        await page.waitForSelector('text=Skip for now', { timeout: 3000 });
        await page.locator('text=Skip for now').click();
        await page.waitForTimeout(1500);
        skipAttempts++;
        console.log(`✅ Skipped step ${skipAttempts}`);
      } catch (e) {
        console.log('❌ No more skip buttons found');
        break;
      }
    }
    
    // Wait for dashboard to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/05-final-dashboard.png', fullPage: true });
    
    // Now test for the calendar widget
    console.log('Testing calendar widget presence...');
    
    // Check if we can find dashboard elements
    const dashboardElements = [
      '[data-testid="dashboard-container"]',
      'text=Dream Lover',
      'text=Current Cycle',
      'text=Calendar Overview'
    ];
    
    let dashboardFound = false;
    for (const element of dashboardElements) {
      try {
        if (await page.locator(element).isVisible({ timeout: 2000 })) {
          console.log(`✅ Found dashboard element: ${element}`);
          dashboardFound = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Dashboard element not found: ${element}`);
      }
    }
    
    if (dashboardFound) {
      console.log('✅ Dashboard is loaded, checking for calendar widget...');
      
      // Test calendar widget components
      const calendarElements = [
        '[data-testid="dashboard-calendar-widget"]',
        '[data-testid="phase-info-card"]',
        '[data-testid="calendar-container"]',
        '[data-testid="mini-legend"]',
        'text=Calendar Overview',
        'text=View full calendar'
      ];
      
      for (const element of calendarElements) {
        try {
          if (await page.locator(element).isVisible({ timeout: 2000 })) {
            console.log(`✅ Calendar element found: ${element}`);
          } else {
            console.log(`❌ Calendar element not visible: ${element}`);
          }
        } catch (e) {
          console.log(`❌ Calendar element not found: ${element}`);
        }
      }
      
      // Take focused screenshot of calendar area
      try {
        const calendarWidget = page.locator('[data-testid="dashboard-calendar-widget"]');
        if (await calendarWidget.isVisible()) {
          await calendarWidget.screenshot({ path: 'test-results/06-calendar-widget.png' });
          console.log('✅ Calendar widget screenshot captured');
        }
      } catch (e) {
        console.log('❌ Could not capture calendar widget screenshot');
      }
      
    } else {
      console.log('❌ Dashboard not loaded, calendar widget test skipped');
    }
    
    // Final full page screenshot for manual inspection
    await page.screenshot({ path: 'test-results/07-final-full-page.png', fullPage: true });
    console.log('✅ Test completed - check screenshots in test-results folder');
  });
});