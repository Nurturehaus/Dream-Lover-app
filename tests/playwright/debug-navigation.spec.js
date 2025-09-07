// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Debug Navigation Issue', () => {
  test('debug onboarding completion navigation', async ({ page }) => {
    // Listen to console messages to catch errors
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('Page Error:', error.message);
    });

    // Go to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    console.log('=== STARTING NAVIGATION DEBUG ===');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/debug-start.png', fullPage: true });
    
    // Complete onboarding step by step with detailed logging
    const nextButton = page.locator('[data-testid="onboarding-next-button"]');
    
    // Step 1: Welcome -> Role selection
    console.log('Step 1: Clicking Next from Welcome');
    await nextButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/debug-step1.png', fullPage: true });
    
    // Step 2: Select role
    console.log('Step 2: Selecting tracker role');
    const trackerButton = page.locator('[data-testid="role-tracker-button"]');
    await trackerButton.click();
    await page.waitForTimeout(500);
    
    // Continue through steps quickly
    await nextButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/debug-step2.png', fullPage: true });
    
    await nextButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/debug-step3.png', fullPage: true });
    
    // Final click - this should navigate to Auth
    console.log('Final Step: Clicking Get Started');
    console.log('URL before final click:', page.url());
    
    // Check what test IDs are visible before click
    const testIdsBefore = await page.$$eval('[data-testid]', elements => 
      elements.map(el => el.getAttribute('data-testid'))
    );
    console.log('Test IDs before final click:', testIdsBefore);
    
    await nextButton.click();
    console.log('Get Started clicked - waiting for navigation...');
    
    // Wait a bit longer to see if navigation happens
    await page.waitForTimeout(5000);
    
    console.log('URL after final click:', page.url());
    await page.screenshot({ path: 'test-results/debug-final.png', fullPage: true });
    
    // Check what test IDs are visible after click
    const testIdsAfter = await page.$$eval('[data-testid]', elements => 
      elements.map(el => el.getAttribute('data-testid'))
    );
    console.log('Test IDs after final click:', testIdsAfter);
    
    // Check if we're on Auth screen
    const authScreen = await page.locator('[data-testid="auth-screen"]').isVisible().catch(() => false);
    const onboardingScreen = await page.locator('[data-testid="onboarding-screen"]').isVisible().catch(() => false);
    
    console.log('Auth screen visible:', authScreen);
    console.log('Onboarding screen visible:', onboardingScreen);
    
    // Print all console messages and errors
    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    console.log('\n=== ERRORS ===');
    errors.forEach(err => console.log(err));
    
    // Check page content
    const pageText = await page.textContent('body');
    console.log('\n=== PAGE TEXT CONTAINS ===');
    console.log('Onboarding keywords:', /onboarding|get started|personalized|insights/i.test(pageText));
    console.log('Auth keywords:', /sign|login|email|password|create account/i.test(pageText));
    console.log('Dashboard keywords:', /dashboard|dream lover|cycle|period/i.test(pageText));
  });
});