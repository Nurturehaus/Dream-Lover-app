import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { CalendarPage } from '../pages/CalendarPage.js';
import { SettingsPage } from '../pages/SettingsPage.js';
import { LogPage } from '../pages/LogPage.js';
import { TestHelpers } from '../utils/helpers.js';
import { TestData, TestDataHelpers } from '../fixtures/testData.js';

test.describe('Visual Regression Tests', () => {
  let authPage;
  let dashboardPage;
  let calendarPage;
  let settingsPage;
  let logPage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    calendarPage = new CalendarPage(page);
    settingsPage = new SettingsPage(page);
    logPage = new LogPage(page);
    helpers = new TestHelpers(page);
    
    // Set consistent viewport for visual regression
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X dimensions
    
    // Clear app data
    await helpers.clearAppData();
  });

  test.describe('Authentication Screens', () => {
    test('should match auth screen signin mode', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      // Wait for animations to complete
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('auth-signin.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match auth screen signup mode', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignUpMode();
      
      // Wait for animations to complete
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('auth-signup.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match auth screen with validation errors', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      // Trigger validation errors
      await authPage.submitForm();
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('auth-validation-errors.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Dashboard Screens', () => {
    test.beforeEach(async ({ page }) => {
      // Register and login user for dashboard tests
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
    });

    test('should match dashboard default state', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      
      // Wait for data to load
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('dashboard-default.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match dashboard with cycle data', async ({ page }) => {
      // Mock cycle data
      await page.evaluate(() => {
        const cycleData = {
          lastPeriodStart: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          averageCycleLength: 28,
          periodDuration: 5,
          currentDay: 14,
          currentPhase: 'ovulation'
        };
        localStorage.setItem('cycleData', JSON.stringify(cycleData));
      });
      
      await page.reload();
      await dashboardPage.expectToBeOnDashboard();
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('dashboard-with-cycle-data.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match dashboard with logged entries', async ({ page }) => {
      // Mock logged entries
      await page.evaluate(() => {
        const logEntries = [{
          date: new Date().toISOString().split('T')[0],
          flowIntensity: 'medium',
          symptoms: ['cramps', 'headache'],
          mood: 2,
          temperature: 98.6,
          partnerVisible: true
        }];
        localStorage.setItem('logEntries', JSON.stringify(logEntries));
      });
      
      await page.reload();
      await dashboardPage.expectToBeOnDashboard();
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('dashboard-with-log-entries.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Calendar Screens', () => {
    test.beforeEach(async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
    });

    test('should match calendar default view', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.waitForCalendarToLoad();
      
      await expect(page).toHaveScreenshot('calendar-default.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match calendar with period tracking', async ({ page }) => {
      // Mock period data
      await page.evaluate(() => {
        const today = new Date();
        const periodStart = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000));
        
        const cycleData = {
          lastPeriodStart: periodStart.toISOString().split('T')[0],
          periodDuration: 5,
          averageCycleLength: 28
        };
        localStorage.setItem('cycleData', JSON.stringify(cycleData));
      });
      
      await page.reload();
      await calendarPage.goto();
      await calendarPage.waitForCalendarToLoad();
      
      await expect(page).toHaveScreenshot('calendar-with-period.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match calendar with adjust dates modal', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.openAdjustDatesModal();
      
      // Wait for modal animation
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('calendar-adjust-dates-modal.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match calendar legend', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.waitForCalendarToLoad();
      
      // Focus on legend area only
      const legend = page.locator('[class*="legend"], [data-testid*="legend"]');
      if (await legend.isVisible()) {
        await expect(legend).toHaveScreenshot('calendar-legend.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Log Screens', () => {
    test.beforeEach(async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
    });

    test('should match log screen empty state', async ({ page }) => {
      await logPage.goto();
      
      // Wait for screen to load
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('log-empty.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match log screen with selections', async ({ page }) => {
      await logPage.goto();
      
      // Make selections
      await logPage.selectFlowIntensity('medium');
      await logPage.selectSymptom('cramps');
      await logPage.selectSymptom('headache');
      await logPage.selectMood(2);
      await logPage.enterTemperature(98.6);
      await logPage.enterNotes('Test notes for visual regression');
      await logPage.setPartnerVisibility(true);
      
      // Wait for UI to update
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('log-with-selections.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match log screen flow intensity options', async ({ page }) => {
      await logPage.goto();
      
      // Focus on flow section
      const flowSection = page.locator('[data-testid="flow-section"]');
      await expect(flowSection).toHaveScreenshot('log-flow-section.png', {
        animations: 'disabled'
      });
    });

    test('should match log screen symptoms grid', async ({ page }) => {
      await logPage.goto();
      
      // Focus on symptoms section
      const symptomsSection = page.locator('[data-testid="symptoms-section"]');
      if (await symptomsSection.isVisible()) {
        await expect(symptomsSection).toHaveScreenshot('log-symptoms-section.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match log screen mood selector', async ({ page }) => {
      await logPage.goto();
      
      // Focus on mood section
      const moodSection = page.locator('[data-testid="mood-section"]');
      await expect(moodSection).toHaveScreenshot('log-mood-section.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Settings Screens', () => {
    test.beforeEach(async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
    });

    test('should match settings screen default state', async ({ page }) => {
      await settingsPage.goto();
      
      // Wait for screen to load
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('settings-default.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match settings with partner invite modal', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickAddPartner();
      
      // Wait for modal animation
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('settings-partner-invite-modal.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match settings with connected partner', async ({ page }) => {
      // Mock connected partner
      await page.evaluate(() => {
        const partnerData = {
          connected: true,
          partner: {
            id: '123',
            name: 'Jane Smith',
            email: 'jane@example.com',
            connectedAt: '2024-01-15T10:00:00.000Z'
          }
        };
        localStorage.setItem('partnerData', JSON.stringify(partnerData));
      });
      
      await page.reload();
      await settingsPage.goto();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('settings-with-partner.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match settings notification toggles', async ({ page }) => {
      await settingsPage.goto();
      
      // Focus on notification section
      const notificationSection = page.locator('[data-testid*="notification"], [class*="notification"]').first();
      if (await notificationSection.isVisible()) {
        await expect(notificationSection).toHaveScreenshot('settings-notifications.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Responsive Design Visual Tests', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      test(`should match dashboard on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        const userData = TestDataHelpers.generateRandomUser();
        await helpers.registerUser(userData);
        
        await dashboardPage.expectToBeOnDashboard();
        await page.waitForTimeout(500);
        
        await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    }
  });

  test.describe('Dark Mode Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Enable dark mode if supported
      await page.emulateMedia({ colorScheme: 'dark' });
    });

    test('should match auth screen in dark mode', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('auth-signin-dark.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match dashboard in dark mode', async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
      
      await dashboardPage.expectToBeOnDashboard();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('dashboard-dark.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Error States Visual Tests', () => {
    test('should match network error state', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', (route) => {
        route.abort('failed');
      });
      
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      const userData = TestData.users.valid.tracker;
      await authPage.signIn(userData);
      
      // Wait for error to appear
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('auth-network-error.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match form validation error state', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignUpMode();
      
      // Fill invalid data
      await authPage.fillSignUpForm(TestData.users.invalid.invalidEmail);
      await authPage.submitForm();
      
      // Wait for validation errors
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('auth-validation-errors-signup.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Loading States Visual Tests', () => {
    test('should match loading state during authentication', async ({ page }) => {
      // Slow down network to catch loading state
      await page.route('**/api/auth/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        route.continue();
      });
      
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      const userData = TestData.users.valid.tracker;
      await authPage.signIn(userData);
      
      // Capture during loading
      await page.waitForTimeout(200);
      
      await expect(page).toHaveScreenshot('auth-loading-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Component Focus States', () => {
    test('should match button focus states', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      // Focus on submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")');
      await submitButton.focus();
      
      await expect(submitButton).toHaveScreenshot('button-focus-state.png', {
        animations: 'disabled'
      });
    });

    test('should match input focus states', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      // Focus on email input
      const emailInput = page.locator('input[type="email"]');
      await emailInput.focus();
      
      await expect(emailInput).toHaveScreenshot('input-focus-state.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Animation Screenshots', () => {
    test('should capture modal open animation end state', async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
      
      await settingsPage.goto();
      await settingsPage.clickAddPartner();
      
      // Wait for animation to complete
      await page.waitForTimeout(600);
      
      await expect(page).toHaveScreenshot('modal-open-end-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture tab transition end state', async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
      
      await dashboardPage.expectToBeOnDashboard();
      
      // Switch to calendar tab
      await calendarPage.goto();
      
      // Wait for transition to complete
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('tab-transition-end-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
});