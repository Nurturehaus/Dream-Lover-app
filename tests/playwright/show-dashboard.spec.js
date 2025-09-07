// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Navigate to Dashboard', () => {
  test('complete onboarding and show dashboard', async ({ page }) => {
    // Go to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    console.log('Starting onboarding flow...');
    
    // Take screenshot of onboarding start
    await page.screenshot({ path: 'test-results/1-onboarding-start.png', fullPage: true });
    
    // Click through onboarding steps
    const nextButton = page.locator('[data-testid="onboarding-next-button"]');
    
    // Step 1: Welcome screen -> Step 2: Role selection
    console.log('Step 1: Clicking Next from Welcome screen');
    await nextButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/2-role-selection.png', fullPage: true });
    
    // Step 2: Select role (tracker)
    console.log('Step 2: Selecting "I track my cycle" role');
    const trackerButton = page.locator('[data-testid="role-tracker-button"]');
    await trackerButton.click();
    await page.waitForTimeout(1000);
    
    // Continue to step 3
    await nextButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/3-connect-partner.png', fullPage: true });
    
    // Step 3: Connect with partner -> Step 4
    console.log('Step 3: Clicking Next from Connect Partner screen');
    await nextButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/4-insights.png', fullPage: true });
    
    // Step 4: Get insights -> Finish onboarding
    console.log('Step 4: Clicking "Get Started" to finish onboarding');
    await nextButton.click();
    await page.waitForTimeout(3000);
    
    // Take screenshot of what we land on after onboarding
    await page.screenshot({ path: 'test-results/5-after-onboarding.png', fullPage: true });
    
    // Check what screen we're on
    const dashboardContainer = page.locator('[data-testid="dashboard-container"]');
    const authScreen = page.locator('[data-testid="auth-screen"]');
    
    const isDashboard = await dashboardContainer.isVisible().catch(() => false);
    const isAuth = await authScreen.isVisible().catch(() => false);
    
    console.log('Dashboard visible:', isDashboard);
    console.log('Auth screen visible:', isAuth);
    
    if (isDashboard) {
      console.log('SUCCESS: Reached dashboard!');
      
      // Take detailed dashboard screenshot
      await page.screenshot({ path: 'test-results/DASHBOARD-VIEW.png', fullPage: true });
      
      // Check dashboard elements
      const dreamLover = page.getByText('Dream Lover');
      if (await dreamLover.isVisible()) {
        console.log('✅ Dream Lover title found');
      }
      
      // Check for action buttons
      const logPeriodButton = page.locator('[data-testid="log-period-button"]');
      const logSymptomsButton = page.locator('[data-testid="log-symptoms-button"]');
      
      console.log('Log Period button visible:', await logPeriodButton.isVisible().catch(() => false));
      console.log('Log Symptoms button visible:', await logSymptomsButton.isVisible().catch(() => false));
      
      // Try clicking navigation tabs
      const tabCalendar = page.locator('[data-testid="tab-calendar"]');
      const tabLog = page.locator('[data-testid="tab-log"]');
      
      if (await tabCalendar.isVisible()) {
        console.log('✅ Navigation tabs found - clicking Calendar tab');
        await tabCalendar.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/CALENDAR-VIEW.png', fullPage: true });
        
        // Go back to dashboard
        const tabHome = page.locator('[data-testid="tab-home"]');
        if (await tabHome.isVisible()) {
          await tabHome.click();
          await page.waitForTimeout(1000);
        }
      }
      
      if (await tabLog.isVisible()) {
        console.log('✅ Clicking Log tab');
        await tabLog.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/LOG-VIEW.png', fullPage: true });
      }
      
    } else if (isAuth) {
      console.log('Landed on auth screen - need to sign up/in first');
      await page.screenshot({ path: 'test-results/AUTH-SCREEN.png', fullPage: true });
      
      // Try to sign up
      const emailInput = page.locator('input[placeholder*="email"], input[type="email"]');
      const passwordInput = page.locator('input[placeholder*="password"], input[type="password"]');
      const nameInput = page.locator('input[placeholder*="name"]');
      
      if (await nameInput.isVisible()) {
        console.log('Filling sign up form...');
        await nameInput.fill('Test User');
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');
        
        const signUpButton = page.getByText('Sign Up');
        if (await signUpButton.isVisible()) {
          await signUpButton.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'test-results/AFTER-SIGNUP.png', fullPage: true });
        }
      }
      
    } else {
      console.log('Unknown screen after onboarding');
      const pageText = await page.textContent('body');
      console.log('Page text:', pageText.substring(0, 300));
    }
  });
});