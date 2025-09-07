const { test, expect } = require('@playwright/test');

test.describe('Dashboard Calendar Widget Debug', () => {
  test('check calendar widget visibility and console errors', async ({ page }) => {
    console.log('🔍 Starting calendar widget debug test...');

    // Track console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({ 
        type: msg.type(), 
        text: msg.text(),
        location: msg.location()
      });
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });

    // Track network errors
    const networkErrors = [];
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure()
      });
      console.log(`Network error: ${request.url()} - ${request.failure()?.errorText}`);
    });

    try {
      console.log('📱 Navigating to dashboard...');
      await page.goto('http://localhost:8081');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      // Take initial screenshot
      await page.screenshot({ path: 'test-results/screenshots/dashboard-initial.png', fullPage: true });
      console.log('📸 Initial dashboard screenshot taken');

      // Check if we're on onboarding screen
      const isOnboarding = await page.locator('[testID="role-selection-screen"]').isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isOnboarding) {
        console.log('🚀 Starting onboarding flow...');
        
        // Complete onboarding flow
        await page.locator('[testID="tracker-role-card"]').click();
        await page.locator('[testID="continue-button"]').click();
        await page.waitForTimeout(2000);
        
        // Profile setup
        await page.locator('[testID="continue-button"]').click();
        await page.waitForTimeout(2000);
        
        console.log('✅ Onboarding completed');
      }

      // Wait for dashboard
      await page.waitForSelector('[testID="dashboard-container"]', { timeout: 30000 });
      console.log('✅ Dashboard container found');

      // Take screenshot of dashboard
      await page.screenshot({ path: 'test-results/screenshots/dashboard-after-onboarding.png', fullPage: true });
      console.log('📸 Dashboard screenshot taken');

      // Check for calendar widget specifically
      console.log('🔍 Looking for calendar widget...');
      
      // Wait for calendar section
      const calendarSection = page.locator('[testID="dashboard-calendar-widget"]');
      const isCalendarSectionVisible = await calendarSection.isVisible({ timeout: 10000 }).catch(() => false);
      console.log(`Calendar section visible: ${isCalendarSectionVisible}`);

      // Check for calendar container
      const calendarContainer = page.locator('[testID="calendar-container"]');
      const isCalendarContainerVisible = await calendarContainer.isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`Calendar container visible: ${isCalendarContainerVisible}`);

      // Check for phase info card
      const phaseCard = page.locator('[testID="phase-info-card"]');
      const isPhaseCardVisible = await phaseCard.isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`Phase info card visible: ${isPhaseCardVisible}`);

      // Check for mini legend
      const miniLegend = page.locator('[testID="mini-legend"]');
      const isMiniLegendVisible = await miniLegend.isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`Mini legend visible: ${isMiniLegendVisible}`);

      // Scroll down to ensure calendar is in view
      console.log('📜 Scrolling to calendar section...');
      await page.evaluate(() => {
        const calendarSection = document.querySelector('[data-testid="dashboard-calendar-widget"]');
        if (calendarSection) {
          calendarSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      
      await page.waitForTimeout(2000);

      // Take screenshot after scrolling
      await page.screenshot({ path: 'test-results/screenshots/dashboard-scrolled-to-calendar.png', fullPage: true });
      console.log('📸 Calendar section screenshot taken');

      // Re-check visibility after scrolling
      const isCalendarVisibleAfterScroll = await calendarSection.isVisible().catch(() => false);
      console.log(`Calendar visible after scroll: ${isCalendarVisibleAfterScroll}`);

      // Check for any elements with "calendar" in the text or testID
      const calendarElements = await page.$$('[data-testid*="calendar"], [class*="calendar"], text="Calendar", text="calendar"');
      console.log(`Found ${calendarElements.length} elements with "calendar" in them`);

      // Get page content to see what's actually rendered
      const pageContent = await page.content();
      const hasCalendarText = pageContent.includes('Calendar') || pageContent.includes('calendar');
      console.log(`Page contains "calendar" text: ${hasCalendarText}`);

      // Print console errors
      const errors = consoleMessages.filter(msg => msg.type === 'error');
      console.log(`\n❌ Console Errors (${errors.length}):`);
      errors.forEach(error => {
        console.log(`  - ${error.text}`);
        if (error.location) {
          console.log(`    Location: ${error.location.url}:${error.location.lineNumber}`);
        }
      });

      // Print console warnings
      const warnings = consoleMessages.filter(msg => msg.type === 'warning');
      console.log(`\n⚠️  Console Warnings (${warnings.length}):`);
      warnings.forEach(warning => {
        console.log(`  - ${warning.text}`);
      });

      // Print network errors
      console.log(`\n🌐 Network Errors (${networkErrors.length}):`);
      networkErrors.forEach(error => {
        console.log(`  - ${error.url}: ${error.failure?.errorText}`);
      });

      // Final summary
      console.log('\n📋 SUMMARY:');
      console.log(`  Dashboard container: ✅`);
      console.log(`  Calendar widget: ${isCalendarVisibleAfterScroll ? '✅' : '❌'}`);
      console.log(`  Phase info card: ${isPhaseCardVisible ? '✅' : '❌'}`);
      console.log(`  Calendar container: ${isCalendarContainerVisible ? '✅' : '❌'}`);
      console.log(`  Mini legend: ${isMiniLegendVisible ? '✅' : '❌'}`);
      console.log(`  Console errors: ${errors.length}`);
      console.log(`  Network errors: ${networkErrors.length}`);

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await page.screenshot({ path: 'test-results/screenshots/dashboard-error.png', fullPage: true });
      throw error;
    }
  });
});