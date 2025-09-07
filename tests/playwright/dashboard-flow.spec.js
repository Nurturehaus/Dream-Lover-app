import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { LogPage } from '../pages/LogPage.js';
import { CalendarPage } from '../pages/CalendarPage.js';
import { TestHelpers } from '../utils/helpers.js';
import { TestData, TestDataHelpers } from '../fixtures/testData.js';

test.describe('Dashboard Flow', () => {
  let authPage;
  let dashboardPage;
  let logPage;
  let calendarPage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    logPage = new LogPage(page);
    calendarPage = new CalendarPage(page);
    helpers = new TestHelpers(page);
    
    // Clear app data and register a user
    await helpers.clearAppData();
    const userData = TestDataHelpers.generateRandomUser();
    await helpers.registerUser(userData);
  });

  test.describe('Dashboard Display', () => {
    test('should show cycle information correctly', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.expectWelcomeMessageVisible();
      await dashboardPage.expectCycleDayVisible();
      await dashboardPage.expectCurrentPhaseVisible();
    });

    test('should display calendar widget', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.expectCalendarWidgetVisible();
    });

    test('should show partner connection status', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.expectPartnerSectionVisible();
      
      // Should show no partner connected by default
      const partnerStatus = await dashboardPage.getPartnerStatus();
      expect(partnerStatus).toContain('No partner connected');
    });

    test('should display quick actions', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.expectQuickActionsVisible();
    });

    test('should show today tracking status', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.expectTodayTrackingVisible();
    });
  });

  test.describe('Navigation from Dashboard', () => {
    test('should navigate to log screen from quick actions', async ({ page }) => {
      await dashboardPage.clickLogTodayButton();
      await logPage.expectToBeOnLogScreen();
    });

    test('should navigate to calendar from widget', async ({ page }) => {
      await dashboardPage.clickCalendarWidget();
      await calendarPage.expectToBeOnCalendar();
    });

    test('should navigate to partner link screen', async ({ page }) => {
      await dashboardPage.clickPartnerSection();
      
      // Should show partner connection screen or modal
      await helpers.waitForElement('[data-testid="partner-link-screen"], [data-testid="partner-modal"]', 5000);
    });
  });

  test.describe('Today Tracking Integration', () => {
    test('should show empty tracking state initially', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      
      const trackingStatus = await dashboardPage.getTodayTrackingStatus();
      expect(trackingStatus).toContain('No entries');
    });

    test('should update tracking status after logging', async ({ page }) => {
      // First log some data
      await dashboardPage.clickLogTodayButton();
      await logPage.expectToBeOnLogScreen();
      
      const logData = TestData.logEntries.complete;
      await logPage.fillCompleteLog(logData);
      await logPage.saveLog();
      
      // Return to dashboard and check tracking status
      await dashboardPage.expectToBeOnDashboard();
      const trackingStatus = await dashboardPage.getTodayTrackingStatus();
      expect(trackingStatus).not.toContain('No entries');
    });

    test('should show correct tracking indicators', async ({ page }) => {
      // Log partial data
      await dashboardPage.clickLogTodayButton();
      await logPage.selectFlowIntensity('medium');
      await logPage.selectSymptom('cramps');
      await logPage.saveLog();
      
      // Check dashboard shows indicators
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.expectTrackingIndicators();
    });
  });

  test.describe('Cycle Phase Information', () => {
    test('should display current cycle phase', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      
      const currentPhase = await dashboardPage.getCurrentPhase();
      expect(currentPhase).toMatch(/menstrual|follicular|ovulation|luteal/i);
    });

    test('should show cycle day counter', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      
      const cycleDay = await dashboardPage.getCurrentCycleDay();
      expect(cycleDay).toBeGreaterThan(0);
      expect(cycleDay).toBeLessThanOrEqual(35);
    });

    test('should display phase-specific suggestions', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.expectPhaseSuggestionsVisible();
      
      const suggestions = await dashboardPage.getPhaseSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  test.describe('Predictions and Insights', () => {
    test('should show next period prediction', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      
      const nextPeriodPrediction = await dashboardPage.getNextPeriodPrediction();
      expect(nextPeriodPrediction).toBeDefined();
      expect(nextPeriodPrediction).toMatch(/in \d+ days?/i);
    });

    test('should display fertility window information', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      
      const fertilityInfo = await dashboardPage.getFertilityWindowInfo();
      expect(fertilityInfo).toBeDefined();
    });

    test('should show insights based on logged data', async ({ page }) => {
      // First log multiple entries to generate insights
      const logData = TestData.logEntries.complete;
      
      for (let i = 0; i < 3; i++) {
        await dashboardPage.clickLogTodayButton();
        await logPage.fillCompleteLog(logData);
        await logPage.saveLog();
        await dashboardPage.expectToBeOnDashboard();
      }
      
      // Check for insights
      await dashboardPage.expectInsightCardsVisible();
    });
  });

  test.describe('Partner Integration', () => {
    test('should display partner connection invitation', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.expectPartnerSectionVisible();
      
      const inviteButton = page.locator('[data-testid="invite-partner-button"]');
      await expect(inviteButton).toBeVisible();
    });

    test('should show partner notes when connected', async ({ page }) => {
      // Mock partner connection state
      await page.evaluate(() => {
        localStorage.setItem('partnerData', JSON.stringify({
          connected: true,
          partner: { name: 'Test Partner', email: 'partner@test.com' }
        }));
      });
      
      await page.reload();
      await dashboardPage.expectToBeOnDashboard();
      
      // Should show partner notes section
      await dashboardPage.expectPartnerNotesVisible();
    });
  });

  test.describe('Notifications and Reminders', () => {
    test('should show period reminder when due', async ({ page }) => {
      // Mock approaching period date
      await page.evaluate(() => {
        const cycleData = {
          lastPeriodStart: new Date(Date.now() - (26 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          averageCycleLength: 28
        };
        localStorage.setItem('cycleData', JSON.stringify(cycleData));
      });
      
      await page.reload();
      await dashboardPage.expectToBeOnDashboard();
      
      // Should show period reminder
      const notification = page.locator('[data-testid="period-reminder"]');
      await expect(notification).toBeVisible();
    });

    test('should display ovulation alerts during fertile window', async ({ page }) => {
      // Mock fertile window timing
      await page.evaluate(() => {
        const cycleData = {
          lastPeriodStart: new Date(Date.now() - (12 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          averageCycleLength: 28
        };
        localStorage.setItem('cycleData', JSON.stringify(cycleData));
      });
      
      await page.reload();
      await dashboardPage.expectToBeOnDashboard();
      
      // Should show ovulation alert
      const notification = page.locator('[data-testid="ovulation-alert"]');
      await expect(notification).toBeVisible();
    });

    test('should show tracking reminder', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      
      // Should show reminder to log today's data if not logged
      const reminder = page.locator('[data-testid="tracking-reminder"]');
      await expect(reminder).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible to screen readers', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      
      // Check for proper ARIA labels
      const cycleInfo = page.locator('[data-testid="cycle-info"]');
      await expect(cycleInfo).toHaveAttribute('role');
      
      const quickActions = page.locator('[data-testid="quick-actions"]');
      await expect(quickActions).toHaveAttribute('role');
      
      // Run accessibility check
      const accessibilityIssues = await helpers.checkAccessibility();
      expect(accessibilityIssues).toHaveLength(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      
      // Tab through main elements
      await page.keyboard.press('Tab'); // Log today button
      await page.keyboard.press('Tab'); // Calendar widget
      await page.keyboard.press('Tab'); // Partner section
      
      // Focused element should be visible and interactive
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load dashboard quickly', async ({ page }) => {
      const loadTime = await helpers.measurePageLoad();
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle large amounts of logged data efficiently', async ({ page }) => {
      // Mock large dataset
      await page.evaluate(() => {
        const largeDataset = Array.from({ length: 100 }, (_, i) => ({
          date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          flowIntensity: ['none', 'light', 'medium', 'heavy'][Math.floor(Math.random() * 4)],
          symptoms: ['cramps', 'headache', 'fatigue'].slice(0, Math.floor(Math.random() * 3)),
          mood: Math.floor(Math.random() * 5)
        }));
        localStorage.setItem('logEntries', JSON.stringify(largeDataset));
      });
      
      await page.reload();
      const loadTime = await helpers.measurePageLoad();
      expect(loadTime).toBeLessThan(5000); // Should still load within 5 seconds
      
      await dashboardPage.expectToBeOnDashboard();
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist dashboard state across sessions', async ({ page }) => {
      // Log some data
      await dashboardPage.clickLogTodayButton();
      await logPage.selectFlowIntensity('medium');
      await logPage.saveLog();
      
      // Get current state
      const initialTrackingStatus = await dashboardPage.getTodayTrackingStatus();
      
      // Simulate app restart
      await helpers.resetToInitialState();
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.loginUser(userData);
      
      // Check state is maintained
      await dashboardPage.expectToBeOnDashboard();
      const restoredTrackingStatus = await dashboardPage.getTodayTrackingStatus();
      expect(restoredTrackingStatus).toBe(initialTrackingStatus);
    });

    test('should handle data corruption gracefully', async ({ page }) => {
      // Corrupt local storage data
      await page.evaluate(() => {
        localStorage.setItem('cycleData', 'invalid json');
        localStorage.setItem('logEntries', '{broken}');
      });
      
      await page.reload();
      
      // Should still load dashboard with default state
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.expectCycleDayVisible();
    });
  });
});